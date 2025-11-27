import Link from "next/link";
import SignInButton from "../signin-button";


export default function Page() {

  return (
      <div>
        <h1>"Login/Register" </h1>
        
        <SignInButton />
        <Link href="/">Continue as guest</Link>
      </div>
  );
}
