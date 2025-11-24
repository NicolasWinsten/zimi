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
      // this authorization part ensures we get refresh tokens on every signin
      // remove this once we can store refresh tokens securely
      // authorization: {
      //   params: {
      //     prompt: "consent",
      //     access_type: "offline",
      //     response_type: "code"
      //   }
      // }
    }),
  ],
  adapter: NeonAdapter(pool),
  
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
