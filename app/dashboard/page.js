'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import { getData } from '@/lib/sheets'

const WEDDING = new Date('2027-01-23T14:00:00')
const fmt = n => 'R ' + Math.round(Number(n) || 0).toLocaleString()

export default function Dashboard() {
  const [user, setUser]         = useState(null)
  const [vendors, setVendors]   = useState([])
  const [tasks, setTasks]       = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading]   = useState(true)

  const days = Math.max(0, Math.ceil((WEDDING - Date.now()) / 86400000))

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => setUser(d.user)).catch(() => {})
    Promise.all([getData('vendors'), getData('tasks'), getData('activity')])
      .then(([v, t, a]) => { setVendors(v); setTasks(t); setActivity(a) })
      .finally(() => setLoading(false))
  }, [])

  const totalQuoted = vendors.reduce((s, v) => s + (Number(v.quote) || 0), 0)
  const totalPaid   = vendors.reduce((s, v) => s + (Number(v.deposit) || 0), 0)
  const done = tasks.filter(t => t.done === 'true').length
  const pct  = tasks.length ? Math.round(done / tasks.length * 100) : 0

  const STATS = [
    { label:'Days to go',  value:days,                  sub:'23 Jan 2027' },
    { label:'Tasks done',  value:`${done}/${tasks.length}`, sub:`${pct}% complete` },
    { label:'Vendors',     value:vendors.length,         sub:`${vendors.filter(v=>v.status==='Fully Paid').length} fully paid` },
    { label:'Total quoted',value:fmt(totalQuoted),       sub:`Paid: ${fmt(totalPaid)}`, accent:true },
  ]

  return (
    <div className="page-wrap">
      <Nav />
      <div style={{ padding:'1.5rem' }}>
        <p style={{ fontSize:'0.6rem',fontWeight:500,letterSpacing:'0.28em',textTransform:'uppercase',color:'#873632' }}>Welcome, {user?.name || '…'}</p>
        <h1 style={{ fontFamily:'var(--font-cormorant)',fontSize:'1.8rem',fontWeight:400,color:'#62191C',marginBottom:'1.25rem' }}>Dashboard</h1>

        {loading ? <p style={{ color:'rgba(98,25,28,0.45)',fontSize:'0.85rem' }}>Loading…</p> : <>

        {/* Stats */}
        <div style={{ display:'flex',gap:'0.75rem',flexWrap:'wrap',marginBottom:'1.1rem' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background:'#fff',border:'1px solid #E0CFC2',padding:'1rem 1.1rem',flex:1,minWidth:130 }}>
              <div style={{ fontSize:'0.6rem',fontWeight:500,letterSpacing:'0.18em',textTransform:'uppercase',color:'#873632',marginBottom:3 }}>{s.label}</div>
              <div style={{ fontFamily:'var(--font-cormorant)',fontSize:'1.9rem',fontWeight:400,color:s.accent?'#873632':'#62191C',lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:'0.7rem',color:'rgba(98,25,28,0.5)',marginTop:3 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ background:'#fff',border:'1px solid #E0CFC2',padding:'1rem 1.25rem',marginBottom:'1rem' }}>
          <div style={{ display:'flex',justifyContent:'space-between',fontSize:'0.75rem',color:'#873632',marginBottom:5 }}>
            <span>Task progress</span><span>{pct}%</span>
          </div>
          <div style={{ height:5,background:'#E0CFC2',borderRadius:3 }}>
            <div style={{ height:'100%',background:'#873632',borderRadius:3,width:`${pct}%`,transition:'width 0.3s' }}/>
          </div>
        </div>

        {/* Recent activity */}
        <div style={{ background:'#fff',border:'1px solid #E0CFC2',padding:'1rem 1.25rem',marginBottom:'1rem' }}>
          <div style={{ fontSize:'0.75rem',fontWeight:500,color:'#62191C',marginBottom:'0.75rem' }}>Recent activity</div>
          {activity.length === 0
            ? <p style={{ fontSize:'0.8rem',color:'rgba(98,25,28,0.4)' }}>No activity yet.</p>
            : [...activity].reverse().slice(0, 6).map((a, i) => (
              <div key={i} style={{ display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.5rem 0',borderBottom:i<5?'1px solid #E0CFC2':'none' }}>
                <div style={{ width:28,height:28,borderRadius:'50%',background:a.user==='Oreoluwa'?'#873632':'#CAAE9F',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.7rem',fontWeight:600,color:a.user==='Oreoluwa'?'#fff':'#62191C',flexShrink:0 }}>{a.user?.[0]}</div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:'0.78rem',color:'#62191C',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{a.description}</div>
                  <div style={{ fontSize:'0.65rem',color:'rgba(98,25,28,0.45)' }}>{a.user}</div>
                </div>
              </div>
            ))
          }
        </div>

        {/* Vendor status */}
        <div style={{ background:'#fff',border:'1px solid #E0CFC2',padding:'1rem 1.25rem' }}>
          <div style={{ fontSize:'0.75rem',fontWeight:500,color:'#62191C',marginBottom:'0.75rem' }}>Vendor status</div>
          {['Not Contacted','Quoted','Booked','Deposit Paid','Fully Paid'].map(s => (
            <div key={s} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.4rem 0',borderBottom:'1px solid #E0CFC2' }}>
              <span style={{ fontSize:'0.78rem',color:'rgba(98,25,28,0.7)' }}>{s}</span>
              <span style={{ fontSize:'0.75rem',fontWeight:600,color:'#873632',background:'rgba(98,25,28,0.07)',padding:'2px 10px',borderRadius:20 }}>{vendors.filter(v=>v.status===s).length}</span>
            </div>
          ))}
        </div>
        </>}
      </div>
    </div>
  )
}
