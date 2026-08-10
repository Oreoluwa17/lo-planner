'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import { getData, mutate } from '@/lib/sheets'

const C = { maroon:'#62191C', rust:'#873632', blush:'#CAAE9F', beige:'#E0CFC2', cream:'#FBF6F2', white:'#fff' }
const inp = { width:'100%', padding:'0.62rem 0.8rem', border:'1px solid #CAAE9F', fontFamily:'var(--font-jost)', fontSize:'0.85rem', color:'#62191C', background:'#FBF6F2', outline:'none' }
const lbl = { display:'block', fontSize:'0.6rem', fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:'#873632', marginBottom:'0.28rem' }

export default function Tasks() {
  const [tasks, setTasks]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ text:'', cat:'', day:'church' })
  const [saving, setSaving]     = useState(false)

  useEffect(() => { getData('tasks').then(setTasks).finally(()=>setLoading(false)) }, [])

  const filtered = filter==='all' ? tasks : tasks.filter(t=>t.day===filter)
  const cats = [...new Set(filtered.map(t=>t.cat))]
  const done = tasks.filter(t=>t.done==='true').length
  const pct  = tasks.length ? Math.round(done/tasks.length*100) : 0

  async function toggle(task) {
    const newDone = task.done !== 'true'
    setTasks(ts => ts.map(t => t.id===task.id ? {...t, done:newDone?'true':'false'} : t))
    await mutate('toggleTask', { id:task.id, done:newDone })
  }

  async function addTask() {
    if (!form.text.trim()) return
    setSaving(true)
    const res = await mutate('addTask', form)
    if (res.result) setTasks(ts => [...ts, res.result])
    setSaving(false); setShowForm(false); setForm({ text:'', cat:'', day:'church' })
  }

  async function del(id) {
    if (!confirm('Delete this task?')) return
    await mutate('deleteTask', {id})
    setTasks(ts => ts.filter(t=>t.id!==id))
  }

  return (
    <div className="page-wrap">
      <Nav/>
      <div style={{ padding:'1.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem' }}>
          <div>
            <p style={{ fontSize:'0.6rem', fontWeight:500, letterSpacing:'0.28em', textTransform:'uppercase', color:C.rust }}>Checklist</p>
            <h1 style={{ fontFamily:'var(--font-cormorant)', fontSize:'1.8rem', fontWeight:400, color:C.maroon }}>Tasks</h1>
          </div>
          <button onClick={()=>setShowForm(true)} style={{ padding:'0.6rem 1.1rem', background:C.maroon, color:'#fff', fontFamily:'var(--font-jost)', fontSize:'0.65rem', fontWeight:500, letterSpacing:'0.14em', textTransform:'uppercase', border:'none', cursor:'pointer' }}>+ Add</button>
        </div>

        <div style={{ background:C.white, border:'1px solid '+C.beige, padding:'0.9rem 1.1rem', marginBottom:'1rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:C.rust, marginBottom:'5px' }}>
            <span>{done} of {tasks.length} complete</span><span>{pct}%</span>
          </div>
          <div style={{ height:5, background:C.beige, borderRadius:3 }}>
            <div style={{ height:'100%', background:C.rust, borderRadius:3, width:`${pct}%`, transition:'width 0.3s' }}/>
          </div>
        </div>

        <div style={{ display:'flex', gap:'6px', marginBottom:'1.1rem', flexWrap:'wrap' }}>
          {['all','traditional','church','general'].map(f => (
            <button key={f} onClick={()=>setFilter(f)} style={{ padding:'4px 12px', fontSize:'0.62rem', fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', border:'1px solid '+C.blush, background:filter===f?C.maroon:C.white, color:filter===f?'#fff':C.rust, cursor:'pointer', borderRadius:20 }}>
              {f==='all'?'All':f==='traditional'?'Traditional':f==='church'?'Church':'General'}
            </button>
          ))}
        </div>

        {loading ? <p style={{ fontSize:'0.85rem', color:'rgba(98,25,28,0.45)' }}>Loading…</p>
        : cats.map(cat => {
          const items = filtered.filter(t=>t.cat===cat)
          const catDone = items.filter(t=>t.done==='true').length
          return (
            <div key={cat} style={{ marginBottom:'1.25rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                <span style={{ fontSize:'0.62rem', fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:C.rust }}>{cat}</span>
                <span style={{ fontSize:'0.65rem', color:'rgba(98,25,28,0.5)' }}>{catDone}/{items.length}</span>
              </div>
              <div style={{ background:C.white, border:'1px solid '+C.beige, padding:'0.4rem 1rem' }}>
                {items.map((t,i) => (
                  <div key={t.id} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.6rem 0', borderBottom:i<items.length-1?'1px solid '+C.beige:'none' }}>
                    <input type="checkbox" checked={t.done==='true'} onChange={()=>toggle(t)} style={{ width:16, height:16, accentColor:C.rust, flexShrink:0, cursor:'pointer' }}/>
                    <span style={{ flex:1, fontSize:'0.82rem', color:t.done==='true'?'rgba(98,25,28,0.4)':C.maroon, textDecoration:t.done==='true'?'line-through':'none', lineHeight:1.4 }}>{t.text}</span>
                    {t.doneBy&&<span style={{ fontSize:'0.62rem', color:'rgba(98,25,28,0.4)', flexShrink:0 }}>{t.doneBy?.[0]}</span>}
                    <button onClick={()=>del(t.id)} style={{ fontSize:'0.6rem', color:'rgba(160,48,48,0.5)', background:'none', border:'none', cursor:'pointer', flexShrink:0 }}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {showForm && (
          <div style={{ position:'fixed', inset:0, background:'rgba(98,25,28,0.4)', zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={e=>{ if(e.target===e.currentTarget) setShowForm(false) }}>
            <div style={{ background:C.white, width:'100%', maxWidth:480, padding:'1.5rem', borderRadius:'2px 2px 0 0' }}>
              <h3 style={{ fontFamily:'var(--font-cormorant)', fontSize:'1.4rem', color:C.maroon, marginBottom:'1.2rem' }}>Add Task</h3>
              <div style={{ marginBottom:'0.9rem' }}><label style={lbl}>Description *</label><input style={inp} value={form.text} onChange={e=>setForm(f=>({...f,text:e.target.value}))} placeholder="What needs to be done?"/></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'1.4rem' }}>
                <div><label style={lbl}>Category</label><input style={inp} value={form.cat} onChange={e=>setForm(f=>({...f,cat:e.target.value}))} placeholder="e.g. Décor"/></div>
                <div><label style={lbl}>Day</label><select style={inp} value={form.day} onChange={e=>setForm(f=>({...f,day:e.target.value}))}>{['traditional','church','general'].map(d=><option key={d} value={d}>{d}</option>)}</select></div>
              </div>
              <div style={{ display:'flex', gap:'0.75rem' }}>
                <button onClick={()=>setShowForm(false)} style={{ flex:1, padding:'0.7rem', background:C.cream, border:'1px solid '+C.blush, color:C.rust, fontFamily:'var(--font-jost)', fontSize:'0.72rem', cursor:'pointer' }}>Cancel</button>
                <button onClick={addTask} disabled={saving} style={{ flex:2, padding:'0.7rem', background:C.maroon, border:'none', color:'#fff', fontFamily:'var(--font-jost)', fontSize:'0.72rem', cursor:'pointer', opacity:saving?0.7:1 }}>{saving?'Saving…':'Add task'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
