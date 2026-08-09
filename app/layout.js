import { Cormorant_Garamond, Jost } from 'next/font/google'
import SessionWrapper from '@/components/SessionWrapper'
import './globals.css'

const cormorant = Cormorant_Garamond({ subsets:['latin'], weight:['300','400','500','600'], variable:'--font-cormorant', display:'swap' })
const jost = Jost({ subsets:['latin'], weight:['300','400','500','600'], variable:'--font-jost', display:'swap' })

export const metadata = { title: 'L & O Wedding Planner' }

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body>
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  )
}