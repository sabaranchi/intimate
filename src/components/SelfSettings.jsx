import React, { useEffect, useRef, useState } from 'react'
import * as friendLogic from '../utils/friendLogic'

const GENDERS = [['男', '男'], ['女', '女'], ['その他', 'other'], ['未設定', '']]
const DISCLOSURE = ['用件だけ', '事実は話す', '感情も話す', '弱さも見せられる']
const LISTEN_TALK = ['聞き役', 'バランス', '話し役']

export function createEmptySelf(){
  return {
    name: '', gender: '', personalityType: '',
    strengths: '', weaknesses: '',
    likes: '', dislikes: '', values: '',
    selfDisclosure: '', listenTalk: 'バランス',
    notes: '', updatedAt: ''
  }
}

export default function SelfSettings({ self, onSave, onBack }){
  const [local, setLocal] = useState(()=> ({ ...createEmptySelf(), ...(self || {}) }))
  const latest = useRef(local)
  const timer = useRef(null)

  useEffect(()=>{ setLocal({ ...createEmptySelf(), ...(self || {}) }) }, [])
  useEffect(()=>{ latest.current = local }, [local])
  useEffect(()=>{
    if(timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(()=> onSave({ ...local, updatedAt: new Date().toISOString() }), 450)
    return ()=>{ if(timer.current) clearTimeout(timer.current) }
  }, [local])
  useEffect(()=> ()=>{ onSave({ ...latest.current, updatedAt: new Date().toISOString() }) }, [])

  function set(key, value){ setLocal(prev => ({ ...prev, [key]: value })) }

  const typeDef = friendLogic.getPersonalityType(local.personalityType)

  return (
    <div className="person-page communication-page self-page">
      <header className="communication-header">
        <div className="stage-header-copy">
          <p className="eyebrow">YOUR PROFILE</p>
          <h2>自分の設定</h2>
          <div className="score-line"><span><small>ここの設定が、相手ごとのトラック判定と「自分の傾向」ヒントに使われます。</small></span></div>
        </div>
      </header>

      <section className="communication-card">
        <div className="section-heading"><p className="eyebrow">BASICS</p><h3>基本</h3></div>
        <label>名前（呼ばれ方）<input value={local.name} onChange={e=> set('name', e.target.value)} placeholder="ニックネームでもOK" /></label>
        <div className="field-label">性別（同性→友情 / 異性→ロマンス の自動判定に使用）</div>
        <div className="chip-row">
          {GENDERS.map(([label, value]) => (
            <button type="button" key={label} className={local.gender === value ? 'chip chip-on' : 'chip chip-off'} onClick={()=> set('gender', value)}>{label}</button>
          ))}
        </div>
      </section>

      <section className="communication-card">
        <div className="section-heading"><p className="eyebrow">YOUR TYPE</p><h3>自分のタイプ（自己診断）</h3></div>
        <div className="type-picker">
          {friendLogic.PERSONALITY_TYPES.map(t => (
            <button type="button" key={t.id} className={local.personalityType === t.id ? 'type-chip selected' : 'type-chip'} onClick={()=> set('personalityType', local.personalityType === t.id ? '' : t.id)}>
              <strong>{t.label}</strong><span>{t.impression}</span>
            </button>
          ))}
        </div>
        {typeDef && <p className="type-note">{typeDef.tendency}</p>}
      </section>

      <section className="communication-card">
        <div className="section-heading"><p className="eyebrow">IN CONVERSATION</p><h3>会話での自分</h3></div>
        <div className="field-label">聞き役 ↔ 話し役</div>
        <div className="chip-row">
          {LISTEN_TALK.map(v => (
            <button type="button" key={v} className={local.listenTalk === v ? 'chip chip-on' : 'chip chip-off'} onClick={()=> set('listenTalk', v)}>{v}</button>
          ))}
        </div>
        <div className="field-label">自己開示の傾向</div>
        <div className="chip-row">
          {DISCLOSURE.map(v => (
            <button type="button" key={v} className={local.selfDisclosure === v ? 'chip chip-on' : 'chip chip-off'} onClick={()=> set('selfDisclosure', local.selfDisclosure === v ? '' : v)}>{v}</button>
          ))}
        </div>
        <label>会話で出しやすいこと<textarea rows="2" value={local.strengths} onChange={e=> set('strengths', e.target.value)} placeholder="ボケ・ツッコミ・共感・質問・自分語り など" /></label>
        <label>会話で苦手なこと<textarea rows="2" value={local.weaknesses} onChange={e=> set('weaknesses', e.target.value)} placeholder="沈黙が気まずい・誘うのが苦手・弱音を見せられない など" /></label>
      </section>

      <section className="communication-card">
        <div className="section-heading"><p className="eyebrow">YOU</p><h3>好き・苦手・価値観</h3></div>
        <label>好きなこと・趣味<textarea rows="2" value={local.likes} onChange={e=> set('likes', e.target.value)} placeholder="話の弾になるもの" /></label>
        <label>苦手なこと・避けたいこと<textarea rows="2" value={local.dislikes} onChange={e=> set('dislikes', e.target.value)} /></label>
        <label>大事にしている価値観<textarea rows="2" value={local.values} onChange={e=> set('values', e.target.value)} placeholder="友人関係・恋愛で譲れないこと" /></label>
        <label>メモ<textarea rows="2" value={local.notes} onChange={e=> set('notes', e.target.value)} /></label>
      </section>

      <nav className="communication-actions">
        <button type="button" onClick={onBack}>← 戻る</button>
        <span className="autosave-hint">変更は自動保存されます</span>
      </nav>
    </div>
  )
}
