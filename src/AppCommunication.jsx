import React, { useEffect, useRef, useState } from 'react'
import MainListCommunication from './components/MainListCommunication'
import CalendarPage from './components/CalendarPage'
import CommunicationPersonPage from './components/CommunicationPersonPage'
import * as avatarStore from './utils/avatarStore'
import * as db from './utils/db'
import * as friendLogic from './utils/friendLogic'

const STORAGE_KEY = 'intimate_people_v1'
const PIN_KEY = 'intimate_app_pin'

function loadPeopleLocal(){
  try{
    const value = localStorage.getItem(STORAGE_KEY)
    return value ? JSON.parse(value) : []
  }catch(e){ return [] }
}

async function loadPeopleDb(){
  try{
    const value = await db.getKv(STORAGE_KEY)
    return Array.isArray(value) ? value : []
  }catch(e){ return [] }
}

async function savePeople(people){
  try{
    await db.setKv(STORAGE_KEY, people)
    localStorage.removeItem(STORAGE_KEY)
  }catch(e){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(people)) }catch(_e){}
  }
}

export default function AppCommunication(){
  const [people, setPeople] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [route, setRoute] = useState(window.location.hash || '#')
  const [locked, setLocked] = useState(()=> Boolean(localStorage.getItem(PIN_KEY)))
  const [pinMode, setPinMode] = useState(false)
  const [message, setMessage] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createAvatarFile, setCreateAvatarFile] = useState(null)
  const avatarMigrationStarted = useRef(false)

  useEffect(()=>{
    const handleHashChange = ()=> setRoute(window.location.hash || '#')
    window.addEventListener('hashchange', handleHashChange)
    return ()=> window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(()=>{
    let active = true
    ;(async()=>{
      const fromDb = await loadPeopleDb()
      const fromLocal = fromDb.length ? [] : loadPeopleLocal()
      const initial = fromDb.length ? fromDb : fromLocal
      if(active){ setPeople(initial); setLoaded(true) }
      if(fromLocal.length) await savePeople(fromLocal)
    })()
    return ()=>{ active = false }
  }, [])

  useEffect(()=>{
    if(loaded) savePeople(people)
  }, [people, loaded])

  // Keep all existing photos while moving old inline images into IndexedDB.
  useEffect(()=>{
    if(!loaded || avatarMigrationStarted.current) return
    avatarMigrationStarted.current = true
    ;(async()=>{
      let changed = false
      const migrated = await Promise.all(people.map(async person=>{
        if(typeof person?.avatar !== 'string' || !person.avatar.startsWith('data:')) return person
        try{
          const response = await fetch(person.avatar)
          const avatarId = await avatarStore.saveAvatarBlob(await response.blob())
          const next = {...person, avatarId}
          delete next.avatar
          changed = true
          return next
        }catch(e){ return person }
      }))
      if(changed) setPeople(migrated)
    })()
  }, [loaded, people])

  function updatePerson(id, patch){
    setPeople(prev=> prev.map(person=> person.id === id ? {...person, ...patch} : person))
  }

  function deletePeople(ids){
    setPeople(prev=> prev.filter(person=> !ids.has(person.id)))
  }

  async function createPerson(){
    let avatarId = null
    if(createAvatarFile){
      try{ avatarId = await avatarStore.saveCompressedAvatar(createAvatarFile, {maxWidth: 720, quality: 0.82}) }catch(e){}
    }
    const communication = friendLogic.createEmptyCommunicationProfile()
    setPeople(prev=> [...prev, {
      id: String(Date.now() + Math.floor(Math.random() * 1000)),
      name: createName.trim() || '無名',
      reading: '', nickname: '', gender: '', relation: '', relationTags: [],
      relationshipStatus: 'unknown', contacts: {}, address: '', birthday: '', followUpDate: '',
      workplace: '', school: '', favourites: [], dislikes: [], hobbies: [], tags: [], groups: [],
      avatarId, communication, lastInteractionDate: '', lastConversationSummary: '', friendScore: 0,
      events: [], photos: [], customFields: [],
      notes: {personality: '', worries: '', wants: '', topics: '', commonTopics: '', entries: []},
      stats: {talkDays: 0, playCount: 0}
    }])
    setCreateName('')
    setCreateAvatarFile(null)
    setShowCreateModal(false)
  }

  function exportJSON(){
    const blob = new Blob([JSON.stringify(people, null, 2)], {type: 'application/json'})
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'people_export.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  function importJSON(file){
    if(!file) return
    const reader = new FileReader()
    reader.onload = ()=>{
      try{
        const parsed = JSON.parse(reader.result)
        if(!Array.isArray(parsed)) throw new Error('invalid data')
        setPeople(parsed)
        setMessage('インポートしました')
      }catch(e){ setMessage('読み込めないファイルです') }
    }
    reader.readAsText(file)
  }

  function unlock(pin){
    const stored = localStorage.getItem(PIN_KEY)
    if(!stored || stored === pin){ setLocked(false); setMessage(''); return }
    setMessage('PINが違います')
  }

  if(locked){
    return <div className="lock-screen"><PinForm pinMode={pinMode} setPinMode={setPinMode} message={message} onUnlock={unlock} onSetPin={pin=>{ localStorage.setItem(PIN_KEY, pin); setPinMode(false); setLocked(false) }} /></div>
  }

  const currentId = route.startsWith('#person:') ? route.split(':')[1] : null
  const currentPerson = people.find(person=> person.id === currentId)

  return (
    <div className="app-root">
      {drawerOpen && (
        <div className="drawer communication-drawer">
          <button onClick={()=>{ setShowCreateModal(true); setDrawerOpen(false) }}>新しい人物</button>
          <button onClick={()=>{ setDrawerOpen(false); window.dispatchEvent(new CustomEvent('intimate:enterDeleteMode')) }}>人物を削除</button>
          <button onClick={()=>{ setDrawerOpen(false); window.location.hash = '#calendar' }}>カレンダー</button>
          <button onClick={exportJSON}>エクスポート</button>
          <label className="import-btn">インポート<input type="file" accept="application/json" onChange={e=> importJSON(e.target.files[0])} hidden /></label>
          <button onClick={()=> setDrawerOpen(false)}>閉じる</button>
        </div>
      )}

      <main>
        {route === '#calendar' && <CalendarPage people={people} onBack={()=>{ window.location.hash = '#' }} />}
        {route !== '#calendar' && !currentId && (
          <MainListCommunication people={people} onUpdate={updatePerson} onToggleDrawer={()=> setDrawerOpen(value=> !value)} onDeleteMultiple={deletePeople} />
        )}
        {route !== '#calendar' && currentId && currentPerson && (
          <CommunicationPersonPage person={currentPerson} onSave={patch=> updatePerson(currentId, patch)} onBack={()=>{ window.location.hash = '#' }} />
        )}
        {route !== '#calendar' && currentId && !currentPerson && <p className="empty-state">人物が見つかりません</p>}
      </main>

      {showCreateModal && (
        <div className="modal-mask">
          <div className="modal create-person-modal">
            <p className="eyebrow">NEW PERSON</p>
            <h3>人物を追加</h3>
            <label>名前<input autoFocus placeholder="名前" value={createName} onChange={e=> setCreateName(e.target.value)} /></label>
            <label>写真<input type="file" accept="image/*" onChange={e=> setCreateAvatarFile(e.target.files[0])} /></label>
            <div className="modal-actions">
              <button onClick={createPerson}>作成</button>
              <button className="secondary" onClick={()=> setShowCreateModal(false)}>キャンセル</button>
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
      <h2>{pinMode ? 'PINを設定' : 'PINを入力'}</h2>
      <input type="password" inputMode="numeric" value={pin} onChange={e=> setPin(e.target.value)} placeholder="4桁以上" />
      {pinMode ? (
        <><button disabled={pin.length < 4} onClick={()=>{ onSetPin(pin); setPin('') }}>設定</button><button onClick={()=> setPinMode(false)}>キャンセル</button></>
      ) : (
        <><button onClick={()=>{ onUnlock(pin); setPin('') }}>解除</button><button onClick={()=> setPinMode(true)}>新しいPINを設定</button></>
      )}
      {message && <p>{message}</p>}
    </div>
  )
}
