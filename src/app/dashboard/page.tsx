'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Menu, X, ChevronDown, Users, GraduationCap, ClipboardList, Activity, BookOpen, School, User, Settings, Bell, PlusCircle, FileText, Calendar, Home, LogOut, PieChart, UserPlus, Edit } from 'lucide-react'
import Link from 'next/link'

// Mock data (replace with actual data fetching in a real application)
const recentTests = [
 { id: 1, name: "Mathematics Quiz - Algebra", date: "Created 2 days ago", avgScore: 78 },
 { id: 2, name: "English Literature - Shakespeare", date: "Administered 4 days ago", avgScore: 82 },
 { id: 3, name: "Science - Biology Basics", date: "Created 1 week ago", avgScore: 75 },
]

const upcomingTests = [
 { id: 1, name: "Chemistry - Periodic Table", date: "Scheduled for tomorrow" },
 { id: 2, name: "Geography - Climate Zones", date: "Scheduled for 3 days from now" },
 { id: 3, name: "Computer Science - Algorithms", date: "Scheduled for next week" },
]

const classPerformance = [
 { subject: "Math", avgScore: 76 },
 { subject: "English", avgScore: 82 },
 { subject: "Science", avgScore: 79 },
 { subject: "History", avgScore: 85 },
]

const studentProgress = [
 { name: "Week 1", avgScore: 65 },
 { name: "Week 2", avgScore: 68 },
 { name: "Week 3", avgScore: 72 },
 { name: "Week 4", avgScore: 75 },
 { name: "Week 5", avgScore: 79 },
]

const topicPerformance = [
 { name: "Algebra", score: 85 },
 { name: "Geometry", score: 78 },
 { name: "Calculus", score: 72 },
 { name: "Statistics", score: 88 },
]


const activityLog = [
 { icon: <FileText className="w-4 h-4" />, message: "New test 'Advanced Algebra' created", timestamp: "2 hours ago" },
 { icon: <UserPlus className="w-4 h-4" />, message: "5 new students added to 'Physics 101'", timestamp: "4 hours ago" },
 { icon: <Edit className="w-4 h-4" />, message: "Question bank updated for 'World History'", timestamp: "Yesterday" },
 { icon: <Activity className="w-4 h-4" />, message: "Monthly performance report generated", timestamp: "2 days ago" },
]

export default function Dashboard() {
 const [sidebarOpen, setSidebarOpen] = useState(false)

 return (
  <div className="flex h-screen bg-gray-100">
   {/* Sidebar */}
   <aside
    className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
     } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
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
    <nav className="mt-6">
     <NavItem icon={<Home />} label="Dashboard" active />
     <NavItem icon={<ClipboardList />} label="Tests" />
     <NavItem icon={<GraduationCap />} label="Classes" />
     <NavItem icon={<Users />} label="Students" />
     <NavItem icon={<Activity />} label="Analytics" />
     <NavItem icon={<Settings />} label="Settings" />
     <NavItem icon={<LogOut />} label="Logout" />
    </nav>
   </aside>

   {/* Main content */}
   <div className="flex-1 flex flex-col overflow-hidden">
    {/* Top bar */}
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

    {/* Main content area */}
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
     <div className="mx-auto px-6 py-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Welcome back, Teacher</h2>

      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
       <StatCard title="Total Students" value="1,234" icon={<Users className="h-8 w-8" />} />
       <StatCard title="Active Classes" value="56" icon={<GraduationCap className="h-8 w-8" />} />
       <StatCard title="Tests Conducted" value="289" icon={<ClipboardList className="h-8 w-8" />} />
       <StatCard title="Avg. Performance" value="78%" icon={<Activity className="h-8 w-8" />} />
      </div>

      <div className="grid gap-6 mb-8 md:grid-cols-2 h-[100%]">
       <Card>
        <CardHeader>
         <CardTitle>Recent Tests</CardTitle>
        </CardHeader>
        <CardContent>
         <div className="space-y-8">
          {recentTests.map((test) => (
           <div key={test.id} className="flex items-center">
            <div className="ml-4 space-y-1">
             <p className="text-sm font-medium leading-none">{test.name}</p>
             <p className="text-sm text-muted-foreground">
              {test.date} | Avg. Score: {test.avgScore}%
             </p>
            </div>
            <div className="ml-auto font-medium">
             <Button variant="ghost" size="sm">View Details</Button>
            </div>
           </div>
          ))}
         </div>
        </CardContent>
       </Card>
       <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLog.map((activity, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {activity.icon}
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
       <Card>
            <CardHeader>
              <CardTitle>Average Score per test</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topicPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#8884d8" name="Score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
      </div>
     </div>
    </main>
   </div>
  </div>
 )
}

function StatCard({ title, value, icon }) {
 return (
  <Card className="flex items-center p-6">
   <div className="p-3 rounded-full bg-violet-500 bg-opacity-10">
    {icon}
   </div>
   <div className="ml-4">
    <h3 className="mb-2 text-sm font-medium text-gray-600">{title}</h3>
    <p className="text-lg font-semibold text-gray-700">{value}</p>
   </div>
  </Card>
 )
}

function NavItem({ icon, label, active = false }) {
 return (
  <a
   href="#"
   className={`flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 ${active ? 'bg-gray-100' : ''
    }`}
  >
   {icon}
   <span className="mx-3">{label}</span>
  </a>
 )
}