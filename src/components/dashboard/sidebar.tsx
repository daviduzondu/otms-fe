'use client'
import { Home, FileText, Users, Book, PieChart, Settings, User } from "lucide-react"
import { signOut } from "next-auth/react"

export default function Sidebar() {
 return <aside className="w-64 bg-white shadow-md">
  <div className="p-4">
   <h2 className="text-2xl font-bold text-primary">OTMS</h2>
  </div>
  <nav className="mt-6">
   <NavItem icon={<Home className="w-5 h-5 mr-2" />} label="Dashboard" active />
   <NavItem icon={<FileText className="w-5 h-5 mr-2" />} label="Tests" />
   <NavItem icon={<Users className="w-5 h-5 mr-2" />} label="Students" />
   <NavItem icon={<Book className="w-5 h-5 mr-2" />} label="Question Pools" />
   <NavItem icon={<PieChart className="w-5 h-5 mr-2" />} label="Analytics" />
   <NavItem icon={<Settings className="w-5 h-5 mr-2" />} label="Settings" />
   
   <div className="fixed bottom-3" onClick={() => signOut({ callbackUrl: '/' })}>
    <NavItem icon={<User className="w-5 h-5 mr-2" />} label="Log Out" />
   </div>
  </nav>
 </aside>
}

function NavItem({ icon, label, active = false }) {
 return (
  <a
   href="#"
   className={`flex items-center px-4 py-2 text-gray-700 ${active ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'
    }`}
  >
   {icon}
   {label}
  </a>
 )
}