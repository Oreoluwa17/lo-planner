'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import { getData, mutate } from '@/lib/sheets'

const CATEGORIES = ['Kitchen','Bedroom','Bathroom','Living Room','Travel','Tech','Experience','Cash Gift','Other']
const CURRENCIES  = ['ZAR','USD','NGN','GBP']
const CURRENCY_SYMBOLS = { ZAR:'R', USD:'$', NGN:'₦', GBP:'£' }
const STORES = ['Amazon','Zara Home','Woolworths Home','@Home','Checkers','Takealot','IKEA','Other']
const EMPTY = { name:'',store:'',url:'',price:'',currency:'ZAR',category:'Kitchen',imageUrl:'',status:'Available',notes:'' }
const S = {
  inp: { width:'100%',padding:'0.62rem 0.8rem',border:'1px solid #CAAE9F',fontSize:'0.85rem',color:'#62191C',background:'#FBF6F2',outline:'none' },
  lbl: { display:'block',fontSize:'0.6rem',fontWeight:600,letterSpacing:'0.16em',textTransform:'uppercase',color:'#873632',marginBottom:5 }
}

const STATUS_STYLE = {
  'Available': { bg:'rgba(98,25,28,0.06)',color:'#873632' },
  'Purchased': { bg:'rgba(45,106,79,0.1)', color:'#2d6a4f' },
  'Reserved':  { bg:'rgba(158,113,97,0.15)',color:'#9E7161' },
}

export default function Registry() {
  const [items,    setItems]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editId,   setEditId]   = useState(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)

  useEffect(() => { getData('registry').then(setItems).finally(() => setLoading(false)) }, [])

  const cats = ['all', ...CATEGORIES]
  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter)

  const totalItems     = items.length
  const purchasedItems = items.filter(i => i.status === 'Purchased').length

  function openAdd()   { setForm(EMPTY); setEditId(null); setShowForm(true) }
  function openEdit(i) { setForm({...i}); setEditId(i.id); setShowForm(true) }

  async function save() {
    if (!form.name.trim()) return
    setSaving(true)
    if (editId) {
      await mutate('updateRegistry', {...form, id:editId})
      setItems(is => is.map(i => i.id === editId ? {...form, id:editId} : i))
    } else {
      const res = await mutate('addRegistry', form)
      if (res.result) setItems(is => [...is, res.result])
    }
    setSaving(false); setShowForm(false)
  }

  async function del(id) {
    if (!confirm('Remove this item from the registry?')) return
    await mutate('deleteRegistry', {id})
    setItems(is => is.filter(i => i.id !== id))
  }

  async function setStatus(item, status) {
    await mutate('updateRegistry', {...item, status})
    setItems(is => is.map(i => i.id === item.id ? {...i, status} : i))
  }

  function fmtPrice(price, currency) {
    const sym = CURRENCY_SYMBOLS[currency] || currency
    return `${sym}${Math.round(Number(price)||0).toLocaleString()}`
  }

  return (
    <div className="page-wrap">
      <Nav />
      <div style={{ padding:'1.5rem' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem' }}>
          <div>
            <p style={{ fontSize:'0.6rem',fontWeight:500,letterSpacing:'0.28em',textTransform:'uppercase',color:'#873632' }}>Gift List</p>
            <h1 style={{ fontFamily:'var(--font-cormorant)',fontSize:'1.8rem',fontWeight:400,color:'#62191C' }}>Registry</h1>
          </div>
          <button onClick={openAdd} style={{ padding:'0.6rem 1.1rem',background:'#62191C',color:'#fff',fontSize:'0.65rem',fontWeight:500,letterSpacing:'0.14em',textTransform:'uppercase',border:'none',cursor:'pointer' }}>+ Add Gift</button>
        </div>

        {/* Summary */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.6rem',marginBottom:'1rem' }}>
          {[['Total items',totalItems,'#62191C'],['Purchased',purchasedItems,'#2d6a4f'],['Available',totalItems-purchasedItems,'#873632']].map(([l,v,c]) => (
            <div key={l} style={{ background:'#fff',border:'1px solid #E0CFC2',padding:'0.8rem 1rem' }}>
              <div style={{ fontSize:'0.58rem',fontWeight:500,letterSpacing:'0.14em',textTransform:'uppercase',color:'#873632',marginBottom:3 }}>{l}</div>
              <div style={{ fontFamily:'var(--font-cormorant)',fontSize:'1.8rem',fontWeight:400,color:c }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Category filters */}
        <div style={{ display:'flex',gap:6,marginBottom:'1.1rem',flexWrap:'wrap' }}>
          {cats.map(c => (
            <button key={c} onClick={()=>setFilter(c)} style={{ padding:'4px 12px',fontSize:'0.6rem',fontWeight:500,letterSpacing:'0.08em',textTransform:'uppercase',border:'1px solid #CAAE9F',background:filter===c?'#62191C':'#fff',color:filter===c?'#fff':'#873632',cursor:'pointer',borderRadius:20 }}>{c==='all'?'All':c}</button>
          ))}
        </div>

        {loading ? <p style={{ fontSize:'0.85rem',color:'rgba(98,25,28,0.45)' }}>Loading…</p>
        : filtered.length===0 ? <p style={{ fontSize:'0.85rem',color:'rgba(98,25,28,0.4)',textAlign:'center',padding:'2rem' }}>No items yet. Add your first gift!</p>
        : filtered.map(item => {
          const ss = STATUS_STYLE[item.status] || STATUS_STYLE['Available']
          return (
            <div key={item.id} style={{ background:'#fff',border:'1px solid #E0CFC2',padding:'1rem 1.1rem',marginBottom:'0.75rem' }}>
              <div style={{ display:'flex',alignItems:'flex-start',gap:10 }}>
                {/* Image or placeholder */}
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.name} style={{ width:56,height:56,objectFit:'cover',flexShrink:0,border:'1px solid #E0CFC2' }}/>
                  : <div style={{ width:56,height:56,background:'#FBF6F2',border:'1px solid #E0CFC2',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem',flexShrink:0 }}>🎁</div>
                }
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:6 }}>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:'0.9rem',fontWeight:500,color:'#62191C',marginBottom:2 }}>{item.name}</div>
                      <div style={{ display:'flex',alignItems:'center',gap:5,flexWrap:'wrap',marginBottom:3 }}>
                        <span style={{ fontSize:'0.62rem',background:'#FBF6F2',border:'1px solid #E0CFC2',color:'rgba(98,25,28,0.7)',padding:'1px 7px',borderRadius:20 }}>{item.category}</span>
                        <span style={{ fontSize:'0.62rem',color:'rgba(98,25,28,0.5)' }}>{item.store}</span>
                        <span style={{ fontSize:'0.62rem',fontWeight:600,color:ss.color,background:ss.bg,padding:'1px 8px',borderRadius:20 }}>{item.status}</span>
                      </div>
                      {item.notes && <div style={{ fontSize:'0.72rem',color:'rgba(98,25,28,0.5)' }}>{item.notes}</div>}
                    </div>
                    <div style={{ textAlign:'right',flexShrink:0 }}>
                      <div style={{ fontSize:'0.9rem',fontWeight:500,color:'#62191C' }}>{fmtPrice(item.price, item.currency)}</div>
                      {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ fontSize:'0.62rem',color:'#873632',textDecoration:'none',borderBottom:'1px solid #CAAE9F' }}>View →</a>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display:'flex',gap:4,marginTop:8,flexWrap:'wrap' }}>
                    {['Available','Reserved','Purchased'].map(s => (
                      <button key={s} onClick={()=>setStatus(item,s)} style={{ fontSize:'0.58rem',padding:'2px 8px',background:item.status===s?'#62191C':'transparent',color:item.status===s?'#fff':'#873632',border:'1px solid '+(item.status===s?'#62191C':'#CAAE9F'),cursor:'pointer',borderRadius:20 }}>{s}</button>
                    ))}
                    <button onClick={()=>openEdit(item)} style={{ fontSize:'0.58rem',padding:'2px 8px',background:'transparent',border:'1px solid #CAAE9F',color:'#873632',cursor:'pointer',borderRadius:20,marginLeft:'auto' }}>Edit</button>
                    <button onClick={()=>del(item.id)} style={{ fontSize:'0.58rem',padding:'2px 8px',background:'transparent',border:'1px solid #e0a0a0',color:'#a03030',cursor:'pointer',borderRadius:20 }}>Remove</button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {showForm && (
          <div style={{ position:'fixed',inset:0,background:'rgba(98,25,28,0.4)',zIndex:200,display:'flex',alignItems:'flex-end',justifyContent:'center' }} onClick={e=>{if(e.target===e.currentTarget)setShowForm(false)}}>
            <div style={{ background:'#fff',width:'100%',maxWidth:480,maxHeight:'92vh',overflowY:'auto',padding:'1.5rem',borderRadius:'2px 2px 0 0' }}>
              <h3 style={{ fontFamily:'var(--font-cormorant)',fontSize:'1.4rem',color:'#62191C',marginBottom:'1.2rem' }}>{editId?'Edit':'Add'} Gift Item</h3>

              <div style={{ marginBottom:'0.9rem' }}><label style={S.lbl}>Item name *</label><input style={S.inp} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. KitchenAid Stand Mixer"/></div>

              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'0.9rem' }}>
                <div><label style={S.lbl}>Store</label><select style={S.inp} value={form.store} onChange={e=>setForm(f=>({...f,store:e.target.value}))}>{STORES.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                <div><label style={S.lbl}>Category</label><select style={S.inp} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>{CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
              </div>

              <div style={{ marginBottom:'0.9rem' }}>
                <label style={S.lbl}>Price</label>
                <div style={{ display:'grid',gridTemplateColumns:'100px 1fr',gap:'0.5rem' }}>
                  <select style={S.inp} value={form.currency} onChange={e=>setForm(f=>({...f,currency:e.target.value}))}>
                    {CURRENCIES.map(c=><option key={c} value={c}>{CURRENCY_SYMBOLS[c]} {c}</option>)}
                  </select>
                  <input style={S.inp} type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="0"/>
                </div>
              </div>

              <div style={{ marginBottom:'0.9rem' }}><label style={S.lbl}>Store link (URL)</label><input style={S.inp} value={form.url} onChange={e=>setForm(f=>({...f,url:e.target.value}))} placeholder="https://www.amazon.com/..."/></div>
              <div style={{ marginBottom:'0.9rem' }}><label style={S.lbl}>Image URL (optional)</label><input style={S.inp} value={form.imageUrl} onChange={e=>setForm(f=>({...f,imageUrl:e.target.value}))} placeholder="https://..."/></div>
              <div style={{ marginBottom:'0.9rem' }}><label style={S.lbl}>Status</label><select style={S.inp} value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>{['Available','Reserved','Purchased'].map(s=><option key={s} value={s}>{s}</option>)}</select></div>
              <div style={{ marginBottom:'1.4rem' }}><label style={S.lbl}>Notes</label><input style={S.inp} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Colour preference, size, etc."/></div>

              <div style={{ display:'flex',gap:'0.75rem' }}>
                <button onClick={()=>setShowForm(false)} style={{ flex:1,padding:'0.7rem',background:'#FBF6F2',border:'1px solid #CAAE9F',color:'#873632',fontSize:'0.72rem',cursor:'pointer' }}>Cancel</button>
                <button onClick={save} disabled={saving} style={{ flex:2,padding:'0.7rem',background:'#62191C',border:'none',color:'#fff',fontSize:'0.72rem',cursor:'pointer',opacity:saving?0.7:1 }}>{saving?'Saving…':editId?'Save changes':'Add to registry'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
