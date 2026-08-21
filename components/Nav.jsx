'use client'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

const LINKS = [
  { href:'/dashboard', label:'Dashboard', icon:'⬜' },
  { href:'/vendors',   label:'Vendors',   icon:'👥' },
  { href:'/tasks',     label:'Tasks',     icon:'✅' },
  { href:'/budget',    label:'Budget',    icon:'💰' },
  { href:'/registry',  label:'Registry',  icon:'🎁' },
  { href:'/rsvp',      label:'RSVPs',     icon:'💌' },
  { href:'/activity',  label:'Activity',  icon:'📋' },
]

export default function Nav() {
  const path = usePathname()
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => setUser(d.user)).catch(() => {})
  }, [])

  async function signOut() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="nav-desktop" style={{ position:'fixed',top:0,left:0,bottom:0,width:220,background:'#62191C',display:'flex',flexDirection:'column',zIndex:50,overflowY:'auto' }}>
        <div style={{ padding:'1.5rem 1.25rem 1rem',borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontFamily:'var(--font-cormorant)',fontSize:'1.5rem',fontWeight:300,color:'#fff',letterSpacing:'0.06em' }}>L & O</div>
          <div style={{ fontSize:'0.58rem',fontWeight:500,letterSpacing:'0.22em',textTransform:'uppercase',color:'#CAAE9F',marginTop:2 }}>Wedding Planner</div>
        </div>
        {user && (
          <div style={{ padding:'1rem 1.25rem',borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display:'flex',alignItems:'center',gap:'0.6rem' }}>
              <div style={{ width:30,height:30,borderRadius:'50%',background:'#873632',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.75rem',fontWeight:600,color:'#fff' }}>{user.name?.[0]}</div>
              <div>
                <div style={{ fontSize:'0.82rem',fontWeight:500,color:'#fff' }}>{user.name}</div>
                <div style={{ fontSize:'0.65rem',color:'rgba(255,255,255,0.5)' }}>Signed in</div>
              </div>
            </div>
          </div>
        )}
        <nav style={{ padding:'0.75rem 0',flex:1 }}>
          {LINKS.map(l => {
            const active = path === l.href
            return (
              <Link key={l.href} href={l.href} style={{ display:'flex',alignItems:'center',gap:'0.7rem',padding:'0.65rem 1.25rem',textDecoration:'none',background:active?'rgba(255,255,255,0.12)':'transparent',borderLeft:active?'3px solid #E0CFC2':'3px solid transparent' }}>
                <span style={{ fontSize:'1rem' }}>{l.icon}</span>
                <span style={{ fontSize:'0.8rem',fontWeight:active?500:400,color:active?'#fff':'rgba(255,255,255,0.65)' }}>{l.label}</span>
              </Link>
            )
          })}
        </nav>
        <div style={{ padding:'1rem 1.25rem',borderTop:'1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={signOut} style={{ fontSize:'0.72rem',fontWeight:500,letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(255,255,255,0.5)',background:'none',border:'none',cursor:'pointer',padding:0 }}>Sign out</button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="nav-mobile" style={{ position:'fixed',bottom:0,left:0,right:0,background:'#62191C',display:'flex',borderTop:'1px solid rgba(255,255,255,0.1)',zIndex:50,paddingBottom:'env(safe-area-inset-bottom)' }}>
        {LINKS.map(l => {
          const active = path === l.href
          return (
            <Link key={l.href} href={l.href} style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'0.5rem 0.1rem',textDecoration:'none',gap:2,borderTop:active?'2px solid #E0CFC2':'2px solid transparent' }}>
              <span style={{ fontSize:'0.9rem',lineHeight:1 }}>{l.icon}</span>
              <span style={{ fontSize:'0.38rem',fontWeight:500,letterSpacing:'0.06em',color:active?'#fff':'rgba(255,255,255,0.5)',textTransform:'uppercase' }}>{l.label}</span>
            </Link>
          )
        })}
      </nav>

      <style>{`
        .nav-desktop { display: flex !important; }
        .nav-mobile  { display: none !important; }
        .page-wrap   { margin-left: 220px; }
        @media(max-width: 767px) {
          .nav-desktop { display: none !important; }
          .nav-mobile  { display: flex !important; }
          .page-wrap   { margin-left: 0; padding-bottom: 5.5rem; }
        }
      `}</style>
    </>
  )
}
