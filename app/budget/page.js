'use client'
import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import { getData, mutate } from '@/lib/sheets'

const C = { maroon:'#62191C', rust:'#873632', blush:'#CAAE9F', beige:'#E0CFC2', cream:'#FBF6F2', white:'#fff' }
const fmt = n => 'R ' + Math.round(Number(n)||0).toLocaleString()

export default function Budget() {
  const [vendors, setVendors] = useState([])
  const [budget, setBudget]   = useState([])
  const [loading, setLoading] = useState(true)
  const [totalBudget, setTotalBudget] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]       = useState({ description:'', cat:'', day:'church', amount:'', type:'expense' })
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    Promise.all([getData('vendors'), getData('budget')])
      .then(([v,b]) => { setVendors(v); setBudget(b) })
      .finally(() => setLoading(false))
  }, [])

  const totalQuoted = vendors.reduce((s,v)=>s+(Number(v.quote)||0),0)
  const totalPaid   = vendors.reduce((s,v)=>s+(Number(v.deposit)||0),0)
  const tb = Number(totalBudget)||0
  const remaining = tb - totalQuoted
  const pct = tb ? Math.min(100, Math.round(totalQuoted/tb*100)) : 0

  const byDay = { traditional:0, church:0, general:0 }
  vendors.forEach(v => { if(byDay[v.day]!==undefined) byDay[v.day] += Number(v.quote)||0 })

  async function addItem() {
    if (!form.description.trim()) return
    setSaving(true)
    const res = await mutate('addBudget', form)
    if (res.result) setBudget(b => [...b, res.result])
    setSaving(false); setShowForm(false); setForm({ description:'', cat:'', day:'church', amount:'', type:'expense' })
  }

  async function delItem(id) {
    if (!confirm('Delete this item?')) return
    await mutate('deleteBudget', { id })
    setBudget(b => b.filter(x=>x.id!==id))
  }

  const inp = { width:'100%', padding:'0.62rem 0.8rem', border:'1px solid '+C.blush, fontFamily:'var(--font-jost)', fontSize:'0.85rem', color:C.maroon, background:C.cream, outline:'none' }
  const lbl = { display:'block', fontSize:'0.6rem', fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:C.rust, marginBottom:'0.28rem' }

  return (
    <div className="page-wrap">
      <Nav/>
      <div style={{ padding:'1.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
          <div>
            <p style={{ fontSize:'0.6rem', fontWeight:500, letterSpacing:'0.28em', textTransform:'uppercase', color:C.rust }}>Track</p>
            <h1 style={{ fontFamily:'var(--font-cormorant)', fontSize:'1.8rem', fontWeight:400, color:C.maroon }}>Budget</h1>
          </div>
          <button onClick={()=>setShowForm(true)} style={{ padding:'0.6rem 1.1rem', background:C.maroon, color:'#fff', fontFamily:'var(--font-jost)', fontSize:'0.65rem', fontWeight:500, letterSpacing:'0.14em', textTransform:'uppercase', border:'none', cursor:'pointer' }}>
            + Add
          </button>
        </div>

        {/* Set budget */}
        <div style={{ background:C.white, border:'1px solid '+C.beige, padding:'1rem 1.25rem', marginBottom:'1rem' }}>
          <label style={lbl}>Total budget (R)</label>
          <input type="number" value={totalBudget} onChange={e=>setTotalBudget(e.target.value)} placeholder="Enter your total wedding budget" style={{ ...inp, fontSize:'1.2rem', fontWeight:500 }}/>
          {tb > 0 && (
            <div style={{ marginTop:'0.75rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.72rem', color:C.rust, marginBottom:'4px' }}>
                <span>Quoted: {fmt(totalQuoted)}</span><span>{pct}% used</span>
              </div>
              <div style={{ height:6, background:C.beige, borderRadius:3 }}>
                <div style={{ height:'100%', background:pct>90?'#a03030':C.rust, borderRadius:3, width:`${pct}%`, transition:'width 0.3s' }}/>
              </div>
            </div>
          )}
        </div>

        {/* Summary cards */}
        {loading ? <p style={{ fontSize:'0.85rem', color:'rgba(98,25,28,0.45)' }}>Loading…</p> : <>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'1.1rem' }}>
          {[['Total quoted',fmt(totalQuoted),C.maroon],['Total paid',fmt(totalPaid),'#2d6a4f'],['Outstanding',fmt(totalQuoted-totalPaid),'#9E7161'],['Remaining',tb?fmt(remaining):'—',remaining<0?'#a03030':C.maroon]].map(([l,v,c])=>(
            <div key={l} style={{ background:C.white, border:'1px solid '+C.beige, padding:'0.9rem 1rem' }}>
              <div style={{ fontSize:'0.62rem', fontWeight:500, letterSpacing:'0.16em', textTransform:'uppercase', color:C.rust, marginBottom:'3px' }}>{l}</div>
              <div style={{ fontFamily:'var(--font-cormorant)', fontSize:'1.5rem', fontWeight:400, color:c }}>{v}</div>
            </div>
          ))}
        </div>

        {/* By day */}
        <div style={{ background:C.white, border:'1px solid '+C.beige, padding:'1rem 1.25rem', marginBottom:'1.1rem' }}>
          <div style={{ fontSize:'0.72rem', fontWeight:500, color:C.maroon, marginBottom:'0.75rem' }}>Spend by day</div>
          {Object.entries(byDay).map(([day,amt])=>{
            const dp = totalQuoted ? Math.round(amt/totalQuoted*100) : 0
            return (
              <div key={day} style={{ marginBottom:'0.7rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.72rem', marginBottom:'3px' }}>
                  <span style={{ color:'rgba(98,25,28,0.7)', textTransform:'capitalize' }}>{day==='church'?'Church & reception':day}</span>
                  <span style={{ fontWeight:500, color:C.maroon }}>{fmt(amt)} <span style={{ color:'rgba(98,25,28,0.4)',fontWeight:400 }}>({dp}%)</span></span>
                </div>
                <div style={{ height:4, background:C.beige, borderRadius:2 }}>
                  <div style={{ height:'100%', background:C.rust, borderRadius:2, width:`${dp}%` }}/>
                </div>
              </div>
            )
          })}
        </div>

        {/* Vendor quotes table */}
        <div style={{ background:C.white, border:'1px solid '+C.beige, padding:'1rem 1.25rem', marginBottom:'1.1rem' }}>
          <div style={{ fontSize:'0.72rem', fontWeight:500, color:C.maroon, marginBottom:'0.75rem' }}>All vendor quotes</div>
          {vendors.length===0 ? <p style={{ fontSize:'0.8rem', color:'rgba(98,25,28,0.4)' }}>No vendors added yet.</p>
          : vendors.map(v=>(
            <div key={v.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.5rem 0', borderBottom:'1px solid '+C.beige }}>
              <div>
                <div style={{ fontSize:'0.8rem', fontWeight:500, color:C.maroon }}>{v.name}</div>
                <div style={{ fontSize:'0.68rem', color:'rgba(98,25,28,0.55)' }}>{v.cat} · {v.day}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:'0.82rem', fontWeight:500, color:C.maroon }}>{fmt(v.quote)}</div>
                <div style={{ fontSize:'0.68rem', color:'#2d6a4f' }}>Paid: {fmt(v.deposit)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Extra budget items */}
        {budget.length > 0 && (
          <div style={{ background:C.white, border:'1px solid '+C.beige, padding:'1rem 1.25rem' }}>
            <div style={{ fontSize:'0.72rem', fontWeight:500, color:C.maroon, marginBottom:'0.75rem' }}>Other budget items</div>
            {budget.map(item=>(
              <div key={item.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.5rem 0', borderBottom:'1px solid '+C.beige }}>
                <div>
                  <div style={{ fontSize:'0.8rem', color:C.maroon }}>{item.description}</div>
                  <div style={{ fontSize:'0.68rem', color:'rgba(98,25,28,0.5)' }}>{item.cat} · {item.day} · by {item.createdBy}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ fontSize:'0.82rem', fontWeight:500, color:C.maroon }}>{fmt(item.amount)}</span>
                  <button onClick={()=>delItem(item.id)} style={{ fontSize:'0.62rem', color:'rgba(160,48,48,0.6)', background:'none', border:'none', cursor:'pointer' }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
        </>}

        {showForm && (
          <div style={{ position:'fixed', inset:0, background:'rgba(98,25,28,0.4)', zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={e=>{ if(e.target===e.currentTarget) setShowForm(false) }}>
            <div style={{ background:C.white, width:'100%', maxWidth:480, padding:'1.5rem', borderRadius:'2px 2px 0 0' }}>
              <h3 style={{ fontFamily:'var(--font-cormorant)', fontSize:'1.4rem', color:C.maroon, marginBottom:'1.2rem' }}>Add Budget Item</h3>
              <div style={{ marginBottom:'0.9rem' }}><label style={lbl}>Description *</label><input style={inp} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="e.g. Stationery printing"/></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'0.9rem' }}>
                <div><label style={lbl}>Category</label><input style={inp} value={form.cat} onChange={e=>setForm(f=>({...f,cat:e.target.value}))} placeholder="e.g. Stationery"/></div>
                <div><label style={lbl}>Day</label><select style={inp} value={form.day} onChange={e=>setForm(f=>({...f,day:e.target.value}))}>{['traditional','church','general'].map(d=><option key={d} value={d}>{d}</option>)}</select></div>
              </div>
              <div style={{ marginBottom:'1.4rem' }}><label style={lbl}>Amount (R)</label><input type="number" style={inp} value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} placeholder="0"/></div>
              <div style={{ display:'flex', gap:'0.75rem' }}>
                <button onClick={()=>setShowForm(false)} style={{ flex:1, padding:'0.7rem', background:C.cream, border:'1px solid '+C.blush, color:C.rust, fontFamily:'var(--font-jost)', fontSize:'0.72rem', cursor:'pointer' }}>Cancel</button>
                <button onClick={addItem} disabled={saving} style={{ flex:2, padding:'0.7rem', background:C.maroon, border:'none', color:'#fff', fontFamily:'var(--font-jost)', fontSize:'0.72rem', cursor:'pointer', opacity:saving?0.7:1 }}>{saving?'Saving…':'Add item'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
