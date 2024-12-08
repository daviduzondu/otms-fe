"use client";

import {SessionProvider, useSession} from "next-auth/react";
import {ReactNode, Suspense, useEffect, useState} from "react";
import Loader from "../../components/loader/loader";
import {LoaderPinwheel} from "lucide-react";

interface AuthProviderProperties {
    children: ReactNode;
}

function SessionChecker({children}: AuthProviderProperties) {
    const {status} = useSession();
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

export default function AuthSessionProvider({children}: AuthProviderProperties) {
    return (
        <SessionProvider>
            <Suspense
                fallback={<div className={"h-[100vh] w-[100vw] flex items-center justify-center"}><LoaderPinwheel className={'animate-spin'} size={'40'} strokeWidth={'1'}/> Loading...
                </div>}>
                <SessionChecker>{children}</SessionChecker>
            </Suspense>
        </SessionProvider>
    );
}
