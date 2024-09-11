
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ibm } from "./fonts";
import Navbar from "../components/navbar/navbar";
import { AuthProvider } from "../contexts/auth.context";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
 title: "OTMS",
 description: "Your All-In-One Platform to Create, Deliver & Grade Tests For Students. Effectively.",
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
  <html lang="en">
   <body className={`${inter.className} ${ibm.variable} xl:px-[7em] lg:px-[7em] md:px-[6em] sm:px-[4em] px-[2em] pt-10 pb-4 overflow-x-hidden`}>
    <AuthProvider>
     <Navbar />
     <div className="mt-4">
      {children}
     </div>
    </AuthProvider>
   </body>
  </html>
 );
}
