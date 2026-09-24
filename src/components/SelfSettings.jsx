import React from 'react'
export function createEmptySelf(){return {name:'',notes:'',updatedAt:''}}
export default function SelfSettings({self,onSave}){
  const set=(key,value)=>onSave(prev=>({...prev,[key]:value,updatedAt:new Date().toISOString()}))
  return <div className="y-profile">
    <label>呼ばれたい名前<input value={self.name||''} onChange={e=>set('name',e.target.value)}/></label>
    <label>自分に残したいひと言<textarea rows="3" value={self.notes||''} onChange={e=>set('notes',e.target.value)} placeholder="書かなくても大丈夫"/></label>
    <p className="y-muted">以前のプロフィールや練習記録は削除せず、エクスポートに含めています。</p>
  </div>
}
