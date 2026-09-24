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
      // Only show dates the user chose, never contact-frequency pressure.
      if(!p || !p.followUpDate) return
      const followUp = new Date(p.followUpDate + 'T12:00:00')
      if(isNaN(followUp)) return
      const key = fmtYMD(followUp)
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
      const followUps = followUpsByMonthDay[fmtYMD(new Date(year,month,d))] || []
      cells.push({ type:'day', day:d, birthdays: bds, followUps })
    }
    // ensure full weeks (multiple of 7)
    while(cells.length % 7 !== 0) cells.push({ type:'blank' })
    return cells
  }, [refDate, birthdaysByMonthDay, followUpsByMonthDay])

  function prevMonth(){ const d = new Date(refDate); d.setMonth(d.getMonth()-1); setRefDate(d) }
  function nextMonth(){ const d = new Date(refDate); d.setMonth(d.getMonth()+1); setRefDate(d) }

  return (
    <div className="calendar-page">
      <div className="calendar-nav">
        <button className="calendar-back" onClick={onBack}>← 戻る</button>
        <div className="calendar-month-nav">
          <button onClick={prevMonth} aria-label="前月">〈</button>
          <div className="calendar-title">{year}年 {month+1}月</div>
          <button onClick={nextMonth} aria-label="次月">〉</button>
        </div>
      </div>
      <div className="calendar-legend">
        <span><i className="dot birthday" />🎂 誕生日</span>
        <span><i className="dot followup" />🌱 メモした予定</span>
      </div>
      <div className="calendar-grid">
        {['日','月','火','水','木','金','土'].map(w=> (
          <div key={w} className="calendar-weekday">{w}</div>
        ))}
        {grid.map((cell, i)=>{
          if(cell.type==='blank') return <div key={i} />
          const hasBirthday = (cell.birthdays||[]).length>0
          const hasFollowUp = (cell.followUps||[]).length>0
          const cls = 'calendar-cell'
            + (hasBirthday ? ' has-birthday' : '')
            + (hasFollowUp ? ' has-followup' : '')
          return (
            <div key={i} className={cls}>
              <div className="calendar-day">{cell.day}</div>
              {hasBirthday && (
                <ul className="calendar-marks">
                  {cell.birthdays.map(p=> <li key={p.id}>🎂 {p.name}</li>)}
                </ul>
              )}
              {hasFollowUp && (
                <ul className="calendar-marks">
                  {cell.followUps.map(p=> <li key={p.id}>🌱 {p.name}</li>)}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
