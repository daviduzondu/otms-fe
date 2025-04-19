"use client";

import { SessionProvider, signIn, useSession } from "next-auth/react";
import { ReactNode, Suspense, useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { usePathname } from "next/navigation";

interface AuthProviderProperties {
 children: ReactNode;
}

function SessionChecker({ children }: AuthProviderProperties) {
 const { status } = useSession();
 const [isLoading, setIsLoading] = useState(true);
 const pathname = usePathname();

 useEffect(() => {
  if (status === 'unauthenticated' && pathname !== '/auth/login') {
   signIn();
   return;
  }

  if (status === "loading") {
   setIsLoading(true);
  } else {
   setIsLoading(false);
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
