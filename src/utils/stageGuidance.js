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
  8:['外見ではなく性格・考え方・一緒にいる感覚を一つ褒めて、受け取り方を見る','「話してて楽」「一緒だと楽しい」を一度だけ伝える','次の予定をこちらから一つ具体的に出して、乗ってくるか見る'],
  9:['一緒にいる時間そのものへの好意を一度だけ言葉にする','恋愛方向の話（付き合ったらどんな感じか等）を一度だけ軽く出し、乗ってくるか見る','歩く時など、相手が取れる位置で手を一度だけ差し出す。取らなければそのまま歩く（繰り返さない）'],
  10:['告白前の三条件（何度も自然に会えている・相手も関係を続けようとしている・好意を拒まれていない）を一つずつ確認する','二人で落ち着いて話せる時間を作る','好きな気持ちと「付き合いたい」を短く言葉で伝える']
}

const FRIEND_MICRO_STEPS = {
  1:['次に会ったら、名前を入れて短く挨拶する','共通の場について一言だけ話す','相手からの挨拶や反応を待つ余白を作る'],
  2:['前回聞いたことを一つだけ続ける','答えやすい好みを聞き、自分の話も一つ返す','会話が自然に終われるところで切り上げる'],
  3:['軽い価値観を一つ聞く','自分の失敗談を先に話す','相手の答えを覚えて次回につなげる'],
  4:['前の会話に関係するものを一つだけ送る','相手固有の興味に触れる','返信を要求せず、対面の続きを作る'],
  5:['グループの予定に「一緒にやろう」と乗せる','相手のハマりを聞いて共通点を探す','「今度みんなで」を具体的な候補まで進める'],
  6:['会話の延長で短時間の二人遊びを提案する','候補日を二つ出し、断れる言い方にする','会った後に短く「楽しかった、また行こう」と伝える'],
  7:['前回の二人の思い出に触れる','相手から出た次回案を具体化する','新しく知った一面を一つ肯定する'],
  8:['自分の失敗や苦手を具体的に一つ話して、相手も何か返してくるか見る','相手が話した相談を茶化さず受け取り、後日その続きを自分から振る','助言より先に「大変だったな」と受け止める'],
  9:['以前の話の続きを覚えて自分から振り、相手も回収するか見る','内輪ネタを一度出して、相手も乗ってくるか見る（乗らなければ使わない）','考え方の違いを面白がって一つ掘る'],
  10:['用がなくても近況を一度送って、返し方を見る','会えない時期があっても関係は変わらないと一度伝える','いてくれることへの感謝を具体的な場面で一度言葉にする']
}

const FRIEND_COLLECTION_GUIDE = {
  1: STAGE_COLLECTION_GUIDE[1],
  2: STAGE_COLLECTION_GUIDE[2],
  3: STAGE_COLLECTION_GUIDE[3],
  4: STAGE_COLLECTION_GUIDE[4],
  5: [
    {source:BASIC,key:'hobbies',label:'一緒にできそうな趣味',prompt:'グループ内で一緒に動くきっかけになる',ask:'「それ、みんなでやったら楽しそう」',placeholder:'一緒に楽しめそうなこと',type:'list'},
    {source:NOTES,key:'wants',label:'行きたい場所・やりたいこと',prompt:'「今度みんなで」を具体化する材料',ask:'「最近行ってみたいところある？」',placeholder:'行きたい場所・やりたいこと'},
    {source:NOTES,key:'topics',label:'グループで盛り上がった話題',prompt:'次に会った時の入口になる',ask:'その場で一番ウケた・伸びた話を残す',placeholder:'盛り上がった話題'}
  ],
  6: [
    {source:NOTES,key:'wants',label:'二人で行きたい場所',prompt:'短く断りやすい二人遊びの提案に使う',ask:'「来週か再来週、どこか空いてる？」',placeholder:'次に行きたい場所'},
    {source:BASIC,key:'dislikes',label:'避けたい場所・状況',prompt:'相手が断りやすく心地よい提案にする',ask:'人混み・時間帯・食べ物などの苦手を覚える',placeholder:'避けたいこと',type:'list'},
    {source:NOTES,key:'worries',label:'予定上の負担・気がかり',prompt:'誘いを圧力にしないために把握',ask:'忙しさや負担を相手が話した時だけ残す',placeholder:'予定の制約・気がかり'}
  ],
  7: [
    {source:NOTES,key:'commonTopics',label:'二人だけの思い出・共通体験',prompt:'一回を「続く関係」に変える',ask:'二人で笑ったこと・印象に残ったこと',placeholder:'二人の思い出'},
    {source:NOTES,key:'personality',label:'新しく知った一面',prompt:'内面への肯定につなげる',ask:'「意外とこういうところがある」と感じた点',placeholder:'新しく知った一面'},
    {source:NOTES,key:'wants',label:'次に一緒にしたいこと',prompt:'相手側の提案を優先して残す',ask:'相手が「次は」と話した内容',placeholder:'次回の候補'}
  ],
  8: [
    {source:NOTES,key:'worries',label:'安心して話してくれた悩み',prompt:'自己開示を雑に扱わず覚えておく',ask:'相手が自分から話した悩みだけを残す',placeholder:'相談・悩み'},
    {source:NOTES,key:'personality',label:'尊敬・いいと思う部分',prompt:'茶化さず伝えられる材料になる',ask:'考え方、頑張り、優しさなど',placeholder:'いいと思うところ'},
    {source:BASIC,key:'dislikes',label:'苦手・コンプレックスへの配慮',prompt:'触れない方がよい話題を覚える',ask:'相手が嫌がった・避けた話題',placeholder:'触れない方がよいこと',type:'list'}
  ],
  9: [
    {source:NOTES,key:'commonTopics',label:'二人の内輪ネタ・呼び方',prompt:'二人の文脈を言葉にできる',ask:'定着したあだ名・ネタ',placeholder:'内輪ネタ・呼び方'},
    {source:NOTES,key:'personality',label:'一致する価値観と違い',prompt:'共通点だけでなく違いも面白がる',ask:'考え方が合った点・違った点',placeholder:'価値観の一致・違い'},
    {source:NOTES,key:'topics',label:'過去に話した内容の続き',prompt:'覚えていることを示せる',ask:'前回途中だった話題',placeholder:'続きを聞きたい話'}
  ],
  10: [
    {source:NOTES,key:'wants',label:'これからも続けたい関わり方',prompt:'頻度が落ちても続く形を探す',ask:'「この先どんな感じで会いたい？」',placeholder:'これからの関わり方'},
    {source:NOTES,key:'worries',label:'相手の生活の変化・繁忙期',prompt:'距離が空く時期を責めないため',ask:'相手が話した予定・環境の変化',placeholder:'生活の変化'},
    {source:NOTES,key:'commonTopics',label:'感謝を伝えたい具体的な場面',prompt:'「いてくれて助かった」を言葉にする',ask:'実際に助けられた・楽しかった場面',placeholder:'感謝したい場面'}
  ]
}

const WORK_MICRO_STEPS = {
  1:['名刺交換の時、相手の話した内容を一つ覚えてお礼メッセージに添える','次に会える場所や機会を一つ聞いておく','自己紹介は簡潔にし、相手の話を多く聞く'],
  2:['前回の話を一つ覚えて、次に会った時に振る','相手の名前を会話の中で一度呼ぶ','イベントや勉強会の情報を一つ共有する'],
  3:['仕事以外の話題を一つ振ってみる','自分の失敗談を一つ話す','相手が広げた雑談にもう一往復付き合う'],
  4:['相手の強みや視点を一つ具体的に褒める','用がなくても役立ちそうな情報を一つ送る','小さな相談を一つ持ちかけてみる'],
  5:['有益な情報を一つ渡す。見返りを求めない','1対1で話せる短い時間を提案する','相手の近況を具体的に聞く'],
  6:['初回の1対1は短めに切り上げる','会話の最後に「また」を明確に伝える','相手の課題や悩みを一つ聞く'],
  7:['小さな頼み事を一つしてみる','頼んだ結果と感謝を必ず報告する','自分にできることを一つ申し出る'],
  8:['紹介できそうな人を一人思い浮かべ、提案してみる','相手の実績や近況の続きを聞く','深い相談を一つ持ちかけてみる'],
  9:['定期的な情報共有を一つ提案する','率直なフィードバックを一つ求めてみる','感謝を具体的な場面で伝える'],
  10:['具体的な協業や依頼を一つ提案してみる','節目に感謝を言葉にする','対等な立場での相談を持ちかける']
}

const WORK_COLLECTION_GUIDE = {
  1: [
    {source:BASIC,key:'workplace',label:'所属・肩書き',prompt:'次に会う時の話の入口になる',ask:'「どちらの会社で、どんなお仕事を？」',placeholder:'会社・役職'},
    {source:NOTES,key:'topics',label:'話しやすそうな話題',prompt:'次回の話題ストックになる',ask:'相手が乗ってきた話題を残す',placeholder:'話題の好み'}
  ],
  2: [
    {source:NOTES,key:'topics',label:'前回話した内容',prompt:'「前回の続き」を作る',ask:'次に会った時に振れる話',placeholder:'前回の話題'},
    {source:BASIC,key:'hobbies',label:'興味・関心事',prompt:'雑談の幅を広げる',ask:'仕事以外で関心がありそうなこと',placeholder:'趣味・関心'}
  ],
  3: [
    {source:NOTES,key:'personality',label:'仕事のスタイル・考え方',prompt:'価値観の合う協力の仕方を探る',ask:'計画型か柔軟型か、など',placeholder:'仕事のスタイル'},
    {source:BASIC,key:'favourites',label:'好きなもの',prompt:'ちょっとした気遣いのヒント',ask:'好きな店・もの',placeholder:'好きなもの',type:'list'}
  ],
  4: [
    {source:NOTES,key:'commonTopics',label:'重なる分野・関心',prompt:'情報を送る時の的を絞る',ask:'お互いの仕事が重なる部分',placeholder:'重なる分野'},
    {source:NOTES,key:'wants',label:'今取り組んでいること',prompt:'役に立てるタイミングを掴む',ask:'「今どんなことに力を入れてます？」',placeholder:'今の取り組み'}
  ],
  5: [
    {source:NOTES,key:'wants',label:'求めている情報・人脈',prompt:'渡せる情報のヒントになる',ask:'相手が探している情報・つながり',placeholder:'求めているもの'},
    {source:NOTES,key:'topics',label:'共有すると喜ばれる情報の種類',prompt:'一方通行にしないため',ask:'相手が反応した情報のジャンル',placeholder:'情報の種類'}
  ],
  6: [
    {source:NOTES,key:'worries',label:'今の課題・悩み',prompt:'力になれる部分を知る',ask:'相手が自分から話した課題だけ残す',placeholder:'課題・悩み'},
    {source:NOTES,key:'wants',label:'目指していること・目標',prompt:'長期的な関わり方を考える材料',ask:'「今どんなことを目指してます？」',placeholder:'目標・展望'}
  ],
  7: [
    {source:NOTES,key:'worries',label:'相手が頼りたいこと',prompt:'頼み事の的を絞る',ask:'相手が困っていることを覚えておく',placeholder:'頼まれそうなこと'},
    {source:NOTES,key:'commonTopics',label:'お互いに協力できること',prompt:'頼み・頼まれのバランスを取る',ask:'自分が力になれる分野',placeholder:'協力できること'}
  ],
  8: [
    {source:NOTES,key:'commonTopics',label:'紹介できそうな人・機会',prompt:'信頼を裏切らない紹介にする',ask:'相手に合いそうな人を覚えておく',placeholder:'紹介候補'},
    {source:NOTES,key:'wants',label:'相手が今ほしいつながり',prompt:'紹介の精度を上げる',ask:'相手が探している人脈',placeholder:'ほしいつながり'}
  ],
  9: [
    {source:NOTES,key:'topics',label:'定期的に話したいテーマ',prompt:'関係を切らさない接点を作る',ask:'お互い関心が続くテーマ',placeholder:'継続的な話題'},
    {source:NOTES,key:'worries',label:'相手の忙しさ・繁忙期',prompt:'距離が空く時期を責めないため',ask:'相手が話した予定・環境の変化',placeholder:'忙しい時期'}
  ],
  10: [
    {source:NOTES,key:'wants',label:'これから一緒にやりたいこと',prompt:'協業の具体化に使う',ask:'「これから何を一緒にやれそうか」',placeholder:'一緒にやりたいこと'},
    {source:NOTES,key:'commonTopics',label:'感謝を伝えたい具体的な場面',prompt:'関係を当然視しないため',ask:'実際に助けられた場面',placeholder:'感謝したい場面'}
  ]
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

function microStepsTable(track){
  if(track==='romance') return MICRO_STEPS
  if(track==='work') return WORK_MICRO_STEPS
  return FRIEND_MICRO_STEPS
}
function collectionGuideTable(track){
  if(track==='romance') return STAGE_COLLECTION_GUIDE
  if(track==='work') return WORK_COLLECTION_GUIDE
  return FRIEND_COLLECTION_GUIDE
}

export function getMicroSteps(person,stage,track='friend'){
  const anchor=getKnownAnchor(person)
  const table=microStepsTable(track)
  const steps=table[stage]||table[1]
  return steps.map((step,index)=>index===0&&stage>=2&&stage<=5?`${step}（「${anchor}」を入口に）`:step)
}

export function getCollectionGuide(stage,track='friend'){
  return collectionGuideTable(track)[stage]||[]
}

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

// Per-stage reaction reading for stages 8-10 — "you made a move, here is how to
// read each of the three possible responses". Keyed by `${track}:${stage}`.
const REACTION_GUIDE = {
  'romance:8': [
    { sign: '肯定を嬉しそうに受け取る／褒め返してくる／予定に乗ってくる', next: '同じ深さの肯定をもう一度。9段階を視野に' },
    { sign: '照れて流す・予定は「今度ね」で止まる', next: '重ねない。今の段階で会話を積む' },
    { sign: '話題を変える・反応が硬い', next: '好意を引っ込め、軽い話に戻す。温度を維持' }
  ],
  'romance:9': [
    { sign: '好意や次の提案が相手からも出る／差し出した手を取る', next: '複数回そろえば10段階（告白の準備）へ' },
    { sign: '嫌がりはしないが相手発のサインはない／手は取らない', next: '同じ段階でもう一度。手は繰り返さず、そのまま歩く' },
    { sign: '距離を取る・恋愛の話をそらす', next: '一段軽い話へ。今の段階を維持し、期限を優先しない' }
  ],
  'romance:10': [
    { sign: '三条件がそろっている・二人の時間を相手も作る', next: '好きな気持ちと「付き合いたい」を短く伝える' },
    { sign: '会えてはいるが、相手の維持・発展の動きが弱い', next: '告白を保留。9段階の確認に戻る' },
    { sign: '好意を示すと引く', next: '進めない。関係を今の形で保つ' }
  ],
  'friend:8': [
    { sign: '相手も自分から弱さや悩みを話す', next: '同じ深さで受け合う。9段階へ' },
    { sign: '聞いてはくれるが自分の話はしない', next: '要求しない。次の機会にまた少しだけ開示' },
    { sign: '茶化す・話を流す', next: '深い話はいったん引く。軽い共有に戻す' }
  ],
  'friend:9': [
    { sign: '過去の話や内輪ネタを相手も回収する／深い相談が来る', next: '二人の文脈を育てる。10段階（親友）へ' },
    { sign: '会話は続くが二人だけの文脈は薄い', next: '前の話の続きを覚えて振る。焦らない' },
    { sign: '内輪ネタに乗ってこない', next: '共通体験を増やす方に戻す' }
  ],
  'friend:10': [
    { sign: '久しぶりでも気まずくない・困った時に連絡し合える', next: '頻度が落ちても続く形を二人で見つける' },
    { sign: '会えばいいが、間が空くと連絡が途切れる', next: '用がなくても近況を送る習慣を続ける' },
    { sign: '距離が空いて自然消滅しそう', next: '責めずに、こちらから軽く再開のきっかけを作る' }
  ],
  'work:8': [
    { sign: '相手が自分を誰かに紹介してくれる／紹介を快く受けてくれる', next: '紹介した・された人を大事にする。9段階へ' },
    { sign: '紹介はまだないが情報交換は続く', next: '同じ段階でもう一度。まず自分から紹介してみる' },
    { sign: '距離を置かれる・反応が薄くなる', next: '頼み事や紹介を控え、情報提供に戻る' }
  ],
  'work:9': [
    { sign: '困った時に相手から声がかかる／連絡が途切れても自然に再開する', next: '10段階（継続的な協力関係の先）へ' },
    { sign: '関係は続くが一方通行気味', next: '自分から協力できることを一つ増やす' },
    { sign: '連絡が徐々に減る', next: '負担になっていないか見直す。頻度を落として様子を見る' }
  ],
  'work:10': [
    { sign: '重要な場面で名前を出して推薦してくれる／対等に相談し合える', next: '関係を維持。節目ごとに感謝を言葉にする' },
    { sign: '協力関係だが対等さが弱い', next: '自分の貢献を増やし、対等な関係を作る' },
    { sign: '関係が薄れてきた', next: '責めずに軽い接点（近況共有）から再開する' }
  ]
}

function trackKey(track){ return (track === 'romance' || track === 'work') ? track : 'friend' }

export function getReactionGuide(track, stage){
  return REACTION_GUIDE[`${trackKey(track)}:${Number(stage)}`] || null
}

// Physical first steps — romance track, stage 9-10 only. All options must be
// clearly perceivable and easy to decline. One at a time; if it is not received,
// stop and hold the stage. No graded escalation ladder past a first mutual gesture.
export const PHYSICAL_GUIDE = {
  intro: '好意がある程度お互いに見えてから。相手にも「いま動いた」と分かる形で、一回だけ。受け取られなければそのまま引き、今の段階を維持する。',
  best: '確実なのは言葉で聞くこと（「手つなぎたい」「ハグしていい？」）。断られてもお互い次に進みやすい。聞かれるのを不自然に感じる相手なら、下の「言葉にしない場合」を使う。',
  nonVerbal: {
    intro: '「止められなかった＝OK」ではない。はっきり前向きのサインが複数そろっている時だけ。動きはゆっくり、途中で一度止めて、最後の一歩（最後の数センチ）は相手に委ねる。迷ったら、その迷い自体が「まだ」のサイン。次の機会にする。',
    green: [
      '視線が合い続ける／相手も見つめ返してくる',
      '会話のテンポが落ちて、沈黙が気まずくない',
      '距離が近いのに相手が離れない・むしろ詰めてくる',
      'すでに手や肩の接触があって、引かれていない',
      '相手からも軽く触れてくる'
    ],
    how: [
      'ゆっくり近づく。急がない',
      '途中で一度止まって相手の反応を見る。引いた・固まったらそこでやめる',
      '最後の距離は相手が詰めるのを待つ。相手が動けば成立、動かなければ引く'
    ],
    note: '聞かれるのを嫌う相手でも、雑・急・断りにくい動きは同じくらい引かれる。ゆっくりで、途中で止まれて、最後を相手に委ねる動きなら、言葉がなくても相手は選べる。',
    recovery: {
      intro: 'ぎこちなくなる原因は「動き」ではなく「そのあとの自分の反応」。固まる・謝りすぎる・黙る・不機嫌になると、そこで初めて気まずくなる。受け取られなくても普通に会話を続ければ、相手も普通に戻る。相手はこちらのテンションを見て判断する。',
      do: [
        'テンションを変えず、話していた話題をそのまま続ける（言おうと思っていた話を一つ用意しておくと楽）',
        '触れそうなら軽く：「ちょっと気が早かったな」と一言、笑って次の話へ。深刻にしない',
        '場所や活動を変える（歩き出す・店を出る・飲み物を買う）。流れが物理的に切り替わる',
        '他のサインがまだ前向きなら、日を改めてもう一度。同じ日には繰り返さない'
      ],
      dont: ['謝りすぎる・言い訳を並べる', '黙り込む・分かりやすく落ち込む', 'その場でもう一度試す', '「なんで？」と理由を問う・気まずさを相手に処理させる']
    }
  },
  moves: [
    {
      move: '言葉で聞く：「手つなぎたい」「ハグしていい？」',
      readings: [
        ['「いいよ」／自分からしてくる', '受け入れられている。次に会う時も自然にできる'],
        ['「今はいいかな」', 'そのまま引く。関係は変わらない。少し間を置く'],
        ['はっきり嫌がる', '身体的な距離はまだ。会話と気持ちの段階に戻す']
      ]
    },
    {
      move: '歩く時、相手にも分かる形で手を差し出す（取るか取らないか相手が選べる）',
      readings: [
        ['手を取る／握り返す', '好意が返ってきている。他のサインも揃えば10段階へ'],
        ['取らない・そのまま歩く', '一回でやめる。繰り返さない。同じ段階を維持'],
        ['さっと離れる・歩く位置を変える', '身体的接触はまだ早い。次はしない']
      ]
    },
    {
      move: '別れ際に軽いハグを提案する（言葉で、または腕を軽く広げて相手が応じられる形で）',
      readings: [
        ['応じる／自分からもする', '受け入れられている'],
        ['ぎこちなく応じる', '無理はさせない。次は言葉で確認してから'],
        ['避ける・固まる', '提案しない。会話の心地よさを優先する']
      ]
    }
  ],
  coupleNote: '交際が成立したら、この先の距離感は「手順」ではなく二人で話して決める領域。「ペースを合わせられるか」「嫌なことを言い合えるか」を確認する。相手に隠れて段階を測るのは健全な関係とは逆の動き。'
}

export function getPhysicalGuide(track, stage){
  return track === 'romance' && Number(stage) >= 9 ? PHYSICAL_GUIDE : null
}

const OUTCOME_DETAIL = {
  'romance:9': {
    returned: { title: 'サインが返ってきた', body: '好意の言葉や次の提案、差し出した手を取る等が相手からも出ている。複数そろえば10段階へ。' },
    neutral: { title: '成立はした', body: '嫌がられてはいないが、相手発のサインはまだ。同じ段階で会話を重ねる。手は繰り返さない。' },
    thin: { title: '反応は薄め', body: '好意や誘いを重ねず、一段軽い話に戻す。今の段階を維持し、期限を優先しない。' }
  },
  'romance:10': {
    returned: { title: '三条件がそろった', body: '好きな気持ちと「付き合いたい」を短く言葉で伝えてよい状態。' },
    neutral: { title: 'もう一度確認', body: '会えてはいるが相手の維持・発展の動きが弱い。告白は保留し、9段階の確認へ。' },
    thin: { title: '進めない', body: '好意を示すと引くなら、関係を今の形で保つ。' }
  }
}

export function getOutcomeMessage(outcome, track, stage){
  const detail = OUTCOME_DETAIL[`${track === 'romance' ? 'romance' : 'friend'}:${Number(stage)}`]
  if(detail && detail[outcome]){
    const tone = outcome === 'returned' ? 'positive' : outcome === 'thin' ? 'pause' : 'neutral'
    return { ...detail[outcome], tone }
  }
  if(outcome==='returned') return {title:'半歩返ってきた',body:'相互サインを確認し、条件が揃えば次の一段へ進めます。',tone:'positive'}
  if(outcome==='neutral') return {title:'自然に成立した',body:'急いで強めず、同じ段階でもう一度だけ会話を重ねます。',tone:'neutral'}
  if(outcome==='thin') return {title:'反応は薄めだった',body:'好意や誘いを重ねず、一段小さい話題へ戻して余白を作ります。',tone:'pause'}
  return null
}
