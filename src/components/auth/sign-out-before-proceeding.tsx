import { Info } from "lucide-react";
import { Button } from "../ui/button";
import { signOut } from "next-auth/react";

export default function SignOutBeforeProceeding() {
 return <div className="flex items-center justify-center flex-col space-y-4">
  <Info size={80} />
  <h2 className="text-2xl font-bold">You are currently signed in</h2>
  <div>You must sign out of your current account to proceed.</div>
  <Button variant={'destructive'} size={'sm'} onClick={() => signOut()}>Sign Out</Button>
 </div>

}