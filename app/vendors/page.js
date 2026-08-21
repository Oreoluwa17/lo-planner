'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import { getData, mutate } from '@/lib/sheets'

const STATUSES   = ['Not Contacted','Quoted','Booked','Deposit Paid','Fully Paid']
const CURRENCIES = ['ZAR','USD','NGN','GBP']
const CURRENCY_SYMBOLS = { ZAR:'R', USD:'$', NGN:'₦', GBP:'£' }
const STATUS_COLOR = { 'Not Contacted':'rgba(98,25,28,0.4)','Quoted':'#9E7161','Booked':'#873632','Deposit Paid':'#873632','Fully Paid':'#2d6a4f' }
const EMPTY = { name:'',cat:'',day:'church',contact:'',phone:'',quote:'',currency:'ZAR',deposit:'',status:'Not Contacted',notes:'' }
const S = {
  inp: { width:'100%',padding:'0.62rem 0.8rem',border:'1px solid #CAAE9F',fontSize:'0.85rem',color:'#62191C',background:'#FBF6F2',outline:'none' },
  lbl: { display:'block',fontSize:'0.6rem',fontWeight:600,letterSpacing:'0.16em',textTransform:'uppercase',color:'#873632',marginBottom:5 }
}

function fmtZAR(n) { return 'R ' + Math.round(Number(n)||0).toLocaleString() }
function fmtOrig(amount, currency) {
  const sym = CURRENCY_SYMBOLS[currency] || currency
  return `${sym}${Math.round(Number(amount)||0).toLocaleString()}`
}

export default function Vendors() {
  const [vendors,  setVendors]  = useState([])
  const [rates,    setRates]    = useState({ ZAR:1, USD:0.054, NGN:88.5, GBP:0.043 })
  const [rateInfo, setRateInfo] = useState('')
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editId,   setEditId]   = useState(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)

  useEffect(() => {
    getData('vendors').then(setVendors).finally(() => setLoading(false))
    fetch('/api/rates').then(r => r.json()).then(d => {
      setRates(d.rates)
      if (d.fallback) setRateInfo('Using estimated rates')
      else if (d.updated) setRateInfo(`Rates: ${new Date(d.updated).toLocaleDateString()}`)
    }).catch(() => {})
  }, [])

  function toZAR(amount, currency) {
    const rate = rates[currency] || 1
    return Number(amount) / rate
  }

  const filtered = filter === 'all' ? vendors : vendors.filter(v => v.day === filter)
  const totalQuotedZAR = vendors.reduce((s,v) => s + toZAR(v.quote, v.currency||'ZAR'), 0)
  const totalPaidZAR   = vendors.reduce((s,v) => s + toZAR(v.deposit, v.currency||'ZAR'), 0)

  function openAdd() {
    setForm({...EMPTY})
    setEditId(null)
    setShowForm(true)
  }

  function openEdit(v) {
    // Always ensure currency is set — fixes the ZAR reset bug
    setForm({
      ...EMPTY,
      ...v,
      currency: v.currency && CURRENCIES.includes(v.currency) ? v.currency : 'ZAR',
    })
    setEditId(v.id)
    setShowForm(true)
  }

  async function save() {
    if (!form.name.trim()) return
    setSaving(true)
    if (editId) {
      await mutate('updateVendor', {...form, id: editId})
      setVendors(vs => vs.map(v => v.id === editId ? {...form, id:editId} : v))
    } else {
      const res = await mutate('addVendor', form)
      if (res.result) setVendors(vs => [...vs, res.result])
    }
    setSaving(false); setShowForm(false)
  }

  async function del(id) {
    if (!confirm('Delete this vendor?')) return
    await mutate('deleteVendor', {id})
    setVendors(vs => vs.filter(v => v.id !== id))
  }

  return (
    <div className="page-wrap">
      <Nav />
      <div style={{ padding:'1.5rem' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem' }}>
          <div>
            <p style={{ fontSize:'0.6rem',fontWeight:500,letterSpacing:'0.28em',textTransform:'uppercase',color:'#873632' }}>Manage</p>
            <h1 style={{ fontFamily:'var(--font-cormorant)',fontSize:'1.8rem',fontWeight:400,color:'#62191C' }}>Vendors</h1>
          </div>
          <button onClick={openAdd} style={{ padding:'0.6rem 1.1rem',background:'#62191C',color:'#fff',fontSize:'0.65rem',fontWeight:500,letterSpacing:'0.14em',textTransform:'uppercase',border:'none',cursor:'pointer' }}>+ Add</button>
        </div>

        {/* Totals */}
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'1rem' }}>
          <div style={{ background:'#fff',border:'1px solid #E0CFC2',padding:'0.9rem 1rem' }}>
            <div style={{ fontSize:'0.6rem',fontWeight:500,letterSpacing:'0.16em',textTransform:'uppercase',color:'#873632',marginBottom:3 }}>Total quoted (ZAR)</div>
            <div style={{ fontFamily:'var(--font-cormorant)',fontSize:'1.5rem',fontWeight:400,color:'#62191C' }}>{fmtZAR(totalQuotedZAR)}</div>
          </div>
          <div style={{ background:'#fff',border:'1px solid #E0CFC2',padding:'0.9rem 1rem' }}>
            <div style={{ fontSize:'0.6rem',fontWeight:500,letterSpacing:'0.16em',textTransform:'uppercase',color:'#873632',marginBottom:3 }}>Total paid (ZAR)</div>
            <div style={{ fontFamily:'var(--font-cormorant)',fontSize:'1.5rem',fontWeight:400,color:'#2d6a4f' }}>{fmtZAR(totalPaidZAR)}</div>
          </div>
        </div>

        {rateInfo && <p style={{ fontSize:'0.65rem',color:'rgba(98,25,28,0.4)',marginBottom:'0.75rem',textAlign:'center' }}>{rateInfo}</p>}

        {/* Filters */}
        <div style={{ display:'flex',gap:6,marginBottom:'1.1rem',flexWrap:'wrap' }}>
          {['all','traditional','church','general'].map(f => (
            <button key={f} onClick={()=>setFilter(f)} style={{ padding:'4px 12px',fontSize:'0.62rem',fontWeight:500,letterSpacing:'0.1em',textTransform:'uppercase',border:'1px solid #CAAE9F',background:filter===f?'#62191C':'#fff',color:filter===f?'#fff':'#873632',cursor:'pointer',borderRadius:20 }}>
              {f==='all'?'All':f}
            </button>
          ))}
        </div>

        {loading ? <p style={{ fontSize:'0.85rem',color:'rgba(98,25,28,0.45)' }}>Loading…</p>
        : filtered.length===0 ? <p style={{ fontSize:'0.85rem',color:'rgba(98,25,28,0.4)',textAlign:'center',padding:'2rem' }}>No vendors yet.</p>
        : filtered.map(v => {
          const cur = (v.currency && CURRENCIES.includes(v.currency)) ? v.currency : 'ZAR'
          const quoteZAR   = toZAR(v.quote, cur)
          const depositZAR = toZAR(v.deposit, cur)

          return (
            <div key={v.id} style={{ background:'#fff',border:'1px solid #E0CFC2',padding:'1rem 1.1rem',marginBottom:'0.75rem' }}>
              <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8 }}>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:6,flexWrap:'wrap' }}>
                    <span style={{ fontSize:'0.92rem',fontWeight:500,color:'#62191C' }}>{v.name}</span>
                    <span style={{ fontSize:'0.62rem',fontWeight:600,color:STATUS_COLOR[v.status],background:'rgba(98,25,28,0.07)',padding:'2px 8px',borderRadius:20 }}>{v.status}</span>
                    <span style={{ fontSize:'0.6rem',background:'#E0CFC2',color:'#62191C',padding:'2px 8px',borderRadius:20 }}>{v.day}</span>
                    {cur !== 'ZAR' && <span style={{ fontSize:'0.6rem',background:'#FBF6F2',border:'1px solid #CAAE9F',color:'#873632',padding:'2px 8px',borderRadius:20 }}>{cur}</span>}
                  </div>
                  <div style={{ fontSize:'0.75rem',color:'rgba(98,25,28,0.6)',marginTop:2 }}>{v.cat}{v.contact?' · '+v.contact:''}</div>
                  {v.phone&&<div style={{ fontSize:'0.72rem',color:'rgba(98,25,28,0.45)' }}>{v.phone}</div>}
                  {v.notes&&<div style={{ fontSize:'0.72rem',color:'rgba(98,25,28,0.55)',marginTop:4 }}>{v.notes}</div>}
                </div>
                <div style={{ textAlign:'right',flexShrink:0 }}>
                  <div style={{ fontSize:'0.88rem',fontWeight:500,color:'#62191C' }}>{fmtZAR(quoteZAR)}</div>
                  {cur !== 'ZAR' && v.quote && <div style={{ fontSize:'0.68rem',color:'rgba(98,25,28,0.45)' }}>{fmtOrig(v.quote, cur)}</div>}
                  <div style={{ fontSize:'0.7rem',color:'#2d6a4f' }}>Paid: {fmtZAR(depositZAR)}</div>
                  <div style={{ display:'flex',gap:4,marginTop:6,justifyContent:'flex-end' }}>
                    <button onClick={()=>openEdit(v)} style={{ fontSize:'0.65rem',padding:'3px 8px',background:'transparent',border:'1px solid #CAAE9F',color:'#873632',cursor:'pointer' }}>Edit</button>
                    <button onClick={()=>del(v.id)} style={{ fontSize:'0.65rem',padding:'3px 8px',background:'transparent',border:'1px solid #e0a0a0',color:'#a03030',cursor:'pointer' }}>Del</button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Form */}
        {showForm && (
          <div style={{ position:'fixed',inset:0,background:'rgba(98,25,28,0.4)',zIndex:200,display:'flex',alignItems:'flex-end',justifyContent:'center' }} onClick={e=>{if(e.target===e.currentTarget)setShowForm(false)}}>
            <div style={{ background:'#fff',width:'100%',maxWidth:480,maxHeight:'92vh',overflowY:'auto',padding:'1.5rem',borderRadius:'2px 2px 0 0' }}>
              <h3 style={{ fontFamily:'var(--font-cormorant)',fontSize:'1.4rem',color:'#62191C',marginBottom:'1.2rem' }}>{editId?'Edit':'Add'} Vendor</h3>

              <div style={{ marginBottom:'0.9rem' }}><label style={S.lbl}>Vendor name *</label><input style={S.inp} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Flowers by Grace"/></div>

              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'0.9rem' }}>
                <div><label style={S.lbl}>Category</label><input style={S.inp} value={form.cat} onChange={e=>setForm(f=>({...f,cat:e.target.value}))} placeholder="e.g. Décor"/></div>
                <div><label style={S.lbl}>Day</label><select style={S.inp} value={form.day} onChange={e=>setForm(f=>({...f,day:e.target.value}))}>{['traditional','church','general'].map(d=><option key={d} value={d}>{d}</option>)}</select></div>
              </div>

              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'0.9rem' }}>
                <div><label style={S.lbl}>Email</label><input style={S.inp} value={form.contact} onChange={e=>setForm(f=>({...f,contact:e.target.value}))} placeholder="email@vendor.com"/></div>
                <div><label style={S.lbl}>Phone</label><input style={S.inp} value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+27 00 000 0000"/></div>
              </div>

              {/* Quote with currency — key fix: value always set explicitly */}
              <div style={{ marginBottom:'0.9rem' }}>
                <label style={S.lbl}>Quote amount</label>
                <div style={{ display:'grid',gridTemplateColumns:'110px 1fr',gap:'0.5rem' }}>
                  <select
                    style={S.inp}
                    value={form.currency || 'ZAR'}
                    onChange={e => setForm(f => ({...f, currency: e.target.value}))}
                  >
                    {CURRENCIES.map(c => (
                      <option key={c} value={c}>{CURRENCY_SYMBOLS[c]} {c}</option>
                    ))}
                  </select>
                  <input
                    style={S.inp}
                    type="number"
                    value={form.quote}
                    onChange={e => setForm(f => ({...f, quote: e.target.value}))}
                    placeholder="0"
                  />
                </div>
                {form.currency && form.currency !== 'ZAR' && form.quote && (
                  <div style={{ fontSize:'0.7rem',color:'rgba(98,25,28,0.55)',marginTop:4 }}>
                    ≈ {fmtZAR(toZAR(form.quote, form.currency))} at current rates
                  </div>
                )}
              </div>

              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'0.9rem' }}>
                <div>
                  <label style={S.lbl}>Deposit paid ({CURRENCY_SYMBOLS[form.currency||'ZAR']})</label>
                  <input style={S.inp} type="number" value={form.deposit} onChange={e=>setForm(f=>({...f,deposit:e.target.value}))} placeholder="0"/>
                </div>
                <div>
                  <label style={S.lbl}>Status</label>
                  <select style={S.inp} value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                    {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom:'1.4rem' }}><label style={S.lbl}>Notes</label><input style={S.inp} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Any notes…"/></div>

              <div style={{ display:'flex',gap:'0.75rem' }}>
                <button onClick={()=>setShowForm(false)} style={{ flex:1,padding:'0.7rem',background:'#FBF6F2',border:'1px solid #CAAE9F',color:'#873632',fontSize:'0.72rem',cursor:'pointer' }}>Cancel</button>
                <button onClick={save} disabled={saving} style={{ flex:2,padding:'0.7rem',background:'#62191C',border:'none',color:'#fff',fontSize:'0.72rem',cursor:'pointer',opacity:saving?0.7:1 }}>
                  {saving?'Saving…':editId?'Save changes':'Add vendor'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
