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
  { key: 'events', label: '記録' },
  { key: 'notes', label: 'メモ' }
]

const SAFETY_ITEMS = [
  ['reciprocated', '前回の一手に、相手からリアクションが返ってきたか'],
  ['oneStep', '今の段階から「一段だけ」上の行動か'],
  ['roomToDecline', '相手が流したり断ったりできる余白があるか']
]

const TRACK_OPTIONS = [
  { value: 'auto', label: '自動' },
  { value: 'friend', label: '友情' },
  { value: 'romance', label: 'ロマンス' }
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
function selfHint(self){
  if(!self) return ''
  if(self.listenTalk === '聞き役') return 'あなたは聞き役タイプ。今日は自分の話も一つ返してみる。'
  if(self.listenTalk === '話し役') return 'あなたは話し役タイプ。今日は相手に一つ多く質問してみる。'
  if(self.selfDisclosure === '用件だけ' || self.selfDisclosure === '事実は話す') return '自己開示が控えめな設定。軽い失敗談を一つ先に出すと往復が生まれる。'
  return ''
}

export default function CommunicationPersonPage({ person, self, onSave, onBack }){
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
  function updateCommunication(key, value){ patchCommunication(profile => ({ ...profile, [key]: value })) }
  function chooseStage(stage){ updateCommunication('relationshipStage', stage) }
  function setPersonalityType(id){ setLocal(prev => ({ ...prev, personalityType: prev.personalityType === id ? '' : id })) }

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
  const track = friendLogic.resolveTrack(local, self?.gender)
  const trackLabel = track === 'romance' ? 'ロマンス' : '友情'
  const stages = friendLogic.getStages(track)
  const goalTitle = stages[stages.length - 1].title
  const definition = friendLogic.getStageDefinition(stage, track)
  const gate = friendLogic.getStageGateProgress(profile, stage, track)
  const stageChecks = stage && Array.isArray(profile.stageChecks?.[stage]) ? profile.stageChecks[stage] : []
  const log = friendLogic.getConversationLog(profile)
  const nextToAsk = log.find(entry => entry.wantToAsk)?.wantToAsk || ''
  const typeDef = friendLogic.getPersonalityType(local.personalityType)
  const hint = selfHint(self)

  const flow = stage ? conversationFlow.getConversationLevel(stage, track) : null
  const microSteps = stage ? stageGuidance.getMicroSteps(local, stage, track) : []
  const plan = stage ? (profile.stepPlans?.[stage] || {}) : {}
  const selectedStep = Number.isInteger(plan.selectedStep) ? plan.selectedStep : 0
  const planDraft = plan.draft !== undefined ? plan.draft : (microSteps[selectedStep] || '')
  const outcomeMessage = stageGuidance.getOutcomeMessage(plan.outcome)
  const collectionGuide = stage ? stageGuidance.getCollectionGuide(stage, track) : []
  const collectionFilled = collectionGuide.filter(item => stageGuidance.isCollectionFilled(local, item)).length

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
    { v: `${stage || 0}/10`, l: `LV（→ ${goalTitle}）` },
    log.length ? { v: log.length, l: '記録した会話' } : null,
    daysSinceFirst ? { v: daysSinceFirst, l: '日目' } : null,
    daysToBirthday != null ? { v: daysToBirthday, l: '日後が誕生日' } : null
  ].filter(Boolean)

  return (
    <div className="person-page communication-page stage-page">
      <header className="communication-header">
        <img className="avatar-large" src={avatarUrl || local.avatar || FALLBACK_AVATAR} alt="" />
        <div className="stage-header-copy">
          <p className="eyebrow">{track === 'romance' ? 'ROMANCE TRACK' : 'FRIEND TRACK'}</p>
          <h2>{local.name || '無名'}</h2>
          <div className="score-line">
            <span className="score-number">{stage || '—'}</span>
            <span><strong>{definition?.title || 'レベル未設定'}</strong><small>{definition?.summary || 'いまの関係に近いレベルを選ぶ'}</small></span>
          </div>
          <div className="hearts header-hearts" aria-label={stage ? `レベル${stage}` : 'レベル未設定'}>
            {Array.from({ length: 10 }).map((_, index)=> <span className={stage && index < stage ? 'heart filled' : 'heart'} key={index}>{stage && index < stage ? '❤️' : '🖤'}</span>)}
          </div>
          <div className="track-switch" role="group" aria-label="トラック">
            {TRACK_OPTIONS.map(opt => (
              <button type="button" key={opt.value}
                className={profile.track === opt.value ? 'track-opt active' : 'track-opt'}
                onClick={()=> updateCommunication('track', opt.value)}>
                {opt.label}{opt.value === 'auto' ? `（${trackLabel}）` : ''}
              </button>
            ))}
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
          <section className="journey-strip" aria-label="ステータス">
            {journeyTiles.map(tile => (
              <div key={tile.l}><b>{tile.v}</b><span>{tile.l}</span></div>
            ))}
          </section>

          <section className="stage-picker-card">
            <div className="section-heading"><p className="eyebrow">CURRENT LEVEL</p><h3>いまの関係はどのレベル？</h3></div>
            <p className="stage-help">こなした回数ではなく、相手からも関係が返ってきているレベルを選ぶ。</p>
            <div className="stage-scale" role="radiogroup" aria-label="現在のレベル">
              {stages.map(item => {
                const linked = conversationFlow.getConversationLevel(item.id, track)
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

          <section className="communication-card type-card">
              <div className="section-heading"><p className="eyebrow">READ THE PLAYER</p><h3>相手のタイプと接し方</h3></div>
              <div className="type-picker">
                {friendLogic.PERSONALITY_TYPES.map(t => (
                  <button type="button" key={t.id} className={local.personalityType === t.id ? 'type-chip selected' : 'type-chip'} onClick={()=> setPersonalityType(t.id)}>
                    <strong>{t.label}</strong><span>{t.impression}</span>
                  </button>
                ))}
              </div>
              {typeDef && (
                <div className="type-guide">
                  <p className="type-tendency">{typeDef.tendency}</p>
                  <p className="type-open"><b>最初の一言</b>{typeDef.openLine}</p>
                  <div className="type-cols">
                    <div className="type-ok"><b>刺さる動き</b><ul>{typeDef.ok.map(x => <li key={x}>{x}</li>)}</ul></div>
                    <div className="type-ng"><b>やらかしやすい</b><ul>{typeDef.ng.map(x => <li key={x}>{x}</li>)}</ul></div>
                  </div>
                </div>
              )}
          </section>

          <section className="communication-card conversation-card">
            <div className="section-heading"><p className="eyebrow">CONVERSATION LOG</p><h3>会話の記録</h3></div>
            <p className="gate-intro">話すたびに、内容と「相手から返ってきたもの」を短く残す。積み重ねが攻略メモになる。</p>

            <div className="convo-form">
              <label>話した日<input type="date" value={draft.date} onChange={event=> setDraft(d => ({ ...d, date: event.target.value }))} /></label>
              <label>話した内容・話題<textarea rows="2" value={draft.topics} onChange={event=> setDraft(d => ({ ...d, topics: event.target.value }))} placeholder="話題と、どこまで個人的な話になったか" /></label>
              <label>相手から返ってきた反応<textarea rows="2" value={draft.theirResponse} onChange={event=> setDraft(d => ({ ...d, theirResponse: event.target.value }))} placeholder="質問が返った、話を広げた、次の提案があった、など" /></label>
              <label>印象に残ったこと・使えるネタ<textarea rows="2" value={draft.appreciated} onChange={event=> setDraft(d => ({ ...d, appreciated: event.target.value }))} placeholder="相手のこういうところ、次に使えそうな情報" /></label>
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
                    {entry.appreciated && <p className="convo-good"><b>ネタ</b>{entry.appreciated}</p>}
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
                  <div><p className="eyebrow">LEVEL {stage} ＝ CONVERSATION LEVEL {flow.id}</p><h3>いまのレベルに合う会話</h3></div>
                  <span className="level-badge">LV {flow.id}</span>
                </div>
                <div className="flow-formula"><small>{flow.title}</small><strong>{flow.formula}</strong><p>{flow.purpose}</p></div>

                <div className="flow-block">
                  <h4>会話の進め方</h4>
                  <ol className="flow-moves">{flow.moves.map(move => <li key={move}>{move}</li>)}</ol>
                </div>

                <div className="flow-block">
                  <h4>使える言い回し（タップで次の一手に）</h4>
                  <div className="flow-examples">
                    {flow.examples.map(example => (
                      <button type="button" key={example} onClick={()=> updateStepPlan(stage, { draft: example, status: '', outcome: '' })}>{example}</button>
                    ))}
                  </div>
                </div>

                <div className="flow-engine">
                  <article><small>深掘り</small><p>{flow.deepener}</p></article>
                  <article><small>仮説で本音を引き出す</small><p>{flow.hypothesis}</p></article>
                  <article className="invite"><small>断りやすく誘う</small><p>{flow.invitation}</p></article>
                </div>

                <div className="advance-signals">
                  <strong>次のレベルへのサイン</strong>
                  <div>{flow.advanceSignals.map(signal => <span key={signal}>✓ {signal}</span>)}</div>
                </div>
                <p className="ethical-note">つまずきポイント：{flow.caution}</p>

                <label className="flow-note-label">この人との会話メモ
                  <textarea rows="2" value={profile.conversationFlowNotes?.[flow.id] || ''} onChange={event=> updateFlowNote(flow.id, event.target.value)} placeholder="使えそうな話題、前に出た言葉、次に聞きたいこと" />
                </label>
              </section>

              <section className="communication-card momentum-card">
                <div className="section-heading"><p className="eyebrow">QUEST</p><h3>次の一手</h3></div>
                <p className="gate-intro">大きく進めず、今のレベルから一つだけ自然に濃くする。</p>
                {hint && <p className="self-hint">💡 {hint}</p>}
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
                  {!plan.status && <button type="button" className="advance" onClick={()=> updateStepPlan(stage, { status: 'planned', outcome: '' })}>この一手を予定にする</button>}
                  {plan.status === 'planned' && (
                    <>
                      <span className="plan-status">✓ 次の一手が決まった</span>
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
                      <button type="button" onClick={()=> updateStepPlan(stage, { status: '', outcome: '', draft: '', selectedStep: microSteps.length ? (selectedStep + 1) % microSteps.length : 0 })}>次の一手を選ぶ</button>
                    </div>
                  )}
                </div>
              </section>

              <section className="communication-card gate-card">
                <div className="section-heading with-progress">
                  <div><p className="eyebrow">LEVEL-UP GATE</p><h3>{stage === 10 ? `${goalTitle}と言える条件` : '次のレベルへの条件'}</h3></div>
                  <span>{gate.checked}/{gate.total}</span>
                </div>
                <p className="gate-intro">自分がやったことではなく、相手から返ってきた反応だけをチェックする。</p>
                <div className="gate-checks">
                  {definition.nextConditions.map((condition, index)=> (
                    <label className={stageChecks[index] ? 'checked' : ''} key={condition}>
                      <input type="checkbox" checked={Boolean(stageChecks[index])} onChange={()=> toggleStageCheck(index)} /><span>{condition}</span>
                    </label>
                  ))}
                </div>
                <div className={gate.ready ? 'gate-status ready' : 'gate-status'}>
                  <strong>{gate.ready ? 'READY' : `${gate.checked}/${gate.total}`}</strong>
                  <span>{gate.ready ? (stage === 10 ? `${goalTitle}レベルに到達できる状態` : '次のレベルを試せる') : `あと${Math.max(0, gate.required - gate.checked)}個サインが必要`}</span>
                </div>
                <div className="next-move"><strong>レベルを上げるなら</strong><p>{definition.nextMove}</p><small>つまずきポイント：{definition.caution}</small></div>
                <div className="stage-step-controls">
                  <button type="button" disabled={stage <= 1} onClick={()=> chooseStage(stage - 1)}>← 一段戻す</button>
                  {stage < 10 && <button type="button" className="advance" disabled={!gate.ready} onClick={()=> chooseStage(stage + 1)}>レベルアップ →</button>}
                </div>
              </section>

              <section className="communication-card safety-card">
                <div className="section-heading"><p className="eyebrow">BEFORE THE NEXT MOVE</p><h3>次の一手の前チェック</h3></div>
                {SAFETY_ITEMS.map(([key, label])=> (
                  <label key={key} className={profile.nextStepSafety[key] ? 'checked' : ''}>
                    <input type="checkbox" checked={Boolean(profile.nextStepSafety[key])} onChange={()=> toggleSafety(key)} /><span>{label}</span>
                  </label>
                ))}
              </section>

              {collectionGuide.length > 0 && (
                <section className="communication-card knowledge-card">
                  <div className="section-heading with-progress">
                    <div><p className="eyebrow">INTEL</p><h3>このレベルで押さえておくこと</h3></div>
                    <span>{collectionFilled}/{collectionGuide.length}</span>
                  </div>
                  <p className="gate-intro">質問攻めにせず、相手が自然に話した時に記録する。入力は基本情報・メモにも反映される。</p>
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
                <summary><span><small>TALK DECK</small><strong>このレベルで自然な5つの話題</strong></span></summary>
                <div className="talk-deck-grid">
                  {definition.topics.map(([name, example], index)=> (
                    <article className="talk-card" key={name}><span>{index + 1}</span><div><strong>{name}</strong><p>{example}</p></div></article>
                  ))}
                </div>
              </details>

              <details className="communication-card cues-card flow-details">
                <summary><span><small>SIGNS</small><strong>相手の様子を読み取る</strong></span></summary>
                <ul className="cues-list">
                  <li><b>声・語尾</b>急に高くなる＝緊張。ぼそぼそ＝踏み込んでほしい。「〜かな」「〜みたいな」多用＝決断を委ねたい</li>
                  <li><b>笑い方</b>鼻で笑う＝観察者。口を隠す＝本心を見せるのが怖い。目が笑ってない大笑い＝社交疲れ</li>
                  <li><b>否定から入る</b>「いや」「でも」が口癖＝プライドと防衛。まず肯定すると懐く</li>
                  <li><b>スマホ</b>画面を下に＝集中の演出 or 隠し事。通知を毎回チェック＝常に刺激・承認がほしい</li>
                  <li><b>姿勢・手</b>顔や首に手＝不安。私物を寄せてくる＝受け入れてほしいサイン。足を組み替える＝退屈 or 緊張</li>
                </ul>
                <p className="ethical-note">相手が心地よいか・緊張していないかを読む手がかりとして使う。</p>
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
              <strong>まず現在のレベルを選ぶ</strong>
              <p>迷ったら、自分ができることではなく「相手から返ってきている反応」で選ぶ。</p>
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
