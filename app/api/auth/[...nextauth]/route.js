import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

import NeonAdapter from "@auth/neon-adapter"
import { Pool } from "@neondatabase/serverless"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  adapter: NeonAdapter(pool),
  
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
