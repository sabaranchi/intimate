const ACTION_DELTA = {
  called: 5,       // 連絡とった
  talked: 10,      // 話した
  played: 20       // 遊んだ（未指定のため維持）
}

function clamp(n, a = 0, b = 100){ return Math.max(a, Math.min(b, n)) }

function fmtYMD(d){ const y=d.getFullYear(); const m=('0'+(d.getMonth()+1)).slice(-2); const da=('0'+d.getDate()).slice(-2); return `${y}-${m}-${da}` }

function calculateScoreDecay(person){
  const p = JSON.parse(JSON.stringify(person || {}))
  p.friendScore = typeof p.friendScore === 'number' ? p.friendScore : 20

  // 永続下限保護: 過去到達スコアに応じて floor を更新し保持
  const prevFloor = typeof p.floor === 'number' ? p.floor : 0
  const reached = p.friendScore
  let newFloor = prevFloor
  if(reached >= 90) newFloor = Math.max(prevFloor, 70)
  else if(reached >= 70) newFloor = Math.max(prevFloor, 50)
  else if(reached >= 50) newFloor = Math.max(prevFloor, 30)
  // メモ数*1を永続下限に反映
  try{ newFloor = Math.max(newFloor, getMemoBase(p)) }catch(e){}

  // 最終相互作用が無ければ floor のみ更新して返す
  if(!p.lastInteractionDate){
    p.floor = newFloor
    return p
  }

  const now = new Date()
  const lastDate = new Date(p.lastInteractionDate)
  const daysSince = Math.floor((now - lastDate) / 86400000)

  // 2週間（14日）は低下なし
  if(daysSince <= 14){
    p.floor = newFloor
    return p
  }

  // 15日目以降、毎日 -1 ずつ低下
  const decayDays = daysSince - 14
  const decay = decayDays * 1
  let nextScore = clamp(p.friendScore - decay)
  if(typeof newFloor === 'number' && nextScore < newFloor) nextScore = newFloor
  p.friendScore = nextScore
  p.floor = newFloor
  return p
}

export { calculateScoreDecay, ACTION_DELTA, clamp, fmtYMD }
// メモ数に基づく基礎ポイント（永続下限）
export function getMemoBase(person){
  try{
    const n = Array.isArray(person?.notes?.entries) ? person.notes.entries.length : 0
    return n
  }catch(e){ return 0 }
}
