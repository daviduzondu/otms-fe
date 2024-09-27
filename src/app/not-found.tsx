'use client'

import { FallbackProps } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Bird, RotateCw, TriangleAlert } from "lucide-react";

export default function NotFound() {

 return (
  <div role="alert" className="flex items-center justify-center text-center h-screen flex-col space-y-4 w-1/3">
   <div className="flex flex-col gap-3 items-center">
    <Bird size={80} />
    <h1 className="text-3xl font-semibold">404</h1>
   </div>
   <div style={{ color: "red" }} className="text-lg">The requested resource could not be found</div>
   <div className="flex gap-3">
    <Link href={'/'}>
     <Button variant={'outline'}>
      <ArrowLeft size={15} className="mr-2" />
      Back to Home
     </Button>
    </Link>
   </div>
  </div>
 );
}
