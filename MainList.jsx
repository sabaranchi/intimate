import React, { useState, useEffect, useRef } from 'react'
import * as avatarStore from '../utils/avatarStore'
import * as friendLogic from '../utils/friendLogic'

function makeId(){ return String(Date.now() + Math.floor(Math.random()*1000)) }
// PersonPageの関係性プリセットと一致させる
const REL_PRESETS = ['中学','高校','大学','友達','恋人','元恋人','先輩','後輩','サークル','バイト','職場','上司','同僚','部下','家族','趣味仲間','SNS友達','近所','その他']

export default function MainList({people, onAdd, onUpdate, onToggleDrawer, onDeleteMultiple}){
  const [avatarMap, setAvatarMap] = useState({})
  const prevUrls = useRef({})
  const [q, setQ] = useState('')
  const [sortBy, setSortBy] = useState('lastInteractionDate_desc')
  const [relationFilter, setRelationFilter] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [deleteMode, setDeleteMode] = useState(false)
  const [selectedForDelete, setSelectedForDelete] = useState(new Set())
  const DAILY_PREFIX = 'intimate_daily_actions_'
  const [todayKey, setTodayKey] = useState(()=> fmtYMD(new Date()))
  const [daily, setDaily] = useState(()=> loadDaily(fmtYMD(new Date())))

  useEffect(()=>{
    let mounted = true
    // revoke previous urls
    Object.values(prevUrls.current).forEach(u=>{ try{ URL.revokeObjectURL(u) }catch(e){} })
    prevUrls.current = {}
    async function build(){
      const map = {}
      await Promise.all(people.map(async p=>{
        if(!p) return
        if(p.avatar) { map[p.id] = p.avatar; return }
        if(p.avatarId){
          try{
            const u = await avatarStore.getAvatarURL(p.avatarId)
            if(u){ map[p.id] = u; prevUrls.current[p.id] = u }
          }catch(e){}
        }
      }))
      if(mounted) setAvatarMap(map)
    }
    build()
    return ()=>{ mounted = false; Object.values(prevUrls.current).forEach(u=>{ try{ URL.revokeObjectURL(u) }catch(e){} }) }
  }, [people])

  useEffect(()=>{
    function handleDeleteMode(){
      toggleDeleteMode()
    }
    window.addEventListener('intimate:enterDeleteMode', handleDeleteMode)
    return ()=> window.removeEventListener('intimate:enterDeleteMode', handleDeleteMode)
  }, [])

  function gotoPerson(id){
    window.location.hash = `#person:${id}`
  }

  function fmtYMD(d){ const y=d.getFullYear(); const m=('0'+(d.getMonth()+1)).slice(-2); const da=('0'+d.getDate()).slice(-2); return `${y}-${m}-${da}` }
  function loadDaily(key){
    try{
      const raw = localStorage.getItem(DAILY_PREFIX + key)
      return raw ? JSON.parse(raw) : {}
    }catch(e){ return {} }
  }
  function saveDaily(key, obj){ try{ localStorage.setItem(DAILY_PREFIX + key, JSON.stringify(obj)) }catch(e){} }

  // watch day change: before switching, apply daily action boosts, then reset checkboxes
  useEffect(()=>{
    const t = setInterval(()=>{
      const k = fmtYMD(new Date())
      if(k !== todayKey){
        // apply boosts accumulated for previous day
        const prevDayData = daily || {}
        Object.keys(prevDayData).forEach(pid => {
          const d = prevDayData[pid] || {}
          const totalDelta = (d.called? (friendLogic.ACTION_DELTA.called||0) : 0)
            + (d.talked? (friendLogic.ACTION_DELTA.talked||0) : 0)
            + (d.played? (friendLogic.ACTION_DELTA.played||0) : 0)
          if(totalDelta){
            const person = people.find(p=> String(p.id) === String(pid))
            const cur = person?.friendScore || 20
            const next = friendLogic.clamp(cur + totalDelta)
            // 最終連絡日も前日キー（todayKey）で更新
            onUpdate(pid, { friendScore: next, lastInteractionDate: todayKey })
          }
        })
        // move to new day and clear daily state
        setTodayKey(k)
        setDaily(loadDaily(k))
      }
    }, 60000)
    return ()=> clearInterval(t)
  }, [todayKey, daily, people])

  function toggleDaily(id, field, value){
    setDaily(prev=>{
      const next = {...prev, [id]: {...(prev[id]||{}), [field]: value}}
      saveDaily(todayKey, next)
      return next
    })
    // 日内のスコア加算・最終連絡日の更新は翌日切替時にまとめて適用
    // ここではdaily状態のみ更新する
  }

  function toggleDeleteMode(){
    setDeleteMode(v=> !v)
    setSelectedForDelete(new Set())
  }

  function toggleSelectForDelete(id){
    setSelectedForDelete(prev=>{
      const next = new Set(prev)
      if(next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function executeDelete(){
    if(selectedForDelete.size === 0) return
    if(!window.confirm(`${selectedForDelete.size}件の人物を削除してもよろしいですか？`)) return
    onDeleteMultiple && onDeleteMultiple(selectedForDelete)
    setDeleteMode(false)
    setSelectedForDelete(new Set())
  }

  // build filtered & sorted list
  const terms = q.trim().toLowerCase()
  // PersonPageのプリセットも候補に統合（存在しないタグでも選べるように）
  const fromPeople = Array.from(new Set(people.flatMap(p=> p?.relationTags || [])))
  const allRelations = Array.from(new Set([...(REL_PRESETS||[]), ...fromPeople]))
  const presetSet = new Set(REL_PRESETS)
  const relationOptions = [...REL_PRESETS, ...allRelations.filter(x=> !presetSet.has(x)).sort()]
  const filtered = people.filter(p=>{
    if(terms){
      const bag = [p.name, p.reading, p.nickname, (p.relationTags||[]).join(','), (p.groups||[]).join(','), p.relation].filter(Boolean).join(' ').toLowerCase()
      if(!bag.includes(terms)) return false
    }
    if(relationFilter.length){
      const ptags = new Set((p.relationTags||[]).map(String))
      for(const t of relationFilter){ if(!ptags.has(t)) return false }
    }
    return true
  })

  // apply sorting
  const sorted = [...filtered].sort((a, b)=>{
    if(sortBy === 'lastInteractionDate_desc'){
      const aDate = a.lastInteractionDate || ''
      const bDate = b.lastInteractionDate || ''
      return bDate.localeCompare(aDate)
    }else if(sortBy === 'lastInteractionDate_asc'){
      const aDate = a.lastInteractionDate || ''
      const bDate = b.lastInteractionDate || ''
      return aDate.localeCompare(bDate)
    }else if(sortBy === 'friendScore_desc'){
      return (b.friendScore||0) - (a.friendScore||0)
    }else if(sortBy === 'friendScore_asc'){
      return (a.friendScore||0) - (b.friendScore||0)
    }else if(sortBy === 'name'){
      return (a.name||'').localeCompare(b.name||'')
    }
    return 0
  })

  return (
    <div className="main-list">
      <div className="list-actions" style={{display:'flex',flexDirection:'column',gap:8,width:'100%'}}>
        {/* 1段目: 検索バー + メニュー */}
        <div style={{display:'flex',gap:8,alignItems:'center',width:'100%'}}>
          <input placeholder="検索" value={q} onChange={e=> setQ(e.target.value)} style={{flex:'1',minWidth:'100px'}} />
          <div className="drawer-toggle" style={{position:'static'}}>
            <button onClick={()=> onToggleDrawer && onToggleDrawer()}>☰</button>
          </div>
        </div>
        {/* 2段目: ソートトグル + 絞り込みボタン */}
        <div style={{display:'flex',gap:8,alignItems:'center',width:'100%',flexWrap:'wrap'}}>
          <select value={sortBy} onChange={e=> setSortBy(e.target.value)} style={{flex:'1',minWidth:'100px'}}>
            <option value="lastInteractionDate_desc">最終対面日（新しい順）</option>
            <option value="lastInteractionDate_asc">最終対面日（古い順）</option>
            <option value="friendScore_desc">親密度（高い順）</option>
            <option value="friendScore_asc">親密度（低い順）</option>
            <option value="name">名前順</option>
          </select>
          <button type="button" onClick={e=>{ e.stopPropagation(); setShowFilters(v=> !v) }} style={{padding:'6px 12px',whiteSpace:'nowrap'}}>絞り込み</button>
        </div>
        {/* 絞り込みボタン押下でchip rowを表示 */}
        {showFilters && relationOptions.length > 0 && (
          <div className="chip-row" style={{margin:'6px 0 10px 0', display:'flex', gap:6, flexWrap:'wrap'}}>
            {relationOptions.map(r=>{
              const on = relationFilter.includes(r)
              return (
                <button key={r} type="button" className={"chip " + (on?'chip-on':'chip-off')} onClick={()=>{
                  setRelationFilter(prev=>{
                    if(prev.includes(r)) return prev.filter(x=> x!==r)
                    return [...prev, r]
                  })
                }}>{r}</button>
              )
            })}
          </div>
        )}
        {/* 削除モード: 削除実行ボタンと選択数 */}
        {deleteMode && (
          <div style={{display:'flex',gap:8,alignItems:'center',width:'100%',padding:'8px',background:'rgba(255,200,200,0.3)',borderRadius:'6px'}}>
            <span style={{flex:1}}>{selectedForDelete.size}件選択</span>
            <button type="button" onClick={executeDelete} style={{padding:'6px 12px',whiteSpace:'nowrap'}}>削除実行</button>
            <button type="button" onClick={toggleDeleteMode} style={{padding:'6px 12px',whiteSpace:'nowrap'}}>キャンセル</button>
          </div>
        )}
      </div>

      <ul className="people-list">
        {sorted.map(p=> (
          <li key={p.id} className="person-row" onClick={()=> deleteMode ? null : gotoPerson(p.id)} style={{cursor: deleteMode ? 'default' : 'pointer'}}>
            {deleteMode && (
              <input type="checkbox" checked={selectedForDelete.has(p.id)} onChange={()=> toggleSelectForDelete(p.id)} onClick={e=> e.stopPropagation()} style={{marginRight:8}} />
            )}
            <img className="avatar" src={avatarMap[p.id] || p.avatar || '/icon-192.png'} alt="avatar" />
            <div className="meta">
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div className="name">{p.name}</div>
                <select className="list-relation-select" value={p.relationshipStatus || 'unknown'} onClick={e=>e.stopPropagation()} onMouseDown={e=>e.stopPropagation()} onChange={e=>{ e.stopPropagation(); onUpdate(p.id, { relationshipStatus: e.target.value }) }}>
                  <option value="unknown">不明</option>
                  <option value="partner_yes">交際あり</option>
                  <option value="partner_no">交際なし</option>
                  <option value="married">既婚</option>
                  <option value="single">独身</option>
                </select>
              </div>
              <div className="hearts">
                {Array.from({length:10}).map((_,i)=>{
                  const pct = Math.round((p.friendScore||0)/10)
                  const filled = i < pct
                  // append variation selector-15 to force text presentation (avoid emoji)
                  const filledChar = '♥\uFE0E'
                  const emptyChar = '♡\uFE0E'
                  return <span key={i} className={"heart " + (filled? 'filled':'')}>{filled ? filledChar : emptyChar}</span>
                })}
              </div>
              {(p.relationTags && p.relationTags.length>0) && (
                <div style={{fontSize:12,opacity:0.8}}>#{p.relationTags.join(' #')}</div>
              )}
              <div className="last-interaction" style={{fontSize:12,opacity:0.9,marginTop:4}}>最終対面/連絡日: {p.lastInteractionDate || '—'}</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:4}} onClick={e=> e.stopPropagation()}>
                {p.contacts?.tel && <a href={`tel:${p.contacts.tel}`} className="chip" style={{padding:'4px 8px'}}>📞</a>}
                {p.contacts?.email && <a href={`mailto:${p.contacts.email}`} className="chip" style={{padding:'4px 8px'}}>✉️</a>}
                {p.contacts?.twitter && <a href={`https://twitter.com/${p.contacts.twitter.replace(/^@/, '')}`} target="_blank" rel="noreferrer" className="chip" style={{padding:'4px 8px'}}>𝕏</a>}
                {p.contacts?.line && <a href={`${p.contacts.line.startsWith('http') ? p.contacts.line : 'https://line.me/R/ti/p/' + p.contacts.line}`} target="_blank" rel="noreferrer" className="chip" style={{padding:'4px 8px'}}>LINE</a>}
                {p.contacts?.instagram && <a href={`https://instagram.com/${p.contacts.instagram.replace(/^@/, '')}`} target="_blank" rel="noreferrer" className="chip" style={{padding:'4px 8px'}}>📷</a>}
                {p.contacts?.tiktok && <a href={`https://tiktok.com/@${p.contacts.tiktok.replace(/^@/, '')}`} target="_blank" rel="noreferrer" className="chip" style={{padding:'4px 8px'}}>🎵</a>}
                {p.contacts?.bereal && <a href={`https://bereal.com`} target="_blank" rel="noreferrer" className="chip" style={{padding:'4px 8px',cursor:'help'}} title={`BeReal: @${p.contacts.bereal}`}>🎬</a>}
              </div>
              <div className="daily-actions" style={{display:'flex',gap:4,alignItems:'center',flexWrap:'wrap',marginTop:4}} onClick={e=> e.stopPropagation()}>
                <label style={{display:'flex',alignItems:'center',gap:2}}>
                  <input type="checkbox" checked={!!(daily[p.id]?.called)} onChange={e=> toggleDaily(p.id, 'called', e.target.checked)} /> 連絡とった
                </label>
                <label style={{display:'flex',alignItems:'center',gap:2}}>
                  <input type="checkbox" checked={!!(daily[p.id]?.talked)} onChange={e=> toggleDaily(p.id, 'talked', e.target.checked)} /> 話した
                </label>
                <label style={{display:'flex',alignItems:'center',gap:2}}>
                  <input type="checkbox" checked={!!(daily[p.id]?.played)} onChange={e=> toggleDaily(p.id, 'played', e.target.checked)} /> 遊んだ
                </label>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
