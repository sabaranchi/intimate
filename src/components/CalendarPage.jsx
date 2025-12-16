import React from 'react'

function startOfMonth(d){ const x = new Date(d.getFullYear(), d.getMonth(), 1); x.setHours(0,0,0,0); return x }
function endOfMonth(d){ const x = new Date(d.getFullYear(), d.getMonth()+1, 0); x.setHours(23,59,59,999); return x }
function pad(n){ return ('0'+n).slice(-2) }
function fmtYMD(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}` }

export default function CalendarPage({ people, onBack }){
  const [refDate, setRefDate] = React.useState(()=> new Date())
  const year = refDate.getFullYear()
  const month = refDate.getMonth()

  const birthdaysByMonthDay = React.useMemo(()=>{
    const map = {}
    const peopleArray = Array.isArray(people) ? people : []
    peopleArray.forEach(p=>{
      if(!p || !p.birthday) return
      const bd = new Date(p.birthday)
      if(isNaN(bd)) return
      // use month/day only; mark in current ref month if months match
      const m = bd.getMonth()
      const d = bd.getDate()
      const key = `${m}-${d}`
      if(!map[key]) map[key] = []
      map[key].push(p)
    })
    return map
  }, [people])

  const followUpsByMonthDay = React.useMemo(()=>{
    const map = {}
    const peopleArray = Array.isArray(people) ? people : []
    peopleArray.forEach(p=>{
      if(!p || !p.lastInteractionDate) return
      const lastDate = new Date(p.lastInteractionDate)
      if(isNaN(lastDate)) return
      // 3週間後（21日後）
      const followUp = new Date(lastDate)
      followUp.setDate(followUp.getDate() + 21)
      const m = followUp.getMonth()
      const d = followUp.getDate()
      const key = `${m}-${d}`
      if(!map[key]) map[key] = []
      map[key].push(p)
    })
    return map
  }, [people])

  const grid = React.useMemo(()=>{
    const start = startOfMonth(refDate)
    const end = endOfMonth(refDate)
    const days = end.getDate()
    const firstWeekday = start.getDay() // 0=Sun
    const cells = []
    // leading blanks
    for(let i=0;i<firstWeekday;i++) cells.push({ type:'blank' })
    for(let d=1; d<=days; d++){
      const key = `${month}-${d}`
      const bds = birthdaysByMonthDay[key] || []
      const followUps = followUpsByMonthDay[key] || []
      cells.push({ type:'day', day:d, birthdays: bds, followUps })
    }
    // ensure full weeks (multiple of 7)
    while(cells.length % 7 !== 0) cells.push({ type:'blank' })
    return cells
  }, [refDate, birthdaysByMonthDay, followUpsByMonthDay])

  function prevMonth(){ const d = new Date(refDate); d.setMonth(d.getMonth()-1); setRefDate(d) }
  function nextMonth(){ const d = new Date(refDate); d.setMonth(d.getMonth()+1); setRefDate(d) }

  return (
    <div className="calendar-page" style={{padding:12}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
        <button onClick={onBack}>← 戻る</button>
        <button onClick={prevMonth}>〈 前月</button>
        <div style={{fontWeight:700}}>{year}年 {month+1}月</div>
        <button onClick={nextMonth}>次月 〉</button>
      </div>
      <div className="calendar-grid" style={{display:'grid',gridTemplateColumns:'repeat(7, 1fr)',gap:6}}>
        {['日','月','火','水','木','金','土'].map(w=> (
          <div key={w} style={{textAlign:'center',fontWeight:700,opacity:0.8}}>{w}</div>
        ))}
        {grid.map((cell, i)=>{
          if(cell.type==='blank') return <div key={i} />
          const hasBirthday = (cell.birthdays||[]).length>0
          const hasFollowUp = (cell.followUps||[]).length>0
          let bgColor = '#f5e6d2'
          if(hasBirthday) bgColor = 'rgba(255,170,100,0.4)'
          if(hasFollowUp && !hasBirthday) bgColor = 'rgba(150,200,255,0.4)'
          if(hasBirthday && hasFollowUp) bgColor = 'rgba(255,180,180,0.5)'
          return (
            <div key={i} className="calendar-cell" style={{border:'1px solid #7a5230',borderRadius:6,padding:8,background: bgColor}}>
              <div style={{fontWeight:700}}>{cell.day}</div>
              {hasBirthday && (
                <ul style={{listStyle:'none',padding:0,margin:0,fontSize:12}}>
                  {cell.birthdays.map(p=> (
                    <li key={p.id}>🎂 {p.name}</li>
                  ))}
                </ul>
              )}
              {hasFollowUp && (
                <ul style={{listStyle:'none',padding:0,margin:0,fontSize:12}}>
                  {cell.followUps.map(p=> (
                    <li key={p.id}>📞 {p.name}</li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
