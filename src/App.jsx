import React, { useEffect, useRef, useState } from 'react'
import MainList from './components/MainList'
import CalendarPage from './components/CalendarPage'
import PersonPage from './components/PersonPage'
import * as friendLogic from './utils/friendLogic'
import * as avatarStore from './utils/avatarStore'
import * as db from './utils/db'

const STORAGE_KEY = 'intimate_people_v1'
const PIN_KEY = 'intimate_app_pin'
const REMINDER_KEY = 'intimate_last_reminder_check'

function loadPeopleLocal(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  }catch(e){
    return []
  }
}

async function loadPeopleDb(){
  try{
    const data = await db.getKv(STORAGE_KEY)
    return Array.isArray(data) ? data : []
  }catch(e){
    return []
  }
}

async function savePeopleDb(p){
  try{
    await db.setKv(STORAGE_KEY, p)
  }catch(e){
    // fallback: best effort localStorage
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(p)) }catch(_e){}
  }
}

export default function App(){
  const [people, setPeople] = useState([])
  const [loaded, setLoaded] = useState(false)
  const migrationDoneRef = useRef(false)
  const [route, setRoute] = useState(window.location.hash || '#')
  const [locked, setLocked] = useState(true)
  const [pinMode, setPinMode] = useState(false)
  const [message, setMessage] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createAvatarFile, setCreateAvatarFile] = useState(null)

  useEffect(()=>{
    const h = ()=>setRoute(window.location.hash || '#')
    window.addEventListener('hashchange', h)
    return ()=> window.removeEventListener('hashchange', h)
  },[])

  // 初期ロード: IndexedDB -> (なければ) localStorage を取り込み
  useEffect(()=>{
    let cancelled = false
    ;(async()=>{
      const fromDb = await loadPeopleDb()
      if(!cancelled && fromDb.length){
        setPeople(fromDb)
        setLoaded(true)
        return
      }
      const fromLocal = loadPeopleLocal()
      if(!cancelled){
        setPeople(fromLocal)
        setLoaded(true)
      }
      if(fromLocal.length){
        await savePeopleDb(fromLocal)
        localStorage.removeItem(STORAGE_KEY)
      }
    })()
    return ()=>{ cancelled = true }
  }, [])

  // 保存: people が変わったら IndexedDB に保存（初期ロード完了後）
  useEffect(()=>{
    if(!loaded) return
    savePeopleDb(people)
    // localStorage を使わず容量圧迫を防ぐ
    try{ localStorage.removeItem(STORAGE_KEY) }catch(e){}
  }, [people, loaded])

  // migrate any inline data: URLs to IndexedDB on startup
  useEffect(()=>{
    if(!loaded) return
    if(migrationDoneRef.current) return
    migrationDoneRef.current = true
    async function migrate(){
      let changed = false
      const out = await Promise.all((people||[]).map(async p => {
        // Migrate avatar data URLs
        if(p && typeof p.avatar === 'string' && p.avatar.startsWith('data:')){
          try{
            const resp = await fetch(p.avatar)
            const blob = await resp.blob()
            const id = await avatarStore.saveAvatarBlob(blob)
            changed = true
            const np = {...p}
            delete np.avatar
            np.avatarId = id
            return np
          }catch(e){ return p }
        }
        // Migrate photo data URLs
        if(p && Array.isArray(p.photos) && p.photos.some(ph => typeof ph === 'string')){
          const convertedPhotos = []
          for(const ph of p.photos){
            if(typeof ph === 'string'){
              try{
                const resp = await fetch(ph)
                const blob = await resp.blob()
                const id = await avatarStore.saveCompressedAvatar(blob, { maxWidth: 1280, quality: 0.8 })
                convertedPhotos.push({ id })
                changed = true
              }catch(e){ convertedPhotos.push(ph) }
            }else{
              convertedPhotos.push(ph)
            }
          }
          return {...p, photos: convertedPhotos}
        }
        return p
      }))
      if(changed){
        setPeople(out)
        savePeopleDb(out)
      }
    }
    migrate()
  }, [loaded, people])

  useEffect(()=>{
    const stored = localStorage.getItem(PIN_KEY)
    if(!stored) setLocked(false)
  },[])

  // アプリ起動時にスコア減衰を適用する
  useEffect(()=>{
    setPeople(prev => (prev || []).map(p => friendLogic.calculateScoreDecay(p)))
  }, [])

  // 通知許可を穏やかにリクエスト
  useEffect(()=>{
    if(typeof Notification === 'undefined') return
    if(Notification.permission === 'default'){
      // 軽く遅延してからリクエスト（初回のみ）
      const t = setTimeout(()=>{ try{ Notification.requestPermission() }catch(e){} }, 1500)
      return ()=> clearTimeout(t)
    }
  }, [])

  function sameMonthDay(d1, d2){
    return d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
  }
  function fmtYMD(d){ const y=d.getFullYear(); const m=('0'+(d.getMonth()+1)).slice(-2); const da=('0'+d.getDate()).slice(-2); return `${y}-${m}-${da}` }
  function notify(title, body){
    try{
      if(typeof Notification !== 'undefined' && Notification.permission === 'granted'){
        new Notification(title, { body, icon: '/icon-192.png' })
      }
    }catch(e){}
  }

  // 起動時リマインダー: 本日誕生日、フォロー予定日
  useEffect(()=>{
    const today = new Date()
    const todayKey = fmtYMD(today)
    const last = localStorage.getItem(REMINDER_KEY)
    if(last === todayKey) return
    const msgs = []
    ;(people||[]).forEach(p=>{
      // 誕生日が7日以内
      if(p && p.birthday){
        const bd = new Date(p.birthday)
        if(!isNaN(bd)){
          // 今年の誕生日を計算
          const thisYearBd = new Date(today.getFullYear(), bd.getMonth(), bd.getDate())
          const daysUntil = Math.floor((thisYearBd - today) / 86400000)
          if(daysUntil >= 0 && daysUntil <= 7){
            msgs.push(`${p.name} さんの誕生日まであと${daysUntil}日🎂`)
          }
        }
      }
      // 最終連絡日から3週間経過
      if(p && p.lastInteractionDate){
        const lastDate = new Date(p.lastInteractionDate)
        if(!isNaN(lastDate)){
          const daysSince = Math.floor((today - lastDate) / 86400000)
          if(daysSince >= 21){
            msgs.push(`${p.name} さんに${daysSince}日間連絡していません`)
          }
        }
      }
    })
    if(msgs.length){
      notify('リマインダー', msgs.join('\n'))
    }
    localStorage.setItem(REMINDER_KEY, todayKey)
  }, [people])

  function addPerson(person){
    const newP = [...people, person]
    setPeople(newP)
  }
  function updatePerson(id, patch){
    const newP = people.map(p=> p.id===id ? {...p, ...patch} : p)
    setPeople(newP)
  }
  function deleteMultiplePeople(idSet){
    const newP = people.filter(p=> !idSet.has(p.id))
    setPeople(newP)
  }
  function exportJSON(){
    const blob = new Blob([JSON.stringify(people,null,2)], {type:'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'people_export.json'
    a.click()
    URL.revokeObjectURL(url)
  }
  function importJSON(file){
    const reader = new FileReader()
    reader.onload = ()=>{
      try{
        const parsed = JSON.parse(reader.result)
        if(Array.isArray(parsed)){
          setPeople(parsed)
          setMessage('インポート完了')
        }else{
          setMessage('不正なファイルです')
        }
      }catch(e){ setMessage('読み込み失敗') }
    }
    reader.readAsText(file)
  }

  function openCreateModal(){
    setShowCreateModal(true)
    setDrawerOpen(false)
  }
  function doCreate(){
    const id = String(Date.now() + Math.floor(Math.random()*1000))
    const reader = new FileReader()
    const finalize = async (avatarId)=>{
      const person = {
        id,
        name: createName || '無名',
        reading:'',
        nickname:'',
          relationshipStatus: 'unknown',
        gender:'',
        relation:'',
        contacts:{},
        address:'',
        birthday:'',
        followUpDate:'',
        workplace:'',
        school:'',
        favourites:[],
        dislikes:[],
        hobbies:[],
        tags:[],
        groups:[],
        lastInteractionDate:'',
        avatarId: avatarId || null,
        friendScore:20,
        events:[],
        notes:{ personality:'', worries:'', wants:'', topics:'', commonTopics:'' },
        stats:{ talkDays:0, playCount:0 }
      }
      addPerson(person)
      setShowCreateModal(false)
      setCreateName('')
      setCreateAvatarFile(null)
    }
    if(createAvatarFile){
      // compress + store in IndexedDB
      avatarStore.saveCompressedAvatar(createAvatarFile, { maxWidth: 512, quality: 0.75 }).then(id=> finalize(id)).catch(()=> finalize(null))
    }else finalize(null)
  }

  function setPin(pin){
    if(pin) localStorage.setItem(PIN_KEY, pin)
  }
  function tryUnlock(pin){
    const stored = localStorage.getItem(PIN_KEY)
    if(!stored){ setLocked(false); return true }
    if(pin === stored){ setLocked(false); return true }
    return false
  }

  if(locked){
    return (
      <div className="lock-screen">
        <h2>アプリを開くにはPINを入力してください</h2>
        <PinForm onSetPin={(p)=>{ setPin(p); setPinMode(false); setMessage('PINを設定しました'); }} onUnlock={(p)=>{ if(tryUnlock(p)) setMessage('解除しました'); else setMessage('PINが違います') }} pinMode={pinMode} setPinMode={setPinMode} message={message} />
      </div>
    )
  }

  const currentId = route.startsWith('#person:') ? route.split(':')[1] : null

  return (
    <div className="app-root">
      {drawerOpen && (
        <div className="drawer">
          <button onClick={openCreateModal}>新規追加</button>
          <button onClick={()=>{ setDrawerOpen(false); window.dispatchEvent(new CustomEvent('intimate:enterDeleteMode')) }}>人物削除</button>
          <button onClick={()=>{ setDrawerOpen(false); window.location.hash = '#calendar' }}>カレンダー</button>
          <button onClick={exportJSON}>エクスポート</button>
          <label className="import-btn">インポート<input type="file" accept="application/json" onChange={e=> importJSON(e.target.files[0])} style={{display:'none'}} /></label>
          <button onClick={()=> setDrawerOpen(false)}>閉じる</button>
        </div>
      )}
      <main>
        {route === '#calendar' && (
          <CalendarPage people={people} onBack={()=> window.location.hash = '#'} />
        )}
        {route !== '#calendar' && !currentId && <MainList people={people} onAdd={addPerson} onUpdate={updatePerson} onToggleDrawer={()=> setDrawerOpen(v=>!v)} onDeleteMultiple={deleteMultiplePeople} />}
        {route !== '#calendar' && currentId && <PersonPage person={people.find(p=>p.id===currentId)} onSave={(patch)=> updatePerson(currentId, patch)} onBack={()=> window.location.hash = '#'} />}
      </main>
      {showCreateModal && (
        <div className="modal-mask">
          <div className="modal">
            <h3>人物を追加</h3>
            <input placeholder="名前" value={createName} onChange={e=> setCreateName(e.target.value)} />
            <input type="file" accept="image/*" onChange={e=> setCreateAvatarFile(e.target.files[0])} />
            <div style={{marginTop:8}}>
              <button onClick={doCreate}>作成</button>
              <button onClick={()=> setShowCreateModal(false)}>キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PinForm({onSetPin, onUnlock, pinMode, setPinMode, message}){
  const [pin, setPin] = useState('')
  return (
    <div className="pin-form">
      {pinMode ? (
        <>
          <p>新しいPINを入力して設定</p>
          <input value={pin} onChange={e=>setPin(e.target.value)} placeholder="4桁以上" />
          <button onClick={()=>{ onSetPin(pin); setPin('') }}>設定</button>
          <button onClick={()=> setPinMode(false)}>キャンセル</button>
        </>
      ) : (
        <>
          <p>既存のPINを入力、またはPINを設定してください</p>
          <input value={pin} onChange={e=>setPin(e.target.value)} placeholder="PIN" />
          <button onClick={()=>{ onUnlock(pin); setPin('') }}>解除</button>
          <button onClick={()=> setPinMode(true)}>新しいPINを設定</button>
        </>
      )}
      <div className="pin-message">{message}</div>
    </div>
  )
}
