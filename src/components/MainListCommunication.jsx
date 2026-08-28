import React,{useEffect,useRef,useState} from 'react'
import * as avatarStore from '../utils/avatarStore'
import * as friendLogic from '../utils/friendLogic'
import { FALLBACK_AVATAR } from '../utils/avatarFallback'

const REL_PRESETS=['中学','高校','大学','友達','恋人','元恋人','先輩','後輩','サークル','バイト','職場','上司','同僚','部下','家族','趣味仲間','SNS友達','近所','その他']

export default function MainListCommunication({people,onToggleDrawer,onDeleteMultiple,onStartCreate}){
  const [avatarMap,setAvatarMap]=useState({})
  const previousUrls=useRef({})
  const [query,setQuery]=useState('')
  const [sortBy,setSortBy]=useState('lastConversationDate_desc')
  const [relationFilter,setRelationFilter]=useState([])
  const [showFilters,setShowFilters]=useState(false)
  const [deleteMode,setDeleteMode]=useState(false)
  const [selected,setSelected]=useState(new Set())

  useEffect(()=>{
    let active=true
    Object.values(previousUrls.current).forEach(url=>{try{URL.revokeObjectURL(url)}catch(e){}})
    previousUrls.current={}
    ;(async()=>{
      const next={}
      await Promise.all((people||[]).map(async person=>{
        if(person?.avatar){next[person.id]=person.avatar;return}
        if(person?.avatarId){try{const url=await avatarStore.getAvatarURL(person.avatarId);if(url){next[person.id]=url;previousUrls.current[person.id]=url}}catch(e){}}
      }))
      if(active)setAvatarMap(next)
    })()
    return ()=>{active=false;Object.values(previousUrls.current).forEach(url=>{try{URL.revokeObjectURL(url)}catch(e){}})}
  },[people])

  useEffect(()=>{const handler=()=>{setDeleteMode(true);setSelected(new Set())};window.addEventListener('intimate:enterDeleteMode',handler);return()=>window.removeEventListener('intimate:enterDeleteMode',handler)},[])

  const relationOptions=Array.from(new Set([...REL_PRESETS,...(people||[]).flatMap(person=>person?.relationTags||[])]))
  const term=query.trim().toLowerCase()
  const filtered=(people||[]).filter(person=>{
    const searchable=[person.name,person.reading,person.nickname,...(person.relationTags||[]),...(person.groups||[])].filter(Boolean).join(' ').toLowerCase()
    if(term&&!searchable.includes(term))return false
    if(relationFilter.length){const tags=new Set(person.relationTags||[]);if(!relationFilter.every(tag=>tags.has(tag)))return false}
    return true
  })
  const sorted=[...filtered].sort((a,b)=>{
    if(sortBy==='lastConversationDate_desc')return friendLogic.getLastConversationDate(b).localeCompare(friendLogic.getLastConversationDate(a))
    if(sortBy==='lastConversationDate_asc')return friendLogic.getLastConversationDate(a).localeCompare(friendLogic.getLastConversationDate(b))
    if(sortBy==='friendScore_desc')return (friendLogic.getRelationshipStage(b)||0)-(friendLogic.getRelationshipStage(a)||0)
    if(sortBy==='friendScore_asc')return (friendLogic.getRelationshipStage(a)||0)-(friendLogic.getRelationshipStage(b)||0)
    return(a.name||'').localeCompare(b.name||'')
  })

  function toggleSelected(id){setSelected(previous=>{const next=new Set(previous);next.has(id)?next.delete(id):next.add(id);return next})}
  function deleteSelected(){if(!selected.size)return;if(!window.confirm(`${selected.size}件の人物を削除してもよろしいですか？`))return;onDeleteMultiple(selected);setSelected(new Set());setDeleteMode(false)}

  const hasPeople=(people||[]).length>0

  return <div className="main-list communication-list">
    <header className="list-hero"><div><p className="eyebrow">RELATIONSHIP GRADIENT</p><h1>関係性の現在地</h1><p>ハート1個＝1段階。相手から返ってきた反応を基準に進めます。</p></div><button className="menu-button" onClick={onToggleDrawer} aria-label="メニュー">☰</button></header>

    {!hasPeople&&<div className="first-run">
      <p className="eyebrow">RELATIONSHIP GRADIENT</p>
      <h2>最初の一人を登録しましょう</h2>
      <p>会った回数ではなく、相手から返ってきた反応で関係の「現在地」を記録するアプリです。まずは気になる人を一人追加してみてください。</p>
      <button type="button" onClick={()=>onStartCreate&&onStartCreate()}>＋ 人物を追加</button>
    </div>}

    {hasPeople&&<>
    <div className="list-controls"><input placeholder="名前・呼び名・関係性を検索" value={query} onChange={event=>setQuery(event.target.value)}/><select value={sortBy} onChange={event=>setSortBy(event.target.value)}><option value="lastConversationDate_desc">最近話した順</option><option value="lastConversationDate_asc">会話日が古い順</option><option value="friendScore_desc">段階が高い順</option><option value="friendScore_asc">段階が低い順</option><option value="name">名前順</option></select><button type="button" onClick={()=>setShowFilters(value=>!value)}>関係性で絞る</button></div>
    {showFilters&&<div className="chip-row relation-filters">{relationOptions.map(relation=><button type="button" key={relation} className={relationFilter.includes(relation)?'chip chip-on':'chip chip-off'} onClick={()=>setRelationFilter(previous=>previous.includes(relation)?previous.filter(item=>item!==relation):[...previous,relation])}>{relation}</button>)}</div>}
    {deleteMode&&<div className="delete-bar"><span>{selected.size}件選択</span><button onClick={deleteSelected}>削除</button><button onClick={()=>{setDeleteMode(false);setSelected(new Set())}}>キャンセル</button></div>}
    <ul className="people-list">{sorted.map(person=>{
      const profile=friendLogic.normalizeCommunication(person)
      const stage=profile.relationshipStage
      const definition=friendLogic.getStageDefinition(stage)
      const gate=friendLogic.getStageGateProgress(profile,stage)
      const lastDate=friendLogic.getLastConversationDate(person)
      return <li className="person-row communication-person-row" key={person.id} onClick={()=>{if(!deleteMode)window.location.hash=`#person:${person.id}`}}>
        {deleteMode&&<input type="checkbox" checked={selected.has(person.id)} onChange={()=>toggleSelected(person.id)} onClick={event=>event.stopPropagation()}/>}<img className="avatar" src={avatarMap[person.id]||FALLBACK_AVATAR} alt=""/>
        <div className="meta"><div className="person-title-line"><strong className="name">{person.name}</strong><span className={stage?'intimacy-badge':'intimacy-badge provisional'}>{stage?`Stage ${stage} · ${definition.title}`:'段階未設定'}</span></div>
          <div className="hearts compact-hearts" aria-label={stage?`第${stage}段階`:'段階未設定'}>{Array.from({length:10}).map((_,index)=><span key={index} className={stage&&index<stage?'heart filled':'heart'}>{stage&&index<stage?'❤️':'🖤'}</span>)}</div>
          <div className="communication-preview"><span>会話 {lastDate||'未記録'}</span>{stage&&<span>相互サイン {gate.checked}/{gate.total}</span>}{profile.iCallThem&&<span>「{profile.iCallThem}」と呼ぶ</span>}</div>
          {profile.recentTopics&&<p className="topic-preview">{profile.recentTopics}</p>}
        </div><span className="row-arrow">›</span>
      </li>})}</ul>{!sorted.length&&<p className="empty-state">条件に合う人がいません</p>}
    </>}
  </div>
}
