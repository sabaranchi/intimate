import React,{useRef,useState} from 'react'
import {today} from '../utils/yamada'
import {PRACTICES,PRACTICE_GROUPS,practiceState,activePractice,nextPractice,completedPractices,choosePractice,completePractice,reopenPractice} from '../utils/yamadaPractice'

export function PracticeReminder({self}){
  const item=activePractice(self),{entries}=practiceState(self)
  if(!item||entries[item.id]?.completed)return null
  return <details className="y-card y-practice-reminder"><summary>今日の自分：{item.title}</summary><p>{item.action}</p><p className="y-muted">気をつけること：{item.care}</p><a href="#self">話したあとに、自分の練習を振り返る →</a></details>
}
function PracticeCard({item,entry,onSave}){
  const [note,setNote]=useState(entry?.note||'')
  const [notice,setNotice]=useState('')
  return <div className="y-practice-current">
    <p className="y-eyebrow">今は、この一つだけ · {PRACTICE_GROUPS[item.group]}</p>
    <h3>{item.title}</h3>
    <p className="y-practice-action">{item.action}</p>
    <p className="y-muted"><strong>気をつけること</strong><br/>{item.care}</p>
    <div className="y-practice-criterion"><span>これができたら、クリア</span><p>{item.clear}</p></div>
    <label>できた場面・気づき（任意）<textarea rows="2" maxLength={500} value={note} onChange={e=>setNote(e.target.value)} placeholder="例：返事は短かったけど、自分からあいさつできた。"/></label>
    <div className="y-actions"><button className="y-primary" onClick={()=>{onSave(prev=>completePractice(prev,item.id,note,today()));setNotice('できた経験を残しました。')}}>{entry?.completed?'気づきを更新する':'できた · クリアする'}</button><button className="y-text-button" onClick={()=>onSave(prev=>choosePractice(prev,null))}>今日はお休み</button></div>
    <p className="y-muted" role="status">{notice||'機会がなかった・難しかった日は、そのままで大丈夫。減点も期限もありません。'}</p>
  </div>
}
export default function YamadaPractice({self,onSave}){
  const section=useRef(null)
  function selectFromList(event){
    const list=event.target.closest('button')?.closest('.y-practice > details')
    if(list){
      list.open=false
      section.current?.scrollIntoView({block:'start'})
      section.current?.querySelector('h1')?.focus({preventScroll:true})
    }
  }
  const {entries}=practiceState(self),active=activePractice(self),next=nextPractice(self),done=completedPractices(self)
  const justDone=active&&entries[active.id]?.completed
  return <section ref={section} onClick={selectFromList} className="y-card y-practice" aria-label="山田に近づく小さな練習">
    <p className="y-eyebrow">山田のよさを、自分の習慣に。</p><h1 tabIndex={-1}>話しやすい自分を、ひとつずつ。</h1>
    <p className="y-muted">明るいキャラを演じるより、関わりやすくなる行動を。相手の反応ではなく、自分ができたことでクリアします。</p>
    <div className="y-practice-progress"><span>{done.length} / {PRACTICES.length} クリア</span><progress aria-label="練習のクリア数" value={done.length} max={PRACTICES.length}/></div>
    {justDone?<div className="y-practice-success" role="status"><h3>「{active.title}」をクリア。</h3><p>一度できた経験ができました。毎回完璧でなくて大丈夫。</p>{next?<button className="y-primary" onClick={()=>onSave(prev=>choosePractice(prev,next.id))}>次の一つへ：{next.title}</button>:<p>12個の行動を試せました。これで人間関係が完成するわけではありません。必要な項目を選んで、何度でも練習できます。</p>}</div>:active?<PracticeCard key={active.id} item={active} entry={entries[active.id]} onSave={onSave}/>:<div className="y-practice-start"><p>{next?'まずは一つ、試してみよう。順番は自由です。':'一通りクリアしました。もう一度練習したい項目を選べます。'}</p>{next&&<button className="y-primary" onClick={()=>onSave(prev=>choosePractice(prev,next.id))}>この一つを始める：{next.title}</button>}</div>}
    <details><summary>取り組むことを選ぶ・できたことを見る</summary><p className="y-muted">クリアは「一度やってみた」の印。性格の採点ではなく、ハート・関係の10段階とも連動しません。場面がなければ別の項目へ。</p>{PRACTICE_GROUPS.map((group,i)=><div key={group} className="y-practice-group"><h3>{group}</h3>{PRACTICES.filter(item=>item.group===i).map(item=>{const entry=entries[item.id],complete=entry?.completed===true;return <details key={item.id} className="y-practice-item"><summary>{complete?'✓':'○'} {item.title}{active?.id===item.id&&!complete?' · 取り組み中':''}</summary><p>{item.action}</p><p className="y-muted">気をつけること：{item.care}</p><p className="y-muted">クリアの目安：{item.clear}</p>{complete&&<p className="y-muted">クリアした日：{entry.date||'記録なし'}</p>}{entry?.note&&<p className="y-memory">{entry.note}</p>}<button onClick={()=>onSave(prev=>complete?reopenPractice(prev,item.id):choosePractice(prev,item.id))}>{complete?'もう一度練習する（メモは残す）':'この一つに取り組む'}</button>{complete&&<p className="y-muted">選ぶと未クリアに戻ります。間違えてクリアした場合もここから戻せます。</p>}</details>})}</div>)}</details>
    <p className="y-muted y-practice-footnote">山田の素直さや気軽さをヒントにした、アプリ独自の練習です。原作の課題や台詞ではありません。</p>
  </section>
}
