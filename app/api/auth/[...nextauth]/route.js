import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const USERS = [
  { id: 'oreoluwa', name: 'Oreoluwa', username: 'ore',     color: '#873632' },
  { id: 'londiwe',  name: 'Londiwe',  username: 'londiwe', color: '#9E7161' },
]

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = USERS.find(u => u.username === credentials?.username)
        if (!user) return null
        const expected = process.env[`PASSWORD_${user.id.toUpperCase()}`]
        if (!expected || credentials?.password !== expected) return null
        return { id: user.id, name: user.name, color: user.color }
      }
    })
  ],
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) { token.id = user.id; token.color = user.color }
      return token
    },
    session({ session, token }) {
      if (session.user) { session.user.id = token.id; session.user.color = token.color }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
