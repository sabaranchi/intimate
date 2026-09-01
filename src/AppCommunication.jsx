import React, { useEffect, useRef, useState } from 'react'
import MainListCommunication from './components/MainListCommunication'
import CalendarPage from './components/CalendarPage'
import CommunicationPersonPage from './components/CommunicationPersonPage'
import SelfSettings, { createEmptySelf } from './components/SelfSettings'
import * as avatarStore from './utils/avatarStore'
import * as db from './utils/db'
import * as friendLogic from './utils/friendLogic'

const STORAGE_KEY = 'intimate_people_v1'
const SELF_KEY = 'intimate_self_v1'
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
  const [self, setSelf] = useState(()=> createEmptySelf())
  const [selfLoaded, setSelfLoaded] = useState(false)
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

  // Ask the browser to keep our IndexedDB data (Safari evicts non-persistent
  // storage after ~7 days unused — unacceptable for a relationship journal).
  useEffect(()=>{
    try{ navigator.storage && navigator.storage.persist && navigator.storage.persist() }catch(e){}
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

  useEffect(()=>{
    let active = true
    ;(async()=>{
      try{
        const value = await db.getKv(SELF_KEY)
        if(active && value && typeof value === 'object') setSelf({ ...createEmptySelf(), ...value })
      }catch(e){}
      if(active) setSelfLoaded(true)
    })()
    return ()=>{ active = false }
  }, [])

  useEffect(()=>{
    if(!selfLoaded) return
    try{ db.setKv(SELF_KEY, self) }catch(e){}
  }, [self, selfLoaded])

  useEffect(()=>{
    if(!message) return
    const t = setTimeout(()=> setMessage(''), 4000)
    return ()=> clearTimeout(t)
  }, [message])

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

  function collectAssetIds(list){
    const ids = new Set()
    for(const p of (list || [])){
      if(p?.avatarId) ids.add(p.avatarId)
      for(const ph of (p?.photos || [])){ if(ph && typeof ph === 'object' && ph.id) ids.add(ph.id) }
    }
    return [...ids]
  }

  async function exportJSON(){
    let assets = {}
    try{
      for(const id of collectAssetIds(people)){
        const blob = await avatarStore.getAvatarBlob(id)
        if(blob) assets[id] = await avatarStore.blobToDataURL(blob)
      }
    }catch(e){}
    const payload = { format: 'intimate-backup', version: 2, exportedAt: new Date().toISOString(), self, people, assets }
    const blob = new Blob([JSON.stringify(payload)], {type: 'application/json'})
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `intimate-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    try{ localStorage.setItem('intimate_last_export', new Date().toISOString()) }catch(e){}
    setMessage(`${people.length}人・写真${Object.keys(assets).length}件を書き出しました`)
  }

  function importJSON(file){
    if(!file) return
    const reader = new FileReader()
    reader.onload = async ()=>{
      try{
        const parsed = JSON.parse(reader.result)
        const incoming = Array.isArray(parsed) ? parsed : parsed?.people
        if(!Array.isArray(incoming)) throw new Error('invalid data')
        if(people.length && !window.confirm(
          `現在の${people.length}人を、読み込むデータ（${incoming.length}人）で置き換えます。\n`
          + `元に戻せません。心配な場合は先にエクスポートしてください。\n\n続けますか？`
        )) return
        const assets = (!Array.isArray(parsed) && parsed?.assets) || {}
        let restored = 0
        for(const [id, dataURL] of Object.entries(assets)){
          try{
            await avatarStore.putAvatarBlob(id, await avatarStore.dataURLToBlob(dataURL))
            restored++
          }catch(e){}
        }
        if(!Array.isArray(parsed) && parsed?.self && typeof parsed.self === 'object'){
          setSelf({ ...createEmptySelf(), ...parsed.self })
        }
        setPeople(incoming)
        setMessage(`${incoming.length}人・写真${restored}件を読み込みました`)
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
  const isSelfRoute = route === '#self'

  return (
    <div className="app-root">
      {message && <div className="app-toast" role="status" onClick={()=> setMessage('')}>{message}</div>}
      {drawerOpen && (
        <div className="drawer communication-drawer">
          <button onClick={()=>{ setShowCreateModal(true); setDrawerOpen(false) }}>新しい人物</button>
          <button onClick={()=>{ setDrawerOpen(false); window.dispatchEvent(new CustomEvent('intimate:enterDeleteMode')) }}>人物を削除</button>
          <button onClick={()=>{ setDrawerOpen(false); window.location.hash = '#self' }}>自分の設定</button>
          <button onClick={()=>{ setDrawerOpen(false); window.location.hash = '#calendar' }}>カレンダー</button>
          <button onClick={exportJSON}>エクスポート</button>
          <label className="import-btn">インポート<input type="file" accept="application/json" onChange={e=> importJSON(e.target.files[0])} hidden /></label>
          <button onClick={()=> setDrawerOpen(false)}>閉じる</button>
        </div>
      )}

      <main>
        {route === '#calendar' && <CalendarPage people={people} onBack={()=>{ window.location.hash = '#' }} />}
        {isSelfRoute && <SelfSettings self={self} onSave={setSelf} onBack={()=>{ window.location.hash = '#' }} />}
        {route !== '#calendar' && !isSelfRoute && !currentId && (
          <MainListCommunication people={people} self={self} onUpdate={updatePerson} onToggleDrawer={()=> setDrawerOpen(value=> !value)} onDeleteMultiple={deletePeople} onStartCreate={()=> setShowCreateModal(true)} />
        )}
        {route !== '#calendar' && !isSelfRoute && currentId && currentPerson && (
          <CommunicationPersonPage person={currentPerson} self={self} onSave={patch=> updatePerson(currentId, patch)} onBack={()=>{ window.location.hash = '#' }} />
        )}
        {route !== '#calendar' && !isSelfRoute && currentId && !currentPerson && <p className="empty-state">人物が見つかりません</p>}
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
