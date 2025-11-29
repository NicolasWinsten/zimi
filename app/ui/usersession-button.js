"use client";

import { useSession, signOut, signIn } from "next-auth/react";

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
    // use default sigin UI from next-auth
    return (<button onClick={() => signIn()}>Sign in</button>);
  }
}