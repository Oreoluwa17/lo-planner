'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    const res = await signIn('credentials', { username, password, redirect: false })
    setLoading(false)
    if (res?.ok) router.push('/dashboard')
    else setError('Incorrect username or password.')
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(150deg, #FBF6F2 0%, #E0CFC2 55%, #CAAE9F 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}>
      <div style={{ width:'100%', maxWidth:'360px' }}>
        {/* Monogram */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontFamily:'var(--font-cormorant)', fontSize:'2.8rem', fontWeight:300, color:'#62191C', letterSpacing:'0.06em', lineHeight:1 }}>L & O</div>
          <p style={{ fontFamily:'var(--font-jost)', fontSize:'0.65rem', fontWeight:500, letterSpacing:'0.28em', textTransform:'uppercase', color:'#873632', marginTop:'0.4rem' }}>Wedding Planner</p>
        </div>

        <div style={{ background:'#fff', border:'1px solid #E0CFC2', padding:'2rem', borderRadius:'2px' }}>
          <h1 style={{ fontFamily:'var(--font-cormorant)', fontSize:'1.5rem', fontWeight:400, color:'#62191C', marginBottom:'1.5rem', textAlign:'center' }}>Sign in</h1>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:'1rem' }}>
              <label style={{ display:'block', fontSize:'0.62rem', fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:'#873632', marginBottom:'0.35rem' }}>Username</label>
              <input
                value={username} onChange={e => setUsername(e.target.value)} required
                placeholder="ore or londiwe"
                style={{ width:'100%', padding:'0.7rem 0.9rem', border:'1px solid #CAAE9F', fontFamily:'var(--font-jost)', fontSize:'0.9rem', color:'#62191C', background:'#FBF6F2', outline:'none', borderRadius:'1px' }}
                onFocus={e => e.target.style.borderColor='#873632'}
                onBlur={e => e.target.style.borderColor='#CAAE9F'}
              />
            </div>
            <div style={{ marginBottom:'1.5rem' }}>
              <label style={{ display:'block', fontSize:'0.62rem', fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:'#873632', marginBottom:'0.35rem' }}>Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                style={{ width:'100%', padding:'0.7rem 0.9rem', border:'1px solid #CAAE9F', fontFamily:'var(--font-jost)', fontSize:'0.9rem', color:'#62191C', background:'#FBF6F2', outline:'none', borderRadius:'1px' }}
                onFocus={e => e.target.style.borderColor='#873632'}
                onBlur={e => e.target.style.borderColor='#CAAE9F'}
              />
            </div>

            {error && <p style={{ fontSize:'0.8rem', color:'#873632', marginBottom:'1rem', textAlign:'center' }}>{error}</p>}

            <button type="submit" disabled={loading}
              style={{ width:'100%', padding:'0.75rem', background:'#62191C', color:'#fff', fontFamily:'var(--font-jost)', fontSize:'0.72rem', fontWeight:500, letterSpacing:'0.2em', textTransform:'uppercase', border:'none', cursor:'pointer', opacity:loading?0.7:1, borderRadius:'1px' }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', fontSize:'0.72rem', color:'#9E7161', marginTop:'1.5rem', letterSpacing:'0.05em' }}>
          23 · 01 · 2027 · Durban
        </p>
      </div>
    </div>
  )
}
