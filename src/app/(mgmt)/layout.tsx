import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css"
import { ibm } from "../fonts";
import { Toaster } from "@/components/ui/sonner";
import AuthSessionProvider from "../../contexts/providers/auth-session.provider";
import { AuthProvider } from "../../contexts/auth.context";
import { Button } from "../../components/ui/button";
import { ArrowLeft, HomeIcon } from "lucide-react";
import Link from "next/link";
import UserProfileBtn from "../../components/user-profile-btn";
import AuthGuard from "../../components/guards/auth-guard";
import { ErrorBoundary } from "react-error-boundary";
import GlobalErrorFallback from "../../components/errors/global-error-fallback";
import { headers } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
 title: "OTMS",
 description: "Your All-In-One Platform to Create, Deliver & Grade Tests For Students. Effectively.",
};

export default function TestMgmtLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
 const pathname = headers().get('x-pathname');
 // console.log(h.get('x-url'));
 return (
  <>

   <div className={`${inter.className} ${ibm.variable} min-h-screen flex justify-center bg-gray-100`}
    style={{
     'backgroundImage': 'radial-gradient(#80808048 0.8px, transparent 0)',
     'backgroundSize': '20px 20px',
     'backgroundPosition': '-19px -19px',
     'backgroundAttachment': 'fixed',
    }}>

    <AuthSessionProvider>
     <AuthProvider>
      <AuthGuard next={pathname}>
       <ErrorBoundary FallbackComponent={GlobalErrorFallback}>

        <Link href="/dashboard">
         <Button className="lg:fixed absolute top-4 left-4 h-fit flex gap-2 z-50"
          variant={"outline"}>
          <ArrowLeft size={'18'} />
          Return to dashboard</Button>
        </Link>

        <Link href="/">
         <Button className="fixed bottom-4 left-4 h-fit flex gap-2 z-50"
          variant={"outline"}>
          <HomeIcon size={'18'} />
          Go to Home</Button>
        </Link>
        <UserProfileBtn className={"z-50 lg:fixed absolute"} />
        <div className="flex justify-center mt-16 lg:mt-4">
         {children}
         <Toaster richColors position="top-center" theme="light" className="text-3xl" />
        </div>
       </ErrorBoundary>
      </AuthGuard>
     </AuthProvider>
    </AuthSessionProvider>
   </div>
  </>
 );
}
