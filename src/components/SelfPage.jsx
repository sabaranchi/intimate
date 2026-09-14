import React, { useState } from 'react'
import SelfSettings from './SelfSettings'
import corpus from '../utils/hanshengCorpus.json'
import { normalizePractice, localDay, PRINCIPLES, OS_QUESTIONS, SCORE_AXES, ROUTINES, personContext } from '../utils/selfPractice'
import '../self.css'

const TABS = [['today','今日'],['prepare','会う前'],['train','練習'],['library','資料庫'],['profile','プロフィール']]
const LIBRARY = [...corpus.scenes.map(x=>({...x,kind:'場面'})),...corpus.templates.map(x=>({...x,kind:'会話',category:'会話テンプレ'})),...corpus.guides.map(x=>({...x,kind:'ガイド',category:'実践ガイド'}))]
const textOf = value => typeof value === 'string' ? value : ''
function Field({label,value,onChange,placeholder,rows=2}){return <label className="self-field"><span>{label}</span><textarea rows={rows} value={textOf(value)} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></label>}
function Card({eyebrow,title,children,className=''}){return <section className={`self-card ${className}`}><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{children}</section>}
function SourceText({text}){return <div className="self-source-text">{text.split('\n').filter(line=>line.trim()&&line.trim()!=='---').map((line,i)=>{const heading=/^#{1,6} /.test(line);const clean=line.replace(/^#{1,6} /,'').replace(/\*\*/g,'');return heading?<h4 key={i}>{clean}</h4>:<p key={i}>{clean}</p>})}</div>}

export default function SelfPage({self,people,onSave,onBack,saveStatus,onRetry}){
  const [tab,setTab]=useState('today')
  const [personId,setPersonId]=useState('general')
  const [query,setQuery]=useState('')
  const [category,setCategory]=useState('すべて')
  const [month,setMonth]=useState(localDay().slice(0,7))
  const p=normalizePractice(self.practice)
  const today=localDay()
  const daily=p.daily[today]||{}
  const task=corpus.days.find(d=>d.id===p.day)
  const phase=corpus.phases.find(d=>p.day>=d.start&&p.day<=d.end)
  const training=p.training[p.day]||{}
  const person=people.find(x=>String(x.id)===personId)
  const prep=p.preparations[personId]||{}
  const monthly=p.monthly[month]||{}
  const pinned=[...PRINCIPLES,...LIBRARY].filter(x=>p.pins.includes(x.id))
  const completed=corpus.days.filter(d=>p.training[d.id]?.done).length
  function update(fn){onSave(prev=>({...prev,practice:fn(normalizePractice(prev.practice)),updatedAt:new Date().toISOString()}))}
  function setDaily(key,value){update(v=>({...v,daily:{...v.daily,[today]:{...v.daily[today],[key]:value}}}))}
  function setPrep(key,value){update(v=>({...v,preparations:{...v.preparations,[personId]:{...v.preparations[personId],[key]:value}}}))}
  function setTraining(key,value){update(v=>({...v,training:{...v.training,[p.day]:{...v.training[p.day],[key]:value}}}))}
  function setMonthly(key,value){update(v=>({...v,monthly:{...v.monthly,[month]:{...v.monthly[month],[key]:value}}}))}
  function pin(id){update(v=>({...v,pins:v.pins.includes(id)?v.pins.filter(x=>x!==id):[...v.pins,id]}))}
  function focus(text){setDaily('focus',text);setTab('today')}
  const results=LIBRARY.filter(x=>(category==='すべて'||x.category===category)&&`${x.title} ${x.text}`.toLowerCase().includes(query.trim().toLowerCase()))

  return <div className="self-hub">
    <header className="self-hero">
      <div className="self-topline"><button className="self-back" onClick={onBack}>← 人物一覧</button><span role="status">{saveStatus==='error'?'保存できていません':saveStatus==='saving'?'保存中…':'自動保存済み'}</span></div>
      <p className="eyebrow">MY FIELD NOTES</p><h1>{self.name?`${self.name}の自分ノート`:'自分ノート'}</h1>
      <p>場を読み、動き、信用を残す。<br/>漢昇の「判断と行動」を、自分の日常へ。</p>
      <div className="self-hero-meta"><span>7つの判断軸</span><span>365の小さな実践</span><span>自分のペースで</span></div>
    </header>
    {saveStatus==='error'&&<div role="alert" className="self-save-error">保存に失敗しました。この画面を閉じずに再試行してください。<button onClick={onRetry}>保存を再試行</button></div>}
    <nav className="self-tabs" aria-label="自分ノートのページ">{TABS.map(([id,label])=><button key={id} aria-current={tab===id?'page':undefined} onClick={()=>setTab(id)}>{label}</button>)}</nav>
    <div className="self-content" key={tab}>
    {tab==='today'&&<>
      <Card eyebrow={today.replaceAll('-',' / ')} title="今日は、一つでいい。" className="self-focus-card">
        <Field label="今日、意識すること" value={daily.focus} onChange={v=>setDaily('focus',v)} placeholder="例：自分をよく見せる前に、相手の困り事を一つ聞く"/>
        <div className="self-inline-actions"><button onClick={()=>setTab('prepare')}>会う前に整える →</button><button className="self-quiet" onClick={()=>setTab('train')}>Day {p.day} の練習を見る</button></div>
      </Card>
      <Card eyebrow="MY COMPASS" title="忘れたくない、自分の軸">
        <Field label="どういう人でありたい？" value={p.identity} onChange={identity=>update(v=>({...v,identity}))} placeholder="自分らしい言葉を三つ" rows={1}/>
        <Field label="いつも目に入れておきたいこと" value={p.reminder} onChange={reminder=>update(v=>({...v,reminder}))} placeholder="守る約束、つい忘れる姿勢、自分へのひと言"/>
        {pinned.length>0&&<div className="self-pins">{pinned.map(item=><details key={item.id}><summary>{item.title}</summary><SourceText text={item.text}/><button className="self-quiet" onClick={()=>pin(item.id)}>固定を外す</button></details>)}</div>}
        <details className="self-disclosure"><summary>漢昇から取り入れる8つの姿勢 <span>よく忘れるものを固定</span></summary><div className="self-principles">{PRINCIPLES.map(item=><article key={item.id}><h3>{item.title}</h3><p>{item.text}</p><button className="self-quiet" aria-pressed={p.pins.includes(item.id)} onClick={()=>pin(item.id)}>{p.pins.includes(item.id)?'固定済み':'今日の画面に固定'}</button></article>)}</div></details>
      </Card>
      <Card eyebrow="A STEADY BASE" title="生活を整える"><div className="self-routines">{ROUTINES.map(item=><label key={item}><input type="checkbox" checked={Boolean(daily[item])} onChange={e=>setDaily(item,e.target.checked)}/>{item}</label>)}</div><p className="self-muted">できたことだけ。空白の日があっても、最初からやり直す必要はありません。</p></Card>
      <Card eyebrow="ONE MINUTE REVIEW" title="今日を、次の一手にする">
        <Field label="良かった行動・起きた事実" value={daily.good} onChange={v=>setDaily('good',v)} placeholder="例：先に希望を聞いたら、相手から候補を出してくれた"/>
        <Field label="次に変えることを一つ" value={daily.next} onChange={v=>setDaily('next',v)} placeholder="例：誘う時は日時まで具体的に伝える"/>
        <details className="self-disclosure"><summary>これまでの振り返り</summary>{Object.keys(p.daily).filter(d=>d!==today&&(p.daily[d]?.good||p.daily[d]?.next)).sort().reverse().map(d=><article className="self-history" key={d}><h3>{d}</h3><p>{textOf(p.daily[d].good)}</p><p className="self-muted">次の一手：{textOf(p.daily[d].next)||'未記入'}</p></article>)}{!Object.keys(p.daily).some(d=>d!==today&&(p.daily[d]?.good||p.daily[d]?.next))&&<p className="self-muted">記録した振り返りは、ここに残ります。</p>}</details>
      </Card>
    </>}
    {tab==='prepare'&&<>
      <Card eyebrow="BEFORE YOU MEET" title="会う前に、相手と場を見る">
        <label className="self-field"><span>誰と会う？</span><select value={personId} onChange={e=>setPersonId(e.target.value)}><option value="general">人物を指定しない・場全体の準備</option>{people.map(x=><option key={x.id} value={String(x.id)}>{x.name||'名前未設定'}</option>)}</select></label>
        {person?<><div className="self-context">{personContext(person).map(([label,value])=><div key={label}><small>{label}</small><p>{value}</p></div>)}{!personContext(person).length&&<p>基本情報やメモを残すと、ここでも確認できます。</p>}</div><a className="self-text-link" href={`#person:${person.id}`}> {person.name}の現在地・基本情報・メモを見る →</a></>:<p className="self-muted">人物を選ぶと、基本情報・前回の話・共通の話題を参照しながら準備できます。</p>}
        {(self.weaknesses||self.values)&&<details className="self-disclosure"><summary>自分の傾向も確認</summary>{self.weaknesses&&<p>苦手：{self.weaknesses}</p>}{self.values&&<p>大切にしたいこと：{self.values}</p>}</details>}
      </Card>
      <Card eyebrow="HANSHENG OS · 7 QUESTIONS" title="答えを決めつけず、見立てを持つ"><p className="self-muted">全部を埋める必要はありません。わからないところは、今日聞くことに。</p><div className="self-os">{OS_QUESTIONS.map(([key,label,hint],i)=><div key={key}><span className="self-number">{String(i+1).padStart(2,'0')}</span><Field label={label} value={prep[key]} onChange={v=>setPrep(key,v)} placeholder={hint}/></div>)}</div><Field label="忘れてはいけない約束・気遣い" value={prep.promise} onChange={v=>setPrep('promise',v)} placeholder="相手が話した予定、次に聞くと約束したことなど"/><button onClick={()=>focus(prep.promise||prep.give||prep.pace||'相手の事情を聞いてから、一つ具体的に提案する')}>今日の意識に持ち帰る</button><p className="self-muted">この準備は自分用。相手の基本情報や親密度を自動で変更しません。</p></Card>
    </>}
    {tab==='train'&&<>
      <Card eyebrow="365 SMALL PRACTICES" title="読むだけで終わらせない。">
        <p className="self-muted">Dayは開始日からの経過ではなく、練習番号。好きな場所から、何度でも取り組めます。</p>
        <label className="self-field"><span>テーマから選ぶ</span><select value={phase?.id||13} onChange={e=>update(v=>({...v,day:corpus.phases.find(x=>x.id===Number(e.target.value)).start}))}>{corpus.phases.map(x=><option value={x.id} key={x.id}>{x.id}. {x.title}（Day {x.start}–{x.end}）</option>)}</select></label>
        <div className="self-day-controls"><button disabled={p.day===1} onClick={()=>update(v=>({...v,day:v.day-1}))} aria-label="前の練習">←</button><label>Day <select aria-label="練習日" value={p.day} onChange={e=>update(v=>({...v,day:Number(e.target.value)}))}>{corpus.days.map(d=><option key={d.id} value={d.id}>{d.id}</option>)}</select><span> / 365</span></label><button disabled={p.day===365} onClick={()=>update(v=>({...v,day:v.day+1}))} aria-label="次の練習">→</button></div>
        <div className="self-task"><p className="eyebrow">{phase?.title||'一年の統合'}</p><h3>{task.text}</h3><label className="self-check"><input type="checkbox" checked={Boolean(training.done)} onChange={e=>setTraining('done',e.target.checked)}/>取り組んだ</label></div>
        <Field label="やってみて気づいたこと" value={training.note} onChange={v=>setTraining('note',v)} placeholder="結果よりも、試したこと・発見を残す"/>
        <button onClick={()=>focus(task.text)}>この練習を今日の意識にする</button><div className="self-progress"><progress value={completed} max="365"/><small>{completed} / 365 件の実践を記録</small></div>
      </Card>
      <Card eyebrow="MONTHLY CHECK-IN" title="自分の変化を、月に一度">
        <label className="self-field"><span>振り返る月</span><input type="month" value={month} onChange={e=>{if(e.target.value)setMonth(e.target.value)}}/></label>
        <p className="self-muted">自分の実感を1〜10で。相手の好意や、関係の10段階とは別の記録です。</p>
        <div className="self-scores">{SCORE_AXES.map(axis=><label key={axis}><span>{axis}</span><select value={monthly[axis]||''} onChange={e=>setMonthly(axis,e.target.value?Number(e.target.value):'')}><option value="">未評価</option>{Array.from({length:10},(_,i)=><option key={i+1} value={i+1}>{i+1} / 10</option>)}</select></label>)}</div>
        <Field label="そう感じた具体的な行動・変化" value={monthly.evidence} onChange={v=>setMonthly('evidence',v)} placeholder="例：断られても引きずらず、別の提案を考えられた"/><Field label="来月の重点を一つ" value={monthly.next} onChange={v=>setMonthly('next',v)} placeholder="例：頼まれた小さな仕事を、期限より前に返す"/>
      </Card>
    </>}
    {tab==='library'&&<>
      <Card eyebrow="THE HANSHENG PLAYBOOK" title="必要なときに、必要な一枚。"><p className="self-muted">100場面・会話テンプレ50本・4つの実践ガイド。添付の訓練書を収録し、今日の実践へつなげます。</p><label className="self-field"><span>言葉や場面で検索</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="断られた、初対面、交渉、声…"/></label><label className="self-field"><span>テーマ</span><select value={category} onChange={e=>setCategory(e.target.value)}>{['すべて',...new Set(LIBRARY.map(x=>x.category))].map(x=><option key={x}>{x}</option>)}</select></label><p className="self-muted" role="status">{results.length}件</p></Card>
      <div className="self-library">{results.map(item=><details className="self-card" key={item.id}><summary><small>{item.kind}{item.number?` ${String(item.number).padStart(2,'0')}`:''} · {item.category}</small><strong>{item.title}</strong></summary><SourceText text={item.text}/><div className="self-inline-actions"><button className="self-quiet" aria-pressed={p.pins.includes(item.id)} onClick={()=>pin(item.id)}>{p.pins.includes(item.id)?'固定を外す':'忘れたくないことに固定'}</button><button onClick={()=>focus(`${item.title}：${item.text.replace(/\*\*/g,'')}`)}>今日の意識にする</button></div></details>)}</div>{!results.length&&<p className="self-muted">見つかりませんでした。短い言葉や、別のテーマで探してください。</p>}
      <p className="self-source-note">出典：添付の「現実版・陳漢昇」訓練書。原作の場面解釈は添付資料によるものです。創作の人物像を練習に活用する資料であり、効果を保証するものではありません。</p>
    </>}
    {tab==='profile'&&<><p className="self-muted">これまでの自分の設定です。相手ごとの提案やトラック判定にも使われます。</p><SelfSettings self={self} onSave={onSave} embedded/></>}
    </div>
    <footer className="self-footer">自分の記録はこの端末に保存。メニューのエクスポートで、人物・写真と一緒にバックアップできます。</footer>
  </div>
}
