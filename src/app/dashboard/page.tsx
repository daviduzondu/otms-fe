import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BarChart, Bell, Book, Calendar, FileText, Home, LogOut, PieChart, PlusCircle, Settings, Users } from 'lucide-react'
import Link from 'next/link'

export default function TeacherDashboard() {
 return (
  <div className="flex h-screen bg-gray-100">
   {/* Sidebar */}
   <aside className="w-64 bg-white shadow-md">
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
    </nav>
   </aside>

   {/* Main Content */}
   <main className="flex-1 overflow-y-auto">
    {/* Header */}
    <header className="bg-white shadow-sm">
     <div className="flex items-center justify-between px-8 py-4">
      <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
      <div className="flex items-center space-x-4">
       <Button variant="ghost" size="icon">
        <Bell className="w-5 h-5" />
       </Button>
       <Avatar>
        <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Teacher" />
        <AvatarFallback>TC</AvatarFallback>
       </Avatar>
      </div>
     </div>
    </header>

    {/* Dashboard Content */}
    <div className="p-8">
     {/* Quick Actions */}
     <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
      <div className="flex space-x-4">
       <Link href='/test/create'>
        <Button>
         <PlusCircle className="w-4 h-4 mr-2" />
         Create New Test
        </Button>
       </Link>
       <Button variant="outline">
        <FileText className="w-4 h-4 mr-2" />
        Manage Question Pools
       </Button>
       <Button variant="outline">
        <Users className="w-4 h-4 mr-2" />
        View Student Reports
       </Button>
      </div>
     </div>

     {/* Statistics */}
     <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatCard title="Total Tests" value="24" icon={<FileText className="w-4 h-4 text-muted-foreground" />} change="+2 from last week" />
      <StatCard title="Active Students" value="573" icon={<Users className="w-4 h-4 text-muted-foreground" />} change="+18 from last month" />
      <StatCard title="Average Score" value="76%" icon={<BarChart className="w-4 h-4 text-muted-foreground" />} change="+2% from last month" />
      <StatCard title="Upcoming Tests" value="3" icon={<Calendar className="w-4 h-4 text-muted-foreground" />} change="Next test in 2 days" />
     </div>

     {/* Recent and Upcoming Tests */}
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <Card>
       <CardHeader>
        <CardTitle>Recent Tests</CardTitle>
        <CardDescription>Last 5 tests created or administered</CardDescription>
       </CardHeader>
       <CardContent>
        <TestList tests={recentTests} />
       </CardContent>
      </Card>
      <Card>
       <CardHeader>
        <CardTitle>Upcoming Tests</CardTitle>
        <CardDescription>Tests scheduled for the next 7 days</CardDescription>
       </CardHeader>
       <CardContent>
        <TestList tests={upcomingTests} />
       </CardContent>
      </Card>
     </div>

     {/* Performance Insights */}
     <Card>
      <CardHeader>
       <CardTitle>Performance Insights</CardTitle>
       <CardDescription>Overview of student performance across recent tests</CardDescription>
      </CardHeader>
      <CardContent>
       <Tabs defaultValue="overall">
        <TabsList>
         <TabsTrigger value="overall">Overall Performance</TabsTrigger>
         <TabsTrigger value="bySubject">Performance by Subject</TabsTrigger>
         <TabsTrigger value="improvement">Areas for Improvement</TabsTrigger>
        </TabsList>
        <TabsContent value="overall">
         <div className="h-[300px] flex items-center justify-center bg-muted text-muted-foreground">
          Overall performance chart placeholder
         </div>
        </TabsContent>
        <TabsContent value="bySubject">
         <div className="h-[300px] flex items-center justify-center bg-muted text-muted-foreground">
          Performance by subject chart placeholder
         </div>
        </TabsContent>
        <TabsContent value="improvement">
         <div className="h-[300px] flex items-center justify-center bg-muted text-muted-foreground">
          Areas for improvement chart placeholder
         </div>
        </TabsContent>
       </Tabs>
      </CardContent>
     </Card>
    </div>
   </main>
  </div>
 )
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

function StatCard({ title, value, icon, change }) {
 return (
  <Card>
   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">{title}</CardTitle>
    {icon}
   </CardHeader>
   <CardContent>
    <div className="text-2xl font-bold">{value}</div>
    <p className="text-xs text-muted-foreground">{change}</p>
   </CardContent>
  </Card>
 )
}

function TestList({ tests }) {
 return (
  <ul className="space-y-4">
   {tests.map((test, index) => (
    <li key={index} className="flex items-center justify-between">
     <div>
      <h3 className="font-semibold">{test.name}</h3>
      <p className="text-sm text-muted-foreground">{test.date}</p>
     </div>
     <Button variant="outline" size="sm">View</Button>
    </li>
   ))}
  </ul>
 )
}

// Mock data
const recentTests = [
 { name: "Mathematics Quiz - Algebra", date: "Created 2 days ago" },
 { name: "English Literature - Shakespeare", date: "Administered 4 days ago" },
 { name: "Science - Biology Basics", date: "Created 1 week ago" },
 { name: "History - World War II", date: "Administered 1 week ago" },
 { name: "Physics - Mechanics", date: "Created 2 weeks ago" },
]

const upcomingTests = [
 { name: "Chemistry - Periodic Table", date: "Scheduled for tomorrow" },
 { name: "Geography - Climate Zones", date: "Scheduled for 3 days from now" },
 { name: "Computer Science - Algorithms", date: "Scheduled for next week" },
]