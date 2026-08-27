import React, { useEffect, useRef, useState } from 'react'
import * as avatarStore from '../utils/avatarStore'
import * as friendLogic from '../utils/friendLogic'

const REL_PRESETS = ['中学','高校','大学','友達','恋人','元恋人','先輩','後輩','サークル','バイト','職場','上司','同僚','部下','家族','趣味仲間','SNS友達','近所','その他']

export default function MainListCommunication({people, onUpdate, onToggleDrawer, onDeleteMultiple}){
  const [avatarMap, setAvatarMap] = useState({})
  const previousUrls = useRef({})
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('lastConversationDate_desc')
  const [relationFilter, setRelationFilter] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [deleteMode, setDeleteMode] = useState(false)
  const [selected, setSelected] = useState(new Set())

  useEffect(()=>{
    let active = true
    Object.values(previousUrls.current).forEach(url=>{ try{ URL.revokeObjectURL(url) }catch(e){} })
    previousUrls.current = {}
    ;(async()=>{
      const next = {}
      await Promise.all((people || []).map(async person=>{
        if(person?.avatar){ next[person.id] = person.avatar; return }
        if(person?.avatarId){
          try{
            const url = await avatarStore.getAvatarURL(person.avatarId)
            if(url){ next[person.id] = url; previousUrls.current[person.id] = url }
          }catch(e){}
        }
      }))
      if(active) setAvatarMap(next)
    })()
    return ()=>{
      active = false
      Object.values(previousUrls.current).forEach(url=>{ try{ URL.revokeObjectURL(url) }catch(e){} })
    }
  }, [people])

  useEffect(()=>{
    const enterDeleteMode = ()=>{ setDeleteMode(true); setSelected(new Set()) }
    window.addEventListener('intimate:enterDeleteMode', enterDeleteMode)
    return ()=> window.removeEventListener('intimate:enterDeleteMode', enterDeleteMode)
  }, [])

  const relationOptions = Array.from(new Set([
    ...REL_PRESETS,
    ...(people || []).flatMap(person=> person?.relationTags || [])
  ]))
  const term = query.trim().toLowerCase()
  const filtered = (people || []).filter(person=>{
    const searchable = [person.name, person.reading, person.nickname, ...(person.relationTags || []), ...(person.groups || [])]
      .filter(Boolean).join(' ').toLowerCase()
    if(term && !searchable.includes(term)) return false
    if(relationFilter.length){
      const tags = new Set(person.relationTags || [])
      if(!relationFilter.every(tag=> tags.has(tag))) return false
    }
    return true
  })

  const sorted = [...filtered].sort((a, b)=>{
    if(sortBy === 'lastConversationDate_desc') return friendLogic.getLastConversationDate(b).localeCompare(friendLogic.getLastConversationDate(a))
    if(sortBy === 'lastConversationDate_asc') return friendLogic.getLastConversationDate(a).localeCompare(friendLogic.getLastConversationDate(b))
    if(sortBy === 'friendScore_desc') return friendLogic.getCommunicationScore(b) - friendLogic.getCommunicationScore(a)
    if(sortBy === 'friendScore_asc') return friendLogic.getCommunicationScore(a) - friendLogic.getCommunicationScore(b)
    return (a.name || '').localeCompare(b.name || '')
  })

  function toggleSelected(id){
    setSelected(prev=>{
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function deleteSelected(){
    if(!selected.size) return
    if(!window.confirm(`${selected.size}件の人物を削除してもよろしいですか？`)) return
    onDeleteMultiple(selected)
    setSelected(new Set())
    setDeleteMode(false)
  }

  return (
    <div className="main-list communication-list">
      <header className="list-hero">
        <div>
          <p className="eyebrow">COMMUNICATION MAP</p>
          <h1>人との距離感</h1>
          <p>行動回数ではなく、話し方と互いの自然さで見る親密度</p>
        </div>
        <button className="menu-button" onClick={onToggleDrawer} aria-label="メニュー">☰</button>
      </header>

      <div className="list-controls">
        <input placeholder="名前・呼び名・関係性を検索" value={query} onChange={e=> setQuery(e.target.value)} />
        <select value={sortBy} onChange={e=> setSortBy(e.target.value)}>
          <option value="lastConversationDate_desc">最近話した順</option>
          <option value="lastConversationDate_asc">会話日が古い順</option>
          <option value="friendScore_desc">親密度が高い順</option>
          <option value="friendScore_asc">親密度が低い順</option>
          <option value="name">名前順</option>
        </select>
        <button type="button" onClick={()=> setShowFilters(value=> !value)}>関係性で絞る</button>
      </div>

      {showFilters && (
        <div className="chip-row relation-filters">
          {relationOptions.map(relation=>(
            <button
              type="button"
              key={relation}
              className={relationFilter.includes(relation) ? 'chip chip-on' : 'chip chip-off'}
              onClick={()=> setRelationFilter(prev=> prev.includes(relation) ? prev.filter(item=> item !== relation) : [...prev, relation])}
            >{relation}</button>
          ))}
        </div>
      )}

      {deleteMode && (
        <div className="delete-bar">
          <span>{selected.size}件選択</span>
          <button onClick={deleteSelected}>削除</button>
          <button onClick={()=>{ setDeleteMode(false); setSelected(new Set()) }}>キャンセル</button>
        </div>
      )}

      <ul className="people-list">
        {sorted.map(person=>{
          const profile = friendLogic.normalizeCommunication(person)
          const progress = friendLogic.getAssessmentProgress(profile)
          const score = friendLogic.getCommunicationScore(person)
          const level = friendLogic.getCommunicationLevel(score, progress.rated > 0)
          const filled = progress.rated > 0 ? Math.round(score / 10) : 0
          const lastDate = friendLogic.getLastConversationDate(person)
          return (
            <li className="person-row communication-person-row" key={person.id} onClick={()=>{ if(!deleteMode) window.location.hash = `#person:${person.id}` }}>
              {deleteMode && <input type="checkbox" checked={selected.has(person.id)} onChange={()=> toggleSelected(person.id)} onClick={e=> e.stopPropagation()} />}
              <img className="avatar" src={avatarMap[person.id] || '/icon-192.png'} alt="" />
              <div className="meta">
                <div className="person-title-line">
                  <strong className="name">{person.name}</strong>
                  <span className={progress.complete ? 'intimacy-badge' : 'intimacy-badge provisional'}>{level.label}</span>
                </div>
                <div className="hearts compact-hearts" aria-label={progress.rated ? `親密度 ${score}` : '未評価'}>
                  {Array.from({length:10}).map((_, i)=><span key={i} className={i < filled ? 'heart filled' : 'heart'}>{i < filled ? '❤️' : '🖤'}</span>)}
                  <small>{progress.rated ? `${score}` : '未評価'}</small>
                </div>
                <div className="communication-preview">
                  <span>会話 {lastDate || '未記録'}</span>
                  {profile.iCallThem && <span>呼び方「{profile.iCallThem}」</span>}
                  {progress.rated > 0 && !progress.complete && <span>{progress.rated}/5項目</span>}
                </div>
                {profile.recentTopics && <p className="topic-preview">{profile.recentTopics}</p>}
              </div>
              <span className="row-arrow">›</span>
            </li>
          )
        })}
      </ul>
      {!sorted.length && <p className="empty-state">該当する人はいません</p>}
    </div>
  )
}
