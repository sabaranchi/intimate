import React, { useState, useRef, useEffect } from 'react'
import * as friendLogic from '../utils/friendLogic'
import * as avatarStore from '../utils/avatarStore'

const REL_PRESETS = ['中学','高校','大学','友達','恋人','元恋人','先輩','後輩','サークル','バイト','職場','上司','同僚','部下','家族','趣味仲間','SNS友達','近所','その他']

export default function PersonPage({person, onSave, onBack}){
  const [tab, setTab] = useState('basic')
  const [expandedPhoto, setExpandedPhoto] = useState(null)
  const [photoUrls, setPhotoUrls] = useState({}) // photo id -> object URL
  const [showAvatarCrop, setShowAvatarCrop] = useState(false)
  const [avatarCropImage, setAvatarCropImage] = useState(null)
  const cropCanvasRef = useRef(null)
  // Crop interaction state: pinch-zoom + drag
  const [cropScale, setCropScale] = useState(1)
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 })
  const cropPointersRef = useRef(new Map())
  const pinchInitialRef = useRef({ dist: 0, scale: 1 })
  const cropViewportRef = useRef(null)

  // Bind non-passive wheel handler to allow preventDefault
  useEffect(()=>{
    if(!showAvatarCrop) return
    const el = cropViewportRef.current
    if(!el) return
    const handler = (e)=>{
      e.preventDefault()
      const delta = -Math.sign(e.deltaY) * 0.1
      setCropScale(prev => Math.max(0.5, Math.min(5, prev + delta)))
    }
    el.addEventListener('wheel', handler, { passive: false })
    return ()=>{ el.removeEventListener('wheel', handler) }
  }, [showAvatarCrop])

  function normalizePerson(p){
    const base = p || {}
    const defaultOrder = ['name','reading','nickname','gender','relationTags','contacts','address','birthday','workplace','favourites','dislikes','hobbies']
    const order = Array.isArray(base.basicOrder) ? base.basicOrder.slice() : defaultOrder.slice()
    if(!order.includes('relationTags')) order.splice(Math.min(order.length, 5), 0, 'relationTags')
    return {
      ...base,
      lastInteractionDate: base.lastInteractionDate || '',
      photos: Array.isArray(base.photos) ? base.photos : [],
      lastConversationSummary: base.lastConversationSummary || '',
      relationTags: Array.isArray(base.relationTags) ? base.relationTags : (base.relation ? [base.relation] : []),
      tags: Array.isArray(base.tags) ? base.tags : [],
      groups: Array.isArray(base.groups) ? base.groups : [],
      extraFields: base.extraFields || {},
      relationshipStatus: base.relationshipStatus || 'unknown',
      customFields: Array.isArray(base.customFields) ? base.customFields : [],
      events: Array.isArray(base.events) ? base.events : [],
      notes: {
        ...(base.notes || {}),
        entries: Array.isArray(base.notes?.entries) ? base.notes.entries : []
      },
      fieldHeights: base.fieldHeights || {},
      basicOrder: order.filter((v,i,a)=> a.indexOf(v)===i),
      stats: base.stats || { talkDays: 0, playCount: 0 },
      friendScore: typeof base.friendScore === 'number' ? base.friendScore : 20
    }
  }

  const [local, setLocal] = useState(()=> normalizePerson(person))
  useEffect(()=> setLocal(normalizePerson(person)), [person])
  const [lastAdded, setLastAdded] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const dragSrc = useRef(null)
  const avatarInputRef = useRef(null)

  // Early return check must come AFTER all Hooks
  if(!person) return (
    <div>
      <p>人物が見つかりません</p>
      <button onClick={onBack}>戻る</button>
    </div>
  )

  // Migrate base64 photos to compressed blobs in IndexedDB
  const migrationDoneRef = useRef(false)
  useEffect(()=>{
    if(migrationDoneRef.current) return
    migrationDoneRef.current = true
    async function migratePhotos(){
      const photos = local.photos || []
      if(!photos.some(p => typeof p === 'string')) return
      const converted = []
      for(const ph of photos){
        if(typeof ph === 'string'){
          try{
            const resp = await fetch(ph)
            const blob = await resp.blob()
            const id = await avatarStore.saveCompressedAvatar(blob, { maxWidth: 1280, quality: 0.8 })
            converted.push({ id })
          }catch(e){ converted.push(ph) }
        }else{
          converted.push(ph)
        }
      }
      if(converted.some((p, i) => p !== photos[i])){
        setLocal(prev => ({...prev, photos: converted}))
      }
    }
    migratePhotos()
  }, []) // Run only once on mount

  // Resolve photo URLs for id-based photos
  const photoResolvedRef = useRef(false)
  useEffect(()=>{
    if(photoResolvedRef.current) return
    photoResolvedRef.current = true
    let cancelled = false
    ;(async()=>{
      const entries = local.photos || []
      const map = {}
      for(const ph of entries){
        if(ph && typeof ph === 'object' && ph.id){
          try{
            const url = await avatarStore.getAvatarURL(ph.id)
            if(!cancelled && url) map[ph.id] = url
          }catch(e){}
        }
      }
      if(!cancelled) setPhotoUrls(map)
    })()
    return ()=>{ cancelled = true }
  }, [])

  function save(){
    // normalize before saving
    onSave(normalizePerson(local))
    onBack()
  }

  async function handleAvatar(file){
    const r = new FileReader()
    r.onload = ()=> {
      setAvatarCropImage(r.result)
      setCropScale(1)
      setCropOffset({ x: 0, y: 0 })
      setShowAvatarCrop(true)
    }
    r.readAsDataURL(file)
  }

  function applyCropAvatar(){
    const canvas = cropCanvasRef.current
    if(!canvas) return
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = async ()=>{
      // Compute crop rect from transform (centered viewport with square overlay)
      const cropSize = 440 // viewport overlay size in CSS px
      const s = cropScale
      const W = img.naturalWidth
      const H = img.naturalHeight
      const iCenterX = W/2 - (cropOffset.x / s)
      const iCenterY = H/2 - (cropOffset.y / s)
      const half = (cropSize/2) / s
      let sx = Math.round(iCenterX - half)
      let sy = Math.round(iCenterY - half)
      let sw = Math.round((cropSize) / s)
      let sh = sw // square
      // Clamp to image bounds
      if(sx < 0) sx = 0
      if(sy < 0) sy = 0
      if(sx + sw > W) sx = Math.max(0, W - sw)
      if(sy + sh > H) sy = Math.max(0, H - sh)

      const outSize = Math.min(sw, sh)
      canvas.width = outSize
      canvas.height = outSize
      ctx.drawImage(img, sx, sy, outSize, outSize, 0, 0, outSize, outSize)

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9))
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
      try{
        const id = await avatarStore.saveCompressedAvatar(file, { maxWidth: 512, quality: 0.75 })
        setLocal({...local, avatarId: id, avatar: undefined})
      }catch(e){
        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9)
        setLocal({...local, avatar: croppedDataUrl})
      }
      setShowAvatarCrop(false)
      setAvatarCropImage(null)
    }
    img.src = avatarCropImage
  }

  // Crop interaction handlers (pointer + wheel)
  function onCropPointerDown(e){
    const el = e.currentTarget
    el.setPointerCapture && el.setPointerCapture(e.pointerId)
    const pts = cropPointersRef.current
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if(pts.size === 2){
      const arr = Array.from(pts.values())
      const dx = arr[0].x - arr[1].x
      const dy = arr[0].y - arr[1].y
      pinchInitialRef.current = { dist: Math.hypot(dx, dy), scale: cropScale }
    }
  }
  function onCropPointerMove(e){
    const pts = cropPointersRef.current
    if(!pts.has(e.pointerId)) return
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if(pts.size === 1){
      // Drag to pan
      const dx = e.movementX || 0
      const dy = e.movementY || 0
      setCropOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }))
    }else if(pts.size === 2){
      // Pinch to zoom
      const arr = Array.from(pts.values())
      const dx = arr[0].x - arr[1].x
      const dy = arr[0].y - arr[1].y
      const dist = Math.hypot(dx, dy)
      const base = pinchInitialRef.current
      if(base.dist > 0){
        const nextScale = Math.max(0.5, Math.min(5, base.scale * (dist / base.dist)))
        setCropScale(nextScale)
      }
    }
  }
  function onCropPointerUp(e){
    const pts = cropPointersRef.current
    pts.delete(e.pointerId)
  }
  function onCropWheel(e){
    e.preventDefault()
    const delta = -Math.sign(e.deltaY) * 0.1
    setCropScale(prev => Math.max(0.5, Math.min(5, prev + delta)))
  }

  // manage objectURL for avatarId
  const [avatarUrl, setAvatarUrl] = useState(null)
  useEffect(()=>{
    let mounted = true
    let cur = null
    async function load(){
      if(local.avatar) { setAvatarUrl(local.avatar); return }
      if(local.avatarId){
        const url = await avatarStore.getAvatarURL(local.avatarId)
        if(!mounted) { if(url) URL.revokeObjectURL(url); return }
        if(cur) URL.revokeObjectURL(cur)
        cur = url
        setAvatarUrl(url)
      }else{
        setAvatarUrl(null)
      }
    }
    load()
    return ()=>{ mounted = false; if(cur) URL.revokeObjectURL(cur) }
  }, [local.avatarId, local.avatar])

  // autosize helper for textareas
  function autosize(el){
    if(!el) return 0
    try{
      el.style.height = 'auto'
      const h = el.scrollHeight
      el.style.height = h + 'px'
      return h
    }catch(e){
      return 0
    }
  }

  function getPartnerLabel(gender){
    if(!gender) return 'パートナー'
    const g = String(gender).toLowerCase()
    if(g.includes('男') || g.includes('male') || g.startsWith('m')) return '彼女'
    if(g.includes('女') || g.includes('female') || g.startsWith('f')) return '彼氏'
    return 'パートナー'
  }

  function calcAge(birthdayStr){
    if(!birthdayStr) return null
    const birth = new Date(birthdayStr)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if(m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age >= 0 ? age : null
  }

  // スワイプ検出用
  const containerRef = useRef(null)
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)
  useEffect(()=>{
    const el = containerRef.current
    if(!el) return
    function onTouchStart(e){
      const t = e.touches[0]
      touchStartX.current = t.clientX
      touchStartY.current = t.clientY
    }
    function onTouchEnd(e){
      if(touchStartX.current === null) return
      const t = e.changedTouches[0]
      const dx = t.clientX - touchStartX.current
      const dy = t.clientY - touchStartY.current
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      const threshold = 40
      if(absDx > threshold && absDx > absDy){
        const order = ['basic','events','notes']
        const idx = order.indexOf(tab)
        if(dx < 0 && idx < order.length -1){ // 左スワイプ -> 次
          setTab(order[idx+1])
        }else if(dx > 0 && idx > 0){ // 右スワイプ -> 前
          setTab(order[idx-1])
        }
      }
      touchStartX.current = null
      touchStartY.current = null
    }
    el.addEventListener('touchstart', onTouchStart, {passive:true})
    el.addEventListener('touchend', onTouchEnd, {passive:true})
    return ()=>{
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [tab])

  // run autosize for any textarea after render when local data changes
  useEffect(()=>{
    const root = containerRef.current
    if(!root) return
    const areas = root.querySelectorAll('textarea[data-cat]')
    if(!areas || areas.length===0) return
    // build new heights map
    const newHeights = {...(local.fieldHeights || {})}
    let changed = false
    areas.forEach(a=>{
      const h = autosize(a)
      const cat = a.dataset.cat
      const id = a.dataset.id || 'anon'
      if(!newHeights[cat]) newHeights[cat] = {}
      if(newHeights[cat][id] !== h){ newHeights[cat][id] = h; changed = true }
    })
    if(changed){
      setLocal(prev=> ({...prev, fieldHeights: newHeights}))
    }
  }, [local])

  function addNew(){
    if(tab === 'basic'){
      const id = 'extra-' + Date.now()
      // add a new extra basic field: push id into basicOrder and store label/value in extraFields
      const basicOrder = (local.basicOrder || []).concat(id)
      const extra = {...(local.extraFields||{}), [id]: { label:'', value: '' }}
      setLocal({...local, basicOrder, extraFields: extra})
      setLastAdded({type:'basicExtra', id})
      return
    }
    if(tab === 'events'){
      const id = String(Date.now())
      const ev = { id, text:'', date: new Date().toISOString() }
      const events = [...(local.events||[]), ev]
      setLocal({...local, events})
      setLastAdded({type:'event', id})
      return
    }
    if(tab === 'notes'){
      const id = String(Date.now())
      const entries = [ ...(local.notes?.entries||[]), { id, label: '', text: '' } ]
      setLocal({...local, notes: {...local.notes, entries}})
      setLastAdded({type:'note', id})
      return
    }
  }

  function onDragStart(listName, idx, e){
    dragSrc.current = {listName, idx}
    try{
      e.dataTransfer.effectAllowed = 'move'
      // set some data so some browsers allow drag (Firefox needs setData)
      e.dataTransfer.setData('text/plain', JSON.stringify({listName, idx}))
    }catch(e){}
  }
  function onDragOver(e){ e.preventDefault(); try{ e.dataTransfer.dropEffect = 'move' }catch(e){} }
  function onDrop(listName, idx, e){
    e.preventDefault()
    let src = dragSrc.current
    // fallback: try to read from dataTransfer in case ref was lost
    if(!src){
      try{
        const d = e.dataTransfer.getData('text/plain')
        if(d){ src = JSON.parse(d) }
      }catch(err){}
    }
    if(!src) return
    if(src.listName !== listName){ dragSrc.current = null; return }
    if(src.idx === idx) { dragSrc.current = null; return }
    if(listName === 'basic'){
      const arr = (local.basicOrder||[]).slice()
      const [m] = arr.splice(src.idx,1)
      const insertIdx = Math.min(Math.max(0, idx), arr.length)
      arr.splice(insertIdx,0,m)
      setLocal({...local, basicOrder: arr})
    }else if(listName === 'custom'){
      const arr = (local.customFields||[]).slice()
      const [m] = arr.splice(src.idx,1)
      const insertIdx = Math.min(Math.max(0, idx), arr.length)
      arr.splice(insertIdx,0,m)
      setLocal({...local, customFields: arr})
    }else if(listName === 'events'){
      const arr = (local.events||[]).slice()
      const [m] = arr.splice(src.idx,1)
      const insertIdx = Math.min(Math.max(0, idx), arr.length)
      arr.splice(insertIdx,0,m)
      setLocal({...local, events: arr})
    }else if(listName === 'notes'){
      const arr = (local.notes?.entries||[]).slice()
      const [m] = arr.splice(src.idx,1)
      const insertIdx = Math.min(Math.max(0, idx), arr.length)
      arr.splice(insertIdx,0,m)
      setLocal({...local, notes:{...local.notes, entries: arr}})
    }
    dragSrc.current = null
  }

  return (
    <div className="person-page">
      <div className="person-header">
        <img className="avatar-large" src={avatarUrl || local.avatar || '/icon-192.png'} onClick={()=> avatarInputRef.current && avatarInputRef.current.click()} style={{cursor:'pointer'}} />
        <input ref={avatarInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>{ if(e.target.files && e.target.files[0]) handleAvatar(e.target.files[0]) }} />
        <div className="header-meta">
          <div className="name-row">
            <h2>{local.name}{calcAge(local.birthday) !== null && ` (${calcAge(local.birthday)})`}</h2>
            <select className="relation-select" value={local.relationshipStatus || 'unknown'} onChange={e=> setLocal({...local, relationshipStatus: e.target.value})}>
              <option value="unknown">不明</option>
              <option value="partner_yes">{getPartnerLabel(local.gender)}あり</option>
              <option value="partner_no">{getPartnerLabel(local.gender)}なし</option>
              <option value="married">既婚</option>
              <option value="single">独身</option>
            </select>
          </div>
          <div className="hearts header-hearts">
            {Array.from({length:10}).map((_,i)=>{
              const pct = Math.round((local.friendScore||0)/10)
              const filled = i < pct
              const filledChar = '❤️'
              const emptyChar = '🖤'
              return <span key={i} className={"heart " + (filled? 'filled':'')}>{filled ? filledChar : emptyChar}</span>
            })}
          </div>
        </div>
      </div>

      <div className="tabs">
        <div className="tabs-top">
          <button className={tab==='basic' ? 'active' : ''} onClick={()=>setTab('basic')}>基本情報</button>
          <button className={tab==='events' ? 'active' : ''} onClick={()=>setTab('events')}>出来事</button>
          <button className={tab==='notes' ? 'active' : ''} onClick={()=>setTab('notes')}>メモ</button>
        </div>
        <div className="tabs-bottom">
          <button className="back-btn" onClick={()=> save()}>← 戻る</button>
          <button className="edit-btn" onClick={()=> setEditMode(e=>!e)}>{editMode? '完了' : '編集'}</button>
          <button className="add-btn" onClick={()=> addNew()}>追加</button>
        </div>
      </div>

      <div className="tab-body" ref={containerRef}>
        {tab==='basic' && (
          <div className="basic">
            <div className="basic-list">
              {(local.basicOrder||[]).map((key, idx)=> (
                <div key={key} className="basic-row" onDragEnter={e=> e.currentTarget.classList.add('drag-over')} onDragLeave={e=> e.currentTarget.classList.remove('drag-over')} onDragOver={onDragOver} onDrop={e=> { e.currentTarget.classList.remove('drag-over'); onDrop('basic', idx, e) }}>
                  {editMode && <div className="drag-handle" draggable onDragStart={e=> onDragStart('basic', idx, e)}>≡</div>}
                  <div className="basic-main">
                    {key === 'name' && (
                      <div>
                        <div className="basic-label">名前</div>
                        <textarea className="basic-value" data-cat="basic" data-id="name" ref={el=>{ if(el) autosize(el) }} value={local.name||''} onChange={e=> { setLocal({...local, name:e.target.value}); autosize(e.target) }} onFocus={e=> { e.target.scrollIntoView({behavior:'smooth', block:'center'}); autosize(e.target) }} style={{height: (local.fieldHeights?.basic?.name) ? local.fieldHeights.basic.name + 'px' : undefined}} />
                      </div>
                    )}
                    {key === 'reading' && (
                      <div>
                        <div className="basic-label">読み仮名</div>
                        <textarea className="basic-value" data-cat="basic" data-id="reading" ref={el=>{ if(el) autosize(el) }} value={local.reading||''} onChange={e=> { setLocal({...local, reading:e.target.value}); autosize(e.target) }} onFocus={e=> { e.target.scrollIntoView({behavior:'smooth', block:'center'}); autosize(e.target) }} style={{height: (local.fieldHeights?.basic?.reading) ? local.fieldHeights.basic.reading + 'px' : undefined}} />
                      </div>
                    )}
                    {key === 'nickname' && (
                      <div>
                        <div className="basic-label">ニックネーム</div>
                        <textarea className="basic-value" data-cat="basic" data-id="nickname" ref={el=>{ if(el) autosize(el) }} value={local.nickname||''} onChange={e=> { setLocal({...local, nickname:e.target.value}); autosize(e.target) }} onFocus={e=> { e.target.scrollIntoView({behavior:'smooth', block:'center'}); autosize(e.target) }} style={{height: (local.fieldHeights?.basic?.nickname) ? local.fieldHeights.basic.nickname + 'px' : undefined}} />
                      </div>
                    )}
                    {key === 'gender' && (
                      <div>
                        <div className="basic-label">性別</div>
                        <div className="chip-row">
                          {['男', '女'].map(g=>(
                            <button key={g} type="button" className={"chip " + (local.gender === g ? 'chip-on':'chip-off')} onClick={()=> setLocal({...local, gender: local.gender === g ? '' : g})}>{g}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    {key === 'relationTags' && (
                      <div>
                        <div className="basic-label">関係性</div>
                        <div className="chip-row">
                          {Array.from(new Set([...(REL_PRESETS||[]), ...((local.relationTags)||[])] )).map(tag=>{
                            const on = (local.relationTags||[]).includes(tag)
                            return (
                              <button key={tag} type="button" className={"chip " + (on ? 'chip-on':'chip-off')} onClick={()=>{
                                const cur = new Set(local.relationTags||[])
                                if(on){ cur.delete(tag) } else { cur.add(tag) }
                                setLocal({...local, relationTags: Array.from(cur)})
                              }}>{tag}</button>
                            )
                          })}
                        </div>
                        <div style={{marginTop:6,display:'flex',gap:6}}>
                          <input className="basic-value" placeholder="関係性を追加" value={local._tmpRelation || ''} onChange={e=> setLocal({...local, _tmpRelation: e.target.value})} />
                          <button type="button" onClick={()=>{
                            const t = (local._tmpRelation||'').trim()
                            if(!t) return
                            const cur = new Set(local.relationTags||[]); cur.add(t)
                            setLocal({...local, relationTags: Array.from(cur), _tmpRelation:''})
                            setLastAdded({type:'relationTag', id:t})
                          }}>追加</button>
                        </div>
                      </div>
                    )}
                    {key === 'contacts' && (
                      <div>
                        <div className="basic-label">連絡先（電話/メール/SNS）</div>
                        <div style={{display:'flex',flexDirection:'column',gap:6}}>
                          <input placeholder="電話番号" value={local.contacts?.tel||''} onChange={e=> setLocal({...local, contacts:{...(local.contacts||{}), tel:e.target.value}})} />
                          <input placeholder="メール" value={local.contacts?.email||''} onChange={e=> setLocal({...local, contacts:{...(local.contacts||{}), email:e.target.value}})} />
                          <input placeholder="Twitterハンドル (@抜き)" value={local.contacts?.twitter||''} onChange={e=> setLocal({...local, contacts:{...(local.contacts||{}), twitter:e.target.value}})} />
                          <input placeholder="LINE ID/URL" value={local.contacts?.line||''} onChange={e=> setLocal({...local, contacts:{...(local.contacts||{}), line:e.target.value}})} />
                          <input placeholder="Instagramハンドル (@抜き)" value={local.contacts?.instagram||''} onChange={e=> setLocal({...local, contacts:{...(local.contacts||{}), instagram:e.target.value}})} />
                          <input placeholder="TikTokハンドル (@抜き)" value={local.contacts?.tiktok||''} onChange={e=> setLocal({...local, contacts:{...(local.contacts||{}), tiktok:e.target.value}})} />
                          <input placeholder="BeRealユーザー名" value={local.contacts?.bereal||''} onChange={e=> setLocal({...local, contacts:{...(local.contacts||{}), bereal:e.target.value}})} />
                        </div>
                      </div>
                    )}
                    {key === 'address' && (
                      <div>
                        <div className="basic-label">住所</div>
                        <textarea className="basic-value" data-cat="basic" data-id="address" ref={el=>{ if(el) autosize(el) }} value={local.address||''} onChange={e=> { setLocal({...local, address:e.target.value}); autosize(e.target) }} onFocus={e=> { e.target.scrollIntoView({behavior:'smooth', block:'center'}); autosize(e.target) }} style={{height: (local.fieldHeights?.basic?.address) ? local.fieldHeights.basic.address + 'px' : undefined}} />
                      </div>
                    )}
                    {key === 'birthday' && (
                      <div>
                        <div className="basic-label">生年月日</div>
                        <input className="basic-value" type="date" value={local.birthday||''} onChange={e=> setLocal({...local, birthday:e.target.value})} />
                      </div>
                    )}
                    {key === 'workplace' && (
                      <div>
                        <div className="basic-label">学校/会社</div>
                        <textarea className="basic-value" data-cat="basic" data-id="workplace" ref={el=>{ if(el) autosize(el) }} value={local.workplace||''} onChange={e=> { setLocal({...local, workplace:e.target.value}); autosize(e.target) }} onFocus={e=> { e.target.scrollIntoView({behavior:'smooth', block:'center'}); autosize(e.target) }} style={{height: (local.fieldHeights?.basic?.workplace) ? local.fieldHeights.basic.workplace + 'px' : undefined}} />
                      </div>
                    )}
                    {key === 'favourites' && (
                      <div>
                        <div className="basic-label">好きなもの</div>
                        <textarea className="basic-value" data-cat="basic" data-id="favourites" ref={el=>{ if(el) autosize(el) }} value={(local.favourites||[]).join(',')} onChange={e=> { setLocal({...local, favourites: splitList(e.target.value)}); autosize(e.target) }} onFocus={e=> { e.target.scrollIntoView({behavior:'smooth', block:'center'}); autosize(e.target) }} style={{height: (local.fieldHeights?.basic?.favourites) ? local.fieldHeights.basic.favourites + 'px' : undefined}} />
                      </div>
                    )}
                    {key === 'dislikes' && (
                      <div>
                        <div className="basic-label">嫌いなもの</div>
                        <textarea className="basic-value" data-cat="basic" data-id="dislikes" ref={el=>{ if(el) autosize(el) }} value={(local.dislikes||[]).join(',')} onChange={e=> { setLocal({...local, dislikes: splitList(e.target.value)}); autosize(e.target) }} onFocus={e=> { e.target.scrollIntoView({behavior:'smooth', block:'center'}); autosize(e.target) }} style={{height: (local.fieldHeights?.basic?.dislikes) ? local.fieldHeights.basic.dislikes + 'px' : undefined}} />
                      </div>
                    )}
                    {key === 'hobbies' && (
                      <div>
                        <div className="basic-label">趣味</div>
                        <textarea className="basic-value" data-cat="basic" data-id="hobbies" ref={el=>{ if(el) autosize(el) }} value={(local.hobbies||[]).join(',')} onChange={e=> { setLocal({...local, hobbies: splitList(e.target.value)}); autosize(e.target) }} onFocus={e=> { e.target.scrollIntoView({behavior:'smooth', block:'center'}); autosize(e.target) }} style={{height: (local.fieldHeights?.basic?.hobbies) ? local.fieldHeights.basic.hobbies + 'px' : undefined}} />
                      </div>
                    )}
                        {/* render unknown/extra basic keys as generic label+input */}
                        {!['name','reading','nickname','gender','relation','relationTags','contacts','address','birthday','workplace','favourites','dislikes','hobbies'].includes(key) && (
                          <div>
                            {editMode ? (
                              <input className="basic-label" placeholder="項目名" value={local.extraFields?.[key]?.label || ''} ref={el=>{ if(el && lastAdded?.type==='basicExtra' && lastAdded.id===key){ el.focus(); setLastAdded(null) } }} onChange={e=>{
                                const arr = {...(local.extraFields||{})}
                                arr[key] = {...(arr[key]||{}), label: e.target.value}
                                setLocal({...local, extraFields: arr})
                              }} />
                            ) : (
                              <div className="basic-label">{local.extraFields?.[key]?.label || '項目名'}</div>
                            )}
                            <textarea data-cat="basic" data-id={key} className="basic-value" ref={el=>{ if(el) autosize(el) }} value={local.extraFields?.[key]?.value || ''} onChange={e=>{
                              const arr = {...(local.extraFields||{})}
                              arr[key] = {...(arr[key]||{}), value: e.target.value}
                              setLocal({...local, extraFields: arr})
                              autosize(e.target)
                            }} onFocus={e=> { e.target.scrollIntoView({behavior:'smooth', block:'center'}); autosize(e.target) }} style={{height: (local.fieldHeights?.basic?.[key]) ? local.fieldHeights.basic[key] + 'px' : undefined}} />
                          </div>
                        )}
                  </div>
                  {editMode && (
                    <div className="basic-controls">
                      <button onClick={()=>{ 
                        const arr = (local.basicOrder||[]).filter(k=>k!==key)
                        const extras = {...(local.extraFields||{})}
                        if(extras[key]){ delete extras[key] }
                        setLocal({...local, basicOrder: arr, extraFields: extras})
                      }}>削除</button>
                    </div>
                  )}
                </div>
              ))}
              <div className="drop-target" onDragOver={onDragOver} onDrop={e=> { onDrop('basic', (local.basicOrder||[]).length, e) }}></div>
            </div>

            <div className="custom-list">
              {(local.customFields||[]).map((cf, idx)=> (
                <div key={cf.id} className="custom-row" onDragEnter={e=> e.currentTarget.classList.add('drag-over')} onDragLeave={e=> e.currentTarget.classList.remove('drag-over')} onDragOver={onDragOver} onDrop={e=> { e.currentTarget.classList.remove('drag-over'); onDrop('custom', idx, e) }}>
                  {editMode && <div className="drag-handle" draggable onDragStart={e=> onDragStart('custom', idx, e)}>≡</div>}
                  <div className="custom-main">
                    <input ref={el=>{ if(el && lastAdded?.type==='custom' && lastAdded.id===cf.id){ el.focus(); setLastAdded(null) } }} className="custom-label" placeholder="項目名" value={cf.label||''} onChange={e=>{
                      const arr = (local.customFields||[]).slice(); arr[idx] = {...arr[idx], label: e.target.value}; setLocal({...local, customFields: arr})
                    }} />
                    <textarea data-cat="custom" data-id={cf.id} className="custom-value" ref={el=>{ if(el) autosize(el) }} placeholder="内容" value={cf.value||''} onChange={e=>{
                      const arr = (local.customFields||[]).slice(); arr[idx] = {...arr[idx], value: e.target.value}; setLocal({...local, customFields: arr}); autosize(e.target)
                    }} style={{height: (local.fieldHeights?.custom?.[cf.id]) ? local.fieldHeights.custom[cf.id] + 'px' : undefined}} />
                  </div>
                  {editMode && (
                    <div className="custom-controls">
                      <button onClick={()=>{ const arr = (local.customFields||[]).filter(x=>x.id!==cf.id); setLocal({...local, customFields: arr}) }}>削除</button>
                    </div>
                  )}
                </div>
              ))}
              <div className="drop-target" onDragOver={onDragOver} onDrop={e=> { onDrop('custom', (local.customFields||[]).length, e) }}></div>
            </div>

            
          </div>
        )}

        {tab==='events' && (
          <div className="events">
            <div className="basic-row" style={{marginBottom:8}}>
              <div className="basic-main">
                <div className="basic-label">写真アルバム</div>
                <div className="album-upload">
                  <input type="file" accept="image/*" multiple onChange={async e=>{
                    const files = Array.from(e.target.files||[])
                    if(!files.length) return
                    const ids = []
                    for(const f of files){
                      try{
                        const id = await avatarStore.saveCompressedAvatar(f, { maxWidth: 1280, quality: 0.8 })
                        ids.push({ id })
                      }catch(err){ /* skip on error */ }
                    }
                    if(ids.length){
                      const photos = [ ...(local.photos||[]), ...ids ]
                      setLocal({...local, photos})
                    }
                    e.target.value=''
                  }} />
                </div>
                {(local.photos||[]).length>0 && (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(90px,1fr))',gap:6,marginTop:6}}>
                    {(local.photos||[]).map((ph, idx)=>{
                      const isObj = ph && typeof ph === 'object'
                      const src = isObj && ph.id ? (photoUrls[ph.id] || '') : (typeof ph === 'string' ? ph : '')
                      return (
                      <div key={idx} style={{position:'relative',cursor:'pointer'}}>
                        <img src={src} alt="memory" loading="lazy" style={{width:'100%',borderRadius:6,border:'1px solid #7a5230',objectFit:'cover',minHeight:60,background:'#111'}} onClick={()=>{
                          if(isObj && ph.id){
                            const url = photoUrls[ph.id]
                            if(url) setExpandedPhoto(url)
                          }else{
                            setExpandedPhoto(src)
                          }
                        }} />
                        {editMode && (
                          <button style={{position:'absolute',top:2,right:2,fontSize:12,padding:'2px 6px'}} onClick={()=>{
                            const arr = (local.photos||[]).slice()
                            arr.splice(idx,1)
                            setLocal({...local, photos: arr})
                          }}>削除</button>
                        )}
                      </div>)
                    })}
                  </div>
                )}
              </div>
            </div>

            <ul>
              {(local.events||[]).map((ev, i)=> (
                <li key={ev.id} className="event-row" onDragEnter={e=> e.currentTarget.classList.add('drag-over')} onDragLeave={e=> e.currentTarget.classList.remove('drag-over')} onDragOver={onDragOver} onDrop={e=> { e.currentTarget.classList.remove('drag-over'); onDrop('events', i, e) }}>
                  {editMode && <div className="drag-handle" draggable onDragStart={e=> onDragStart('events', i, e)}>≡</div>}
                  <textarea data-cat="events" data-id={ev.id} ref={el=>{ if(el && lastAdded?.type==='event' && lastAdded.id===ev.id){ el.focus(); setLastAdded(null); el.scrollIntoView({behavior:'smooth', block:'center'}); autosize(el) } }} rows={2} value={ev.text||''} placeholder="出来事の内容" onChange={e=>{
                    const arr = (local.events||[]).slice(); arr[i] = {...arr[i], text: e.target.value}; setLocal({...local, events: arr}); autosize(e.target)
                  }} onFocus={e=> { e.target.scrollIntoView({behavior:'smooth', block:'center'}); autosize(e.target) }} />
                  <div style={{height:0}} />
                  <div className="event-meta">{(new Date(ev.date)).toLocaleString()}</div>
                  {editMode && (
                    <div className="event-controls">
                      <button onClick={()=>{ const arr = (local.events||[]).filter(x=>x.id!==ev.id); setLocal({...local, events: arr}) }}>削除</button>
                    </div>
                  )}
                </li>
              ))}
              <div className="drop-target" onDragOver={onDragOver} onDrop={e=> { onDrop('events', (local.events||[]).length, e) }}></div>
            </ul>
          </div>
        )}

        {tab==='notes' && (
          <div className="notes">
            <label>前回話した内容<textarea data-cat="notesMeta" data-id="lastConversationSummary" ref={el=>{ if(el) autosize(el) }} value={local.lastConversationSummary||''} onChange={e=>{ setLocal({...local, lastConversationSummary:e.target.value}); autosize(e.target) }} style={{height: (local.fieldHeights?.notesMeta?.lastConversationSummary) ? local.fieldHeights.notesMeta.lastConversationSummary + 'px' : undefined}} /></label>
            <label>性格の特徴<textarea data-cat="notesMeta" data-id="personality" ref={el=>{ if(el) autosize(el) }} value={local.notes?.personality||''} onChange={e=>{ setLocal({...local, notes:{...local.notes, personality:e.target.value}}); autosize(e.target) }} style={{height: (local.fieldHeights?.notesMeta?.personality) ? local.fieldHeights.notesMeta.personality + 'px' : undefined}} /></label>
            <label>悩み事<textarea data-cat="notesMeta" data-id="worries" ref={el=>{ if(el) autosize(el) }} value={local.notes?.worries||''} onChange={e=>{ setLocal({...local, notes:{...local.notes, worries:e.target.value}}); autosize(e.target) }} style={{height: (local.fieldHeights?.notesMeta?.worries) ? local.fieldHeights.notesMeta.worries + 'px' : undefined}} /></label>
            <label>したい事<textarea data-cat="notesMeta" data-id="wants" ref={el=>{ if(el) autosize(el) }} value={local.notes?.wants||''} onChange={e=>{ setLocal({...local, notes:{...local.notes, wants:e.target.value}}); autosize(e.target) }} style={{height: (local.fieldHeights?.notesMeta?.wants) ? local.fieldHeights.notesMeta.wants + 'px' : undefined}} /></label>
            <label>話題の好み<textarea data-cat="notesMeta" data-id="topics" ref={el=>{ if(el) autosize(el) }} value={local.notes?.topics||''} onChange={e=>{ setLocal({...local, notes:{...local.notes, topics:e.target.value}}); autosize(e.target) }} style={{height: (local.fieldHeights?.notesMeta?.topics) ? local.fieldHeights.notesMeta.topics + 'px' : undefined}} /></label>
            <label>共通の話題<textarea data-cat="notesMeta" data-id="commonTopics" ref={el=>{ if(el) autosize(el) }} value={local.notes?.commonTopics||''} onChange={e=>{ setLocal({...local, notes:{...local.notes, commonTopics:e.target.value}}); autosize(e.target) }} style={{height: (local.fieldHeights?.notesMeta?.commonTopics) ? local.fieldHeights.notesMeta.commonTopics + 'px' : undefined}} /></label>
            <div className="notes-entries">
              {(local.notes?.entries||[]).map((en, i)=> (
                <div key={en.id} onDragEnter={e=> e.currentTarget.classList.add('drag-over')} onDragLeave={e=> e.currentTarget.classList.remove('drag-over')} onDragOver={onDragOver} onDrop={e=> { e.currentTarget.classList.remove('drag-over'); onDrop('notes', i, e) }}>
                  {editMode && <div className="drag-handle" draggable onDragStart={e=> onDragStart('notes', i, e)}>≡</div>}
                  <div style={{flex:1,display:'flex',flexDirection:'column',gap:6}}>
                    {editMode ? (
                      <input className="note-label" ref={el=>{ if(el && lastAdded?.type==='note' && lastAdded.id===en.id){ el.focus(); setLastAdded(null); el.scrollIntoView({behavior:'smooth', block:'center'}) } }} value={en.label||''} onChange={e=>{
                        const arr = (local.notes?.entries||[]).slice(); arr[i] = {...arr[i], label: e.target.value}; setLocal({...local, notes:{...local.notes, entries: arr}})
                      }} onFocus={e=> e.target.scrollIntoView({behavior:'smooth', block:'center'})} />
                    ) : (
                      <div className="note-label">{en.label || '項目名'}</div>
                    )}
                    <textarea data-cat="notes" data-id={en.id} ref={el=>{ if(el && lastAdded?.type==='note' && lastAdded.id===en.id){ /* ensure newly added is sized and focused */ el.focus(); setLastAdded(null); autosize(el); el.scrollIntoView({behavior:'smooth', block:'center'}) } }} value={en.text||''} onChange={e=>{
                      const arr = (local.notes?.entries||[]).slice(); arr[i] = {...arr[i], text: e.target.value}; setLocal({...local, notes:{...local.notes, entries: arr}}); autosize(e.target)
                    }} onFocus={e=> { e.target.scrollIntoView({behavior:'smooth', block:'center'}); autosize(e.target) }} style={{height: (local.fieldHeights?.notes?.[en.id]) ? local.fieldHeights.notes[en.id] + 'px' : undefined}} />
                  </div>
                  {editMode && (
                    <div className="note-controls">
                      <button onClick={()=>{ const arr = (local.notes?.entries||[]).filter(x=>x.id!==en.id); setLocal({...local, notes:{...local.notes, entries: arr}}) }}>削除</button>
                    </div>
                  )}
                </div>
              ))}
              <div className="drop-target" onDragOver={onDragOver} onDrop={e=> { onDrop('notes', (local.notes?.entries||[]).length, e) }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {expandedPhoto && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.8)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setExpandedPhoto(null)}>
          <img src={expandedPhoto} alt="expanded" style={{maxWidth:'90%',maxHeight:'90%',borderRadius:8}} onClick={e=>e.stopPropagation()} />
        </div>
      )}

      {/* Avatar Crop Modal */}
      {showAvatarCrop && avatarCropImage && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.9)',zIndex:300,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:16}}>
          <div
            ref={cropViewportRef}
            onPointerDown={onCropPointerDown}
            onPointerMove={onCropPointerMove}
            onPointerUp={onCropPointerUp}
            style={{
              flex:1,
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              marginBottom:16,
              position:'relative',
              maxWidth:'90vw',
              maxHeight:'70vh',
              width: 'min(90vw, 480px)',
              height: 'min(70vh, 480px)',
              touchAction: 'none',
              background:'rgba(0,0,0,0.3)',
              borderRadius:8
            }}
          >
            <img
              src={avatarCropImage}
              alt="crop"
              style={{
                position:'absolute',
                top:'50%',
                left:'50%',
                transform: `translate(calc(-50% + ${cropOffset.x}px), calc(-50% + ${cropOffset.y}px)) scale(${cropScale})`,
                transformOrigin: 'center center',
                userSelect:'none',
                pointerEvents:'none'
              }}
            />
            {/* Fixed square crop overlay centered */}
            <div style={{
              position:'absolute',
              top:'50%',
              left:'50%',
              width:440,
              height:440,
              transform:'translate(-50%, -50%)',
              border:'3px solid #fff',
              borderRadius:8,
              pointerEvents:'none',
              boxShadow:'0 0 0 9999px rgba(0,0,0,0.5)'
            }} />
            {/* Buttons overlay below the crop box */}
            <div style={{
              position:'absolute',
              top:'calc(50% + 220px + 20px)',
              left:'50%',
              transform:'translateX(-50%)',
              display:'flex',
              gap:8
            }}>
              <button onClick={applyCropAvatar}>トリミング確定</button>
              <button onClick={()=>{ setShowAvatarCrop(false); setAvatarCropImage(null) }}>キャンセル</button>
            </div>
          </div>
        </div>
      )}

      <canvas ref={cropCanvasRef} style={{display:'none'}} />
    </div>
  )
}

function splitList(str){
  return str.split(',').map(s=>s.trim()).filter(Boolean)
}
function safeParse(s){
  try{ return JSON.parse(s) }catch(e){ return {} }
}
