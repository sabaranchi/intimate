import React, { useEffect, useRef, useState } from 'react'
import { CHECKLIST_ITEMS, CHARISMA_GUIDE, NEGOTIATION_GUIDE, NETWORKING_GUIDE } from '../utils/personalGrowth'

function emptyGrowth(){ return { checklist: {}, journal: [] } }
function todayYMD(){
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function GrowthPage({ self, onSave, onBack }){
  const [local, setLocal] = useState(()=> ({ ...self, growth: { ...emptyGrowth(), ...(self?.growth || {}) } }))
  const [draft, setDraft] = useState({ good: '', next: '' })
  const latest = useRef(local)
  const timer = useRef(null)

  useEffect(()=>{ setLocal({ ...self, growth: { ...emptyGrowth(), ...(self?.growth || {}) } }) }, [])
  useEffect(()=>{ latest.current = local }, [local])
  useEffect(()=>{
    if(timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(()=> onSave({ ...local, updatedAt: new Date().toISOString() }), 450)
    return ()=>{ if(timer.current) clearTimeout(timer.current) }
  }, [local])
  useEffect(()=> ()=>{ onSave({ ...latest.current, updatedAt: new Date().toISOString() }) }, [])

  function toggleItem(id){
    setLocal(prev => ({ ...prev, growth: { ...prev.growth, checklist: { ...prev.growth.checklist, [id]: !prev.growth.checklist[id] } } }))
  }
  function addJournal(){
    if(!draft.good.trim() && !draft.next.trim()) return
    const entry = { id: String(Date.now()), date: todayYMD(), good: draft.good.trim(), next: draft.next.trim() }
    setLocal(prev => ({ ...prev, growth: { ...prev.growth, journal: [entry, ...(prev.growth.journal || [])] } }))
    setDraft({ good: '', next: '' })
  }
  function removeJournal(id){
    setLocal(prev => ({ ...prev, growth: { ...prev.growth, journal: (prev.growth.journal || []).filter(entry => entry.id !== id) } }))
  }

  const checked = Object.values(local.growth.checklist || {}).filter(Boolean).length
  const journal = local.growth.journal || []

  return (
    <div className="person-page communication-page self-page">
      <header className="communication-header">
        <div className="stage-header-copy">
          <p className="eyebrow">PERSONAL GROWTH</p>
          <h2>自分の成長</h2>
          <div className="score-line"><span><small>見た目・振る舞いの習慣と、日々の振り返りを積み重ねます。</small></span></div>
        </div>
      </header>

      <section className="communication-card">
        <div className="section-heading with-progress">
          <div><p className="eyebrow">PRESENCE</p><h3>見た目・振る舞いチェックリスト</h3></div>
          <span>{checked}/{CHECKLIST_ITEMS.length}</span>
        </div>
        <div className="gate-checks">
          {CHECKLIST_ITEMS.map(item => (
            <label key={item.id} className={local.growth.checklist[item.id] ? 'checked' : ''}>
              <input type="checkbox" checked={Boolean(local.growth.checklist[item.id])} onChange={()=> toggleItem(item.id)} /><span>{item.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="communication-card">
        <div className="section-heading"><p className="eyebrow">JOURNAL</p><h3>メンタル日誌</h3></div>
        <p className="gate-intro">その日うまくいったことと、次に活かしたいことを短く残します。</p>
        <div className="convo-form">
          <label>うまくいったこと<textarea rows="2" value={draft.good} onChange={e=> setDraft(d => ({ ...d, good: e.target.value }))} /></label>
          <label>次に活かしたいこと<textarea rows="2" value={draft.next} onChange={e=> setDraft(d => ({ ...d, next: e.target.value }))} /></label>
          <button type="button" className="advance" disabled={!draft.good.trim() && !draft.next.trim()} onClick={addJournal}>記録する</button>
        </div>
        {journal.length > 0 && (
          <ol className="convo-list">
            {journal.map(entry => (
              <li className="convo-entry" key={entry.id}>
                <div className="convo-when">{entry.date}</div>
                {entry.good && <p><b>よかった</b>{entry.good}</p>}
                {entry.next && <p className="convo-next"><b>次に</b>{entry.next}</p>}
                <button type="button" className="convo-del" onClick={()=> removeJournal(entry.id)}>削除</button>
              </li>
            ))}
          </ol>
        )}
      </section>

      <details className="communication-card cues-card flow-details">
        <summary><span><small>CHARISMA</small><strong>信頼・好かれる基本</strong></span></summary>
        <ul className="cues-list">{CHARISMA_GUIDE.map(x => <li key={x}>{x}</li>)}</ul>
      </details>

      <details className="communication-card cues-card flow-details">
        <summary><span><small>NEGOTIATION</small><strong>交渉の基本</strong></span></summary>
        <ul className="cues-list">{NEGOTIATION_GUIDE.map(x => <li key={x}>{x}</li>)}</ul>
      </details>

      <details className="communication-card cues-card flow-details">
        <summary><span><small>NETWORKING</small><strong>人脈作りの基本</strong></span></summary>
        <ul className="cues-list">{NETWORKING_GUIDE.map(x => <li key={x}>{x}</li>)}</ul>
      </details>

      <nav className="communication-actions">
        <button type="button" onClick={onBack}>← 戻る</button>
        <span className="autosave-hint">変更は自動保存されます</span>
      </nav>
    </div>
  )
}
