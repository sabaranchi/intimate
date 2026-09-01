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

// Friendship track — same 10-step structure, goal is 親友 (a close friend you hang out with).
export const FRIEND_STAGES = [
  {
    id: 1,
    title: '初対面・認知',
    summary: '感じよく、存在を覚えてもらう',
    topics: [
      ['その場の話', '「今日人多いね」「この授業だるくない？」'],
      ['所属・環境', '「何年？」「この辺よく来る？」'],
      ['軽い好み', '「コーヒー派？」「ゲームやる？」'],
      ['今日の出来事', '「朝早かった？」「このあと暇？」'],
      ['共通点探し', '「それ自分も好き」「同じ講義だ」']
    ],
    nextConditions: ['挨拶を自然に返してくる', '相手からも話しかけてくる', '話しても警戒される感じがない'],
    nextMove: '前回の話を一つ覚えて、次に自分から声をかける',
    caution: '重い話・詮索から入ると引かれる。まずは軽く'
  },
  {
    id: 2,
    title: '顔見知り',
    summary: '会ったら自然に話す人になる',
    topics: [
      ['前回の続き', '「この前のあれ、どうなった？」'],
      ['最近のブーム', '「最近ハマってるものある？」'],
      ['食べ物', '「この辺でうまい店知ってる？」'],
      ['音楽・映画・ゲーム', '「最近何見てる？」'],
      ['休日トーク', '「休みは家派？ 外派？」']
    ],
    nextConditions: ['相手からも質問が返ってくる', '会話を切らずに広げてくれる', '数分は自然に話せる'],
    nextMove: '相手の答えに自分の話も重ねて、往復のリズムを作る',
    caution: '質問を連発してインタビューにしない'
  },
  {
    id: 3,
    title: '普通に話せる',
    summary: '考え方・性格を知る',
    topics: [
      ['性格・タイプ', '「計画立てる派？ 直前に決める派？」'],
      ['好き嫌い', '「逆に絶対無理なものある？」'],
      ['昔の話', '「高校のとき何してた？」'],
      ['失敗談', '「今日ちょっとやらかした」'],
      ['軽い価値観', '「旅行はぎっちり派？ ゆるゆる派？」']
    ],
    nextConditions: ['前に話したことを次につなげられる', '個人的な話にも普通に答えてくれる', '相手もこちらを知ろうとしてくる'],
    nextMove: '前に聞いたことを覚えて、次の会話の入口にする',
    caution: '一気に深掘りしない。重そうなら軽い話へ戻す'
  },
  {
    id: 4,
    title: '個人的に話す',
    summary: 'その場にいるからではなく、あなた個人として話す',
    topics: [
      ['相手固有の話', '「こういうの好きそう」'],
      ['前の話の続き', '「前に言ってた件どうなった？」'],
      ['個別に送れる話', '「これ見て思い出した」'],
      ['小さな相談', '「AとBどっちがいいと思う？」'],
      ['日常共有', '「今日こんなの見つけた」']
    ],
    nextConditions: ['用がなくてもやり取りが続く', '相手からも話題を振ってくる', '返信のテンポ・量が無理なく合っている'],
    nextMove: '対面で出た話題を、LINEやDMへ自然に延長する',
    caution: '即レスや毎日の連絡を目的化しない'
  },
  {
    id: 5,
    title: '一緒に何かする',
    summary: 'グループの中で一緒に動く',
    topics: [
      ['共通の予定', '「今度のあれ行く？」'],
      ['やってみたいこと', '「それ一回やってみたいんだよね」'],
      ['おすすめの場所', '「いい店知ってる？」'],
      ['連携', '「その課題一緒にやらない？」'],
      ['「今度」の話', '「今度みんなで行こうよ」']
    ],
    nextConditions: ['「今度」に前向きな反応がある', 'グループの誘いに乗ってくる', '無理な時は代案を返してくれる'],
    nextMove: 'みんなの予定に乗せる形で、一緒に行動する機会を作る',
    caution: '二人きりを急がない。まずグループでの居心地を作る'
  },
  {
    id: 6,
    title: '二人でも遊ぶ',
    summary: '二人で過ごすことに抵抗がないか確かめる',
    topics: [
      ['共通の趣味', '「その映画、自分も見たい」'],
      ['行きたい場所', '「前に言ってた店、行ってみたい」'],
      ['軽い提案', '「じゃあ今度一緒に行こう」'],
      ['具体化', '「来週か再来週、どこか空いてる？」'],
      ['予定調整', '「土日どっちがいい？」']
    ],
    nextConditions: ['二人で会う誘いに応じてくれる', '二人でも会話が自然に続く', '終わった後も次につながる反応がある'],
    nextMove: '初回は短めに切り上げて「楽しかった、また行こう」と伝える',
    caution: '断られたら理由を追及しない。すぐ再度誘わない'
  },
  {
    id: 7,
    title: '遊ぶのが定番',
    summary: '二人で遊ぶのが普通になる',
    topics: [
      ['二人の思い出', '「この前のあれ面白かったね」'],
      ['新しく知った一面', '「意外とそういうの好きなんだ」'],
      ['次回の話', '「今度はあそこ行こう」'],
      ['内輪ネタ', '（二人だけで通じる言い回し）'],
      ['「また遊ぼう」', '「またやろうぜ」']
    ],
    nextConditions: ['相手も予定を合わせようとしてくる', '行き先や次回を相手から提案してくる', '「また」が相手からも出る'],
    nextMove: '少し時間を長くし、互いに楽しめる場所を選ぶ',
    caution: '回数より、相手の主体性が増えているかを見る'
  },
  {
    id: 8,
    title: '弱さも見せ合える',
    summary: '失敗や苦手を、茶化されずに話せる',
    topics: [
      ['自分の失敗談', '「これマジで反省してる」'],
      ['最近の疲れ・悩み', '「ちょっと最近しんどくてさ」'],
      ['苦手なこと', '「自分これ本当にダメなんだよね」'],
      ['助けてほしいこと', '「ちょっと相談していい？」'],
      ['相手の頑張り', '「あれ普通にすごいと思ってる」']
    ],
    nextConditions: ['相手も自分から弱さや悩みを話す', '相談を茶化さず受け取ってくれる', '後日、話の続きを相手から出してくる'],
    nextMove: '自分の弱さを先に出す。同じ深さを相手に要求しない',
    caution: '開示を返させるために弱さを使わない。秘密を関係の道具にしない'
  },
  {
    id: 9,
    title: '何でも話せる',
    summary: '沈黙も本音も自然。二人の文脈が育つ',
    topics: [
      ['価値観の一致と違い', '「そこは考え方違うけど、理由は分かる」'],
      ['過去の話の回収', '「前に言ってたやつ、その後どう？」'],
      ['二人の呼び方・内輪ネタ', '（定着したあだ名・ネタ）'],
      ['深い相談', '「これ他の人には言ってないんだけど」'],
      ['長期的な話', '「卒業してからもこんな感じで会いたい」']
    ],
    nextConditions: ['相手も過去の話や内輪ネタを回収する', '個人的な悩みや価値観を話してくれる', '連絡や誘いが相手からも来る'],
    nextMove: '以前の話を覚えていることを示し、続きや変化に関心を向ける',
    caution: '「二人だけ」を囲い込みに使わない。相手を他の友人関係から孤立させない'
  },
  {
    id: 10,
    title: '親友',
    summary: '長く続く、対等で心地よい関係',
    topics: [
      ['近況の共有', '「用ないけど近況報告」'],
      ['迷った時の相談', '「ちょっと聞いてほしいことある」'],
      ['変わらない部分・変わった部分', '「昔からそこは変わらないよね」'],
      ['これからの話', '「この先も適当に会おう」'],
      ['感謝', '「いてくれて普通に助かってる」']
    ],
    nextConditions: ['困った時に自然に連絡し合える', '久しぶりでも気まずくならない', '相手の生活の変化を互いに尊重できている'],
    nextMove: '頻度が落ちても続く形を、二人で見つける',
    caution: '「親友だから」で相手の時間や境界を当然視しない'
  }
]

// Neutral read of the other person, adapted from the profiling notes.
export const PERSONALITY_TYPES = [
  {
    id: 'calm', label: '落ち着き・慎重',
    impression: '静かめ・声控えめ・動作が丁寧',
    tendency: '受け身・慎重。警戒心はやや強め、心を開くと安定',
    openLine: '「落ち着いてるよね。こういう人、話しやすい」',
    ok: ['共感→小さな肯定→少しだけ自己開示', '相手のペースに合わせる', '目を見てゆっくり話す'],
    ng: ['いきなりタメ口', '強いイジり・下ネタ', '「なんでそんな静かなの？」系の詰め']
  },
  {
    id: 'bright', label: '明るい・社交',
    impression: '笑顔多い・リアクション大・友達多そう',
    tendency: 'ノリがいい・感情表現豊か。褒められ慣れている',
    openLine: '「絶対クラスのムードメーカーだったでしょ」',
    ok: ['軽いイジり＋ノリ合わせ', '一瞬だけ真面目トーンを挟む（ギャップ）', '人と違う切り口で褒める'],
    ng: ['普通の褒め（可愛い／優しそう）', '盛り上げ役に徹する', 'ずっとハイテンション']
  },
  {
    id: 'frank', label: 'さばさば・自立',
    impression: '口調ハッキリ・ツッコミ気質・カジュアル',
    tendency: '自立心が強い。相手を値踏みしがち',
    openLine: '「はっきりしてそう。曖昧なの嫌いでしょ」',
    ok: ['対等なツッコミ', '自分の意見をちゃんと出す', '短くテンポよく'],
    ng: ['下手に出る', '過剰な気遣い', '何でも同意する']
  },
  {
    id: 'cool', label: 'クール・論理',
    impression: '無表情寄り・目力・モノトーン',
    tendency: '論理的・プライド高め。興味ない相手には冷たい',
    openLine: '「感情より考える派だよね」',
    ok: ['思考・価値観の話', '質問は量より質', '静かな自信を見せる'],
    ng: ['薄い雑談の連打', '馴れ馴れしさ', '無理に笑わせようとする']
  },
  {
    id: 'clingy', label: '甘え・かまって',
    impression: '距離が近い・SNS更新頻繁・構ってオーラ',
    tendency: '承認欲求が強め。情緒が上下しやすい',
    openLine: '「距離感近いよね。人懐っこいタイプ？」',
    ok: ['たまに構う→たまに引く', 'ペースの主導権は自分が持つ', '余裕のある対応'],
    ng: ['即レス・即同調', '全部受け止める', '相手の情緒に巻き込まれる']
  },
  {
    id: 'shy', label: '控えめ・内向',
    impression: '自分を下げる発言が多い・おしゃれ控えめ',
    tendency: '否定されるのが怖い。心を開くと一途',
    openLine: '「控えめだけど、ちゃんと考えて話すよね」',
    ok: ['小さな肯定を積み重ねる', '努力や成果を拾って褒める', '急がない'],
    ng: ['強いツッコミ', 'いじりすぎ', '他人と比較する']
  },
  {
    id: 'volatile', label: '距離が必要（情緒不安定）',
    impression: '初対面から重い話・病み／家庭の話が多い',
    tendency: '依存しやすい・被害者意識。感情の振れ幅が大きい',
    openLine: '（深入りしない。「そうなんだ、大変だったね」と事実だけ受ける）',
    ok: ['話は聞くが踏み込まない', '境界線を明確にする', '冷静さを保つ'],
    ng: ['救世主ムーブ', '過剰な共感', '連絡頻度を上げる']
  }
]

export function getPersonalityType(id){ return PERSONALITY_TYPES.find(t => t.id === id) || null }

// 'romance' when the two are different-gender, 'friend' when same or unknown.
export function autoTrack(selfGender, personGender){
  const a = (selfGender || '').trim()
  const b = (personGender || '').trim()
  if(a && b && a !== b) return 'romance'
  return 'friend'
}
export function resolveTrack(person, selfGender){
  const explicit = person?.communication?.track
  if(explicit === 'friend' || explicit === 'romance') return explicit
  return autoTrack(selfGender, person?.gender)
}
export function getStages(track){ return track === 'romance' ? RELATIONSHIP_STAGES : FRIEND_STAGES }

export function clamp(n, a=0, b=100){ return Math.max(a, Math.min(b,n)) }

export function createEmptyCommunicationProfile(){
  return {
    relationshipStage:null,
    stageChecks:{},
    nextStepSafety:{oneStep:false, roomToDecline:false, reciprocated:false},
    conversationLog:[],
    conversationFlowNotes:{},
    stepPlans:{},
    iCallThem:'', theyCallMe:'', recentTopics:'', lastConversationNote:'', lastConversationDate:'', updatedAt:''
  }
}

function normalizeConversationEntry(entry, index){
  const e = entry && typeof entry === 'object' ? entry : {}
  return {
    id: String(e.id || ('c' + index)),
    date: e.date || '',
    topics: e.topics || '',
    theirResponse: e.theirResponse || '',
    appreciated: e.appreciated || '',
    wantToAsk: e.wantToAsk || ''
  }
}

export function normalizeCommunication(personOrProfile){
  const source=personOrProfile?.communication || personOrProfile || {}
  const profile={...createEmptyCommunicationProfile(),...source}
  const stage=Number(source.relationshipStage)
  profile.relationshipStage=Number.isInteger(stage) && stage>=1 && stage<=10 ? stage : null
  profile.stageChecks=source.stageChecks && typeof source.stageChecks==='object' ? source.stageChecks : {}
  profile.nextStepSafety={...createEmptyCommunicationProfile().nextStepSafety,...(source.nextStepSafety||{})}
  profile.conversationFlowNotes=source.conversationFlowNotes && typeof source.conversationFlowNotes==='object' ? source.conversationFlowNotes : {}
  profile.stepPlans=source.stepPlans && typeof source.stepPlans==='object' ? source.stepPlans : {}
  profile.track=(source.track==='friend'||source.track==='romance') ? source.track : 'auto'

  profile.conversationLog=Array.isArray(source.conversationLog)
    ? source.conversationLog.filter(Boolean).map(normalizeConversationEntry)
    : []

  // Migrate the old single "latest conversation" fields into the first log entry.
  if(!profile.conversationLog.length){
    const legacyDate=source.lastConversationDate || personOrProfile?.lastInteractionDate || ''
    const legacyTopics=source.recentTopics || ''
    const legacyResponse=source.lastConversationNote || personOrProfile?.lastConversationSummary || ''
    if(legacyDate || legacyTopics || legacyResponse){
      profile.conversationLog=[{
        id:'legacy-'+(legacyDate||'0'),
        date:legacyDate, topics:legacyTopics, theirResponse:legacyResponse, appreciated:'', wantToAsk:''
      }]
    }
  }

  // Keep the mirror fields (used by list previews / sorting / calendar) pointed at the newest entry.
  const recent=[...profile.conversationLog].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')))[0]
  if(recent){
    profile.lastConversationDate=recent.date || ''
    profile.recentTopics=recent.topics || ''
    profile.lastConversationNote=recent.theirResponse || ''
  }else{
    if(!profile.lastConversationNote && personOrProfile?.lastConversationSummary) profile.lastConversationNote=personOrProfile.lastConversationSummary
    if(!profile.lastConversationDate && personOrProfile?.lastInteractionDate) profile.lastConversationDate=personOrProfile.lastInteractionDate
  }
  return profile
}

export function getConversationLog(personOrProfile){
  return [...normalizeCommunication(personOrProfile).conversationLog]
    .sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')))
}

export function getRelationshipStage(personOrProfile){ return normalizeCommunication(personOrProfile).relationshipStage }
export function getStageDefinition(stage, track='friend'){
  return getStages(track).find(item=>item.id===Number(stage)) || null
}

export function getStageGateProgress(personOrProfile, stageValue, track='friend'){
  const profile=normalizeCommunication(personOrProfile)
  const stage=Number(stageValue || profile.relationshipStage)
  const definition=getStageDefinition(stage, track)
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

export function getLastConversationDate(person){
  const profile=normalizeCommunication(person)
  const dates=profile.conversationLog.map(entry=>entry.date).filter(Boolean).sort()
  return dates[dates.length-1] || profile.lastConversationDate || person?.lastInteractionDate || ''
}
