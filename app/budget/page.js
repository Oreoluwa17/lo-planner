'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import Nav from '@/components/Nav'
import { getData, mutate } from '@/lib/sheets'

const fmt = n => 'R ' + Math.round(Number(n) || 0).toLocaleString()
const S = {
  inp: { width:'100%', padding:'0.62rem 0.8rem', border:'1px solid #CAAE9F', fontSize:'0.85rem', color:'#62191C', background:'#FBF6F2', outline:'none' },
  lbl: { display:'block', fontSize:'0.6rem', fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:'#873632', marginBottom:5 }
}

export default function Budget() {
  const [vendors,     setVendors]     = useState([])
  const [items,       setItems]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [totalBudget, setTotalBudget] = useState('')
  const [saving,      setSaving]      = useState(false)
  const [showForm,    setShowForm]    = useState(false)
  const [form,        setForm]        = useState({ description:'', cat:'', day:'church', amount:'' })
  const [savingItem,  setSavingItem]  = useState(false)
  const saveTimer = useRef(null)

  useEffect(() => {
    Promise.all([getData('vendors'), getData('budget'), getData('settings')])
      .then(([v, b, s]) => {
        setVendors(v)
        setItems(b)
        if (s && s.totalBudget) setTotalBudget(s.totalBudget)
      })
      .finally(() => setLoading(false))
  }, [])

  // Auto-save total budget 1 second after user stops typing
  function handleBudgetChange(val) {
    setTotalBudget(val)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      setSaving(true)
      await mutate('saveSetting', { key: 'totalBudget', value: val })
      setSaving(false)
    }, 1000)
  }

  const totalQuoted = vendors.reduce((s, v) => s + (Number(v.quote) || 0), 0)
  const totalPaid   = vendors.reduce((s, v) => s + (Number(v.deposit) || 0), 0)
  const tb  = Number(totalBudget) || 0
  const pct = tb ? Math.min(100, Math.round(totalQuoted / tb * 100)) : 0
  const byDay = { traditional:0, church:0, general:0 }
  vendors.forEach(v => { if (byDay[v.day] !== undefined) byDay[v.day] += Number(v.quote) || 0 })

  async function addItem() {
    if (!form.description.trim()) return
    setSavingItem(true)
    const res = await mutate('addBudget', form)
    if (res.result) setItems(b => [...b, res.result])
    setSavingItem(false); setShowForm(false); setForm({ description:'', cat:'', day:'church', amount:'' })
  }

  async function delItem(id) {
    if (!confirm('Delete this item?')) return
    await mutate('deleteBudget', { id })
    setItems(b => b.filter(x => x.id !== id))
  }

  const SUMMARY = [
    ['Total quoted', fmt(totalQuoted), '#62191C'],
    ['Total paid',   fmt(totalPaid),   '#2d6a4f'],
    ['Outstanding',  fmt(totalQuoted - totalPaid), '#9E7161'],
    ['Remaining',    tb ? fmt(tb - totalQuoted) : '—', tb && tb - totalQuoted < 0 ? '#a03030' : '#62191C'],
  ]

  return (
    <div className="page-wrap">
      <Nav />
      <div style={{ padding:'1.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
          <div>
            <p style={{ fontSize:'0.6rem', fontWeight:500, letterSpacing:'0.28em', textTransform:'uppercase', color:'#873632' }}>Track</p>
            <h1 style={{ fontFamily:'var(--font-cormorant)', fontSize:'1.8rem', fontWeight:400, color:'#62191C' }}>Budget</h1>
          </div>
          <button onClick={()=>setShowForm(true)} style={{ padding:'0.6rem 1.1rem', background:'#62191C', color:'#fff', fontSize:'0.65rem', fontWeight:500, letterSpacing:'0.14em', textTransform:'uppercase', border:'none', cursor:'pointer' }}>+ Add</button>
        </div>

        {/* Total budget input */}
        <div style={{ background:'#fff', border:'1px solid #E0CFC2', padding:'1rem 1.25rem', marginBottom:'1rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
            <label style={S.lbl}>Total budget (R)</label>
            {saving && <span style={{ fontSize:'0.65rem', color:'rgba(98,25,28,0.45)' }}>Saving…</span>}
            {!saving && totalBudget && <span style={{ fontSize:'0.65rem', color:'#2d6a4f' }}>✓ Saved</span>}
          </div>
          <input
            type="number"
            value={totalBudget}
            onChange={e => handleBudgetChange(e.target.value)}
            placeholder="e.g. 500000"
            style={{ ...S.inp, fontSize:'1.1rem', fontWeight:500 }}
          />
          {tb > 0 && (
            <div style={{ marginTop:'0.75rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.72rem', color:'#873632', marginBottom:4 }}>
                <span>Quoted: {fmt(totalQuoted)}</span><span>{pct}% used</span>
              </div>
              <div style={{ height:6, background:'#E0CFC2', borderRadius:3 }}>
                <div style={{ height:'100%', background:pct>90?'#a03030':'#873632', borderRadius:3, width:`${pct}%`, transition:'width 0.3s' }}/>
              </div>
            </div>
          )}
        </div>

        {loading ? <p style={{ fontSize:'0.85rem', color:'rgba(98,25,28,0.45)' }}>Loading…</p> : <>

        {/* Summary cards */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'1rem' }}>
          {SUMMARY.map(([l, v, c]) => (
            <div key={l} style={{ background:'#fff', border:'1px solid #E0CFC2', padding:'0.9rem 1rem' }}>
              <div style={{ fontSize:'0.6rem', fontWeight:500, letterSpacing:'0.16em', textTransform:'uppercase', color:'#873632', marginBottom:3 }}>{l}</div>
              <div style={{ fontFamily:'var(--font-cormorant)', fontSize:'1.5rem', fontWeight:400, color:c }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Spend by day */}
        <div style={{ background:'#fff', border:'1px solid #E0CFC2', padding:'1rem 1.25rem', marginBottom:'1rem' }}>
          <div style={{ fontSize:'0.75rem', fontWeight:500, color:'#62191C', marginBottom:'0.75rem' }}>Spend by day</div>
          {Object.entries(byDay).map(([day, amt]) => {
            const dp = totalQuoted ? Math.round(amt / totalQuoted * 100) : 0
            return (
              <div key={day} style={{ marginBottom:'0.7rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.72rem', marginBottom:3 }}>
                  <span style={{ color:'rgba(98,25,28,0.7)', textTransform:'capitalize' }}>{day==='church'?'Church & reception':day}</span>
                  <span style={{ fontWeight:500, color:'#62191C' }}>{fmt(amt)} <span style={{ color:'rgba(98,25,28,0.4)', fontWeight:400 }}>({dp}%)</span></span>
                </div>
                <div style={{ height:4, background:'#E0CFC2', borderRadius:2 }}>
                  <div style={{ height:'100%', background:'#873632', borderRadius:2, width:`${dp}%` }}/>
                </div>
              </div>
            )
          })}
        </div>

        {/* Vendor quotes */}
        <div style={{ background:'#fff', border:'1px solid #E0CFC2', padding:'1rem 1.25rem', marginBottom:'1rem' }}>
          <div style={{ fontSize:'0.75rem', fontWeight:500, color:'#62191C', marginBottom:'0.75rem' }}>All vendor quotes</div>
          {vendors.length === 0
            ? <p style={{ fontSize:'0.8rem', color:'rgba(98,25,28,0.4)' }}>No vendors added yet.</p>
            : vendors.map(v => (
              <div key={v.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.5rem 0', borderBottom:'1px solid #E0CFC2' }}>
                <div>
                  <div style={{ fontSize:'0.8rem', fontWeight:500, color:'#62191C' }}>{v.name}</div>
                  <div style={{ fontSize:'0.68rem', color:'rgba(98,25,28,0.55)' }}>{v.cat} · {v.day}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'0.82rem', fontWeight:500, color:'#62191C' }}>{fmt(v.quote)}</div>
                  <div style={{ fontSize:'0.68rem', color:'#2d6a4f' }}>Paid: {fmt(v.deposit)}</div>
                </div>
              </div>
            ))
          }
        </div>

        {/* Extra budget items */}
        {items.length > 0 && (
          <div style={{ background:'#fff', border:'1px solid #E0CFC2', padding:'1rem 1.25rem' }}>
            <div style={{ fontSize:'0.75rem', fontWeight:500, color:'#62191C', marginBottom:'0.75rem' }}>Other budget items</div>
            {items.map(item => (
              <div key={item.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.5rem 0', borderBottom:'1px solid #E0CFC2' }}>
                <div>
                  <div style={{ fontSize:'0.8rem', color:'#62191C' }}>{item.description}</div>
                  <div style={{ fontSize:'0.68rem', color:'rgba(98,25,28,0.5)' }}>{item.cat} · {item.day}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:'0.82rem', fontWeight:500, color:'#62191C' }}>{fmt(item.amount)}</span>
                  <button onClick={()=>delItem(item.id)} style={{ fontSize:'0.62rem', color:'rgba(160,48,48,0.6)', background:'none', border:'none', cursor:'pointer' }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
        </>}

        {/* Add item form */}
        {showForm && (
          <div style={{ position:'fixed', inset:0, background:'rgba(98,25,28,0.4)', zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={e => { if (e.target===e.currentTarget) setShowForm(false) }}>
            <div style={{ background:'#fff', width:'100%', maxWidth:480, padding:'1.5rem', borderRadius:'2px 2px 0 0' }}>
              <h3 style={{ fontFamily:'var(--font-cormorant)', fontSize:'1.4rem', color:'#62191C', marginBottom:'1.2rem' }}>Add Budget Item</h3>
              <div style={{ marginBottom:'0.9rem' }}><label style={S.lbl}>Description *</label><input style={S.inp} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="e.g. Marriage licence fee"/></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'0.9rem' }}>
                <div><label style={S.lbl}>Category</label><input style={S.inp} value={form.cat} onChange={e=>setForm(f=>({...f,cat:e.target.value}))} placeholder="e.g. Legal"/></div>
                <div><label style={S.lbl}>Day</label><select style={S.inp} value={form.day} onChange={e=>setForm(f=>({...f,day:e.target.value}))}>{['traditional','church','general'].map(d=><option key={d} value={d}>{d}</option>)}</select></div>
              </div>
              <div style={{ marginBottom:'1.4rem' }}><label style={S.lbl}>Amount (R)</label><input type="number" style={S.inp} value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} placeholder="0"/></div>
              <div style={{ display:'flex', gap:'0.75rem' }}>
                <button onClick={()=>setShowForm(false)} style={{ flex:1, padding:'0.7rem', background:'#FBF6F2', border:'1px solid #CAAE9F', color:'#873632', fontSize:'0.72rem', cursor:'pointer' }}>Cancel</button>
                <button onClick={addItem} disabled={savingItem} style={{ flex:2, padding:'0.7rem', background:'#62191C', border:'none', color:'#fff', fontSize:'0.72rem', cursor:'pointer', opacity:savingItem?0.7:1 }}>{savingItem?'Saving…':'Add item'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}