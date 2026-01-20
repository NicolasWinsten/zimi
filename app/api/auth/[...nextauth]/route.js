import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

import NeonAdapter from "@auth/neon-adapter"
import { Pool } from "@neondatabase/serverless"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = NeonAdapter(pool)

// Build providers list
const providers = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
]

// Add test credentials provider only in non-production environments
if (process.env.NODE_ENV !== 'production') {
  providers.push(
    CredentialsProvider({
      id: 'test-credentials',
      name: 'Test Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        name: { label: 'Name', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null
        }

        const email = credentials.email
        const name = credentials.name || 'Test User'

        // Check if user already exists
        let user = await adapter.getUserByEmail(email)

        if (!user) {
          // Create user in database (like OAuth would do)
          user = await adapter.createUser({
            email,
            name,
            emailVerified: new Date(),
            image: null,
          })
        }

        return user
      },
    })
  )
}

export const authOptions = {
  providers,
  adapter,
  // Use JWT for credentials provider (development), database for production OAuth
  session: {
    strategy: process.env.NODE_ENV !== 'production' ? 'jwt' : 'database',
  },
  callbacks: {
    // Include user id in the session (for both JWT and database sessions)
    async session({ session, token, user }) {
      // JWT strategy (credentials provider in development)
      if (token?.sub) {
        session.user.id = token.sub
      }
      // Database strategy (OAuth in production)
      else if (user?.id) {
        session.user.id = user.id
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
