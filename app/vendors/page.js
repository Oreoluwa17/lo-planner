'use client'
import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import { getData, mutate } from '@/lib/sheets'

const C = { maroon:'#62191C', rust:'#873632', blush:'#CAAE9F', beige:'#E0CFC2', cream:'#FBF6F2', white:'#fff' }
const STATUSES = ['Not Contacted','Quoted','Booked','Deposit Paid','Fully Paid']
const STATUS_COLOR = { 'Not Contacted':'rgba(98,25,28,0.35)','Quoted':'#9E7161','Booked':'#873632','Deposit Paid':'#873632','Fully Paid':'#2d6a4f' }
const DAYS = ['traditional','church','general']
const EMPTY_FORM = { name:'',cat:'',day:'church',contact:'',phone:'',quote:'',deposit:'',status:'Not Contacted',notes:'' }

function fmt(n) { return n ? 'R '+Math.round(Number(n)).toLocaleString() : '—' }

export default function Vendors() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId]   = useState(null)
  const [form, setForm]       = useState(EMPTY_FORM)
  const [saving, setSaving]   = useState(false)

  useEffect(() => { getData('vendors').then(setVendors).finally(()=>setLoading(false)) }, [])

  const filtered = filter==='all' ? vendors : vendors.filter(v=>v.day===filter)

  function openAdd()  { setForm(EMPTY_FORM); setEditId(null); setShowForm(true) }
  function openEdit(v){ setForm({...v}); setEditId(v.id); setShowForm(true) }

  async function save() {
    if (!form.name.trim()) return
    setSaving(true)
    if (editId) {
      await mutate('updateVendor', { ...form, id:editId })
      setVendors(vs => vs.map(v => v.id===editId ? {...form,id:editId} : v))
    } else {
      const res = await mutate('addVendor', form)
      if (res.result) setVendors(vs => [...vs, res.result])
    }
    setSaving(false); setShowForm(false)
  }

  async function del(id) {
    if (!confirm('Delete this vendor?')) return
    await mutate('deleteVendor', { id })
    setVendors(vs => vs.filter(v=>v.id!==id))
  }

  const inp = { width:'100%', padding:'0.62rem 0.8rem', border:'1px solid '+C.blush, fontFamily:'var(--font-jost)', fontSize:'0.85rem', color:C.maroon, background:C.cream, outline:'none' }
  const lbl = { display:'block', fontSize:'0.6rem', fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:C.rust, marginBottom:'0.28rem' }

  return (
    <div className="page-wrap">
      <Nav/>
      <div style={{ padding:'1.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
          <div>
            <p style={{ fontSize:'0.6rem', fontWeight:500, letterSpacing:'0.28em', textTransform:'uppercase', color:C.rust }}>Manage</p>
            <h1 style={{ fontFamily:'var(--font-cormorant)', fontSize:'1.8rem', fontWeight:400, color:C.maroon }}>Vendors</h1>
          </div>
          <button onClick={openAdd} style={{ padding:'0.6rem 1.1rem', background:C.maroon, color:'#fff', fontFamily:'var(--font-jost)', fontSize:'0.65rem', fontWeight:500, letterSpacing:'0.14em', textTransform:'uppercase', border:'none', cursor:'pointer' }}>
            + Add
          </button>
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:'6px', marginBottom:'1.1rem', flexWrap:'wrap' }}>
          {['all',...DAYS].map(f => (
            <button key={f} onClick={()=>setFilter(f)}
              style={{ padding:'4px 12px', fontSize:'0.65rem', fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase', border:'1px solid '+C.blush, background:filter===f?C.maroon:C.white, color:filter===f?'#fff':C.rust, cursor:'pointer', borderRadius:20 }}>
              {f==='all'?'All':f}
            </button>
          ))}
        </div>

        {loading ? <p style={{ fontSize:'0.85rem', color:'rgba(98,25,28,0.45)' }}>Loading…</p>
        : filtered.length===0 ? <p style={{ fontSize:'0.85rem', color:'rgba(98,25,28,0.45)', textAlign:'center', padding:'2rem' }}>No vendors yet. Add your first one!</p>
        : filtered.map(v => (
          <div key={v.id} style={{ background:C.white, border:'1px solid '+C.beige, padding:'1rem 1.1rem', marginBottom:'0.75rem' }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'0.5rem' }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap' }}>
                  <span style={{ fontSize:'0.92rem', fontWeight:500, color:C.maroon }}>{v.name}</span>
                  <span style={{ fontSize:'0.62rem', fontWeight:600, color:STATUS_COLOR[v.status]||C.rust, background:'rgba(98,25,28,0.07)', padding:'2px 8px', borderRadius:20 }}>{v.status}</span>
                  <span style={{ fontSize:'0.6rem', background:C.beige, color:C.maroon, padding:'2px 8px', borderRadius:20 }}>{v.day}</span>
                </div>
                <div style={{ fontSize:'0.75rem', color:'rgba(98,25,28,0.6)', marginTop:'2px' }}>{v.cat}{v.contact?' · '+v.contact:''}</div>
                {v.phone && <div style={{ fontSize:'0.72rem', color:'rgba(98,25,28,0.45)' }}>{v.phone}</div>}
                {v.notes && <div style={{ fontSize:'0.72rem', color:'rgba(98,25,28,0.55)', marginTop:'4px' }}>{v.notes}</div>}
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontSize:'0.88rem', fontWeight:500, color:C.maroon }}>{fmt(v.quote)}</div>
                <div style={{ fontSize:'0.7rem', color:'#2d6a4f' }}>Paid: {fmt(v.deposit)}</div>
                <div style={{ display:'flex', gap:'4px', marginTop:'6px', justifyContent:'flex-end' }}>
                  <button onClick={()=>openEdit(v)} style={{ fontSize:'0.65rem', padding:'3px 8px', background:'transparent', border:'1px solid '+C.blush, color:C.rust, cursor:'pointer' }}>Edit</button>
                  <button onClick={()=>del(v.id)} style={{ fontSize:'0.65rem', padding:'3px 8px', background:'transparent', border:'1px solid #e0a0a0', color:'#a03030', cursor:'pointer' }}>Del</button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {showForm && (
          <div style={{ position:'fixed', inset:0, background:'rgba(98,25,28,0.4)', zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={e=>{ if(e.target===e.currentTarget) setShowForm(false) }}>
            <div style={{ background:C.white, width:'100%', maxWidth:480, maxHeight:'92vh', overflowY:'auto', padding:'1.5rem', borderRadius:'2px 2px 0 0' }}>
              <h3 style={{ fontFamily:'var(--font-cormorant)', fontSize:'1.4rem', color:C.maroon, marginBottom:'1.2rem' }}>{editId?'Edit':'Add'} Vendor</h3>
              <div style={{ marginBottom:'0.9rem' }}><label style={lbl}>Vendor name *</label><input style={inp} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Flowers by Grace"/></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'0.9rem' }}>
                <div><label style={lbl}>Category</label><input style={inp} value={form.cat} onChange={e=>setForm(f=>({...f,cat:e.target.value}))} placeholder="e.g. Décor"/></div>
                <div><label style={lbl}>Day</label><select style={inp} value={form.day} onChange={e=>setForm(f=>({...f,day:e.target.value}))}>{DAYS.map(d=><option key={d} value={d}>{d}</option>)}</select></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'0.9rem' }}>
                <div><label style={lbl}>Contact email</label><input style={inp} value={form.contact} onChange={e=>setForm(f=>({...f,contact:e.target.value}))} placeholder="email@vendor.com"/></div>
                <div><label style={lbl}>Phone</label><input style={inp} value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+27 00 000 0000"/></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'0.9rem' }}>
                <div><label style={lbl}>Quote (R)</label><input style={inp} type="number" value={form.quote} onChange={e=>setForm(f=>({...f,quote:e.target.value}))} placeholder="0"/></div>
                <div><label style={lbl}>Deposit paid (R)</label><input style={inp} type="number" value={form.deposit} onChange={e=>setForm(f=>({...f,deposit:e.target.value}))} placeholder="0"/></div>
              </div>
              <div style={{ marginBottom:'0.9rem' }}><label style={lbl}>Status</label><select style={inp} value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>{STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
              <div style={{ marginBottom:'1.4rem' }}><label style={lbl}>Notes</label><input style={inp} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Any notes…"/></div>
              <div style={{ display:'flex', gap:'0.75rem' }}>
                <button onClick={()=>setShowForm(false)} style={{ flex:1, padding:'0.7rem', background:C.cream, border:'1px solid '+C.blush, color:C.rust, fontFamily:'var(--font-jost)', fontSize:'0.72rem', fontWeight:500, cursor:'pointer' }}>Cancel</button>
                <button onClick={save} disabled={saving} style={{ flex:2, padding:'0.7rem', background:C.maroon, border:'none', color:'#fff', fontFamily:'var(--font-jost)', fontSize:'0.72rem', fontWeight:500, cursor:'pointer', opacity:saving?0.7:1 }}>{saving?'Saving…':editId?'Save changes':'Add vendor'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
