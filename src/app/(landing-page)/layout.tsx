
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css"
import { ibm } from "../fonts";
import Navbar from "../../components/navbar/navbar";
import { AuthProvider } from "../../contexts/auth.context";
import AuthSessionProvider from "../../contexts/providers/auth-session.provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
 title: "OTMS",
 description: "The All-In-One Platform to Create, Deliver & Grade Tests For Students, Effectively.",
};

export default function LandingLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
  <>
   <div className={`${inter.className} ${ibm.variable}`}>

    <AuthSessionProvider>
     <AuthProvider>
      <Navbar />
      <div className="mt-4">
       {children}
       <Toaster richColors position="top-center" theme="light" closeButton  pauseWhenPageIsHidden={true} />
      </div>
     </AuthProvider>
    </AuthSessionProvider>
   </div>
  </>
 );
}
