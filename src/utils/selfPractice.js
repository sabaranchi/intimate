export const OS_QUESTIONS = [
  ['want','この人は何を望んでいる？','本人が話したことと、自分の仮説を分ける。'],
  ['concern','この人は何を心配している？','避けたい負担・困り事を確かめる。'],
  ['authority','この場で決められる人は誰？','話す人・相談される人・決める人を見分ける。'],
  ['give','自分は何を渡せる？','情報、手伝い、紹介、時間から一つ。'],
  ['position','自分をどう覚えてもらいたい？','肩書きより、どんな行動で示すか。'],
  ['pace','今は提案する？ 聞く？ 待つ？','相手の忙しさと反応を見て決める。'],
  ['future','半年後、どんな関係でいたい？','そのために今日残したい信用は何か。']
]
export const PRINCIPLES = [
  {id:'observe',title:'目立つ前に、場を見る',text:'相手の事情・困り事・決定者を観察する。人気と権限を取り違えない。'},
  {id:'ego',title:'拒否と自分の価値を切り離す',text:'断られたら受け止める。感情に飲まれず、条件と次の行動を考える。'},
  {id:'help',title:'小さな困り事を一つ減らす',text:'相手の面子を守って助ける。してあげたことを、見返りの請求にしない。'},
  {id:'lead',title:'提案は具体的に、責任は自分で',text:'日時・場所・役割・期限を言葉にする。得意な人に任せ、結果の責任を引き受ける。'},
  {id:'voice',title:'短く話し、言った後に待つ',text:'語尾まで伝える。知らないことは聞く。相手が話せる間を残す。'},
  {id:'trust',title:'約束と長い信用を守る',text:'できない約束はしない。嘘で期待を作らず、終わる時にも丁寧に伝える。'},
  {id:'independent',title:'自分の生活を育てる',text:'仕事、友人、趣味、身だしなみ、休息。恋愛だけで一日を埋めない。'},
  {id:'learn',title:'良かった一つ、次に変える一つ',text:'失敗を人格の評価にせず、観察した事実と次の打ち手を残す。'}
]
export const SCORE_AXES = ['コミュ力','胆力','人脈','交渉','商売','リーダーシップ','見た目','恋愛','メンタル']
export const ROUTINES = ['無理のない運動','身だしなみ','5分読む・学ぶ','睡眠と休息']
export function localDay(date = new Date()){
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}
const object = value => value && typeof value==='object' && !Array.isArray(value) ? value : {}
export function normalizePractice(value){
  const p=object(value)
  return {...p,version:1,identity:typeof p.identity==='string'?p.identity:'行動が早い・面白い・約束を守る',reminder:typeof p.reminder==='string'?p.reminder:'',day:Number.isInteger(p.day)&&p.day>=1&&p.day<=365?p.day:1,pins:Array.isArray(p.pins)?p.pins.filter(v=>typeof v==='string'):[],daily:object(p.daily),preparations:object(p.preparations),training:object(p.training),monthly:object(p.monthly)}
}
export function personContext(person){
  if(!person)return []
  const format=v=>Array.isArray(v)?v.join('、'):typeof v==='string'?v:''
  const log=Array.isArray(person.communication?.conversationLog)?person.communication.conversationLog.filter(x=>x&&typeof x==='object').slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))):[]
  return [['所属',person.workplace||person.school],['好き・趣味',[format(person.favourites),format(person.hobbies)].filter(Boolean).join('／')],['最近の話',log[0]?.topics||person.communication?.lastConversationNote||person.communication?.recentTopics||person.lastConversationSummary],['次に聞きたいこと',log.find(x=>x.wantToAsk)?.wantToAsk],['共通の話題',person.notes?.commonTopics],['したいこと',person.notes?.wants],['気にかけたいこと',person.notes?.worries]].filter(([,value])=>typeof value==='string'&&value.trim())
}
