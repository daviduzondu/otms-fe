'use client'

import { FallbackProps } from "react-error-boundary";
import { Button } from "../ui/button";
import Link from "next/link";
import { ArrowLeft, RotateCw, TriangleAlert } from "lucide-react";

export default function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {

 return (
  <div role="alert" className="flex items-center justify-center text-center h-screen flex-col space-y-4 w-1/3">
   <div className="flex flex-col gap-3 items-center">
    <TriangleAlert size={80} />
    <h1 className="text-3xl font-semibold">{error.heading || "An Error Occurred"}</h1>
   </div>
   <div style={{ color: "red" }} className="text-lg">{error.message}</div>
   <div className="flex gap-3">
    <Link href={'/'}>
     <Button variant={'outline'}>
      <ArrowLeft size={15} className="mr-2" />
      Back to Home
     </Button>
    </Link>
    <Button variant={'outline'} onClick={resetErrorBoundary}>
     <RotateCw size={15} className="mr-2" />
     Retry
    </Button>

   </div>
  </div>
 );
}
