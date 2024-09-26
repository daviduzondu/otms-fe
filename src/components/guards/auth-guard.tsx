'use client'

import React, { createContext, useContext } from "react";
import { AuthContext } from "../../contexts/auth.context";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { infoToast } from "../../helpers/show-toasts";


export default function AuthGuard({ children, callback = null }: { children: React.JSX.Element, callback?: string | null }) {
 const { user } = useContext(AuthContext);

 if (!user) {
  const url = '/auth/login';
  redirect(url);
 } else {
  return (
   <>
    {children}
   </>
  );
 }
}
