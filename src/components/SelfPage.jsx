import React, { useState } from 'react'
import SelfSettings from './SelfSettings'
import { MODES, YAMADA_SOURCE } from '../utils/yamada'

export default function SelfPage({self,onSave,onBack,saveStatus,onRetry}){
  const [overthinking,setOverthinking] = useState(false)
  const mode = MODES.find(x=>x.id===self.yamadaMode) || MODES[0]
  return <div className="y-page">
    <header className="y-top"><button onClick={onBack}>← 人のノート</button><span role="status">{saveStatus==='error'?'未保存':saveStatus==='saving'?'保存中…':'保存済み'}</span></header>
    {saveStatus==='error'&&<div className="y-error" role="alert">保存できていません。画面を閉じずに再試行してください。<button onClick={onRetry}>再試行</button></div>}
    <details className="y-card" open={!self.gender||undefined}><summary>自動モードの設定・自分のプロフィール{self.gender?'（'+(self.gender==='other'?'その他':self.gender)+'）':''}</summary><SelfSettings self={self} onSave={onSave}/></details>
    <section className="y-mode">
      <p className="y-eyebrow">山田モード</p>
      <div className="y-sun" aria-hidden="true">☀</div>
      <div className="y-mode-picker" aria-label="今日の場面">{MODES.map(x=><button key={x.id} aria-pressed={mode.id===x.id} onClick={()=>{onSave(prev=>({...prev,yamadaMode:x.id}));setOverthinking(false)}}>{x.label}</button>)}</div>
      <h1>{overthinking?'うまい返しは、いったん置こう。':mode.title}</h1>
      <p className="y-inner-voice">{overthinking?'今、聞いていて気になったことは何だろう。それを、そのまま言ってみよう。':mode.voice}</p>
      <p className="y-muted">{overthinking?'沈黙があっても大丈夫。急いで埋めなくていい。':mode.note}</p>
      <button className="y-primary" onClick={onBack}>これだけ持って、話しにいく →</button>
      <button className="y-text-button" onClick={()=>setOverthinking(v=>!v)}>{overthinking?'いつもの気持ちに戻す':'考えすぎてしまったとき'}</button>
    </section>
    <details className="y-card y-about"><summary>どんな山田を、自分に取り入れる？</summary>
      <p>『正反対な君と僕』の山田健太郎をヒントに、飾らず人に関心を向け、思ったことを素直に伝える姿勢を大切にしています。</p>
      <p>友達とは、くだらない話も一緒に面白がる。気になる人には、駆け引きより「もっと話したい」という気持ちを。明るさを演じ続けたり、相手を急かしたりする必要はありません。</p>
      <p className="y-muted">このモードの言葉はアプリ独自の解釈で、原作の台詞ではありません。</p>
      <a href={YAMADA_SOURCE} target="_blank" rel="noreferrer">公式の人物紹介 ↗</a>
    </details>
    <p className="y-muted">ここでは気分の切り替えを自由に試せます。相手ごとのモードと段階別のガイドは、その人の「会う前」に表示します。</p>
    <p className="y-footer">今日の達成度も、連続記録もありません。必要なときだけ戻ってきてください。</p>
  </div>
}
