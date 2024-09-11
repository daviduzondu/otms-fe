'use client'

import React, { useContext } from "react";
import { Button } from "../ui/button";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AuthContext } from "../../contexts/auth.context";
import { useRouter } from "next/navigation";

export default function ActionButtons(): React.JSX.Element {
 const { user, authLoading } = useContext(AuthContext)
 const router = useRouter()

 return <>
  <div className="flex flex-col gap-6">
   <Button className="w-fit lg:text-lg lg:py-6 font-normal group relative flex items-center shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out" onClick={() => router.push("/auth/register")}>
    {!user ? "Create an account" : "Continue to dashboard"}
    <ArrowRight
     className="ml-2 w-5 transition-all duration-100 ease-in-out group-hover:ml-[0.8rem] group-hover:w-5 group-hover:opacity-100"
    />
   </Button>

   {!user && <span className="font-semibold flex gap-1 lg:text-xl text-base">Already have an account?
    <Link className="group flex text-blue-600 hover:underline hover:underline-offset-1 items-center justify-center" href={"/auth/login"}>
     Login
     <ArrowRight
      size={20}
      className="-ml-1 w-6 opacity-0 transition-all duration-100 ease-in-out group-hover:ml-[0.1rem] group-hover:w-6 group-hover:opacity-100"
     />
    </Link>
   </span>}
  </div>
 </>

}