import React,{useEffect,useRef,useState} from 'react'
import PersonPage from './PersonPage'
import * as avatarStore from '../utils/avatarStore'
import { FALLBACK_AVATAR } from '../utils/avatarFallback'
import { addMemory, conversations, memory, today, MODES } from '../utils/yamada'

const TABS=[['together','この人と'],['basic','基本情報'],['events','思い出'],['notes','メモ']]
export default function CommunicationPersonPage({person,self,onSave,onBack}){
  const [tab,setTab]=useState('together')
  const [local,setLocal]=useState(person)
  const latest=useRef(person)
  const [avatar,setAvatar]=useState('')
  const [draft,setDraft]=useState('')
  const [date,setDate]=useState(today)
  const [notice,setNotice]=useState('')
  const [editing,setEditing]=useState(null)
  const draftInput=useRef(null)
  const mode=MODES.find(x=>x.id===self?.yamadaMode)||MODES[0]
  useEffect(()=>{
    let active=true,url=''
    if(local.avatar){setAvatar(local.avatar);return}
    setAvatar('')
    if(local.avatarId)avatarStore.getAvatarURL(local.avatarId).then(value=>{url=value||'';if(active)setAvatar(url);else if(url)URL.revokeObjectURL(url)}).catch(()=>{})
    return()=>{active=false;if(url)URL.revokeObjectURL(url)}
  },[local.avatar,local.avatarId])
  function update(patch){const next={...latest.current,...patch};latest.current=next;setLocal(next);onSave(next)}
  function remember(){
    if(!draft.trim())return
    if(editing){update({communication:{...local.communication,conversationLog:conversations(local).map(x=>x.id===editing?{...x,topics:draft.trim(),date}:x)}})}
    else update(addMemory(latest.current,draft,date))
    setDraft('');setEditing(null);setDate(today());setNotice('思い出に残しました。')
  }
  const log=conversations(local)
  function beginEdit(item){setEditing(item.id);setDraft(item.topics||'');setDate(item.date||today());setNotice('');requestAnimationFrame(()=>draftInput.current?.focus())}
  return <div className="y-page y-person-page">
    <header className="y-top"><button onClick={onBack}>← 人のノート</button><a href="#self">山田モード ↗</a></header>
    <div className="y-person-heading"><img src={avatar||FALLBACK_AVATAR} alt=""/><div><p className="y-eyebrow">ONE PERSON, NOT A LEVEL.</p><h1>{local.name||'名前未設定'}</h1>{local.nickname&&<p className="y-muted">{local.nickname}</p>}</div></div>
    <nav className="y-tabs" aria-label="人物のページ">{TABS.map(([key,label])=><button key={key} aria-current={tab===key?'page':undefined} onClick={()=>{setTab(key);setNotice('')}}>{label}</button>)}</nav>
    {tab==='together'?<>
      <section className="y-card y-person-cue"><p className="y-eyebrow">山田モード · {mode.label}</p><h2>{mode.title}</h2><p>{mode.voice}</p></section>
      <section className="y-card"><h2>覚えておきたいこと</h2>{memory(local)?<p className="y-memory">{memory(local)}</p>:<p className="y-muted">まだ空白でも大丈夫。相手が話してくれたことを、あとで少しだけ。</p>}
        <details><summary>ここに置いておくことを変える</summary><label>覚えておきたいひと言<textarea rows="2" value={local.yamada?.remember||''} onChange={e=>update({yamada:{...local.yamada,remember:e.target.value}})} placeholder="約束や、前に話してくれたこと"/></label><p className="y-muted">空欄にすると、最近の会話を表示します。</p></details>
      </section>
      <section className="y-card"><h2>{editing?'思い出を書き直す':'話したあとに、ひと言だけ。'}</h2><label>残しておきたいこと<textarea ref={draftInput} value={draft} rows="3" onChange={e=>{setDraft(e.target.value);setNotice('')}} placeholder="あの話で一緒に笑った。おすすめしてくれた映画が気になる。"/></label><details><summary>日付を変える</summary><label>話した日<input type="date" value={date} onChange={e=>setDate(e.target.value||today())}/></label></details><div className="y-actions"><button className="y-primary" disabled={!draft.trim()} onClick={remember}>{editing?'更新する':'思い出に残す'}</button>{editing&&<button onClick={()=>{setEditing(null);setDraft('');setDate(today())}}>キャンセル</button>}</div><p className="y-muted" role="status">{notice||'記録は任意。楽しかったままで終わっても大丈夫。'}</p>
      </section>
      {log.length>0&&<details className="y-card"><summary>これまでの会話</summary>{log.map((item,i)=><article className="y-log" key={item.id||i}><small>{item.date||'日付なし'}</small><p>{item.topics}</p>{item.theirResponse&&<p className="y-muted">相手のことば：{item.theirResponse}</p>}{item.appreciated&&<p className="y-muted">{item.appreciated}</p>}{item.wantToAsk&&<p className="y-muted">気になったこと：{item.wantToAsk}</p>}{item.id&&<button onClick={()=>beginEdit(item)}>書き直す</button>}</article>)}</details>}
    </>:<PersonPage key={local.id} embedded person={local} tab={tab} onChange={update}/>}
  </div>
}
