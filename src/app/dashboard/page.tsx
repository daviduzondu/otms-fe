'use client';
import { useContext, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { PlusCircle } from 'lucide-react';
import Link from 'next/link'
import RecentTests from '../../components/dashboard/recent-tests'
import { AuthContext } from '../../contexts/auth.context'
import DashboardSummary from '../../components/dashboard/summary'
import { DashboardActivityLog } from '../../components/dashboard/dashboard-activity-log'
import { ErrorBoundary } from 'react-error-boundary'
import LocalErrorFallback from '../../components/errors/local-error-fallback'
import { useShellContext } from '../../contexts/providers/main-action-btn.provider'

export default function Page() {
 const { user } = useContext(AuthContext);
 const { setComponentProps } = useShellContext();

 useEffect(() => {
  const setCustomComponent = () => {
   setComponentProps({
    Component: Link, // The outer Link component
    props: {
     href: '/test/create', // Link's href prop
     children: (
      <Button className="absolute right-5 bottom-5 lg:relative lg:right-auto lg:bottom-auto">
       <PlusCircle className="w-4 h-4 mr-2" />
       Create New Test
      </Button>
     ),
    },
   });
  };
  setCustomComponent();
 }, [setComponentProps]);

 return (
  <div className="flex flex-col h-full">
   <h2 className="text-xl font-semibold text-gray-800 mb-4">
    Welcome back, {user.firstName} {user.lastName}
   </h2>
   <DashboardSummary />

   <div className="flex w-full [&>*]:w-1/2 h-full gap-6 -mt-2 overflow-hidden">
    <RecentTests />
    <ErrorBoundary FallbackComponent={LocalErrorFallback}>
     <DashboardActivityLog />
    </ErrorBoundary>
   </div>
  </div>


 )
}

