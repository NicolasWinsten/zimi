"use client"
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect } from "react"

export default function SignInButton() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect to main page once authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/")
    }
  }, [status, router])

  if (status === 'loading') return null
  
  if (status === "authenticated") {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="px-8 py-3 rounded-lg bg-gradient-to-br from-white via-gray-50 to-gray-200 border-4 border-amber-800 shadow-lg">
          <p className="text-gray-800 font-semibold">{session.user?.name ?? session.user?.email}</p>
        </div>
        <button 
          onClick={signOut}
          className="px-8 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold border-4 border-red-700 shadow-md hover:shadow-lg transition-all duration-200"
        >
          Sign out
        </button>
      </div>
    )
  }

  if (status === "unauthenticated")
    return (
      <Link href="/signin">Sign in</Link>
    )
  
}
