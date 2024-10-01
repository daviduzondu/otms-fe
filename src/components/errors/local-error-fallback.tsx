'use client'

import { FallbackProps } from "react-error-boundary";
import { Button } from "../ui/button";
import Link from "next/link";
import { ArrowLeft, RotateCw, Triangle, TriangleAlert, TriangleAlertIcon } from "lucide-react";

export default function LocalErrorFallback({ error, resetErrorBoundary }: FallbackProps) {

 return (
  <div role="alert" className="flex items-center justify-center text-center flex-col bg-gray-300 bg-muted-foreground p-8 rounded-lg gap-6">
   <div className="flex flex-col gap-3 items-center">
    <TriangleAlertIcon />
    <h1 className="text-base text-card-foreground">{error.message || "Something went wrong!"}</h1>
   </div>
   {/* <div style={{ color: "red" }} className="text-sm font-mono">{error.message}</div> */}
   <div className="flex gap-1">
    <Button variant={'outline'} onClick={resetErrorBoundary} size={'sm'}>
     <RotateCw size={15} className="mr-2" />
     Retry
    </Button>

   </div>
  </div>
 );
}
