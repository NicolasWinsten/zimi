"use client";
import Link from "next/link";
import { NotoSerifChinese } from "../ui/fonts";
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

function LoginProviderButton({provider}) {
  const { status } = useSession()
  const router = useRouter()

  // Redirect to main page once authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/")
    }
  }, [status, router])

  return (
    <button
      onClick={() => signIn(provider)}
      className="px-8 py-3 rounded-lg bg-gradient-to-br from-white via-gray-50 to-gray-200 border-4 border-amber-800 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold text-gray-800"
    >
      Sign in with {provider.charAt(0).toUpperCase() + provider.slice(1)}
    </button>
  )
}

export default function Page() {
  return (
    <div className={`${NotoSerifChinese.className} min-h-screen flex items-center justify-center p-4`}>
      <div className="flex flex-col items-center gap-8">
        <p className="text-xl text-gray-600 text-center max-w-md">
          Match Chinese words to complete today's daily puzzle
        </p>

        {/* Sign in section */}
        <div className="flex flex-col items-center gap-6">
          <div>
            <LoginProviderButton provider={"google"} />
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">or</p>
            <Link href="/" className="px-8 py-3 rounded-lg border-4 border-amber-800 bg-white hover:bg-gray-100 transition-all duration-200 font-semibold text-gray-800 shadow-md hover:shadow-lg">
              Continue as guest
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-gray-600 text-sm max-w-md">
          <p>Sign in with Google to save your daily scores and track your progress.</p>
        </div>
      </div>
    </div>
  );
}
