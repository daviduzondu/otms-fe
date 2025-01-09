'use client'

import { useContext, useState } from "react"
import { AuthContext } from "../../contexts/auth.context"
import { Button } from "../ui/button"
import { Activity, Bell, ClipboardList, GraduationCap, Home, LogOut, Menu, PlusCircle, Settings, Users, X } from "lucide-react"
import Link from 'next/link'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

export default function DashboardShell({ children }) {
 const { user } = useContext(AuthContext)
 const [sidebarOpen, setSidebarOpen] = useState(false)


 return <><aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}
 >
  <div className="flex items-center justify-between h-16 px-6 bg-gray-800 text-white">
   <Link href="/" className="text-2xl font-semibold flex gap-2 items-center"><GraduationCap size={30} /> OTMS</Link>
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
   <NavItem icon={<Home />} label="Overview" href={'/dashboard'} />
   <NavItem icon={<ClipboardList />} label="Tests" href={'/dashboard/tests'} />
   <NavItem icon={<GraduationCap />} label="Classes" />
   <NavItem icon={<Users />} label="Students" />
   <NavItem icon={<Activity />} label="Analytics" />
   <NavItem icon={<Settings />} label="Settings" />
   <NavItem icon={<LogOut />} label="Logout" onClick={() => signOut({ callbackUrl: '/' })} className={"absolute bottom-0 w-full"} />
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
     <h1 className="text-2xl font-semibold">Dashboard</h1>
    </div>
    <div className="flex items-center space-x-4">
     <Link href='/test/create'>
      <Button className='absolute right-5 bottom-5 lg:relative lg:right-auto lg:bottom-auto'>
       <PlusCircle className="w-4 h-4 mr-2" />
       Create New Test
      </Button>
     </Link>
     <Button variant="ghost" size="icon">
      <Bell className="h-5 w-5" />
     </Button>
     <Avatar>
      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Teacher" />
      <AvatarFallback>TC</AvatarFallback>
     </Avatar>
    </div>
   </header>
   <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
    <div className="mx-auto px-6 py-6">
     {children}
    </div></main>
  </div></>

}

function NavItem({ icon, label, href = "#", onClick = () => { }, className }: { icon: JSX.Element, label: string, href?: string, onClick?: () => void, className?: string }) {
 const pathname = usePathname();

 return (
  <Link
   href={href}
   onClick={onClick}
   className={`${className} flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 ${pathname === href ? 'bg-gray-200' : ''
    }`}
  >
   {icon}
   <span className="mx-3">{label}</span>
  </Link>
 )
}