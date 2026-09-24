import React,{useEffect,useState} from 'react'
import * as avatarStore from '../utils/avatarStore'
import { FALLBACK_AVATAR } from '../utils/avatarFallback'
import { memory } from '../utils/yamada'
import { RelationshipSummary } from './YamadaStageGuide'

export default function MainListCommunication({people,self,onToggleDrawer,onDeleteMultiple,onStartCreate}){
  const [query,setQuery]=useState('')
  const [avatars,setAvatars]=useState({})
  const [deleteMode,setDeleteMode]=useState(false)
  const [selected,setSelected]=useState(new Set())
  useEffect(()=>{
    let active=true
    const urls=[]
    Promise.all(people.map(async p=>{
      if(p.avatar)return [p.id,p.avatar]
      if(!p.avatarId)return [p.id,'']
      try{const url=await avatarStore.getAvatarURL(p.avatarId);if(url){if(active)urls.push(url);else URL.revokeObjectURL(url)}return [p.id,url]}catch{return [p.id,'']}
    })).then(entries=>{if(active)setAvatars(Object.fromEntries(entries))})
    return ()=>{active=false;urls.forEach(url=>URL.revokeObjectURL(url))}
  },[people])
  useEffect(()=>{const handler=()=>{setDeleteMode(true);setSelected(new Set())};window.addEventListener('intimate:enterDeleteMode',handler);return()=>window.removeEventListener('intimate:enterDeleteMode',handler)},[])
  const term=query.trim().toLowerCase()
  const visible=people.filter(p=>[p.name,p.reading,p.nickname,...(p.relationTags||[])].filter(Boolean).join(' ').toLowerCase().includes(term))
  function toggle(id){setSelected(prev=>{const next=new Set(prev);next.has(id)?next.delete(id):next.add(id);return next})}
  function remove(){if(selected.size&&window.confirm(selected.size+'人の記録を削除します。必要なら先にエクスポートしてください。削除しますか？')){onDeleteMultiple(selected);setSelected(new Set());setDeleteMode(false)}}
  return <div className="y-page">
    <header className="y-home-header"><div><p className="y-eyebrow">HELLO, AS YOU ARE.</p><h1>人のノート</h1><p className="y-muted">うまく話すより、知りたいと思う気持ちから。</p></div><button onClick={onToggleDrawer} aria-label="メニュー">☰</button></header>
    <a href="#self" className="y-mode-link"><span className="y-sun-small" aria-hidden="true">☀</span><span><strong>山田モードで、いこう。</strong><small>会う前に、ひと言だけ。</small></span><span aria-hidden="true">↗</span></a>
    <section className="y-people-section"><div className="y-section-title"><h2>話したい人、覚えていたいこと</h2><button onClick={onStartCreate} aria-label="人物を追加">＋ 追加</button></div>
      {people.length>0&&<input className="y-search" aria-label="人を探す" type="search" placeholder="名前・呼び名で探す" value={query} onChange={e=>setQuery(e.target.value)}/>}
      {deleteMode&&<div className="y-actions"><span>{selected.size}人を選択</span><button disabled={!selected.size} onClick={remove}>選んだ人を削除</button><button onClick={()=>setDeleteMode(false)}>キャンセル</button></div>}
      {!people.length&&<div className="y-card y-empty"><h3>会話は、ノートの外で。</h3><p>ここには、忘れたくない人や出来事だけ。<br/>まずは一人、名前を残しておきませんか。</p><button className="y-primary" onClick={onStartCreate}>最初の一人を追加</button></div>}
      <ul className="y-people">{visible.map(p=><li key={p.id}>
        {deleteMode?<label className="y-person-link"><input type="checkbox" checked={selected.has(p.id)} onChange={()=>toggle(p.id)}/><span>{p.name||'名前未設定'}</span></label>:<a className="y-person-link" href={'#person:'+p.id}><img src={avatars[p.id]||FALLBACK_AVATAR} alt=""/><span><strong>{p.nickname||p.name||'名前未設定'}</strong><RelationshipSummary person={p} self={self}/><small>{memory(p)||'その人との話を、少しずつ。'}</small></span><span aria-hidden="true">›</span></a>}
      </li>)}</ul>
      {people.length>0&&!visible.length&&<p className="y-muted">その名前の人は見つかりませんでした。</p>}
    </section><p className="y-footer">ハートは二人の現在地の目安。会った回数では増えません。</p>
  </div>
}
