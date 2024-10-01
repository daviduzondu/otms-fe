"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ReactNode, useState, useEffect, Suspense } from "react";
import Loader from "../../components/loader/loader";

interface AuthProviderProperties {
 children: ReactNode;
}

function SessionChecker({ children }: AuthProviderProperties) {
 const { status } = useSession();
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
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
   <Suspense fallback={<Loader />}>
    <SessionChecker>{children}</SessionChecker>
   </Suspense>
  </SessionProvider>
 );
}
