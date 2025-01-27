'use client'

import { ReactNode, useContext, useEffect, useState } from "react"
import { AuthContext } from "../../contexts/auth.context"
import { Button } from "../ui/button"
import { Activity, Bell, ClipboardList, GraduationCap, Home, HomeIcon, LogOut, Menu, PlusCircle, School, Settings, Sparkles, Users, X } from "lucide-react"
import Link from 'next/link'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { ErrorBoundary } from "react-error-boundary"
import LocalErrorFallback from "../errors/local-error-fallback"
import { ibm } from "../../app/fonts"
import { useShellContext } from "../../contexts/providers/main-action-btn.provider"

type NavMap = {
 [path: string]: [string, JSX.Element];
};

const navMap: NavMap = {
 "/dashboard": ["Overview", <Home />],
 "/dashboard/tests": ["Tests", <ClipboardList />],
 "/dashboard/classes": ["Classes", <School />],
 "/dashboard/students": ["Students", <Users />],
};

export default function DashboardShell({ children }) {
 const [sidebarOpen, setSidebarOpen] = useState(false)
 const pathname = usePathname();
 const { componentProps } = useShellContext();
 const { Component, props } = componentProps;
 const [topBar, setTopBar] = useState<{ icon: JSX.Element, text: string }>({
  text: navMap[pathname][0],
  icon: navMap[pathname][1]
 });



 return <div className="flex w-full h-screen overflow-hidden"><aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}
 >
  <div className="flex items-center justify-between h-16 px-6 bg-gray-800 text-white">
   <Link href="/" className={`font-plex ${ibm.className} text-2xl font-semibold flex gap-2 items-center`}><GraduationCap size={30} /> OTMS</Link>
   <Button
    variant="ghost"
    size="icon"
    onClick={() => setSidebarOpen(false)}
    className="lg:hidden"
   >
    <X className="h-6 w-6" />
   </Button>
  </div>
  <nav className="mt-6 relative flex-1">
   <NavItem setTopBar={setTopBar} icon={<Home />} label="Overview" href={'/dashboard'} />
   <NavItem setTopBar={setTopBar} icon={<ClipboardList />} label="Tests" href={'/dashboard/tests'} />
   <NavItem setTopBar={setTopBar} icon={<School />} label="Classes" href={'/dashboard/classes'} />
   <NavItem setTopBar={setTopBar} icon={<Users />} label="Students" href={'/dashboard/students'} />
   <NavItem setTopBar={setTopBar} icon={<LogOut />} label="Logout" onClick={() => confirm("Are you sure you want to log out?") && signOut({ callbackUrl: '/' })} className={"absolute bottom-0 w-full"} />
  </nav>

 </aside>
  <div className="flex-1 flex flex-col overflow-hidden">
   <header className="flex items-center justify-between h-16 px-6 bg-white border-b">
    <div className="flex items-center">
     <Button
      variant="ghost"
      size="icon"
      onClick={() => setSidebarOpen(true)}
      className="lg:hidden mr-4"
     >
      <Menu className="h-6 w-6" />
     </Button>
     <div className="text-2xl font-semibold flex items-center gap-2">
      {topBar.icon}
      <h1>
       {topBar.text}
      </h1>
     </div>
    </div>
    <div className="flex items-center space-x-4">
     {/* <Link href='/test/create'>
      <Button className='absolute right-5 bottom-5 lg:relative lg:right-auto lg:bottom-auto'>
       <PlusCircle className="w-4 h-4 mr-2" />
       Create New Test
      </Button>
     </Link> */}
     <Button variant="outline" className="z-10 absolute right-5 bottom-20 lg:relative lg:right-auto lg:bottom-auto">       <Sparkles className="w-4 h-4 mr-2" />
      My Branding</Button>
     {Component ? <Component {...props} /> : <p>No component set.</p>}
    </div>
   </header>
   <main className="flex-1 flex overflow-x-hidden overflow-y-auto">
    <div className="mx-auto px-6 py-6 w-full">
     <ErrorBoundary FallbackComponent={LocalErrorFallback} >
      {children}
     </ErrorBoundary>
    </div></main>
  </div></div>

}

function NavItem({ icon, label, href = "#", onClick = () => { }, className, setTopBar }: { icon: JSX.Element, label: string, href?: string, onClick?: () => void, className?: string, setTopBar: React.Dispatch<React.SetStateAction<{ icon: JSX.Element, text: string }>> }) {
 const pathname = usePathname();

 return (
  <Link
   href={href}
   onClick={() => {
    if (href !== "#") setTopBar({ icon, text: label })
    onClick();
   }}
   className={`${className} flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 ${pathname === href ? 'bg-gray-200' : ''
    }`}
  >
   {icon}
   <span className="mx-3">{label}</span>
  </Link>
 )
}