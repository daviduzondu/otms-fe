import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BarChart, Bell, Book, Calendar, FileText, Home, LogOut, PieChart, PlusCircle, Settings, Users, User } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'
import AuthGuard from '../../components/guards/auth-guard'
import DashboardGreeting from './dashboard.client'
import UserProfileBtn from '../../components/user-profile-btn'
import RecentTests from '../../components/dashboard/recent-tests'
import Sidebar from '../../components/dashboard/sidebar'
import TestList from '../../components/dashboard/test-list'
import UpcomingTests from '../../components/dashboard/upcoming-tests'


export const metadata: Metadata = {
 title: 'Dashboard',
 description: 'Welcome to your Dashboard',
};

export default function TeacherDashboard() {
 return (
  <AuthGuard>
   <div className="flex h-screen bg-gray-100">
    {/* Sidebar */}
    <Sidebar />

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
        {/* <UserProfileBtn className='' /> */}
        {/* <Avatar>
         <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Teacher" />
         <AvatarFallback>TC</AvatarFallback>
        </Avatar> */}
       </div>
      </div>
     </header>

     {/* Dashboard Content */}
     <div className="p-8">
      {/* Quick Actions */}
      <div className="mb-8">
       <DashboardGreeting />
       {/* <h2 className="text-xl font-semibold text-gray-800 mb-4">Welcome back, </h2> */}
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
       <RecentTests />
       <UpcomingTests />
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
  </AuthGuard>
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