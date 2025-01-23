'use client'

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import GlobalErrorFallback from "../../components/errors/global-error-fallback";
import { ibm } from "../fonts";
import Link from "next/link";
import { GraduationCap, Loader } from "lucide-react";
import { Toaster } from "../../components/ui/sonner";

export default function TestLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
 return <ErrorBoundary FallbackComponent={GlobalErrorFallback}>
  <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">
   <Loader className={'animate-spin text-gray-600'} size={'70'} />
  </div>}>
   <div className={`flex items-center justify-center w-screen ${ibm.variable} bg-gradient-to-b from-blue-50 to-gray-100`}>
    <Toaster richColors position="top-center" theme="light" className="text-3xl" />

    {children}
    <div className={"absolute bottom-5 flex flex-col items-center justify-center footer-brand"}>
     <Link className="font-plex flex gap-2 items-center justify-center" href={'/'}>
      <GraduationCap /> ONLINE TEST MANAGEMENT SYSTEM
     </Link>
     <span className="text-xs">Final year project by <Link href={"https://www.daviduzondu.com.ng"} className={"underline hover:no-underline"}>David Uzondu</Link></span>
    </div>
   </div>
  </Suspense>
 </ErrorBoundary>
}