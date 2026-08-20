'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import { getData } from '@/lib/sheets'

function timeAgo(ts) {
  if (!ts) return ''
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(ts).toLocaleDateString('en-ZA', {day:'numeric', month:'short'})
}

export default function Activity() {
  const [activity, setActivity] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('all')

  useEffect(() => {
    getData('activity')
      .then(a => setActivity([...a].reverse()))
      .finally(() => setLoading(false))
  }, [])

  const users    = [...new Set(activity.map(a => a.user).filter(Boolean))]
  const filtered = filter === 'all' ? activity : activity.filter(a => a.user === filter)

  return (
    <div className="page-wrap">
      <Nav />
      <div style={{padding:'1.5rem'}}>
        <p style={{fontSize:'0.6rem',fontWeight:500,letterSpacing:'0.28em',textTransform:'uppercase',color:'#873632'}}>Log</p>
        <h1 style={{fontFamily:'var(--font-cormorant)',fontSize:'1.8rem',fontWeight:400,color:'#62191C',marginBottom:'1.25rem'}}>Activity</h1>

        <div style={{display:'flex',gap:6,marginBottom:'1.1rem',flexWrap:'wrap'}}>
          {['all', ...users].map(u => (
            <button key={u} onClick={()=>setFilter(u)} style={{padding:'4px 14px',fontSize:'0.62rem',fontWeight:500,letterSpacing:'0.1em',textTransform:'uppercase',border:'1px solid #CAAE9F',background:filter===u?'#62191C':'#fff',color:filter===u?'#fff':'#873632',cursor:'pointer',borderRadius:20}}>
              {u === 'all' ? 'Everyone' : u}
            </button>
          ))}
        </div>

        {loading ? <p style={{fontSize:'0.85rem',color:'rgba(98,25,28,0.45)'}}>Loading…</p>
        : filtered.length === 0 ? <p style={{fontSize:'0.85rem',color:'rgba(98,25,28,0.4)',textAlign:'center',padding:'3rem'}}>No activity yet.</p>
        : (
          <div style={{background:'#fff',border:'1px solid #E0CFC2'}}>
            {filtered.map((a, i) => (
              <div key={i} style={{display:'flex',alignItems:'flex-start',gap:'0.85rem',padding:'0.9rem 1.1rem',borderBottom:i<filtered.length-1?'1px solid #E0CFC2':'none'}}>
                <div style={{width:34,height:34,borderRadius:'50%',background:a.user==='Oreoluwa'?'#873632':'#CAAE9F',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.8rem',fontWeight:600,color:a.user==='Oreoluwa'?'#fff':'#62191C',flexShrink:0}}>
                  {a.user?.[0] || '?'}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8}}>
                    <span style={{fontSize:'0.82rem',fontWeight:500,color:'#62191C'}}>{a.user}</span>
                    <span style={{fontSize:'0.7rem',color:'rgba(98,25,28,0.4)',flexShrink:0}}>{timeAgo(a.timestamp)}</span>
                  </div>
                  <p style={{fontSize:'0.8rem',color:'rgba(98,25,28,0.7)',marginTop:2,lineHeight:1.4}}>{a.description}</p>
                  <p style={{fontSize:'0.65rem',color:'rgba(98,25,28,0.35)',marginTop:2}}>
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
