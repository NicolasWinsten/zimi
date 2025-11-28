"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import Link from "next/link";

export default function SignInButton() {
  const { data: session, status } = useSession()
  if (status === "authenticated") {
    return (
    <div>
      <p>Signed in as {session.user.name}</p>
      <button onClick={signOut}>Sign out</button>
    </div>
    
  )
  } else {
    return (<button onClick={() => signIn()}>Sign in</button>
      // <Link
      //   href="/signin"
      //   className="px-8 py-3 rounded-lg bg-gradient-to-br from-white via-gray-50 to-gray-200 border-4 border-amber-800 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold text-gray-800"
      // >
      //   Go Sign in
      // </Link>
    );
  }
}