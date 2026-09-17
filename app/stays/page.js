'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import { getData, mutate } from '@/lib/sheets'

const TYPES = ['Hotel','Guesthouse','Airbnb','Lodge','B&B','Boutique Hotel','Apartment']
const AREAS = ['Umhlanga','South Beach','North Beach','Ballito','Durban CBD','Berea','La Lucia','Morningside','Other']
const CURRENCIES = ['ZAR','USD','GBP','NGN']
const CURRENCY_SYM = { ZAR:'R', USD:'$', GBP:'£', NGN:'₦' }
const EMPTY = { name:'',type:'Hotel',area:'Umhlanga',priceMin:'',priceMax:'',currency:'ZAR',url:'',description:'',rating:'',imageUrl:'',amenities:'',featured:'false' }

const S = {
  inp: { width:'100%',padding:'0.62rem 0.8rem',border:'1px solid #CAAE9F',fontSize:'0.85rem',color:'#62191C',background:'#FBF6F2',outline:'none' },
  lbl: { display:'block',fontSize:'0.6rem',fontWeight:600,letterSpacing:'0.16em',textTransform:'uppercase',color:'#873632',marginBottom:5 }
}

function Stars({ n }) {
  return <span style={{ color:'#C5973A',fontSize:'0.8rem' }}>{'★'.repeat(Math.min(5,Math.round(Number(n)||0)))}</span>
}

export default function Stays() {
  const [stays,    setStays]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editId,   setEditId]   = useState(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)

  useEffect(() => { getData('stays').then(setStays).finally(()=>setLoading(false)) }, [])

  const filtered = filter==='all' ? stays : stays.filter(s=>s.type===filter||s.area===filter)

  function openAdd()   { setForm({...EMPTY}); setEditId(null); setShowForm(true) }
  function openEdit(s) { setForm({...EMPTY,...s}); setEditId(s.id); setShowForm(true) }

  async function save() {
    if (!form.name.trim()) return
    setSaving(true)
    if (editId) {
      await mutate('updateStay', {...form, id:editId})
      setStays(ss => ss.map(s => s.id===editId ? {...form,id:editId} : s))
    } else {
      const res = await mutate('addStay', form)
      if (res.result) setStays(ss => [...ss, res.result])
    }
    setSaving(false); setShowForm(false)
  }

  async function del(id) {
    if (!confirm('Remove this stay?')) return
    await mutate('deleteStay', {id})
    setStays(ss => ss.filter(s=>s.id!==id))
  }

  const sym = CURRENCY_SYM[form.currency||'ZAR'] || 'R'

  return (
    <div className="page-wrap">
      <Nav/>
      <div style={{ padding:'1.5rem' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem' }}>
          <div>
            <p style={{ fontSize:'0.6rem',fontWeight:500,letterSpacing:'0.28em',textTransform:'uppercase',color:'#873632' }}>Guest Accommodation</p>
            <h1 style={{ fontFamily:'var(--font-cormorant)',fontSize:'1.8rem',fontWeight:400,color:'#62191C' }}>Stays</h1>
          </div>
          <button onClick={openAdd} style={{ padding:'0.6rem 1.1rem',background:'#62191C',color:'#fff',fontSize:'0.65rem',fontWeight:500,letterSpacing:'0.14em',textTransform:'uppercase',border:'none',cursor:'pointer' }}>+ Add</button>
        </div>

        <p style={{ fontSize:'0.75rem',color:'rgba(98,25,28,0.55)',marginBottom:'1rem',lineHeight:1.6 }}>
          Add accommodation options for your guests. These appear on the wedding website travel guide so guests can browse and book directly.
        </p>

        {/* Filters */}
        <div style={{ display:'flex',gap:6,marginBottom:'1.1rem',flexWrap:'wrap' }}>
          {['all',...TYPES.slice(0,4),...AREAS.slice(0,3)].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{ padding:'4px 10px',fontSize:'0.6rem',fontWeight:500,letterSpacing:'0.08em',textTransform:'uppercase',border:'1px solid #CAAE9F',background:filter===f?'#62191C':'#fff',color:filter===f?'#fff':'#873632',cursor:'pointer',borderRadius:20 }}>
              {f==='all'?'All':f}
            </button>
          ))}
        </div>

        {loading ? <p style={{ fontSize:'0.85rem',color:'rgba(98,25,28,0.45)' }}>Loading…</p>
        : filtered.length===0 ? <p style={{ fontSize:'0.85rem',color:'rgba(98,25,28,0.4)',textAlign:'center',padding:'2rem' }}>No stays yet. Add options for your guests!</p>
        : filtered.map(s => (
          <div key={s.id} style={{ background:'#fff',border:'1px solid #E0CFC2',padding:'1rem 1.1rem',marginBottom:'0.75rem' }}>
            <div style={{ display:'flex',alignItems:'flex-start',gap:10 }}>
              {s.imageUrl
                ? <img src={s.imageUrl} alt={s.name} style={{ width:52,height:52,objectFit:'cover',border:'1px solid #E0CFC2',flexShrink:0 }}/>
                : <div style={{ width:52,height:52,background:'#FBF6F2',border:'1px solid #E0CFC2',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem',flexShrink:0 }}>🏨</div>
              }
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:'flex',alignItems:'center',gap:6,flexWrap:'wrap' }}>
                  <span style={{ fontSize:'0.9rem',fontWeight:500,color:'#62191C' }}>{s.name}</span>
                  {s.featured==='true'&&<span style={{ fontSize:'0.58rem',fontWeight:600,background:'#FFF3D4',color:'#8B5E00',padding:'2px 7px',borderRadius:20 }}>Featured</span>}
                  <span style={{ fontSize:'0.6rem',background:'#E0CFC2',color:'#62191C',padding:'2px 8px',borderRadius:20 }}>{s.type}</span>
                  <span style={{ fontSize:'0.6rem',background:'rgba(98,25,28,0.07)',color:'#873632',padding:'2px 8px',borderRadius:20 }}>{s.area}</span>
                </div>
                <div style={{ display:'flex',alignItems:'center',gap:6,marginTop:2 }}>
                  <Stars n={s.rating}/>
                  <span style={{ fontSize:'0.72rem',color:'rgba(98,25,28,0.5)' }}>{CURRENCY_SYM[s.currency]||'R'}{s.priceMin}–{CURRENCY_SYM[s.currency]||'R'}{s.priceMax}/night</span>
                </div>
                {s.description&&<p style={{ fontSize:'0.72rem',color:'rgba(98,25,28,0.55)',marginTop:3,lineHeight:1.5 }}>{s.description}</p>}
                {s.amenities&&<p style={{ fontSize:'0.68rem',color:'rgba(98,25,28,0.4)',marginTop:2 }}>{s.amenities}</p>}
              </div>
              <div style={{ display:'flex',gap:4,flexShrink:0 }}>
                <button onClick={()=>openEdit(s)} style={{ fontSize:'0.65rem',padding:'3px 8px',background:'transparent',border:'1px solid #CAAE9F',color:'#873632',cursor:'pointer' }}>Edit</button>
                <button onClick={()=>del(s.id)} style={{ fontSize:'0.65rem',padding:'3px 8px',background:'transparent',border:'1px solid #e0a0a0',color:'#a03030',cursor:'pointer' }}>Del</button>
              </div>
            </div>
          </div>
        ))}

        {/* Form */}
        {showForm && (
          <div style={{ position:'fixed',inset:0,background:'rgba(98,25,28,0.4)',zIndex:200,display:'flex',alignItems:'flex-end',justifyContent:'center' }} onClick={e=>{if(e.target===e.currentTarget)setShowForm(false)}}>
            <div style={{ background:'#fff',width:'100%',maxWidth:480,maxHeight:'92vh',overflowY:'auto',padding:'1.5rem',borderRadius:'2px 2px 0 0' }}>
              <h3 style={{ fontFamily:'var(--font-cormorant)',fontSize:'1.4rem',color:'#62191C',marginBottom:'1.2rem' }}>{editId?'Edit':'Add'} Stay</h3>

              <div style={{ marginBottom:'0.9rem' }}><label style={S.lbl}>Property name *</label><input style={S.inp} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. The Oyster Box Hotel"/></div>

              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'0.9rem' }}>
                <div><label style={S.lbl}>Type</label><select style={S.inp} value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>{TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                <div><label style={S.lbl}>Area</label><select style={S.inp} value={form.area} onChange={e=>setForm(f=>({...f,area:e.target.value}))}>{AREAS.map(a=><option key={a} value={a}>{a}</option>)}</select></div>
              </div>

              <div style={{ marginBottom:'0.9rem' }}>
                <label style={S.lbl}>Price range per night</label>
                <div style={{ display:'grid',gridTemplateColumns:'90px 1fr 1fr',gap:'0.5rem' }}>
                  <select style={S.inp} value={form.currency} onChange={e=>setForm(f=>({...f,currency:e.target.value}))}>{CURRENCIES.map(c=><option key={c} value={c}>{CURRENCY_SYM[c]} {c}</option>)}</select>
                  <input style={S.inp} type="number" value={form.priceMin} onChange={e=>setForm(f=>({...f,priceMin:e.target.value}))} placeholder="Min"/>
                  <input style={S.inp} type="number" value={form.priceMax} onChange={e=>setForm(f=>({...f,priceMax:e.target.value}))} placeholder="Max"/>
                </div>
              </div>

              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'0.9rem' }}>
                <div><label style={S.lbl}>Star rating (1–5)</label><input style={S.inp} type="number" min="1" max="5" value={form.rating} onChange={e=>setForm(f=>({...f,rating:e.target.value}))} placeholder="e.g. 4"/></div>
                <div><label style={S.lbl}>Featured</label><select style={S.inp} value={form.featured} onChange={e=>setForm(f=>({...f,featured:e.target.value}))}><option value="false">No</option><option value="true">Yes — show first</option></select></div>
              </div>

              <div style={{ marginBottom:'0.9rem' }}><label style={S.lbl}>Booking URL</label><input style={S.inp} value={form.url} onChange={e=>setForm(f=>({...f,url:e.target.value}))} placeholder="https://booking.com/..."/></div>
              <div style={{ marginBottom:'0.9rem' }}><label style={S.lbl}>Image URL (optional)</label><input style={S.inp} value={form.imageUrl} onChange={e=>setForm(f=>({...f,imageUrl:e.target.value}))} placeholder="https://..."/></div>
              <div style={{ marginBottom:'0.9rem' }}><label style={S.lbl}>Description</label><input style={S.inp} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="e.g. Iconic beachfront hotel in Umhlanga…"/></div>
              <div style={{ marginBottom:'1.4rem' }}><label style={S.lbl}>Amenities (comma separated)</label><input style={S.inp} value={form.amenities} onChange={e=>setForm(f=>({...f,amenities:e.target.value}))} placeholder="WiFi, Pool, Restaurant, Spa, Parking"/></div>

              <div style={{ display:'flex',gap:'0.75rem' }}>
                <button onClick={()=>setShowForm(false)} style={{ flex:1,padding:'0.7rem',background:'#FBF6F2',border:'1px solid #CAAE9F',color:'#873632',fontSize:'0.72rem',cursor:'pointer' }}>Cancel</button>
                <button onClick={save} disabled={saving} style={{ flex:2,padding:'0.7rem',background:'#62191C',border:'none',color:'#fff',fontSize:'0.72rem',cursor:'pointer',opacity:saving?0.7:1 }}>{saving?'Saving…':editId?'Save changes':'Add stay'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
