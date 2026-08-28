import React, { useEffect, useRef, useState } from 'react'
import PersonPage from './PersonPage'
import * as avatarStore from '../utils/avatarStore'
import * as friendLogic from '../utils/friendLogic'
import * as conversationFlow from '../utils/conversationFlow'
import * as stageGuidance from '../utils/stageGuidance'
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

  useEffect(()=>{
    if(saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(()=> onSave(buildPatch()), 500)
    return ()=>{ if(saveTimer.current) clearTimeout(saveTimer.current) }
  }, [local])

  useEffect(()=> ()=>{ onSave(buildPatch(latest.current)) }, [])

  function patchCommunication(mutate){
    setLocal(prev => {
      const profile = friendLogic.normalizeCommunication(prev)
      return { ...prev, communication: { ...mutate(profile), updatedAt: new Date().toISOString() } }
    })
  }

  function updateCommunication(key, value){
    patchCommunication(profile => ({ ...profile, [key]: value }))
  }
  function chooseStage(stage){ updateCommunication('relationshipStage', stage) }

  function toggleStageCheck(index){
    patchCommunication(profile => {
      const stage = profile.relationshipStage
      if(!stage) return profile
      const values = Array.isArray(profile.stageChecks?.[stage]) ? [...profile.stageChecks[stage]] : []
      values[index] = !values[index]
      return { ...profile, stageChecks: { ...profile.stageChecks, [stage]: values } }
    })
  }

  function toggleSafety(key){
    patchCommunication(profile => ({ ...profile, nextStepSafety: { ...profile.nextStepSafety, [key]: !profile.nextStepSafety[key] } }))
  }

  function updateFlowNote(level, text){
    patchCommunication(profile => ({ ...profile, conversationFlowNotes: { ...profile.conversationFlowNotes, [level]: text } }))
  }

  function updateStepPlan(stage, patch){
    patchCommunication(profile => ({ ...profile, stepPlans: { ...profile.stepPlans, [stage]: { ...(profile.stepPlans?.[stage] || {}), ...patch } } }))
  }

  function updateCollection(item, text){
    const value = stageGuidance.parseCollectionValue(text, item)
    setLocal(prev => item.source === 'notes'
      ? { ...prev, notes: { ...(prev.notes || {}), [item.key]: value } }
      : { ...prev, [item.key]: value })
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
    patchCommunication(profile => ({ ...profile, conversationLog: [entry, ...profile.conversationLog] }))
    setDraft(emptyDraft())
  }

  function removeConversation(id){
    patchCommunication(profile => ({ ...profile, conversationLog: profile.conversationLog.filter(entry => entry.id !== id) }))
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

  const flow = stage ? conversationFlow.getConversationLevel(stage) : null
  const microSteps = stage ? stageGuidance.getMicroSteps(local, stage) : []
  const plan = stage ? (profile.stepPlans?.[stage] || {}) : {}
  const selectedStep = Number.isInteger(plan.selectedStep) ? plan.selectedStep : 0
  const planDraft = plan.draft !== undefined ? plan.draft : (microSteps[selectedStep] || '')
  const outcomeMessage = stageGuidance.getOutcomeMessage(plan.outcome)
  const collectionGuide = stage ? stageGuidance.getCollectionGuide(stage) : []
  const collectionFilled = collectionGuide.filter(item => stageGuidance.isCollectionFilled(local, item)).length

  // "ふたりの歩み"
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
              {friendLogic.RELATIONSHIP_STAGES.map(item => {
                const linked = conversationFlow.getConversationLevel(item.id)
                return (
                  <button type="button" role="radio" aria-checked={stage === item.id}
                    className={stage === item.id ? 'stage-step selected' : 'stage-step'}
                    key={item.id} onClick={()=> chooseStage(item.id)}>
                    <span className="n">{item.id}</span>
                    <span className="c">
                      <span className="t">{item.title}</span>
                      <span className="s">{item.summary}</span>
                      <span className="flow-tag">会話: {linked.title}</span>
                    </span>
                  </button>
                )
              })}
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

          {definition && flow ? (
            <main className="stage-content">
              <section className="communication-card flow-card">
                <div className="section-heading flow-heading">
                  <div><p className="eyebrow">STAGE {stage} ＝ CONVERSATION LEVEL {flow.id}</p><h3>今の段階に合う会話</h3></div>
                  <span className="level-badge">LV {flow.id}</span>
                </div>
                <div className="flow-formula"><small>{flow.title}</small><strong>{flow.formula}</strong><p>{flow.purpose}</p></div>

                <div className="flow-block">
                  <h4>会話の進め方</h4>
                  <ol className="flow-moves">{flow.moves.map(move => <li key={move}>{move}</li>)}</ol>
                </div>

                <div className="flow-block">
                  <h4>自然な言い方（タップで次の一歩に使う）</h4>
                  <div className="flow-examples">
                    {flow.examples.map(example => (
                      <button type="button" key={example} onClick={()=> updateStepPlan(stage, { draft: example, status: '', outcome: '' })}>{example}</button>
                    ))}
                  </div>
                </div>

                <div className="flow-engine">
                  <article><small>DEEPEN</small><p>{flow.deepener}</p></article>
                  <article><small>仮説で本音を広げる</small><p>{flow.hypothesis}</p></article>
                  <article className="invite"><small>断りやすく誘う</small><p>{flow.invitation}</p></article>
                </div>

                <div className="advance-signals">
                  <strong>次のレベルへ進める相互サイン</strong>
                  <div>{flow.advanceSignals.map(signal => <span key={signal}>✓ {signal}</span>)}</div>
                </div>
                <p className="ethical-note">{flow.caution}</p>

                <label className="flow-note-label">この人との会話メモ
                  <textarea rows="2" value={profile.conversationFlowNotes?.[flow.id] || ''} onChange={event=> updateFlowNote(flow.id, event.target.value)} placeholder="使えそうな話題、前に出た言葉、次に聞きたいこと" />
                </label>
              </section>

              <section className="communication-card momentum-card">
                <div className="section-heading"><p className="eyebrow">NEXT 5% STEP</p><h3>停滞しないための、次の小さな一歩</h3></div>
                <p className="gate-intro">大きく進めず、今の段階から一つだけ自然に濃くします。</p>
                <div className="micro-steps">
                  {microSteps.map((step, index) => (
                    <button type="button" key={step} className={selectedStep === index ? 'micro-step selected' : 'micro-step'}
                      onClick={()=> updateStepPlan(stage, { selectedStep: index, draft: step, status: '', outcome: '' })}>
                      <span>{index + 1}</span>{step}
                    </button>
                  ))}
                </div>
                <label className="flow-note-label">自分の言葉に直す
                  <textarea rows="2" value={planDraft} onChange={event=> updateStepPlan(stage, { draft: event.target.value })} />
                </label>
                <div className="plan-actions">
                  {!plan.status && <button type="button" className="advance" onClick={()=> updateStepPlan(stage, { status: 'planned', outcome: '' })}>この一歩を予定にする</button>}
                  {plan.status === 'planned' && (
                    <>
                      <span className="plan-status">✓ 次の一歩が決まりました</span>
                      <button type="button" className="advance" onClick={()=> updateStepPlan(stage, { status: 'tried' })}>やってみた</button>
                    </>
                  )}
                  {plan.status === 'tried' && (
                    <div className="outcome-buttons">
                      <span>相手の反応は？</span>
                      <button type="button" onClick={()=> updateStepPlan(stage, { status: 'done', outcome: 'returned' })}>半歩返ってきた</button>
                      <button type="button" onClick={()=> updateStepPlan(stage, { status: 'done', outcome: 'neutral' })}>自然に成立</button>
                      <button type="button" onClick={()=> updateStepPlan(stage, { status: 'done', outcome: 'thin' })}>反応は薄め</button>
                    </div>
                  )}
                  {plan.status === 'done' && outcomeMessage && (
                    <div className={`outcome-message ${outcomeMessage.tone}`}>
                      <div><strong>{outcomeMessage.title}</strong><p>{outcomeMessage.body}</p></div>
                      <button type="button" onClick={()=> updateStepPlan(stage, { status: '', outcome: '', draft: '', selectedStep: microSteps.length ? (selectedStep + 1) % microSteps.length : 0 })}>次の一歩を選ぶ</button>
                    </div>
                  )}
                </div>
              </section>

              <section className="communication-card gate-card">
                <div className="section-heading with-progress">
                  <div><p className="eyebrow">RECIPROCITY GATE</p><h3>{stage === 10 ? '告白が自然になる条件' : '次へ進める相互サイン'}</h3></div>
                  <span>{gate.checked}/{gate.total}</span>
                </div>
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
                <div className="next-move"><strong>段階を進めるなら</strong><p>{definition.nextMove}</p><small>{definition.caution}</small></div>
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

              {collectionGuide.length > 0 && (
                <section className="communication-card knowledge-card">
                  <div className="section-heading with-progress">
                    <div><p className="eyebrow">LEARN NATURALLY</p><h3>この段階で自然に知っておくこと</h3></div>
                    <span>{collectionFilled}/{collectionGuide.length}</span>
                  </div>
                  <p className="gate-intro">質問攻めにせず、相手が自然に話した時に記録します。ここへの入力は基本情報・メモにも反映されます。</p>
                  <div className="knowledge-list">
                    {collectionGuide.map(item => {
                      const filled = stageGuidance.isCollectionFilled(local, item)
                      return (
                        <article className={filled ? 'knowledge-item filled' : 'knowledge-item'} key={`${item.source}-${item.key}`}>
                          <div className="knowledge-heading">
                            <span className="source-chip">{item.source === 'notes' ? 'メモ' : '基本情報'}</span>
                            <strong>{item.label}</strong>
                          </div>
                          <p>{item.prompt}</p>
                          <blockquote>{item.ask}</blockquote>
                          <textarea rows="2"
                            value={stageGuidance.formatCollectionValue(stageGuidance.getCollectionValue(local, item))}
                            onChange={event=> updateCollection(item, event.target.value)}
                            placeholder={item.placeholder} />
                        </article>
                      )
                    })}
                  </div>
                </section>
              )}

              <details className="communication-card talk-deck-card flow-details">
                <summary><span><small>TALK DECK</small><strong>この段階で自然な5つの話題</strong></span></summary>
                <div className="talk-deck-grid">
                  {definition.topics.map(([name, example], index)=> (
                    <article className="talk-card" key={name}><span>{index + 1}</span><div><strong>{name}</strong><p>{example}</p></div></article>
                  ))}
                </div>
              </details>

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
