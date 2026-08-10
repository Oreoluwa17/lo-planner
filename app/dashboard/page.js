'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Nav from '@/components/Nav'
import { getData } from '@/lib/sheets'

const C = { maroon:'#62191C', rust:'#873632', blush:'#CAAE9F', beige:'#E0CFC2', cream:'#FBF6F2', white:'#fff' }
const WEDDING = new Date('2027-01-23T14:00:00')
const fmt = n => 'R ' + Math.round(Number(n)||0).toLocaleString()

function Card({ label, value, sub, color }) {
  return (
    <div style={{ background:C.white, border:'1px solid '+C.beige, padding:'1rem 1.1rem', flex:1, minWidth:130 }}>
      <div style={{ fontSize:'0.6rem', fontWeight:500, letterSpacing:'0.18em', textTransform:'uppercase', color:C.rust, marginBottom:'3px' }}>{label}</div>
      <div style={{ fontFamily:'var(--font-cormorant)', fontSize:'1.9rem', fontWeight:400, color:color||C.maroon, lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:'0.7rem', color:'rgba(98,25,28,0.5)', marginTop:'3px' }}>{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const { data:session } = useSession()
  const [vendors, setVendors]   = useState([])
  const [tasks, setTasks]       = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading]   = useState(true)
  const days = Math.max(0, Math.ceil((WEDDING - Date.now()) / 86400000))

  useEffect(() => {
    Promise.all([getData('vendors'), getData('tasks'), getData('activity')])
      .then(([v,t,a]) => { setVendors(v); setTasks(t); setActivity(a) })
      .finally(() => setLoading(false))
  }, [])

  const totalQuoted = vendors.reduce((s,v)=>s+(Number(v.quote)||0),0)
  const totalPaid   = vendors.reduce((s,v)=>s+(Number(v.deposit)||0),0)
  const done = tasks.filter(t=>t.done==='true').length
  const pct  = tasks.length ? Math.round(done/tasks.length*100) : 0

  return (
    <div className="page-wrap">
      <Nav/>
      <div style={{ padding:'1.5rem' }}>
        <p style={{ fontSize:'0.6rem', fontWeight:500, letterSpacing:'0.28em', textTransform:'uppercase', color:C.rust }}>Welcome, {session?.user?.name}</p>
        <h1 style={{ fontFamily:'var(--font-cormorant)', fontSize:'1.8rem', fontWeight:400, color:C.maroon, marginBottom:'1.25rem' }}>Dashboard</h1>

        {loading ? <p style={{ color:'rgba(98,25,28,0.45)', fontSize:'0.85rem' }}>Loading…</p> : <>
        <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', marginBottom:'1.1rem' }}>
          <Card label="Days to go" value={days} sub="23 Jan 2027"/>
          <Card label="Tasks done" value={`${done}/${tasks.length}`} sub={`${pct}% complete`}/>
          <Card label="Vendors" value={vendors.length} sub={`${vendors.filter(v=>v.status==='Fully Paid').length} fully paid`}/>
          <Card label="Quoted" value={fmt(totalQuoted)} sub={`Paid: ${fmt(totalPaid)}`} color={C.rust}/>
        </div>

        <div style={{ background:C.white, border:'1px solid '+C.beige, padding:'1rem 1.25rem', marginBottom:'1rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:C.rust, marginBottom:'5px' }}>
            <span>Task progress</span><span>{pct}%</span>
          </div>
          <div style={{ height:5, background:C.beige, borderRadius:3 }}>
            <div style={{ height:'100%', background:C.rust, borderRadius:3, width:`${pct}%`, transition:'width 0.3s' }}/>
          </div>
        </div>

        <div style={{ background:C.white, border:'1px solid '+C.beige, padding:'1rem 1.25rem', marginBottom:'1rem' }}>
          <div style={{ fontSize:'0.75rem', fontWeight:500, color:C.maroon, marginBottom:'0.75rem' }}>Recent activity</div>
          {activity.length===0 ? <p style={{ fontSize:'0.8rem', color:'rgba(98,25,28,0.4)' }}>No activity yet.</p>
          : [...activity].reverse().slice(0,6).map((a,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.5rem 0', borderBottom:i<5?'1px solid '+C.beige:'none' }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:a.user==='Oreoluwa'?C.rust:C.blush, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', fontWeight:600, color:a.user==='Oreoluwa'?'#fff':C.maroon, flexShrink:0 }}>{a.user?.[0]}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:'0.78rem', color:C.maroon, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.description}</div>
                <div style={{ fontSize:'0.65rem', color:'rgba(98,25,28,0.45)' }}>{a.user} · {a.timestamp ? new Date(a.timestamp).toLocaleDateString('en-ZA',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : ''}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background:C.white, border:'1px solid '+C.beige, padding:'1rem 1.25rem' }}>
          <div style={{ fontSize:'0.75rem', fontWeight:500, color:C.maroon, marginBottom:'0.75rem' }}>Vendor status</div>
          {['Not Contacted','Quoted','Booked','Deposit Paid','Fully Paid'].map(s => (
            <div key={s} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.4rem 0', borderBottom:'1px solid '+C.beige }}>
              <span style={{ fontSize:'0.78rem', color:'rgba(98,25,28,0.7)' }}>{s}</span>
              <span style={{ fontSize:'0.75rem', fontWeight:600, color:C.rust, background:'rgba(98,25,28,0.07)', padding:'2px 10px', borderRadius:20 }}>{vendors.filter(v=>v.status===s).length}</span>
            </div>
          ))}
        </div>
        </>}
      </div>
    </div>
  )
}
