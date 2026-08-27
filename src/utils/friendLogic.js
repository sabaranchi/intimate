export const RELATIONSHIP_STAGES = [
  {
    id: 1,
    title: '初対面・認知',
    summary: '感じがよく、存在を自然に認識してもらう',
    topics: [
      ['その場の話', '「今日人多いね」「この授業、大変じゃない？」'],
      ['所属・環境', '「何学部？」「この辺よく来る？」'],
      ['軽い好み', '「コーヒー派？」「甘いもの好き？」'],
      ['今日の出来事', '「今日朝早かった？」「このあと予定ある？」'],
      ['共通点探し', '「それ自分も知ってる」「同じ先生なんだ」']
    ],
    nextConditions: ['挨拶を自然に返してくれる', '相手からも挨拶してくれる', '話しかけても警戒感がない'],
    nextMove: '次は、前回の話を一つ覚えて声をかける',
    caution: '恋愛・元恋人など、急に個人的すぎる話はまだしない'
  },
  {
    id: 2,
    title: '顔見知り',
    summary: '会ったら自然に話す人になる',
    topics: [
      ['前回の続き', '「この前言ってた課題、終わった？」'],
      ['最近のブーム', '「最近何かハマってる？」'],
      ['食べ物', '「この辺でおいしい店知ってる？」'],
      ['音楽・映画・ゲーム', '「最近何聴いてる？」'],
      ['軽い休日トーク', '「休みは家にいる派？ 外に出る派？」']
    ],
    nextConditions: ['相手からも質問が返ってくる', '会話をすぐ切らず広げてくれる', '数分ほど自然に話せる'],
    nextMove: '相手の答えに自分の話も少し重ね、往復を作る',
    caution: '質問だけを続けてインタビューにしない'
  },
  {
    id: 3,
    title: '普通に話せる',
    summary: '相手の性格や考え方を知る',
    topics: [
      ['性格', '「計画を立てるタイプ？ 直前に決める派？」'],
      ['好き嫌い', '「逆に絶対苦手な食べ物ある？」'],
      ['昔の話', '「高校のとき何してた？」'],
      ['軽い失敗談', '「今日ちょっとやらかしてさ」'],
      ['軽い価値観', '「旅行は予定ぎっちり派？ 適当派？」']
    ],
    nextConditions: ['前に話した内容を次回につなげられる', '個人的な話題にも自然に答えてくれる', '相手もこちらを知ろうとしてくれる'],
    nextMove: '前に聞いたことを覚えて、次の会話の入口にする',
    caution: '一度に深掘りせず、答えにくそうなら軽い話へ戻る'
  },
  {
    id: 4,
    title: '個人的交流',
    summary: 'その場にいるからではなく、あなた個人と話す',
    topics: [
      ['相手固有の話', '「こういうの好きそう」'],
      ['前の話の続き', '「前に言ってた件、どうなった？」'],
      ['個別に送れる話', '「これ見て思い出した」'],
      ['小さな相談', '「AとBならどっち選ぶ？」'],
      ['日常共有', '「今日こんなの見つけた」']
    ],
    nextConditions: ['用事がなくても多少やり取りが続く', '相手からも質問や話題提供がある', '返信の速さや文量が無理なく合っている'],
    nextMove: '対面で生まれた話題を、LINEやDMへ自然に延長する',
    caution: '連絡先の取得や毎日の返信を目的にしない'
  },
  {
    id: 5,
    title: 'やや親しい',
    summary: '二人の未来や共通体験を少し想像できる',
    topics: [
      ['休日の過ごし方', '「休みの日って何してること多い？」'],
      ['行きたい場所', '「最近行ってみたいところある？」'],
      ['好きな店・場所', '「よく行く店ある？」'],
      ['少し深い自己開示', '「実は人が多い所、少し苦手なんだ」'],
      ['未来の共有', '「それ今度一緒に行ったら面白そう」']
    ],
    nextConditions: ['「今度」の話に前向きな反応がある', '軽い誘いを受け入れる・具体化してくれる', '難しい時は別日や別案を返してくれる'],
    nextMove: '会話の延長で、短く断りやすい1対1の誘いを出す',
    caution: '大げさなデートにせず「無理なら大丈夫」の余白を残す'
  },
  {
    id: 6,
    title: '1対1へ移行',
    summary: '二人で過ごすことへの抵抗がないか確かめる',
    topics: [
      ['食の共有', '「好きなら、あの店たぶん合うと思う」'],
      ['趣味の共有', '「その映画、自分も見たい」'],
      ['場所の共有', '「前に言ってた店、行ってみたい」'],
      ['軽い未来提案', '「じゃあ今度一緒に行こう」'],
      ['具体化', '「来週か再来週、どこか空いてる？」']
    ],
    nextConditions: ['二人で会う誘いに応じてくれる', '二人でいても会話が自然に続く', '終わった後も次につながる反応がある'],
    nextMove: '初回は短めにして「楽しかった、また行こう」と伝える',
    caution: '断られた時に理由を追及したり、すぐ再度迫ったりしない'
  },
  {
    id: 7,
    title: '1対1が続く',
    summary: '一度会った関係から、二人で会うのが普通になる',
    topics: [
      ['二人の思い出', '「この前のあれ、面白かったよね」'],
      ['新しく知った一面', '「意外とそういうの好きなんだね」'],
      ['次回の話', '「今度はあそこ行ってみたい」'],
      ['内面への言及', '「そういうところ真面目だよね」'],
      ['感情共有', '「この前、普通に楽しかった」']
    ],
    nextConditions: ['相手も予定を合わせようとしてくれる', '行きたい場所や次回を提案してくれる', '「また会おう」が相手からも出る'],
    nextMove: '少しだけ時間を長くし、互いに楽しめる場所を選ぶ',
    caution: '回数よりも、相手の主体性が増えているかを見る'
  },
  {
    id: 8,
    title: '親密化・軽い好意',
    summary: '友達との差を、圧力にならない言葉で少し作る',
    topics: [
      ['個人的な褒め', '「そういうところ、結構好き」'],
      ['一緒にいる感覚', '「話してると楽だな」'],
      ['特別感', '「こういう話ができる人、あまりいない」'],
      ['外見への軽い言及', '「今日の服、似合ってるね」'],
      ['二人の関係', '「最近よく一緒にいるよね」']
    ],
    nextConditions: ['個人的な肯定を嬉しそうに受け取る', '相手からも褒めや好意が返ってくる', '次の予定に以前より積極的になる'],
    nextMove: '性格・考え方・一緒にいる感覚への肯定を少し増やす',
    caution: '反応が薄い時は好意を重ねず、今の温度を維持する'
  },
  {
    id: 9,
    title: '好意が見える',
    summary: '「もしかして好きかも」が互いに伝わる',
    topics: [
      ['会いたい気持ち', '「会うの、普通に楽しみになってる」'],
      ['特別扱い', '「これ一緒に行きたいと思った」'],
      ['感情', '「今日会えてよかった」'],
      ['関係の確認', '「二人でいると落ち着くよね」'],
      ['軽い恋愛方向', '「付き合ったらどんな感じなんだろ」']
    ],
    nextConditions: ['相手から連絡や二人の提案が来る', '個人的な悩みや価値観を話してくれる', '複数の好意的な反応が繰り返し返る'],
    nextMove: '相手も関係を進めているか、複数のサインを落ち着いて見る',
    caution: '一つのサインだけで決めず、返ってこない時は期限を優先しない'
  },
  {
    id: 10,
    title: '告白直前',
    summary: '告白が突然ではなく、関係の自然な次の段階になる',
    topics: [
      ['相手への肯定', '「こういうところ、本当に好きだと思う」'],
      ['二人の時間', '「一緒にいる時間、かなり好き」'],
      ['関係の変化', '「こんなに仲良くなると思わなかった」'],
      ['未来', '「これからも二人でいろいろ行きたい」'],
      ['恋愛方向の明確化', '「友達以上に見てると思う」']
    ],
    nextConditions: ['二人で何度か自然に会えている', '相手も関係を維持・発展させようとしている', '好意を示しても拒絶されていない'],
    nextMove: '三つが揃ったら、好きな気持ちと「付き合いたい」を明確に伝える',
    caution: '3か月という期限より、相互性を優先する'
  }
]

export const COMMUNICATION_DIMENSIONS = [
  {key:'conversationDepth', label:'話す内容の深さ', weight:30, levels:['未評価','挨拶・用件','軽い雑談','近況・好み','悩み・本音まで']},
  {key:'atmosphere', label:'会話の空気感', weight:25, levels:['未評価','丁寧に探りながら','普通に話せる','冗談や脱線ができる','沈黙や本音も自然']},
  {key:'myApproachability', label:'自分からの話しかけやすさ', weight:15, levels:['未評価','用事がある時だけ','きっかけがあれば','気軽に話しかけられる','用事がなくても自然']},
  {key:'theirApproachability', label:'相手から話しかけられやすさ', weight:20, levels:['未評価','必要な時だけ','時々向こうから','よく向こうから','互いにごく自然']},
  {key:'addressingCloseness', label:'呼び方の近さ', weight:10, levels:['未評価','苗字・敬称','名前・愛称','呼び捨て・あだ名','二人らしい呼び方']}
]

export function clamp(n, a=0, b=100){ return Math.max(a, Math.min(b,n)) }

export function createEmptyCommunicationProfile(){
  return {
    relationshipStage:null,
    stageChecks:{},
    stepPlans:{},
    nextStepSafety:{oneStep:false, roomToDecline:false, reciprocated:false},
    conversationDepth:null, atmosphere:null, myApproachability:null, theirApproachability:null, addressingCloseness:null,
    iCallThem:'', theyCallMe:'', recentTopics:'', lastConversationNote:'', lastConversationDate:'', updatedAt:''
  }
}

export function normalizeCommunication(personOrProfile){
  const source=personOrProfile?.communication || personOrProfile || {}
  const profile={...createEmptyCommunicationProfile(),...source}
  const stage=Number(source.relationshipStage)
  profile.relationshipStage=Number.isInteger(stage) && stage>=1 && stage<=10 ? stage : null
  profile.stageChecks=source.stageChecks && typeof source.stageChecks==='object' ? source.stageChecks : {}
  profile.stepPlans=source.stepPlans && typeof source.stepPlans==='object' ? source.stepPlans : {}
  profile.nextStepSafety={...createEmptyCommunicationProfile().nextStepSafety,...(source.nextStepSafety||{})}
  if(!profile.lastConversationNote && personOrProfile?.lastConversationSummary) profile.lastConversationNote=personOrProfile.lastConversationSummary
  if(!profile.lastConversationDate && personOrProfile?.lastInteractionDate) profile.lastConversationDate=personOrProfile.lastInteractionDate
  return profile
}

export function getRelationshipStage(personOrProfile){ return normalizeCommunication(personOrProfile).relationshipStage }
export function getStageDefinition(stage){ return RELATIONSHIP_STAGES.find(item=>item.id===Number(stage)) || null }

export function getStageGateProgress(personOrProfile, stageValue){
  const profile=normalizeCommunication(personOrProfile)
  const stage=Number(stageValue || profile.relationshipStage)
  const definition=getStageDefinition(stage)
  if(!definition) return {checked:0,total:0,ready:false}
  const values=Array.isArray(profile.stageChecks?.[stage]) ? profile.stageChecks[stage] : []
  const checked=definition.nextConditions.filter((_,index)=>Boolean(values[index])).length
  const required=stage===10 ? definition.nextConditions.length : 2
  return {checked,total:definition.nextConditions.length,required,ready:checked>=required}
}

export function getCommunicationScore(personOrProfile){
  const stage=getRelationshipStage(personOrProfile)
  if(stage) return stage*10
  const legacy=Number(personOrProfile?.friendScore)
  return Number.isFinite(legacy) ? Math.round(clamp(legacy)) : 0
}

export function getAssessmentProgress(personOrProfile){
  const stage=getRelationshipStage(personOrProfile)
  return {rated:stage?1:0,total:1,complete:Boolean(stage)}
}

export function getCommunicationLevel(score, assessed=true){
  if(!assessed) return {label:'段階未設定',description:'今の関係に最も近い段階を選びます'}
  const stage=Math.max(1,Math.min(10,Math.round((Number(score)||10)/10)))
  const item=getStageDefinition(stage)
  return {label:item?.title||'段階未設定',description:item?.summary||''}
}

export function getLastConversationDate(person){ return person?.communication?.lastConversationDate || person?.lastInteractionDate || '' }

// Compatibility for old callers. Time alone no longer lowers intimacy.
export function calculateScoreDecay(person){
  const next=JSON.parse(JSON.stringify(person||{}))
  next.communication=normalizeCommunication(next)
  next.friendScore=getCommunicationScore(next)
  return next
}
