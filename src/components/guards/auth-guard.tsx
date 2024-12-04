'use client'

import React, {useContext} from "react";
import {AuthContext} from "../../contexts/auth.context";
import {useRouter} from "next/navigation";


export default function AuthGuard({children, next = null}: { children: React.JSX.Element, next?: string | null }) {
    const {user} = useContext(AuthContext);
    const router = useRouter();

    if (!user) {
        const url = `/auth/login/${next ? `?next=${next}` : ''}`;
        router.push(url);
    } else {
        return (
            <>
                {children}
            </>
        );
    }
}
