"use client"
import { useSession, signIn, signOut } from "next-auth/react"

export default function SignInButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') return null

  if (session) {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span>{session.user?.name ?? session.user?.email}</span>
        <button onClick={signOut}>Sign out</button>
      </div>
    )
  }

  return <button onClick={() => signIn('google')}>Sign in with Google</button>
}
