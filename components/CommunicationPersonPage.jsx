import React, { useEffect, useState } from 'react'
import PersonPage from './PersonPage'
import * as avatarStore from '../utils/avatarStore'
import * as friendLogic from '../utils/friendLogic'

function RatingRow({dimension, value, onChange}){
  const selected = value === null || value === undefined ? null : Number(value)
  return (
    <section className="communication-axis">
      <div className="axis-heading">
        <strong>{dimension.label}</strong>
        <span>{selected === null ? '未入力' : `Lv.${selected} ${dimension.levels[selected]}`}</span>
      </div>
      <div className="level-buttons" role="radiogroup" aria-label={dimension.label}>
        {dimension.levels.map((label, level)=>(
          <button
            type="button"
            role="radio"
            aria-checked={selected === level}
            className={selected === level ? 'level-button selected' : 'level-button'}
            key={label}
            onClick={()=> onChange(level)}
          >
            <b>{level}</b>
            <small>{label}</small>
          </button>
        ))}
      </div>
    </section>
  )
}

export default function CommunicationPersonPage({person, onSave, onBack}){
  const [showDetails, setShowDetails] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [local, setLocal] = useState(()=> ({
    ...(person || {}),
    communication: friendLogic.normalizeCommunication(person)
  }))

  useEffect(()=>{
    setLocal({...(person || {}), communication: friendLogic.normalizeCommunication(person)})
  }, [person?.id])

  useEffect(()=>{
    let active = true
    let objectUrl = ''
    ;(async()=>{
      if(person?.avatar){
        if(active) setAvatarUrl(person.avatar)
        return
      }
      if(person?.avatarId){
        try{
          objectUrl = await avatarStore.getAvatarURL(person.avatarId)
          if(active && objectUrl) setAvatarUrl(objectUrl)
        }catch(e){}
      }
    })()
    return ()=>{
      active = false
      if(objectUrl){ try{ URL.revokeObjectURL(objectUrl) }catch(e){} }
    }
  }, [person?.id, person?.avatar, person?.avatarId])

  function buildPatch(nextLocal = local){
    const communication = friendLogic.normalizeCommunication(nextLocal)
    const friendScore = friendLogic.getCommunicationScore({...nextLocal, communication})
    return {
      ...nextLocal,
      communication,
      friendScore,
      lastInteractionDate: communication.lastConversationDate || nextLocal.lastInteractionDate || '',
      lastConversationSummary: communication.lastConversationNote || nextLocal.lastConversationSummary || ''
    }
  }

  function updateCommunication(key, value){
    setLocal(prev=> ({
      ...prev,
      communication: {
        ...friendLogic.normalizeCommunication(prev),
        [key]: value,
        updatedAt: new Date().toISOString()
      }
    }))
  }

  function saveAndBack(){
    const patch = buildPatch()
    onSave(patch)
    onBack()
  }

  function openDetails(){
    const patch = buildPatch()
    setLocal(patch)
    onSave(patch)
    setShowDetails(true)
  }

  if(showDetails){
    return (
      <PersonPage
        person={local}
        onSave={patch=>{
          const merged = buildPatch({...local, ...patch})
          setLocal(merged)
          onSave(merged)
        }}
        onBack={onBack}
      />
    )
  }

  const profile = friendLogic.normalizeCommunication(local)
  const progress = friendLogic.getAssessmentProgress(profile)
  const score = friendLogic.getCommunicationScore({...local, communication: profile})
  const level = friendLogic.getCommunicationLevel(score, progress.rated > 0)
  const filledHearts = progress.rated > 0 ? Math.round(score / 10) : 0

  return (
    <div className="person-page communication-page">
      <header className="communication-header">
        <img className="avatar-large" src={avatarUrl || '/icon-192.png'} alt="" />
        <div>
          <p className="eyebrow">コミュニケーション親密度</p>
          <h2>{local.name || '無名'}</h2>
          <div className="score-line">
            <span className="score-number">{progress.rated > 0 ? score : '—'}</span>
            <span>
              <strong>{level.label}</strong>
              <small>{progress.complete ? '5項目で評価' : `${progress.rated}/5項目の暫定評価`}</small>
            </span>
          </div>
          <div className="hearts header-hearts" aria-label={`親密度 ${progress.rated > 0 ? score : '未評価'}`}>
            {Array.from({length:10}).map((_, i)=>(
              <span className={i < filledHearts ? 'heart filled' : 'heart'} key={i}>{i < filledHearts ? '❤️' : '🖤'}</span>
            ))}
          </div>
        </div>
      </header>

      <div className="communication-summary">
        <strong>{level.description}</strong>
        <p>会った回数や一緒にしたことではなく、今の会話のあり方を記録します。</p>
      </div>

      <main className="communication-form">
        {friendLogic.COMMUNICATION_DIMENSIONS.map(dimension=>(
          <RatingRow
            key={dimension.key}
            dimension={dimension}
            value={profile[dimension.key]}
            onChange={value=> updateCommunication(dimension.key, value)}
          />
        ))}

        <section className="communication-card addressing-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">呼び方</p>
              <h3>実際になんと呼び合う？</h3>
            </div>
          </div>
          <div className="two-column-fields">
            <label>自分 → 相手
              <input value={profile.iCallThem} onChange={e=> updateCommunication('iCallThem', e.target.value)} placeholder="例：さき、田中さん" />
            </label>
            <label>相手 → 自分
              <input value={profile.theyCallMe} onChange={e=> updateCommunication('theyCallMe', e.target.value)} placeholder="例：名字、あだ名" />
            </label>
          </div>
        </section>

        <section className="communication-card conversation-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">直近の会話</p>
              <h3>何を、どんな感じで話した？</h3>
            </div>
          </div>
          <label>最後に話した日
            <input type="date" value={profile.lastConversationDate} onChange={e=> updateCommunication('lastConversationDate', e.target.value)} />
          </label>
          <label>話した内容・話題
            <textarea rows="3" value={profile.recentTopics} onChange={e=> updateCommunication('recentTopics', e.target.value)} placeholder="例：最近の仕事、休日の過ごし方、将来や家族の話" />
          </label>
          <label>会話の雰囲気・印象
            <textarea rows="3" value={profile.lastConversationNote} onChange={e=> updateCommunication('lastConversationNote', e.target.value)} placeholder="例：相手から質問が多かった。途中から冗談も増えて、自然に話せた" />
          </label>
        </section>
      </main>

      <nav className="communication-actions">
        <button type="button" onClick={saveAndBack}>← 保存して戻る</button>
        <button type="button" className="secondary" onClick={openDetails}>基本情報・メモ・写真</button>
      </nav>
    </div>
  )
}
