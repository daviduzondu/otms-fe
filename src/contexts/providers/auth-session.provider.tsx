"use client";

import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { ReactNode, Suspense, useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { usePathname } from "next/navigation";
import { jwtDecode } from 'jwt-decode';
import { isAfter, isBefore } from "date-fns";

interface AuthProviderProperties {
 children: ReactNode;
}

function SessionChecker({ children }: AuthProviderProperties) {
 const { status, data } = useSession();
 const [isLoading, setIsLoading] = useState(true);
 const pathname = usePathname();

 useEffect(() => {
  if (status === "loading") {
   setIsLoading(true);
  } else {
   if (status === 'unauthenticated' && pathname !== '/auth/login' && pathname !== '/') {
    signIn();
    return;
   }
   setIsLoading(false);
   if (data && isAfter(data?.expires, new Date(jwtDecode(data?.user?.accessToken).exp * 1000))) { signOut({ callbackUrl: '/auth/login' }) };
  }
 }, [status]);

 // if (isLoading) {
 //  return <div>Loading right now!...</div>;
 // }
 if (!isLoading) {
  return <>{children}</>;
 }
}

export default function AuthSessionProvider({ children }: AuthProviderProperties) {
 return (
  <SessionProvider>
   <Suspense
    fallback={<div className={"h-[100vh] w-[100vw] flex items-center justify-center"}><Loader className={'animate-spin'} size={'70'} />
    </div>}>
    <SessionChecker>{children}</SessionChecker>
   </Suspense>
  </SessionProvider>
 );
}
