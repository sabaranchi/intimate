// Small, self-directed exercises inspired by the character; not canonical rules.
export const PRACTICE_GROUPS = ['話しかけやすさ', '素直な興味', '裏表のなさ', '一緒に楽しむ']
export const PRACTICES = [
  {id:'welcome',group:0,title:'話しかけられたら、受け取る',action:'声をかけられたら、手元をいったん止めて「うん、どうした？」と反応する。',care:'無理な笑顔や目線は不要。今は難しければ「あとで聞いてもいい？」と伝える。',clear:'相手に聞く姿勢を見せるか、今は話せないことを言葉で伝えられた。'},
  {id:'hello',group:0,title:'自分から、あいさつを一つ',action:'話せそうなタイミングで、自分から「おはよう」「おつかれ」と声をかける。',care:'盛り上げなくていい。忙しそうなら、あいさつだけで終える。',clear:'返事の大きさに関係なく、自分から一度あいさつできた。'},
  {id:'listen',group:0,title:'話の終わりまで、聞いてみる',action:'相手が話している間は、すぐ自分の話や解決策に変えず、一区切りまで聞く。',care:'沈黙を埋めるために質問を重ねない。相づちだけでもいい。',clear:'一つの話を途中で奪わず、聞いてから反応できた。'},
  {id:'curious',group:1,title:'本当に気になったことを、一つ聞く',action:'相手の話の中で気になったところを「それ、どんなところが好き？」など、自分の言葉で聞く。',care:'情報収集のために質問しない。話したくなさそうなら深追いしない。',clear:'自分が知りたいと思ったことを一つ聞き、返事を受け取れた。'},
  {id:'different',group:1,title:'違う好みを、面白がる',action:'好みや考えが違ったら「そこが好きなんだ」と、違いをすぐ否定せずに受け取る。',care:'同意したふりは不要。「自分はこうだけど」と違いを残していい。',clear:'違いを否定したり、無理に合わせたりせずに返せた。'},
  {id:'remember',group:1,title:'前に聞いた話の続きを聞く',action:'覚えている話を一つだけ「この前の○○、どうだった？」と聞いてみる。',care:'覚えていることを試験にしない。忘れたときは普通に聞き直す。',clear:'相手が話してくれたことを、一つ会話に戻せた。'},
  {id:'honest',group:2,title:'小さな本音を、そのまま言う',action:'「それ好き」「知らなかった」「ちょっと緊張した」など、本当に思ったことを一つ伝える。',care:'素直さは、何でも言って傷つけることとは違う。相手への評価より自分の気持ちを。',clear:'よく見せるための答えではなく、自分の気持ちを一つ言えた。'},
  {id:'thanks',group:2,title:'うれしかったことを、言葉にする',action:'助かったことや楽しかったことがあれば「○○してくれて、うれしかった」と伝える。',care:'大げさなお世辞や、見返りを求める褒め方にしない。',clear:'本当にありがたかったこと・楽しかったことを一つ伝えられた。'},
  {id:'respect',group:2,title:'断りも違いも、普通に受け取る',action:'断られたり意見が違ったりしたら、一度受け止める。自分が難しいときも無理せず伝える。',care:'理由を問い詰めたり、不機嫌で返事を変えさせたりしない。自分も我慢し続けない。',clear:'相手の「難しい」を尊重できた、または自分の「難しい」を穏やかに言えた。'},
  {id:'share',group:3,title:'自分の小さな話も、混ぜる',action:'日常のちょっとした発見や失敗を「聞いてよ」と一つ話す。',care:'面白いオチも、自分を下げる演技もいらない。聞き役だけに固定しない。',clear:'相手への質問だけでなく、自分の日常も少し話せた。'},
  {id:'laugh',group:3,title:'笑わせるより、一緒に楽しむ',action:'自分も面白いと思った話に、笑ったり「それいいね」と乗ったりする。',care:'誰かの容姿・弱さ・秘密を笑いの材料にしない。真面目な話になったら茶化さない。',clear:'誰かを下げずに、自分も楽しむ反応が一つできた。'},
  {id:'repair',group:3,title:'ずれたら、言い直せる人になる',action:'言いすぎや勘違いに気づいたら「ごめん、今の言い方よくなかった」と短く言い直す。',care:'「冗談なのに」で押し切らない。練習のために失敗を作る必要もない。',clear:'実際にずれた場面で、言い訳より先に謝る・聞き直すことができた。'}
]
const known = id => PRACTICES.some(item=>item.id===id)
export function practiceState(self){
  const raw=self?.yamadaPractice
  const entries=raw?.entries&&typeof raw.entries==='object'&&!Array.isArray(raw.entries)?raw.entries:{}
  const activeId=known(raw?.activeId)?raw.activeId:null
  return {entries,activeId}
}
export function completedPractices(self){
  const {entries}=practiceState(self)
  return PRACTICES.filter(item=>entries[item.id]?.completed===true)
}
export function activePractice(self){
  const {activeId}=practiceState(self)
  return PRACTICES.find(item=>item.id===activeId)||null
}
export function nextPractice(self){
  const {entries}=practiceState(self)
  return PRACTICES.find(item=>entries[item.id]?.completed!==true)||null
}
export function choosePractice(self,id){
  if(id!==null&&!known(id))return self
  return {...self,yamadaPractice:{...self.yamadaPractice,activeId:id}}
}
export function completePractice(self,id,note,date){
  if(!known(id))return self
  const {entries}=practiceState(self)
  return {...self,yamadaPractice:{...self.yamadaPractice,activeId:id,entries:{...entries,[id]:{...entries[id],completed:true,note:typeof note==='string'?note.trim():'',date}}}}
}
export function reopenPractice(self,id){
  if(!known(id))return self
  const {entries}=practiceState(self)
  return {...self,yamadaPractice:{...self.yamadaPractice,activeId:id,entries:{...entries,[id]:{...entries[id],completed:false}}}}
}
