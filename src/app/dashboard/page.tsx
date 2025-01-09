'use client'

import React, { useContext, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Menu, X, ChevronDown, Users, GraduationCap, ClipboardList, Activity, BookOpen, School, User, Settings, Bell, PlusCircle, FileText, Calendar, Home, LogOut, PieChart, UserPlus, Edit } from 'lucide-react'
import Link from 'next/link'
import RecentTests from '../../components/dashboard/recent-tests'
import { AuthContext } from '../../contexts/auth.context'
import DashboardSummary from '../../components/dashboard/summary'

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

export default function Page() {
 const { user } = useContext(AuthContext)

 return (
  <>
   <h2 className="text-xl font-semibold text-gray-800 mb-4">Welcome back, {user.firstName} {user.lastName}</h2>
   <DashboardSummary />

   <div className="grid gap-6 mb-8 md:grid-cols-2 h-[100%]">
    <RecentTests />
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
  </>
 )
}

