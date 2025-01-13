import "@/app/globals.css"
import { AuthProvider } from "../../contexts/auth.context"
import AuthSessionProvider from "../../contexts/providers/auth-session.provider"
import AuthGuard from "@/components/guards/auth-guard";
import { headers } from "next/headers";
import DashboardShell from "../../components/dashboard/shell.client";
import { ErrorBoundary } from "react-error-boundary";
import LocalErrorFallback from "../../components/errors/local-error-fallback";

export const metadata = {
 title: 'OTMS | Dashboard',
 description: 'Your All-In-One Platform to Create, Deliver & Grade Tests For Students, Effectively.',
}

export default function DashboardLayout({
 children,
}: {
 children: React.ReactNode
}) {
 const pathname = headers().get('x-pathname');
 return (
  <AuthSessionProvider>
   <AuthProvider>
    <AuthGuard next={pathname}>

     <div className="flex h-screen">
      <DashboardShell>{children}</DashboardShell>
      {/* <div className="flex-1 flex flex-col overflow-hidden">

      </div> */}
     </div>
    </AuthGuard>
   </AuthProvider>
  </AuthSessionProvider>
 )
}
