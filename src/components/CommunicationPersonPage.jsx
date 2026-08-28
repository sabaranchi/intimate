import React, { useEffect, useRef, useState } from 'react'
import PersonPage from './PersonPage'
import * as avatarStore from '../utils/avatarStore'
import * as friendLogic from '../utils/friendLogic'
import { FALLBACK_AVATAR } from '../utils/avatarFallback'

const PERSON_TABS = [
  { key: 'relation', label: '関係' },
  { key: 'basic', label: '基本情報' },
  { key: 'events', label: '出来事' },
  { key: 'notes', label: 'メモ' }
]

const SAFETY_ITEMS = [
  ['oneStep', '今の関係より「一段だけ」近い行動か'],
  ['roomToDecline', '相手が断ったり流したりできる余白があるか'],
  ['reciprocated', '前回こちらが近づいた時、相手からも何か返ってきたか']
]

function todayYMD(){
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function emptyDraft(){
  return { date: todayYMD(), topics: '', theirResponse: '', appreciated: '', wantToAsk: '' }
}
function daysBetween(from, to){
  return Math.round((to.getTime() - from.getTime()) / 86400000)
}

export default function CommunicationPersonPage({ person, onSave, onBack }){
  const [activeTab, setActiveTab] = useState('relation')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [local, setLocal] = useState(()=> ({ ...person, communication: friendLogic.normalizeCommunication(person) }))
  const [draft, setDraft] = useState(emptyDraft)
  const latest = useRef(local)
  const saveTimer = useRef(null)

  useEffect(()=>{
    setActiveTab('relation')
    setDraft(emptyDraft())
    setLocal({ ...person, communication: friendLogic.normalizeCommunication(person) })
  }, [person?.id])

  useEffect(()=>{ latest.current = local }, [local])

  useEffect(()=>{
    let active = true
    let objectUrl = ''
    ;(async()=>{
      if(local?.avatar){ if(active) setAvatarUrl(local.avatar); return }
      if(local?.avatarId){
        try{ objectUrl = await avatarStore.getAvatarURL(local.avatarId); if(active && objectUrl) setAvatarUrl(objectUrl) }catch(e){}
      }else if(active){ setAvatarUrl('') }
    })()
    return ()=>{ active = false; if(objectUrl){ try{ URL.revokeObjectURL(objectUrl) }catch(e){} } }
  }, [local?.avatar, local?.avatarId])

  function buildPatch(source = local){
    const communication = friendLogic.normalizeCommunication(source)
    return {
      ...source,
      communication,
      friendScore: friendLogic.getCommunicationScore({ ...source, communication }),
      lastInteractionDate: communication.lastConversationDate || source.lastInteractionDate || '',
      lastConversationSummary: communication.lastConversationNote || source.lastConversationSummary || ''
    }
  }

  // Debounced autosave whenever anything on the page changes.
  useEffect(()=>{
    if(saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(()=> onSave(buildPatch()), 500)
    return ()=>{ if(saveTimer.current) clearTimeout(saveTimer.current) }
  }, [local])

  // Flush pending edits if the page unmounts before the debounce fires.
  useEffect(()=> ()=>{ onSave(buildPatch(latest.current)) }, [])

  function updateCommunication(key, value){
    setLocal(prev => ({
      ...prev,
      communication: { ...friendLogic.normalizeCommunication(prev), [key]: value, updatedAt: new Date().toISOString() }
    }))
  }
  function chooseStage(stage){ updateCommunication('relationshipStage', stage) }

  function toggleStageCheck(index){
    setLocal(prev => {
      const profile = friendLogic.normalizeCommunication(prev)
      const stage = profile.relationshipStage
      if(!stage) return prev
      const values = Array.isArray(profile.stageChecks?.[stage]) ? [...profile.stageChecks[stage]] : []
      values[index] = !values[index]
      return { ...prev, communication: { ...profile, stageChecks: { ...profile.stageChecks, [stage]: values }, updatedAt: new Date().toISOString() } }
    })
  }

  function toggleSafety(key){
    setLocal(prev => {
      const profile = friendLogic.normalizeCommunication(prev)
      return { ...prev, communication: { ...profile, nextStepSafety: { ...profile.nextStepSafety, [key]: !profile.nextStepSafety[key] }, updatedAt: new Date().toISOString() } }
    })
  }

  function addConversation(){
    const entry = {
      id: String(Date.now()),
      date: draft.date || todayYMD(),
      topics: draft.topics.trim(),
      theirResponse: draft.theirResponse.trim(),
      appreciated: draft.appreciated.trim(),
      wantToAsk: draft.wantToAsk.trim()
    }
    setLocal(prev => {
      const profile = friendLogic.normalizeCommunication(prev)
      return { ...prev, communication: { ...profile, conversationLog: [entry, ...profile.conversationLog], updatedAt: new Date().toISOString() } }
    })
    setDraft(emptyDraft())
  }

  function removeConversation(id){
    setLocal(prev => {
      const profile = friendLogic.normalizeCommunication(prev)
      return { ...prev, communication: { ...profile, conversationLog: profile.conversationLog.filter(entry => entry.id !== id), updatedAt: new Date().toISOString() } }
    })
  }

  function handleChildChange(patch){
    setLocal(prev => {
      const merged = { ...prev, ...patch }
      return { ...merged, communication: friendLogic.normalizeCommunication(merged) }
    })
  }

  function leave(){
    if(saveTimer.current) clearTimeout(saveTimer.current)
    onSave(buildPatch(latest.current))
    onBack()
  }

  const profile = friendLogic.normalizeCommunication(local)
  const stage = profile.relationshipStage
  const definition = friendLogic.getStageDefinition(stage)
  const gate = friendLogic.getStageGateProgress(profile, stage)
  const stageChecks = stage && Array.isArray(profile.stageChecks?.[stage]) ? profile.stageChecks[stage] : []
  const log = friendLogic.getConversationLog(profile)
  const nextToAsk = log.find(entry => entry.wantToAsk)?.wantToAsk || ''

  // "ふたりの歩み" — warm, positive-framed running totals.
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const historyDates = [
    ...log.map(entry => entry.date),
    ...(local.events || []).map(event => (event.date ? String(event.date).slice(0, 10) : ''))
  ].filter(Boolean).sort()
  const firstDate = historyDates[0]
  const daysSinceFirst = firstDate ? daysBetween(new Date(firstDate), today) + 1 : null
  let daysToBirthday = null
  if(local.birthday){
    const birth = new Date(local.birthday)
    if(!isNaN(birth)){
      let next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
      if(next < today) next = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate())
      daysToBirthday = daysBetween(today, next)
    }
  }
  const journeyTiles = [
    log.length ? { v: log.length, l: '記録した会話' } : null,
    daysSinceFirst ? { v: daysSinceFirst, l: '日目（最初の記録から）' } : null,
    daysToBirthday != null ? { v: daysToBirthday, l: '日後が誕生日' } : null
  ].filter(Boolean)

  return (
    <div className="person-page communication-page stage-page">
      <header className="communication-header">
        <img className="avatar-large" src={avatarUrl || local.avatar || FALLBACK_AVATAR} alt="" />
        <div className="stage-header-copy">
          <p className="eyebrow">RELATIONSHIP GRADIENT</p>
          <h2>{local.name || '無名'}</h2>
          <div className="score-line">
            <span className="score-number">{stage || '—'}</span>
            <span><strong>{definition?.title || '段階未設定'}</strong><small>{definition?.summary || '今の関係に近い段階を選んでください'}</small></span>
          </div>
          <div className="hearts header-hearts" aria-label={stage ? `第${stage}段階` : '段階未設定'}>
            {Array.from({ length: 10 }).map((_, index)=> <span className={stage && index < stage ? 'heart filled' : 'heart'} key={index}>{stage && index < stage ? '❤️' : '🖤'}</span>)}
          </div>
        </div>
      </header>

      <nav className="person-tabs" role="tablist">
        {PERSON_TABS.map(t => (
          <button key={t.key} type="button" role="tab" aria-selected={activeTab === t.key}
            className={activeTab === t.key ? 'person-tab active' : 'person-tab'}
            onClick={()=> setActiveTab(t.key)}>{t.label}</button>
        ))}
      </nav>

      {activeTab === 'relation' ? (
        <>
          {journeyTiles.length > 0 && (
            <section className="journey-strip" aria-label="ふたりの歩み">
              {journeyTiles.map(tile => (
                <div key={tile.l}><b>{tile.v}</b><span>{tile.l}</span></div>
              ))}
            </section>
          )}

          <section className="stage-picker-card">
            <div className="section-heading"><p className="eyebrow">CURRENT STAGE</p><h3>今の関係はどの段階？</h3></div>
            <p className="stage-help">できた回数ではなく、相手からも関係が返ってきている段階を選びます。</p>
            <div className="stage-scale" role="radiogroup" aria-label="現在の関係段階">
              {friendLogic.RELATIONSHIP_STAGES.map(item => (
                <button type="button" role="radio" aria-checked={stage === item.id}
                  className={stage === item.id ? 'stage-step selected' : 'stage-step'}
                  key={item.id} onClick={()=> chooseStage(item.id)}>
                  <span className="n">{item.id}</span>
                  <span className="c"><span className="t">{item.title}</span><span className="s">{item.summary}</span></span>
                </button>
              ))}
            </div>
          </section>

          <section className="communication-card conversation-card">
            <div className="section-heading"><p className="eyebrow">CONVERSATION LOG</p><h3>会話の記録</h3></div>
            <p className="gate-intro">話すたびに、内容と「相手から返ってきたもの」を短く残します。積み重ねが関係の地図になります。</p>

            <div className="convo-form">
              <label>話した日<input type="date" value={draft.date} onChange={event=> setDraft(d => ({ ...d, date: event.target.value }))} /></label>
              <label>話した内容・話題<textarea rows="2" value={draft.topics} onChange={event=> setDraft(d => ({ ...d, topics: event.target.value }))} placeholder="話題と、どこまで個人的な話になったか" /></label>
              <label>相手から返ってきた反応<textarea rows="2" value={draft.theirResponse} onChange={event=> setDraft(d => ({ ...d, theirResponse: event.target.value }))} placeholder="質問が返った、話を広げた、次の提案があった、など" /></label>
              <label>印象に残ったこと・よかったところ<textarea rows="2" value={draft.appreciated} onChange={event=> setDraft(d => ({ ...d, appreciated: event.target.value }))} placeholder="相手のこういうところがよかった、と思えたこと" /></label>
              <label>次に聞いてみたいこと<textarea rows="2" value={draft.wantToAsk} onChange={event=> setDraft(d => ({ ...d, wantToAsk: event.target.value }))} placeholder="今度会ったら聞きたい・続きを話したいこと" /></label>
              <button type="button" className="advance" disabled={!draft.topics.trim() && !draft.theirResponse.trim() && !draft.appreciated.trim() && !draft.wantToAsk.trim()} onClick={addConversation}>この会話を記録する</button>
            </div>

            {log.length > 0 && (
              <ol className="convo-list">
                {log.map(entry => (
                  <li className="convo-entry" key={entry.id}>
                    <div className="convo-when">{entry.date || '日付なし'}</div>
                    {entry.topics && <p><b>話題</b>{entry.topics}</p>}
                    {entry.theirResponse && <p><b>相手から</b>{entry.theirResponse}</p>}
                    {entry.appreciated && <p className="convo-good"><b>よかった</b>{entry.appreciated}</p>}
                    {entry.wantToAsk && <p className="convo-next"><b>次に</b>{entry.wantToAsk}</p>}
                    <button type="button" className="convo-del" onClick={()=> removeConversation(entry.id)}>削除</button>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {definition ? (
            <main className="stage-content">
              <section className="communication-card talk-deck-card">
                <div className="section-heading"><p className="eyebrow">TALK DECK</p><h3>この段階で自然な5つの話題</h3></div>
                <div className="talk-deck-grid">
                  {definition.topics.map(([name, example], index)=> (
                    <article className="talk-card" key={name}><span>{index + 1}</span><div><strong>{name}</strong><p>{example}</p></div></article>
                  ))}
                </div>
              </section>

              <section className="communication-card gate-card">
                <div className="section-heading"><p className="eyebrow">RECIPROCITY GATE</p><h3>{stage === 10 ? '告白が自然になる条件' : '次へ進める相互サイン'}</h3></div>
                <p className="gate-intro">自分が進めた回数ではなく、相手から返ってきた反応をチェックします。</p>
                <div className="gate-checks">
                  {definition.nextConditions.map((condition, index)=> (
                    <label className={stageChecks[index] ? 'checked' : ''} key={condition}>
                      <input type="checkbox" checked={Boolean(stageChecks[index])} onChange={()=> toggleStageCheck(index)} /><span>{condition}</span>
                    </label>
                  ))}
                </div>
                <div className={gate.ready ? 'gate-status ready' : 'gate-status'}>
                  <strong>{gate.checked}/{gate.total}</strong>
                  <span>{gate.ready ? (stage === 10 ? '告白を考えられる状態です' : '次の一段を試せます') : `${gate.required}個以上の相互サインを確認`}</span>
                </div>
                <div className="next-move"><strong>次にできること</strong><p>{definition.nextMove}</p><small>{definition.caution}</small></div>
                <div className="stage-step-controls">
                  <button type="button" disabled={stage <= 1} onClick={()=> chooseStage(stage - 1)}>← 一段戻す</button>
                  {stage < 10 && <button type="button" className="advance" disabled={!gate.ready} onClick={()=> chooseStage(stage + 1)}>条件を確認して一段進む →</button>}
                </div>
              </section>

              <section className="communication-card safety-card">
                <div className="section-heading"><p className="eyebrow">BEFORE THE NEXT MOVE</p><h3>相手にとっても心地よいかの3点確認</h3></div>
                {SAFETY_ITEMS.map(([key, label])=> (
                  <label key={key} className={profile.nextStepSafety[key] ? 'checked' : ''}>
                    <input type="checkbox" checked={Boolean(profile.nextStepSafety[key])} onChange={()=> toggleSafety(key)} /><span>{label}</span>
                  </label>
                ))}
              </section>

              <section className="communication-card addressing-card">
                <div className="section-heading"><p className="eyebrow">NAMES</p><h3>実際になんと呼び合う？</h3></div>
                <div className="two-column-fields">
                  <label>自分 → 相手<input value={profile.iCallThem} onChange={event=> updateCommunication('iCallThem', event.target.value)} placeholder="例：さき、田中さん" /></label>
                  <label>相手 → 自分<input value={profile.theyCallMe} onChange={event=> updateCommunication('theyCallMe', event.target.value)} placeholder="例：名字、あだ名" /></label>
                </div>
              </section>
            </main>
          ) : (
            <div className="stage-empty">
              <strong>まず現在地を選んでください</strong>
              <p>迷ったら、言いたいことではなく「相手から返ってきている反応」で選びます。</p>
            </div>
          )}
        </>
      ) : (
        <PersonPage embedded person={local} tab={activeTab} onChange={handleChildChange} />
      )}

      <nav className="communication-actions">
        <button type="button" onClick={leave}>← 戻る</button>
        <span className="autosave-hint">{nextToAsk ? `次に: ${nextToAsk}` : '変更は自動保存されます'}</span>
      </nav>
    </div>
  )
}
