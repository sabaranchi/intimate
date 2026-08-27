const BASIC = 'basic'
const NOTES = 'notes'

export const STAGE_COLLECTION_GUIDE = {
  1: [
    {source:BASIC,key:'reading',label:'名前の読み方',prompt:'名前を自然に呼ぶために確認',ask:'「名前、どう読むんだっけ？」',placeholder:'読み方'},
    {source:BASIC,key:'nickname',label:'普段の呼ばれ方',prompt:'相手が心地よい呼び方を知る',ask:'「友達から何て呼ばれることが多い？」',placeholder:'呼ばれ方'},
    {source:BASIC,key:'workplace',label:'所属・共通の場',prompt:'次に会った時の話題の入口になる',ask:'「普段はどこにいることが多い？」',placeholder:'学校・会社・所属'}
  ],
  2: [
    {source:BASIC,key:'hobbies',label:'最近ハマっているもの',prompt:'次回の「前回の続き」を作る',ask:'「最近、何かハマってる？」',placeholder:'趣味・最近のブーム',type:'list'},
    {source:BASIC,key:'favourites',label:'好きな食べ物・作品',prompt:'答えやすく、共通点を探しやすい',ask:'「最近好きな店とか作品ある？」',placeholder:'好きなもの',type:'list'},
    {source:NOTES,key:'topics',label:'話しやすそうな話題',prompt:'会話が続いたテーマを覚える',ask:'相手が少し長く話した話題を残す',placeholder:'話題の好み'}
  ],
  3: [
    {source:NOTES,key:'personality',label:'考え方・性格の傾向',prompt:'軽い価値観の会話につなげる',ask:'「予定は決める派？ その場で決める派？」',placeholder:'性格・考え方'},
    {source:BASIC,key:'dislikes',label:'苦手なもの',prompt:'無理に踏み込まないために覚える',ask:'「逆に苦手なのってある？」',placeholder:'苦手・避けたいもの',type:'list'},
    {source:NOTES,key:'commonTopics',label:'二人の共通話題',prompt:'質問だけでなく自分の話も返せる',ask:'「それ自分も好き」につながった話題を残す',placeholder:'共通の話題'}
  ],
  4: [
    {source:NOTES,key:'topics',label:'個別に送れる話題',prompt:'対面の会話をオンラインへ自然に延長',ask:'「これ見て思い出した」が使えるテーマ',placeholder:'送れそうな話題'},
    {source:BASIC,key:'hobbies',label:'相手固有の興味',prompt:'「あなたに合いそう」を作る',ask:'相手らしさが出た趣味を覚える',placeholder:'趣味・興味',type:'list'},
    {source:NOTES,key:'commonTopics',label:'会話が往復したテーマ',prompt:'相互に話せる内容を優先する',ask:'相手からも質問が返った話題を残す',placeholder:'共通の話題'}
  ],
  5: [
    {source:NOTES,key:'wants',label:'行きたい場所・したいこと',prompt:'軽い「今度」の話へつなげる',ask:'「最近行ってみたいところある？」',placeholder:'行きたい場所・したいこと'},
    {source:BASIC,key:'favourites',label:'好きな店・食べ物',prompt:'短く断りやすい誘いの材料になる',ask:'「よく行く店ある？」',placeholder:'好きな店・食べ物',type:'list'},
    {source:BASIC,key:'hobbies',label:'一緒にできそうな趣味',prompt:'大げさでない共通体験を選ぶ',ask:'「それ、初心者でも楽しめる？」',placeholder:'一緒に楽しめそうなこと',type:'list'}
  ],
  6: [
    {source:NOTES,key:'wants',label:'今度一緒にできること',prompt:'会話の延長として1対1を具体化',ask:'「来週か再来週、どこか空いてる？」',placeholder:'次に行きたい場所・予定'},
    {source:BASIC,key:'dislikes',label:'避けたい場所・状況',prompt:'相手が断りやすく心地よい提案にする',ask:'人混み・時間帯・食べ物などの苦手を覚える',placeholder:'避けたいこと',type:'list'},
    {source:NOTES,key:'worries',label:'予定上の負担・気がかり',prompt:'誘いを圧力にしないために把握',ask:'忙しさや負担を相手が話した時だけ残す',placeholder:'予定の制約・気がかり'}
  ],
  7: [
    {source:NOTES,key:'commonTopics',label:'二人だけの思い出・共通体験',prompt:'一回を「続く関係」へ変える',ask:'二人で笑ったこと・印象に残ったこと',placeholder:'二人の思い出'},
    {source:NOTES,key:'personality',label:'新しく知った一面',prompt:'外見ではなく内面への肯定につなげる',ask:'「意外とこういうところがある」と感じた点',placeholder:'新しく知った一面'},
    {source:NOTES,key:'wants',label:'次に一緒にしたいこと',prompt:'相手側の提案を優先して残す',ask:'相手が「次は」と話した内容',placeholder:'次回の候補'}
  ],
  8: [
    {source:NOTES,key:'personality',label:'好き・尊敬できる内面',prompt:'軽い好意を具体的に伝える',ask:'考え方、優しさ、真面目さなど',placeholder:'肯定したい性格・考え方'},
    {source:NOTES,key:'worries',label:'安心して話してくれたこと',prompt:'自己開示を雑に扱わず覚えておく',ask:'相手が自分から話した悩みだけを残す',placeholder:'相談・悩み'},
    {source:NOTES,key:'commonTopics',label:'二人だから話せること',prompt:'特別感を言葉にできる材料になる',ask:'他の人とはあまり話さない共通テーマ',placeholder:'二人らしい話題'}
  ],
  9: [
    {source:NOTES,key:'wants',label:'これから一緒にしたいこと',prompt:'「会いたい」を具体的な未来にする',ask:'相手から出た次の予定や希望',placeholder:'二人の未来・予定'},
    {source:NOTES,key:'personality',label:'大事にしている価値観',prompt:'好意だけでなく相性も確かめる',ask:'仕事、友人、恋愛で大切にすること',placeholder:'価値観'},
    {source:NOTES,key:'worries',label:'距離を進める上での不安',prompt:'勢いで相手の事情を置き去りにしない',ask:'相手が自分から示した不安や迷い',placeholder:'不安・気がかり'}
  ],
  10: [
    {source:NOTES,key:'wants',label:'付き合った後に望む関係',prompt:'告白をゴールではなく始まりにする',ask:'「どんな関係が心地いい？」',placeholder:'望む関係・未来'},
    {source:NOTES,key:'personality',label:'好きになった具体的な理由',prompt:'告白を相手個人への言葉にする',ask:'一緒にいて感じた相手の魅力',placeholder:'好きなところ'},
    {source:NOTES,key:'worries',label:'尊重すべき事情・ペース',prompt:'返事を迫らず、相手の余白を守る',ask:'相手が話している生活上の事情',placeholder:'配慮したいこと'}
  ]
}

const MICRO_STEPS = {
  1:['次に会ったら、名前を入れて短く挨拶する','共通の場について一言だけ話す','相手からの挨拶や視線を待つ余白を作る'],
  2:['前回聞いたことを一つだけ続ける','答えやすい好みを聞き、自分の話も一つ返す','会話が自然に終われるところで切り上げる'],
  3:['軽い価値観を一つ聞く','小さな失敗談を自分から話す','相手の答えを覚えて次回につなげる'],
  4:['前の会話に関係するものを一つだけ送る','相手固有の興味に触れる','返信を要求せず、対面の続きを作る'],
  5:['「今度」を使った軽い未来の話を出す','行きたい場所を聞いて共通点を探す','反応が良ければ短い誘いに一段だけ進む'],
  6:['会話の延長で短時間の1対1を提案する','候補日を二つ出し、断れる言い方にする','会った後に短く「楽しかった」と伝える'],
  7:['前回の二人の思い出に触れる','相手から出た次回案を具体化する','内面について一つ肯定する'],
  8:['外見ではなく性格や考え方を褒める','「話しやすい」「一緒だと楽しい」を伝える','好意を出した後は相手の反応を待つ'],
  9:['一緒にいる時間への好意を一つ伝える','二人の次の予定を相手側からも提案するか見る','恋愛方向の話を一度だけ軽く出す'],
  10:['告白前の三条件を一つずつ確認する','落ち着いて話せる二人の時間を作る','好きな理由と「付き合いたい」を短く言葉にする']
}

function firstText(value){
  if(Array.isArray(value)) return value.find(Boolean) || ''
  if(typeof value !== 'string') return ''
  return value.split(/[、,\n]/).map(v=>v.trim()).find(Boolean) || ''
}

export function getKnownAnchor(person){
  const profile=person?.communication||{}
  const candidates=[person?.notes?.commonTopics,profile.recentTopics,person?.notes?.topics,person?.hobbies,person?.favourites]
  for(const candidate of candidates){const value=firstText(candidate);if(value)return value}
  return '前に話したこと'
}

export function getMicroSteps(person,stage){
  const anchor=getKnownAnchor(person)
  const steps=MICRO_STEPS[stage]||MICRO_STEPS[1]
  return steps.map((step,index)=>index===0&&stage>=2&&stage<=5?`${step}（「${anchor}」を入口に）`:step)
}

export function getCollectionGuide(stage){ return STAGE_COLLECTION_GUIDE[stage]||[] }

export function getCollectionValue(person,item){
  return item.source===NOTES ? person?.notes?.[item.key] : person?.[item.key]
}

export function isCollectionFilled(person,item){
  const value=getCollectionValue(person,item)
  return Array.isArray(value)?value.some(Boolean):Boolean(String(value||'').trim())
}

export function formatCollectionValue(value){ return Array.isArray(value)?value.join('、'):value||'' }

export function parseCollectionValue(value,item){
  if(item.type==='list') return value.split(/[、,\n]/).map(part=>part.trim()).filter(Boolean)
  return value
}

export function getOutcomeMessage(outcome){
  if(outcome==='returned') return {title:'半歩返ってきた',body:'相互サインを確認し、条件が揃えば次の一段へ進めます。',tone:'positive'}
  if(outcome==='neutral') return {title:'自然に成立した',body:'急いで強めず、同じ段階でもう一度だけ会話を重ねます。',tone:'neutral'}
  if(outcome==='thin') return {title:'反応は薄めだった',body:'好意や誘いを重ねず、一段小さい話題へ戻して余白を作ります。',tone:'pause'}
  return null
}
