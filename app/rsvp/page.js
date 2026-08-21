'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'

export default function RSVP() {
  const [guests,  setGuests]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [filter,  setFilter]  = useState('all')
  const [search,  setSearch]  = useState('')

  useEffect(() => {
    fetch('/api/rsvp')
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setGuests(d.data || [])
      })
      .catch(() => setError('Failed to load RSVP list.'))
      .finally(() => setLoading(false))
  }, [])

  const accepting  = guests.filter(g => g.attending === 'Joyfully accepts')
  const declining  = guests.filter(g => g.attending === 'Regretfully declines')
  const totalGuests = accepting.reduce((s,g) => s + (Number(g.guests)||1), 0)

  const filtered = guests
    .filter(g => filter === 'all' || (filter === 'attending' ? g.attending === 'Joyfully accepts' : g.attending === 'Regretfully declines'))
    .filter(g => !search || g.name?.toLowerCase().includes(search.toLowerCase()) || g.email?.toLowerCase().includes(search.toLowerCase()))

  function fmt(ts) {
    if (!ts) return ''
    return new Date(ts).toLocaleDateString('en-ZA', { day:'numeric', month:'short', year:'numeric' })
  }

  return (
    <div className="page-wrap">
      <Nav />
      <div style={{ padding:'1.5rem' }}>
        <div style={{ marginBottom:'1.25rem' }}>
          <p style={{ fontSize:'0.6rem',fontWeight:500,letterSpacing:'0.28em',textTransform:'uppercase',color:'#873632' }}>Guest List</p>
          <h1 style={{ fontFamily:'var(--font-cormorant)',fontSize:'1.8rem',fontWeight:400,color:'#62191C' }}>RSVPs</h1>
        </div>

        {/* Summary cards */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.6rem',marginBottom:'1.1rem' }}>
          {[
            ['Total RSVPs',  guests.length,   '#62191C'],
            ['Attending',    accepting.length, '#2d6a4f'],
            ['Declining',    declining.length, '#873632'],
          ].map(([l,v,c]) => (
            <div key={l} style={{ background:'#fff',border:'1px solid #E0CFC2',padding:'0.8rem 0.9rem' }}>
              <div style={{ fontSize:'0.58rem',fontWeight:500,letterSpacing:'0.14em',textTransform:'uppercase',color:'#873632',marginBottom:3 }}>{l}</div>
              <div style={{ fontFamily:'var(--font-cormorant)',fontSize:'1.8rem',fontWeight:400,color:c }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Total guests attending */}
        <div style={{ background:'#62191C',padding:'0.8rem 1.1rem',marginBottom:'1.1rem',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <span style={{ fontSize:'0.72rem',fontWeight:500,letterSpacing:'0.1em',textTransform:'uppercase',color:'rgba(255,255,255,0.7)' }}>Total guests attending (incl. +1s)</span>
          <span style={{ fontFamily:'var(--font-cormorant)',fontSize:'1.8rem',fontWeight:300,color:'#fff' }}>{totalGuests}</span>
        </div>

        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          style={{ width:'100%',padding:'0.65rem 0.9rem',border:'1px solid #CAAE9F',fontSize:'0.85rem',color:'#62191C',background:'#fff',outline:'none',marginBottom:'0.9rem' }}
        />

        {/* Filters */}
        <div style={{ display:'flex',gap:6,marginBottom:'1.1rem' }}>
          {[['all','All'],['attending','Attending'],['declining','Declining']].map(([val,label]) => (
            <button key={val} onClick={()=>setFilter(val)} style={{ padding:'4px 14px',fontSize:'0.62rem',fontWeight:500,letterSpacing:'0.1em',textTransform:'uppercase',border:'1px solid #CAAE9F',background:filter===val?'#62191C':'#fff',color:filter===val?'#fff':'#873632',cursor:'pointer',borderRadius:20 }}>
              {label}
            </button>
          ))}
        </div>

        {loading ? <p style={{ fontSize:'0.85rem',color:'rgba(98,25,28,0.45)' }}>Loading…</p>
        : error ? (
          <div style={{ background:'#fff',border:'1px solid #E0CFC2',padding:'1.5rem',textAlign:'center' }}>
            <p style={{ fontSize:'0.85rem',color:'#873632',marginBottom:'0.5rem' }}>{error}</p>
            <p style={{ fontSize:'0.75rem',color:'rgba(98,25,28,0.5)' }}>Make sure RSVP_SCRIPT_URL is set in Vercel and the Apps Script supports getGuests.</p>
          </div>
        )
        : filtered.length===0 ? <p style={{ fontSize:'0.85rem',color:'rgba(98,25,28,0.4)',textAlign:'center',padding:'2rem' }}>No RSVPs yet.</p>
        : (
          <div style={{ background:'#fff',border:'1px solid #E0CFC2' }}>
            {filtered.map((g, i) => {
              const attending = g.attending === 'Joyfully accepts'
              return (
                <div key={i} style={{ display:'flex',alignItems:'flex-start',gap:'0.85rem',padding:'0.9rem 1.1rem',borderBottom:i<filtered.length-1?'1px solid #E0CFC2':'none' }}>
                  {/* Avatar */}
                  <div style={{ width:36,height:36,borderRadius:'50%',background:attending?'rgba(45,106,79,0.12)':'rgba(98,25,28,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem',fontWeight:600,color:attending?'#2d6a4f':'#873632',flexShrink:0 }}>
                    {g.name?.[0]?.toUpperCase()||'?'}
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap' }}>
                      <span style={{ fontSize:'0.88rem',fontWeight:500,color:'#62191C' }}>{g.name}</span>
                      <span style={{ fontSize:'0.6rem',fontWeight:600,padding:'2px 8px',borderRadius:20,background:attending?'rgba(45,106,79,0.1)':'rgba(98,25,28,0.07)',color:attending?'#2d6a4f':'#873632' }}>
                        {attending ? '✓ Attending' : '✗ Declining'}
                      </span>
                      {attending && g.guests && Number(g.guests) > 1 && (
                        <span style={{ fontSize:'0.6rem',color:'rgba(98,25,28,0.5)' }}>+{Number(g.guests)-1} guest{Number(g.guests)>2?'s':''}</span>
                      )}
                    </div>
                    <div style={{ fontSize:'0.72rem',color:'rgba(98,25,28,0.55)',marginTop:2 }}>{g.email}{g.phone?' · '+g.phone:''}</div>
                    {g.message && <div style={{ fontSize:'0.72rem',color:'rgba(98,25,28,0.6)',marginTop:4,fontStyle:'italic' }}>"{g.message}"</div>}
                    <div style={{ fontSize:'0.65rem',color:'rgba(98,25,28,0.35)',marginTop:3 }}>{fmt(g.timestamp)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
