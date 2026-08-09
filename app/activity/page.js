'use client'
import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import { getData } from '@/lib/sheets'

const C = { maroon:'#62191C', rust:'#873632', blush:'#CAAE9F', beige:'#E0CFC2', cream:'#FBF6F2', white:'#fff' }

const ACTION_ICONS = {
  addVendor:'➕', updateVendor:'✏️', deleteVendor:'🗑️',
  addTask:'📋', toggleTask:'✅', deleteTask:'🗑️',
  addBudget:'💰', deleteBudget:'🗑️',
}

function timeAgo(ts) {
  if (!ts) return ''
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff/60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins/60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(ts).toLocaleDateString('en-ZA',{day:'numeric',month:'short'})
}

export default function Activity() {
  const [activity, setActivity] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')

  useEffect(() => { getData('activity').then(a => setActivity([...a].reverse())).finally(()=>setLoading(false)) }, [])

  const filtered = filter==='all' ? activity : activity.filter(a=>a.user===filter)
  const users = [...new Set(activity.map(a=>a.user).filter(Boolean))]

  return (
    <div className="page-wrap">
      <Nav/>
      <div style={{ padding:'1.5rem' }}>
        <div style={{ marginBottom:'1.25rem' }}>
          <p style={{ fontSize:'0.6rem', fontWeight:500, letterSpacing:'0.28em', textTransform:'uppercase', color:C.rust }}>Log</p>
          <h1 style={{ fontFamily:'var(--font-cormorant)', fontSize:'1.8rem', fontWeight:400, color:C.maroon }}>Activity</h1>
        </div>

        {/* User filter */}
        <div style={{ display:'flex', gap:'6px', marginBottom:'1.1rem', flexWrap:'wrap' }}>
          {['all',...users].map(u => (
            <button key={u} onClick={()=>setFilter(u)}
              style={{ padding:'4px 14px', fontSize:'0.62rem', fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', border:'1px solid '+C.blush, background:filter===u?C.maroon:C.white, color:filter===u?'#fff':C.rust, cursor:'pointer', borderRadius:20 }}>
              {u==='all'?'Everyone':u}
            </button>
          ))}
        </div>

        {loading ? <p style={{ fontSize:'0.85rem', color:'rgba(98,25,28,0.45)' }}>Loading…</p>
        : filtered.length===0 ? <p style={{ fontSize:'0.85rem', color:'rgba(98,25,28,0.4)', textAlign:'center', padding:'3rem' }}>No activity yet.</p>
        : (
          <div style={{ background:C.white, border:'1px solid '+C.beige }}>
            {filtered.map((a,i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'0.85rem', padding:'0.9rem 1.1rem', borderBottom:i<filtered.length-1?'1px solid '+C.beige:'none' }}>
                {/* Avatar */}
                <div style={{ width:34, height:34, borderRadius:'50%', background:a.user==='Oreoluwa'?C.rust:C.blush, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:600, color:a.user==='Oreoluwa'?'#fff':C.maroon, flexShrink:0 }}>
                  {a.user?.[0]||'?'}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'0.5rem' }}>
                    <div>
                      <span style={{ fontSize:'0.82rem', fontWeight:500, color:C.maroon }}>{a.user}</span>
                      <span style={{ fontSize:'0.72rem', color:'rgba(98,25,28,0.5)' }}> · {timeAgo(a.timestamp)}</span>
                    </div>
                    <span style={{ fontSize:'1rem', flexShrink:0 }}>{ACTION_ICONS[a.action]||'📝'}</span>
                  </div>
                  <p style={{ fontSize:'0.8rem', color:'rgba(98,25,28,0.7)', marginTop:'2px', lineHeight:1.4 }}>{a.description}</p>
                  <p style={{ fontSize:'0.65rem', color:'rgba(98,25,28,0.35)', marginTop:'2px' }}>
                    {a.timestamp ? new Date(a.timestamp).toLocaleString('en-ZA',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
