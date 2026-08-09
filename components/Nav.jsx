'use client'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

const LINKS = [
  { href:'/dashboard', label:'Dashboard', icon:'⬜' },
  { href:'/vendors',   label:'Vendors',   icon:'👥' },
  { href:'/tasks',     label:'Tasks',     icon:'✅' },
  { href:'/budget',    label:'Budget',    icon:'💰' },
  { href:'/activity',  label:'Activity',  icon:'📋' },
]

export default function Nav() {
  const path = usePathname()
  const { data:session } = useSession() ?? {}

  const user = session?.user

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside style={{
        position:'fixed', top:0, left:0, bottom:0, width:'220px',
        background:'#62191C', display:'flex', flexDirection:'column',
        zIndex:50, overflowY:'auto',
      }} className="hide-mobile">
        {/* Logo */}
        <div style={{ padding:'1.5rem 1.25rem 1rem', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontFamily:'var(--font-cormorant)', fontSize:'1.5rem', fontWeight:300, color:'#fff', letterSpacing:'0.06em' }}>L & O</div>
          <div style={{ fontFamily:'var(--font-jost)', fontSize:'0.58rem', fontWeight:500, letterSpacing:'0.22em', textTransform:'uppercase', color:'#CAAE9F', marginTop:'2px' }}>Wedding Planner</div>
        </div>

        {/* User */}
        {user && (
          <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
              <div style={{ width:30, height:30, borderRadius:'50%', background:user.color||'#873632', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:600, color:'#fff', flexShrink:0 }}>
                {user.name?.[0]}
              </div>
              <div>
                <div style={{ fontSize:'0.82rem', fontWeight:500, color:'#fff' }}>{user.name}</div>
                <div style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.5)' }}>Signed in</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav style={{ padding:'0.75rem 0', flex:1 }}>
          {LINKS.map(l => {
            const active = path === l.href
            return (
              <Link key={l.href} href={l.href} style={{
                display:'flex', alignItems:'center', gap:'0.7rem',
                padding:'0.65rem 1.25rem', textDecoration:'none',
                background:active?'rgba(255,255,255,0.12)':'transparent',
                borderLeft: active?'3px solid #E0CFC2':'3px solid transparent',
                transition:'all 0.15s',
              }}>
                <span style={{ fontSize:'1rem' }}>{l.icon}</span>
                <span style={{ fontSize:'0.8rem', fontWeight:active?500:400, color:active?'#fff':'rgba(255,255,255,0.65)', letterSpacing:'0.04em' }}>{l.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <div style={{ padding:'1rem 1.25rem', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={() => signOut({ callbackUrl:'/login' })}
            style={{ fontFamily:'var(--font-jost)', fontSize:'0.72rem', fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', alignItems:'center', gap:'6px' }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom nav ────────────────────────────── */}
      <nav style={{
        position:'fixed', bottom:0, left:0, right:0,
        background:'#62191C', display:'flex', borderTop:'1px solid rgba(255,255,255,0.1)',
        zIndex:50, paddingBottom:'env(safe-area-inset-bottom)',
      }} className="hide-desktop">
        {LINKS.map(l => {
          const active = path === l.href
          return (
            <Link key={l.href} href={l.href} style={{
              flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              padding:'0.5rem 0.25rem', textDecoration:'none', gap:'2px',
              borderTop: active?'2px solid #E0CFC2':'2px solid transparent',
            }}>
              <span style={{ fontSize:'1.1rem', lineHeight:1 }}>{l.icon}</span>
              <span style={{ fontSize:'0.5rem', fontWeight:500, letterSpacing:'0.08em', color:active?'#fff':'rgba(255,255,255,0.5)', textTransform:'uppercase' }}>{l.label}</span>
            </Link>
          )
        })}
      </nav>

      <style>{`
        @media(min-width:768px){
          .hide-mobile{ display:flex !important; }
          .hide-desktop{ display:none !important; }
          .page-wrap{ margin-left:220px; }
        }
        @media(max-width:767px){
          .hide-mobile{ display:none !important; }
          .hide-desktop{ display:flex !important; }
          .page-wrap{ margin-left:0; padding-bottom:5rem; }
        }
      `}</style>
    </>
  )
}
