'use client'

import { Shield, RectangleEllipsis, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { errorToast } from "../../helpers/show-toasts";
import { Card, CardHeader, CardContent, CardFooter } from "../ui/card";
import { cn } from "../../lib/utils";
import { useRouter } from "next/navigation";

export default function TokenRequestCard({ code }: { code: string }) {
 const router = useRouter();
 const [hasPIN, setHasPIN] = useState(false);
 const [isSending, setIsSending] = useState(false);
 const [val, setVal] = useState("");

 async function requestToken() {
  try {
   setIsSending(true)
   if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
    await new Promise(resolve => setTimeout(resolve, 1200));
    setHasPIN(true);
    setIsSending(false);
   }
   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tests/send-token`, {
    body: JSON.stringify({ email: val, code }),
    method: "POST",
    headers: {
     "Content-Type": "application/json"
    }
   });
   const { message } = await res.json();
   if (!res.ok) throw new Error(message);
   setVal("");
   setHasPIN(true);
  } catch (error) {
   errorToast("Failed to send email", { description: (error as Error).message });
   console.error("Failed to send email")
  }
  setIsSending(false);
 }


 return <Card className="lg:w-[25vw] w-screen">
  <CardHeader className="flex flex-col gap-2">{!hasPIN ? <Shield size="40" /> : <RectangleEllipsis size="40" />}
   <span className="text-lg  font-bold ">Access Restricted</span>
   <span className="text-sm">
    {!hasPIN
     ? "Enter your email. If the email exists for this test, you will receive a Test PIN."
     : "Enter your Test PIN"}
   </span>

  </CardHeader>
  <CardContent className="text-lg -mt-3">
   <form onSubmit={(e) => { e.preventDefault(); if (!hasPIN) requestToken() }} className="flex gap-2 w-full">
    <Input
     type={!hasPIN ? "email" : "text"}
     name="email"
     placeholder={!hasPIN ? "student@example.com" : "Enter your 12-digit PIN"}
     autoFocus
     value={val}
     onChange={(e) => setVal(e.target.value)}
    />
    <Button className="flex items-center justify-center" onClick={() => {
     if (hasPIN) {
      router.replace(`?token=${val}`);
      setIsSending(true)
     }
    }} disabled={isSending || val.length <= 0}>{isSending ? <Loader size={20} className="mr-2 animate-spin" /> : null} {isSending ? "Sending..." : !hasPIN ? "Request PIN" : "Proceed"}</Button>
   </form>
  </CardContent>
  <CardFooter className={cn("text-sm flex-col -mt-3 items-start")}>
   <span className="text-sm">
    {!hasPIN
     ? "Already have a Test PIN? "
     : "Don't have a Test PIN? "}
    <Button
     variant="link"
     className={cn("p-0 m-0 align-baseline inline text-blue-600")}
     onClick={() => setHasPIN(!hasPIN)}
    >
     {!hasPIN ? "Enter it" : "Request it"}
    </Button>.
   </span>

   <span>
    Facing issues? contact your supervisor.
   </span>
  </CardFooter>
 </Card >
}
