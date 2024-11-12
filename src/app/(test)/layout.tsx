
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css"
import { ibm } from "../fonts";
import { Toaster } from "@/components/ui/sonner";
import AuthSessionProvider from "../../contexts/providers/auth-session.provider";
import { AuthProvider } from "../../contexts/auth.context";
import { Button } from "../../components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import UserProfileBtn from "../../components/user-profile-btn";
import AuthGuard from "../../components/guards/auth-guard";
import { ErrorBoundary } from "react-error-boundary";
import GlobalErrorFallback from "../../components/errors/global-error-fallback";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
 title: "OTMS",
 description: "Your All-In-One Platform to Create, Deliver & Grade Tests For Students. Effectively.",
};

export default function TestLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
  <>

   <div className={`${inter.className} ${ibm.variable} min-h-screen flex justify-center bg-gray-100`}>

    <AuthSessionProvider>
     <AuthProvider>
      <AuthGuard>
       <ErrorBoundary FallbackComponent={GlobalErrorFallback}>
        <Link href="/dashboard">
         <Button className="fixed top-4 left-4 h-fit flex gap-2" variant={"outline"}>
          <ArrowLeft size={'18'} />
          Return to dashboard</Button>
        </Link>
        <UserProfileBtn />
        <div className="flex justify-center">
         {children}
         <Toaster richColors position="top-center" theme="light" />
        </div>
       </ErrorBoundary>
      </AuthGuard>
     </AuthProvider>
    </AuthSessionProvider>
   </div>
  </>
 );
}
