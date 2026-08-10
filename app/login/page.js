'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const C = { maroon:'#62191C', rust:'#873632', blush:'#CAAE9F', beige:'#E0CFC2', cream:'#FBF6F2' }

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    const res = await signIn('credentials', { username, password, redirect:false })
    setLoading(false)
    if (res?.ok) router.push('/dashboard')
    else setError('Incorrect username or password.')
  }

  const inp = { width:'100%', padding:'0.7rem 0.9rem', border:'1px solid '+C.blush, fontFamily:'var(--font-jost)', fontSize:'0.9rem', color:C.maroon, background:C.cream, outline:'none' }
  const lbl = { display:'block', fontSize:'0.62rem', fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:C.rust, marginBottom:'0.35rem' }

  return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(150deg,${C.cream} 0%,${C.beige} 55%,${C.blush} 100%)`, display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}>
      <div style={{ width:'100%', maxWidth:'360px' }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontFamily:'var(--font-cormorant)', fontSize:'2.8rem', fontWeight:300, color:C.maroon, letterSpacing:'0.06em', lineHeight:1 }}>L & O</div>
          <p style={{ fontFamily:'var(--font-jost)', fontSize:'0.65rem', fontWeight:500, letterSpacing:'0.28em', textTransform:'uppercase', color:C.rust, marginTop:'0.4rem' }}>Wedding Planner</p>
        </div>
        <div style={{ background:'#fff', border:'1px solid '+C.beige, padding:'2rem' }}>
          <h1 style={{ fontFamily:'var(--font-cormorant)', fontSize:'1.5rem', fontWeight:400, color:C.maroon, marginBottom:'1.5rem', textAlign:'center' }}>Sign in</h1>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:'1rem' }}><label style={lbl}>Username</label><input value={username} onChange={e=>setUsername(e.target.value)} required placeholder="ore or londiwe" style={inp}/></div>
            <div style={{ marginBottom:'1.5rem' }}><label style={lbl}>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" style={inp}/></div>
            {error && <p style={{ fontSize:'0.8rem', color:C.rust, marginBottom:'1rem', textAlign:'center' }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ width:'100%', padding:'0.75rem', background:C.maroon, color:'#fff', fontFamily:'var(--font-jost)', fontSize:'0.72rem', fontWeight:500, letterSpacing:'0.2em', textTransform:'uppercase', border:'none', cursor:'pointer', opacity:loading?0.7:1 }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
        <p style={{ textAlign:'center', fontSize:'0.72rem', color:C.taupe, marginTop:'1.5rem', letterSpacing:'0.05em' }}>23 · 01 · 2027 · Durban</p>
      </div>
    </div>
  )
}
