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
import { DashboardActivityLog } from '../../components/dashboard/dashboard-activity-log'
import { ErrorBoundary } from 'react-error-boundary'
import LocalErrorFallback from '../../components/errors/local-error-fallback'

const topicPerformance = [
 { name: "Algebra", score: 85 },
 { name: "Geometry", score: 78 },
 { name: "Calculus", score: 72 },
 { name: "Statistics", score: 88 },
]

export default function Page() {
 const { user } = useContext(AuthContext);


 return (
  <div className="flex flex-col h-[85vh]">
   <h2 className="text-xl font-semibold text-gray-800 mb-4">
    Welcome back, {user.firstName} {user.lastName}
   </h2>
   <DashboardSummary />

   <div className="flex-1 flex w-full [&>*]:flex-1 gap-6 -mt-2 min-h-0 overflow-hidden">
    <RecentTests />
    <ErrorBoundary FallbackComponent={LocalErrorFallback}>
     <DashboardActivityLog />
    </ErrorBoundary>
   </div>
  </div>


 )
}

