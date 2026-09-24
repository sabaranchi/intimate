import React,{useRef} from 'react'
import {getStage,resolveMode,guidesFor,setStage} from '../utils/yamadaStages'

export function RelationshipHearts({stage,compact=false}){
  return <span className={'y-hearts'+(compact?' y-hearts-compact':'')} role="img" aria-label={stage?'親密度 '+stage+' / 10':'親密度 未設定'}>{Array.from({length:10},(_,i)=><span aria-hidden="true" key={i} className={stage&&i<stage?'is-filled':''}>{stage&&i<stage?'♥':'♡'}</span>)}</span>
}
export function RelationshipSummary({person,self}){
  const stage=getStage(person),mode=resolveMode(person,self)
  return <><RelationshipHearts stage={stage} compact/><small>{stage?'第'+stage+'段階':'段階未設定'} · {mode.id==='friends'?'友達':mode.id==='someone'?'気になる人':'モード未設定'}</small></>
}
export default function YamadaStageGuide({person,self,onChange}){
  const picker=useRef(null)
  function choose(stage){onChange(setStage(person,stage));if(picker.current){picker.current.open=false;picker.current.querySelector('summary')?.focus()}}
  const mode=resolveMode(person,self)
  const stage=getStage(person)
  const guides=guidesFor(mode.id)
  const guide=stage&&mode.id?guides[stage-1]:null
  const label=mode.id==='friends'?'友達':mode.id==='someone'?'気になる人':'モード未設定'
  return <section className="y-card y-stage-guide" aria-label="会う前の山田ガイド">
    <div className="y-stage-heading"><p className="y-eyebrow">山田なら、今はこんな感じ。</p><span className="y-mode-badge">{label}{mode.automatic?' · 自動':''}</span></div>
    <h2>{stage?'第'+stage+'段階'+(guide?' · '+guide.title:''):'いまの関係を選ぼう'}</h2>
    <RelationshipHearts stage={stage}/>
    {guide&&<p className="y-muted">目安：{guide.sign}</p>}
    {!mode.automatic&&<div className="y-mode-setup"><p className="y-muted">同性は「友達」、異性は「気になる人」に自動切替。未設定・その他の場合は、ここで選べます。相手の性別は「基本情報」で設定できます。</p><div className="y-mode-picker">{[['friends','友達'],['someone','気になる人']].map(([id,name])=><button key={id} aria-pressed={mode.id===id} onClick={()=>onChange({yamada:{...person.yamada,mode:id}})}>{name}</button>)}</div><a href="#self">自分の性別を設定する →</a></div>}
    <details className="y-stage-picker" ref={picker}><summary>{stage?'今の段階を見直す':'10段階から選ぶ'}</summary><p className="y-muted">二人の様子に近いものを選びます。段階はいつでも戻せます。ハートは好意の確率ではありません。</p><div role="radiogroup" aria-label="関係の10段階">{guides.map(g=><button key={g.id} role="radio" aria-checked={stage===g.id} onClick={()=>choose(g.id)}><b>{g.id}</b><span>{g.title}<small>{g.sign}</small></span></button>)}</div>{stage&&<button className="y-text-button" onClick={()=>choose(null)}>未設定に戻す</button>}</details>
    {guide?<div className="y-stage-cues"><div><span>すること</span><p>{guide.action}</p></div><div><span>ひと言</span><p className="y-stage-say">「{guide.say}」</p></div><div><span>接し方</span><p>{guide.attitude}</p></div><p className="y-muted">全部覚えなくて大丈夫。ひと言は台本ではなく、自分の言葉で。原作の台詞ではなく、人物像をもとにしたアプリ独自の例です。</p></div>:<p className="y-muted">{!mode.id?'モードと段階を選ぶと、この人に合った「すること・ひと言・接し方」が出ます。':'段階を選ぶと、会う前に確認する3つだけを表示します。'}</p>}
  </section>
}
