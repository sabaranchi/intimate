import React from 'react'
import {normalizeGender} from '../utils/yamadaStages'
export function createEmptySelf(){return {name:'',gender:'',notes:'',updatedAt:''}}
export default function SelfSettings({self,onSave}){
  const set=(key,value)=>onSave(prev=>({...prev,[key]:value,updatedAt:new Date().toISOString()}))
  return <div className="y-profile">
    <label>呼ばれたい名前<input value={self.name||''} onChange={e=>set('name',e.target.value)}/></label>
    <label>自分の性別（モードの自動切替）<select value={{male:'男',female:'女'}[normalizeGender(self.gender)]||(self.gender?'other':'')} onChange={e=>set('gender',e.target.value)}><option value="">未設定</option><option value="男">男</option><option value="女">女</option><option value="other">その他</option></select></label>
    <p className="y-muted">相手と同性なら「友達」、異性なら「気になる人」。未設定・その他の場合は、相手のページで選べます。</p>
    <label>自分に残したいひと言<textarea rows="3" value={self.notes||''} onChange={e=>set('notes',e.target.value)} placeholder="書かなくても大丈夫"/></label>
    <p className="y-muted">以前のプロフィールや練習記録は削除せず、エクスポートに含めています。</p>
  </div>
}
