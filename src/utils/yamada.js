// Preserve legacy records; this mode never calculates relationship scores.
export const YAMADA_SOURCE = 'https://sh-anime.shochiku.co.jp/seihantai_anime/character/%E5%B1%B1%E7%94%B0'
export const MODES = [
  {id:'everyday',label:'ふだん',title:'気になる。それだけで、話しかけていい。',voice:'この人、どんなことが好きなんだろう。おもしろそう。ちょっと聞いてみよう。',note:'言い方は自分のままで。明るく演じ続けなくてもいい。'},
  {id:'friends',label:'友達と',title:'くだらない話も、一緒ならおもしろい。',voice:'ちょっと聞いてよ、って自分の話も混ぜてみよう。ツッコまれたら、それも一緒に笑えばいい。',note:'笑わせる役を背負わなくていい。自分も楽しむ側で。'},
  {id:'someone',label:'気になる人と',title:'一緒に笑えるの、うれしい。',voice:'この人の話、もっと聞きたい。また話したい。その気持ちは、隠さなくていい。',note:'返事は相手のペースで。盛り上げ続けなくていい。'}
]
export function today(){
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
export function conversations(person){
  const log = person?.communication?.conversationLog
  return Array.isArray(log) ? log.filter(x=>x && typeof x==='object').slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))) : []
}
export function memory(person){
  return person?.yamada?.remember || conversations(person)[0]?.topics || person?.lastConversationSummary || person?.communication?.lastConversationNote || person?.communication?.recentTopics || person?.notes?.commonTopics || ''
}
export function addMemory(person, text, date=today(), id=crypto.randomUUID()){
  if(!text.trim()) return person
  const log=[{id,date,topics:text.trim()},...conversations(person)].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')))
  return {...person, communication:{...person.communication, conversationLog:log},lastConversationSummary:log[0].topics||person.lastConversationSummary||'',lastInteractionDate:[date,person.lastInteractionDate||''].sort().pop()}
}
