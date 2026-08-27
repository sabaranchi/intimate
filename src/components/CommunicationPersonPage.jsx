import React,{useEffect,useState} from 'react'
import PersonPage from './PersonPage'
import * as avatarStore from '../utils/avatarStore'
import * as friendLogic from '../utils/friendLogic'
import * as stageGuidance from '../utils/stageGuidance'

const EMPTY_SAFETY={oneStep:false,roomToDecline:false,reciprocated:false}

export default function CommunicationPersonPage({person,onSave,onBack}){
  const [showDetails,setShowDetails]=useState(false)
  const [avatarUrl,setAvatarUrl]=useState('')
  const [local,setLocal]=useState(()=>({...person,communication:friendLogic.normalizeCommunication(person)}))

  useEffect(()=>setLocal({...person,communication:friendLogic.normalizeCommunication(person)}),[person?.id])
  useEffect(()=>{
    let active=true
    let objectUrl=''
    ;(async()=>{
      if(person?.avatar){if(active)setAvatarUrl(person.avatar);return}
      if(person?.avatarId){try{objectUrl=await avatarStore.getAvatarURL(person.avatarId);if(active&&objectUrl)setAvatarUrl(objectUrl)}catch(e){}}
    })()
    return()=>{active=false;if(objectUrl){try{URL.revokeObjectURL(objectUrl)}catch(e){}}}
  },[person?.id,person?.avatar,person?.avatarId])

  function buildPatch(source=local){
    const communication=friendLogic.normalizeCommunication(source)
    return {...source,communication,friendScore:friendLogic.getCommunicationScore({...source,communication}),lastInteractionDate:communication.lastConversationDate||source.lastInteractionDate||'',lastConversationSummary:communication.lastConversationNote||source.lastConversationSummary||''}
  }

  function updateCommunication(key,value){
    setLocal(previous=>({...previous,communication:{...friendLogic.normalizeCommunication(previous),[key]:value,updatedAt:new Date().toISOString()}}))
  }

  function chooseStage(nextStage){
    setLocal(previous=>{
      const profile=friendLogic.normalizeCommunication(previous)
      if(profile.relationshipStage===nextStage)return previous
      return {...previous,communication:{...profile,relationshipStage:nextStage,nextStepSafety:{...EMPTY_SAFETY},updatedAt:new Date().toISOString()}}
    })
  }

  function toggleStageCheck(index){
    setLocal(previous=>{
      const profile=friendLogic.normalizeCommunication(previous)
      const stage=profile.relationshipStage
      if(!stage)return previous
      const checks=Array.isArray(profile.stageChecks?.[stage])?[...profile.stageChecks[stage]]:[]
      checks[index]=!checks[index]
      return {...previous,communication:{...profile,stageChecks:{...profile.stageChecks,[stage]:checks},updatedAt:new Date().toISOString()}}
    })
  }

  function toggleSafety(key){
    setLocal(previous=>{
      const profile=friendLogic.normalizeCommunication(previous)
      return {...previous,communication:{...profile,nextStepSafety:{...profile.nextStepSafety,[key]:!profile.nextStepSafety[key]},updatedAt:new Date().toISOString()}}
    })
  }

  function updateStepPlan(patch){
    setLocal(previous=>{
      const profile=friendLogic.normalizeCommunication(previous)
      const stage=profile.relationshipStage
      if(!stage)return previous
      const current=profile.stepPlans?.[stage]||{}
      return {...previous,communication:{...profile,stepPlans:{...(profile.stepPlans||{}),[stage]:{...current,...patch,updatedAt:new Date().toISOString()}},updatedAt:new Date().toISOString()}}
    })
  }

  function updateCollection(item,text){
    const value=stageGuidance.parseCollectionValue(text,item)
    setLocal(previous=>item.source==='notes'?{...previous,notes:{...(previous.notes||{}),[item.key]:value}}:{...previous,[item.key]:value})
  }

  function saveAndBack(){const patch=buildPatch();onSave(patch);onBack()}
  function openDetails(){const patch=buildPatch();setLocal(patch);onSave(patch);setShowDetails(true)}

  if(showDetails)return <PersonPage person={local} onSave={patch=>{const merged=buildPatch({...local,...patch});setLocal(merged);onSave(merged)}} onBack={onBack}/>

  const profile=friendLogic.normalizeCommunication(local)
  const stage=profile.relationshipStage
  const definition=friendLogic.getStageDefinition(stage)
  const gate=friendLogic.getStageGateProgress(profile,stage)
  const stageChecks=stage&&Array.isArray(profile.stageChecks?.[stage])?profile.stageChecks[stage]:[]
  const microSteps=stage?stageGuidance.getMicroSteps(local,stage):[]
  const plan=stage?(profile.stepPlans?.[stage]||{}):{}
  const selectedStep=Number.isInteger(plan.selectedStep)?plan.selectedStep:0
  const planDraft=plan.draft||microSteps[selectedStep]||''
  const outcomeMessage=stageGuidance.getOutcomeMessage(plan.outcome)
  const collectionGuide=stage?stageGuidance.getCollectionGuide(stage):[]
  const collectionFilled=collectionGuide.filter(item=>stageGuidance.isCollectionFilled(local,item)).length
  const safetyReady=Object.values(profile.nextStepSafety||{}).every(Boolean)

  return <div className="person-page communication-page flow-page">
    <header className="communication-header flow-header">
      <img className="avatar-large" src={avatarUrl||local.avatar||'/icon-192.png'} alt=""/>
      <div className="stage-header-copy"><p className="eyebrow">RELATIONSHIP COMPASS</p><h2>{local.name||'無名'}</h2>
        <div className="score-line"><span className="score-number">{stage||'—'}</span><span><strong>{definition?.title||'段階未設定'}</strong><small>{definition?.summary||'相手から返ってきている反応で現在地を選びます'}</small></span></div>
        <div className="hearts header-hearts" aria-label={stage?`第${stage}段階`:'段階未設定'}>{Array.from({length:10}).map((_,index)=><span className={stage&&index<stage?'heart filled':'heart'} key={index}>{stage&&index<stage?'❤️':'🖤'}</span>)}</div>
      </div>
    </header>

    <section className="stage-picker-card flow-stage-picker"><div className="section-heading"><p className="eyebrow">CURRENT STAGE</p><h3>今の関係の現在地</h3></div><p className="stage-help">回数ではなく、相手から返ってきている最も高い段階を選びます。</p>
      <div className="stage-picker" role="radiogroup" aria-label="現在の関係段階">{friendLogic.RELATIONSHIP_STAGES.map(item=><button type="button" role="radio" aria-checked={stage===item.id} className={stage===item.id?'stage-dot selected':'stage-dot'} key={item.id} onClick={()=>chooseStage(item.id)}><b>{item.id}</b><small>{item.title}</small></button>)}</div>
    </section>

    {definition?<main className="stage-content flow-content">
      <section className="momentum-card">
        <div className="momentum-top"><div><p className="eyebrow">NEXT 5% STEP</p><h3>停滞しないための、次の小さな一歩</h3><p>大きく進めず、今の段階から一つだけ自然に濃くします。</p></div><div className="momentum-count"><b>{gate.checked}</b><span>相互サイン</span></div></div>
        <div className="micro-step-options">{microSteps.map((step,index)=><button type="button" className={selectedStep===index?'micro-step selected':'micro-step'} key={step} onClick={()=>updateStepPlan({selectedStep:index,draft:step,status:'',outcome:''})}><span>{index+1}</span>{step}</button>)}</div>
        <label className="draft-label">自分の言葉に直す<textarea rows="2" value={planDraft} onChange={event=>updateStepPlan({draft:event.target.value})}/></label>
        <div className="plan-actions">
          {!plan.status&&<button className="primary-action" type="button" onClick={()=>updateStepPlan({draft:planDraft,status:'planned',outcome:''})}>この一歩を予定にする</button>}
          {plan.status==='planned'&&<><span className="plan-status">✓ 次の一歩が決まりました</span><button className="primary-action" type="button" onClick={()=>updateStepPlan({status:'tried'})}>やってみた</button></>}
          {plan.status==='tried'&&<div className="outcome-buttons"><span>相手の反応は？</span><button type="button" onClick={()=>updateStepPlan({status:'done',outcome:'returned'})}>半歩返ってきた</button><button type="button" onClick={()=>updateStepPlan({status:'done',outcome:'neutral'})}>自然に成立</button><button type="button" onClick={()=>updateStepPlan({status:'done',outcome:'thin'})}>反応は薄め</button></div>}
          {plan.status==='done'&&outcomeMessage&&<div className={`outcome-message ${outcomeMessage.tone}`}><div><strong>{outcomeMessage.title}</strong><p>{outcomeMessage.body}</p></div><button type="button" onClick={()=>updateStepPlan({status:'',outcome:'',draft:'',selectedStep:(selectedStep+1)%microSteps.length})}>次の一歩を選ぶ</button></div>}
        </div>
      </section>

      <div className="flow-grid">
        <section className="communication-card knowledge-card">
          <div className="section-heading with-progress"><div><p className="eyebrow">LEARN NATURALLY</p><h3>この段階で自然に知っておくこと</h3></div><span>{collectionFilled}/{collectionGuide.length}</span></div>
          <p className="card-intro">質問攻めにせず、相手が自然に話した時に記録します。ここへの入力は基本情報・メモにも反映されます。</p>
          <div className="knowledge-list">{collectionGuide.map(item=>{
            const filled=stageGuidance.isCollectionFilled(local,item)
            return <article className={filled?'knowledge-item filled':'knowledge-item'} key={`${item.source}-${item.key}`}><div className="knowledge-heading"><span className="source-chip">{item.source==='notes'?'メモ':'基本情報'}</span><strong>{item.label}</strong>{filled&&<em>記録済み</em>}</div><p>{item.prompt}</p><blockquote>{item.ask}</blockquote><textarea rows="2" value={stageGuidance.formatCollectionValue(stageGuidance.getCollectionValue(local,item))} onChange={event=>updateCollection(item,event.target.value)} placeholder={item.placeholder}/></article>
          })}</div>
          <button type="button" className="text-link-button" onClick={openDetails}>基本情報・メモをまとめて見る →</button>
        </section>

        <section className="communication-card gate-card">
          <div className="section-heading with-progress"><div><p className="eyebrow">RECIPROCITY GATE</p><h3>{stage===10?'告白が自然になる条件':'次へ進める相互サイン'}</h3></div><span>{gate.checked}/{gate.total}</span></div>
          <p className="card-intro">自分がしたことではなく、相手から返ってきた反応だけをチェックします。</p>
          <div className="gate-checks">{definition.nextConditions.map((condition,index)=><label className={stageChecks[index]?'checked':''} key={condition}><input type="checkbox" checked={Boolean(stageChecks[index])} onChange={()=>toggleStageCheck(index)}/><span>{condition}</span></label>)}</div>
          <div className={gate.ready?'gate-status ready':'gate-status'}><strong>{gate.ready?'READY':'WAIT'}</strong><span>{gate.ready?(stage===10?'三条件が揃いました':'次の一段を試せます'):`${gate.required}個以上の相互サインを確認`}</span></div>
          <div className="next-move"><strong>段階を進めるなら</strong><p>{definition.nextMove}</p><small>{definition.caution}</small></div>
          <div className="stage-step-controls"><button type="button" disabled={stage<=1} onClick={()=>chooseStage(stage-1)}>← 一段戻す</button>{stage<10&&<button type="button" className="advance" disabled={!gate.ready} onClick={()=>chooseStage(stage+1)}>条件を確認して一段進む →</button>}</div>
        </section>
      </div>

      <details className="communication-card talk-deck-card flow-details"><summary><span><small>TALK DECK</small><strong>今の段階で自然な5つの話題</strong></span><em>開く</em></summary><div className="talk-deck-grid">{definition.topics.map(([name,example],index)=><article className="talk-card" key={name}><span>{index+1}</span><div><strong>{name}</strong><p>{example}</p></div></article>)}</div></details>

      <section className="communication-card safety-card compact-safety"><div className="section-heading with-progress"><div><p className="eyebrow">BEFORE THE NEXT MOVE</p><h3>自然さを守る3点確認</h3></div><span>{Object.values(profile.nextStepSafety||{}).filter(Boolean).length}/3</span></div>
        <div className="safety-grid">{[['oneStep','今より一段だけ近い'],['roomToDecline','断れる余白がある'],['reciprocated','前回、相手からも返った']].map(([key,label])=><label key={key} className={profile.nextStepSafety[key]?'checked':''}><input type="checkbox" checked={Boolean(profile.nextStepSafety[key])} onChange={()=>toggleSafety(key)}/><span>{label}</span></label>)}</div>{!safetyReady&&<p className="safety-note">3つ揃わない時は、強めず同じ段階の会話を続けます。</p>}
      </section>

      <div className="flow-grid lower-grid">
        <section className="communication-card addressing-card"><div className="section-heading"><p className="eyebrow">NAMES</p><h3>実際になんと呼び合う？</h3></div><div className="two-column-fields"><label>自分 → 相手<input value={profile.iCallThem} onChange={event=>updateCommunication('iCallThem',event.target.value)} placeholder="例：さき、田中さん"/></label><label>相手 → 自分<input value={profile.theyCallMe} onChange={event=>updateCommunication('theyCallMe',event.target.value)} placeholder="例：名字、あだ名"/></label></div></section>
        <section className="communication-card conversation-card"><div className="section-heading"><p className="eyebrow">LATEST CONVERSATION</p><h3>何を、どんな感じで話した？</h3></div><label>最後に話した日<input type="date" value={profile.lastConversationDate} onChange={event=>updateCommunication('lastConversationDate',event.target.value)}/></label><label>話した内容<textarea rows="2" value={profile.recentTopics} onChange={event=>updateCommunication('recentTopics',event.target.value)} placeholder="どこまで個人的な話になったか"/></label><label>相手から返ってきた反応<textarea rows="2" value={profile.lastConversationNote} onChange={event=>updateCommunication('lastConversationNote',event.target.value)} placeholder="質問、話題提供、次の提案など"/></label></section>
      </div>
    </main>:<div className="stage-empty"><strong>まず現在地を選んでください</strong><p>「自分ができること」ではなく「相手から返ってきている反応」で選ぶと安全です。</p></div>}

    <nav className="communication-actions"><button type="button" onClick={saveAndBack}>← 保存して戻る</button><button type="button" className="secondary" onClick={openDetails}>基本情報・メモ・写真</button></nav>
  </div>
}
