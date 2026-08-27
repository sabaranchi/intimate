import React, { useEffect, useState } from 'react'
import PersonPage from './PersonPage'
import * as avatarStore from '../utils/avatarStore'
import * as friendLogic from '../utils/friendLogic'

export default function CommunicationPersonPage({person,onSave,onBack}){
  const [showDetails,setShowDetails]=useState(false)
  const [avatarUrl,setAvatarUrl]=useState('')
  const [local,setLocal]=useState(()=>({...person,communication:friendLogic.normalizeCommunication(person)}))

  useEffect(()=> setLocal({...person,communication:friendLogic.normalizeCommunication(person)}),[person?.id])
  useEffect(()=>{
    let active=true
    let objectUrl=''
    ;(async()=>{
      if(person?.avatar){ if(active)setAvatarUrl(person.avatar); return }
      if(person?.avatarId){
        try{ objectUrl=await avatarStore.getAvatarURL(person.avatarId); if(active&&objectUrl)setAvatarUrl(objectUrl) }catch(e){}
      }
    })()
    return ()=>{ active=false; if(objectUrl){try{URL.revokeObjectURL(objectUrl)}catch(e){}} }
  },[person?.id,person?.avatar,person?.avatarId])

  function buildPatch(source=local){
    const communication=friendLogic.normalizeCommunication(source)
    return {
      ...source,
      communication,
      friendScore:friendLogic.getCommunicationScore({...source,communication}),
      lastInteractionDate:communication.lastConversationDate||source.lastInteractionDate||'',
      lastConversationSummary:communication.lastConversationNote||source.lastConversationSummary||''
    }
  }

  function updateCommunication(key,value){
    setLocal(previous=>({...previous,communication:{...friendLogic.normalizeCommunication(previous),[key]:value,updatedAt:new Date().toISOString()}}))
  }

  function chooseStage(stage){ updateCommunication('relationshipStage',stage) }

  function toggleStageCheck(index){
    setLocal(previous=>{
      const profile=friendLogic.normalizeCommunication(previous)
      const stage=profile.relationshipStage
      if(!stage)return previous
      const values=Array.isArray(profile.stageChecks?.[stage])?[...profile.stageChecks[stage]]:[]
      values[index]=!values[index]
      return {...previous,communication:{...profile,stageChecks:{...profile.stageChecks,[stage]:values},updatedAt:new Date().toISOString()}}
    })
  }

  function toggleSafety(key){
    setLocal(previous=>{
      const profile=friendLogic.normalizeCommunication(previous)
      return {...previous,communication:{...profile,nextStepSafety:{...profile.nextStepSafety,[key]:!profile.nextStepSafety[key]},updatedAt:new Date().toISOString()}}
    })
  }

  function saveAndBack(){ const patch=buildPatch(); onSave(patch); onBack() }
  function openDetails(){ const patch=buildPatch(); setLocal(patch); onSave(patch); setShowDetails(true) }

  if(showDetails){
    return <PersonPage person={local} onSave={patch=>{const merged=buildPatch({...local,...patch});setLocal(merged);onSave(merged)}} onBack={onBack}/>
  }

  const profile=friendLogic.normalizeCommunication(local)
  const stage=profile.relationshipStage
  const definition=friendLogic.getStageDefinition(stage)
  const gate=friendLogic.getStageGateProgress(profile,stage)
  const stageChecks=stage&&Array.isArray(profile.stageChecks?.[stage])?profile.stageChecks[stage]:[]

  return (
    <div className="person-page communication-page stage-page">
      <header className="communication-header">
        <img className="avatar-large" src={avatarUrl||local.avatar||'/icon-192.png'} alt=""/>
        <div className="stage-header-copy">
          <p className="eyebrow">RELATIONSHIP GRADIENT</p>
          <h2>{local.name||'無名'}</h2>
          <div className="score-line">
            <span className="score-number">{stage||'—'}</span>
            <span><strong>{definition?.title||'段階未設定'}</strong><small>{definition?.summary||'今の関係に近い段階を選んでください'}</small></span>
          </div>
          <div className="hearts header-hearts" aria-label={stage?`第${stage}段階`:'段階未設定'}>
            {Array.from({length:10}).map((_,index)=><span className={stage&&index<stage?'heart filled':'heart'} key={index}>{stage&&index<stage?'❤️':'🖤'}</span>)}
          </div>
        </div>
      </header>

      <section className="stage-picker-card">
        <div className="section-heading"><p className="eyebrow">CURRENT STAGE</p><h3>今の関係はどの段階？</h3></div>
        <p className="stage-help">できた回数ではなく、相手からも関係が返ってきている段階を選びます。</p>
        <div className="stage-picker" role="radiogroup" aria-label="現在の関係段階">
          {friendLogic.RELATIONSHIP_STAGES.map(item=><button type="button" role="radio" aria-checked={stage===item.id} className={stage===item.id?'stage-dot selected':'stage-dot'} key={item.id} onClick={()=>chooseStage(item.id)}><b>{item.id}</b><small>{item.title}</small></button>)}
        </div>
      </section>

      {definition?(
        <main className="stage-content">
          <section className="communication-card talk-deck-card">
            <div className="section-heading"><p className="eyebrow">TALK DECK</p><h3>この段階で自然な5つの話題</h3></div>
            <div className="talk-deck-grid">
              {definition.topics.map(([name,example],index)=><article className="talk-card" key={name}><span>{index+1}</span><div><strong>{name}</strong><p>{example}</p></div></article>)}
            </div>
          </section>

          <section className="communication-card gate-card">
            <div className="section-heading"><p className="eyebrow">RECIPROCITY GATE</p><h3>{stage===10?'告白が自然になる条件':'次へ進める相互サイン'}</h3></div>
            <p className="gate-intro">自分が進めた回数ではなく、相手から返ってきた反応をチェックします。</p>
            <div className="gate-checks">
              {definition.nextConditions.map((condition,index)=><label className={stageChecks[index]?'checked':''} key={condition}><input type="checkbox" checked={Boolean(stageChecks[index])} onChange={()=>toggleStageCheck(index)}/><span>{condition}</span></label>)}
            </div>
            <div className={gate.ready?'gate-status ready':'gate-status'}><strong>{gate.checked}/{gate.total}</strong><span>{gate.ready?(stage===10?'告白を考えられる状態です':'次の一段を試せます'):`${gate.required}個以上の相互サインを確認`}</span></div>
            <div className="next-move"><strong>次の一手</strong><p>{definition.nextMove}</p><small>{definition.caution}</small></div>
            <div className="stage-step-controls">
              <button type="button" disabled={stage<=1} onClick={()=>chooseStage(stage-1)}>← 一段戻す</button>
              {stage<10&&<button type="button" className="advance" disabled={!gate.ready} onClick={()=>chooseStage(stage+1)}>条件を確認して一段進む →</button>}
            </div>
          </section>

          <section className="communication-card safety-card">
            <div className="section-heading"><p className="eyebrow">BEFORE THE NEXT MOVE</p><h3>キモくならないための3点確認</h3></div>
            {[
              ['oneStep','今の関係より「一段だけ」近い行動か'],
              ['roomToDecline','相手が断ったり流したりできる余白があるか'],
              ['reciprocated','前回こちらが近づいた時、相手からも何か返ってきたか']
            ].map(([key,label])=><label key={key} className={profile.nextStepSafety[key]?'checked':''}><input type="checkbox" checked={Boolean(profile.nextStepSafety[key])} onChange={()=>toggleSafety(key)}/><span>{label}</span></label>)}
          </section>

          <section className="communication-card addressing-card">
            <div className="section-heading"><p className="eyebrow">NAMES</p><h3>実際になんと呼び合う？</h3></div>
            <div className="two-column-fields">
              <label>自分 → 相手<input value={profile.iCallThem} onChange={event=>updateCommunication('iCallThem',event.target.value)} placeholder="例：さき、田中さん"/></label>
              <label>相手 → 自分<input value={profile.theyCallMe} onChange={event=>updateCommunication('theyCallMe',event.target.value)} placeholder="例：名字、あだ名"/></label>
            </div>
          </section>

          <section className="communication-card conversation-card">
            <div className="section-heading"><p className="eyebrow">LATEST CONVERSATION</p><h3>何を、どんな感じで話した？</h3></div>
            <label>最後に話した日<input type="date" value={profile.lastConversationDate} onChange={event=>updateCommunication('lastConversationDate',event.target.value)}/></label>
            <label>話した内容・話題<textarea rows="3" value={profile.recentTopics} onChange={event=>updateCommunication('recentTopics',event.target.value)} placeholder="話題と、どこまで個人的な話になったか"/></label>
            <label>相手から返ってきた反応<textarea rows="3" value={profile.lastConversationNote} onChange={event=>updateCommunication('lastConversationNote',event.target.value)} placeholder="質問が返った、相手から話を広げた、次の提案があった、など"/></label>
          </section>
        </main>
      ):<div className="stage-empty"><strong>まず現在地を選んでください</strong><p>迷ったら、言いたいことではなく「相手から返ってきている反応」で選びます。</p></div>}

      <nav className="communication-actions"><button type="button" onClick={saveAndBack}>← 保存して戻る</button><button type="button" className="secondary" onClick={openDetails}>基本情報・メモ・写真</button></nav>
    </div>
  )
}
