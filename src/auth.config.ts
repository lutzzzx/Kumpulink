import { type NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  providers: [], // Empty array, providers will be added in auth.ts
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET || 'a-very-secure-random-secret-key-for-local-development',
}

export default authConfig
