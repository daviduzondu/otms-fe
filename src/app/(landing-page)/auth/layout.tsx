// app/auth/layout.tsx
'use client'
import React, { ReactNode, useEffect } from 'react';
import { ViewTransitions } from 'next-view-transitions';
import { useRouter } from 'next/navigation';
import { headers } from 'next/headers';
import { infoToast } from '../../../helpers/show-toasts';


export default function AuthLayout({ children }: { children: React.JSX.Element }) {

 return (
  <ViewTransitions>
   <div className="mx-auto max-w-[450px] space-y-6 flex flex-col justify-center min-h-[90dvh]">

    {children}
    {/* <div className='flex justify-center items-center text-gray-700 text-xs gap-2'>
     <Separator className="w-20" />
     OR
     <Separator className="w-20" />
    </div> */}
    {/* <div className="space-y-4">
     <Button variant="outline" className="w-full" onClick={async () => {
      await continueWithGoogle()
      router.back()
     }}>
      <img className={"w-5 h-5 mr-2"} src="https://www.svgrepo.com/show/475656/google-color.svg" loading="lazy" alt="google logo" />
      Continue with Google
     </Button>
    </div> */}
   </div>
  </ViewTransitions>
 );
}

function ChromeIcon(props: any) {
 return (
  <svg
   {...props}
   xmlns="http://www.w3.org/2000/svg"
   width="24"
   height="24"
   viewBox="0 0 24 24"
   fill="none"
   stroke="currentColor"
   strokeWidth="2"
   strokeLinecap="round"
   strokeLinejoin="round"
  >
   <circle cx="12" cy="12" r="10" />
   <circle cx="12" cy="12" r="4" />
   <line x1="21.17" x2="12" y1="8" y2="8" />
   <line x1="3.95" x2="8.54" y1="6.06" y2="14" />
   <line x1="10.88" x2="15.46" y1="21.94" y2="14" />
  </svg>
 );
}
