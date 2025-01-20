'use client'

import React, { useContext, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, UserPlus, Edit, Activity, PlusCircle, BookOpen, FolderX } from 'lucide-react'
import { format, isToday, isYesterday, isThisWeek, isThisMonth, parseISO } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { AuthContext } from '../../contexts/auth.context'
import Skeleton from 'react-loading-skeleton'
import { ScrollArea } from '../ui/scroll-area'

interface ActivityItem {
 id: string
 type: string
 createdAt: string
 [key: string]: any
}

interface GroupedActivity {
 icon: React.ReactNode
 message: string
 timestamp: string
}

const getActivityIcon = (type: string) => {
 switch (type) {
  case 'new_class':
   return <BookOpen className="w-4 h-4" />
  case 'new_student':
   return <UserPlus className="w-4 h-4" />
  case 'new_test':
   return <FileText className="w-4 h-4" />
  case 'new_question':
  case 'update_question':
   return <Edit className="w-4 h-4" />
  default:
   return <Activity className="w-4 h-4" />
 }
}

const groupActivities = (activities: ActivityItem[]): GroupedActivity[] => {
 const grouped: { [key: string]: { [type: string]: ActivityItem[] } } = {}

 activities.forEach(activity => {
  const date = parseISO(activity.createdAt)
  const dateKey = format(date, 'yyyy-MM-dd')
  if (!grouped[dateKey]) {
   grouped[dateKey] = {}
  }
  if (!grouped[dateKey][activity.type]) {
   grouped[dateKey][activity.type] = []
  }
  grouped[dateKey][activity.type].push(activity)
 })

 return Object.entries(grouped).flatMap(([dateKey, typeGroups]) =>
  Object.entries(typeGroups).map(([type, items]) => {
   const latestDate = parseISO(items[0].createdAt)
   let message = ''
   let icon = getActivityIcon(type)

   switch (type) {
    case 'new_student':
     message = `${items.length} new ${items.length === 1 ? 'student' : 'students'} added`
     break
    case 'new_test':
     message = `${items.length} new ${items.length === 1 ? 'test' : 'tests'} created`
     break
    case 'new_class':
     message = `${items.length} new ${items.length === 1 ? 'class' : 'classes'} created`
     break
    case 'new_question':
     message = `${items.length} new ${items.length === 1 ? 'question' : 'questions'} added`
     break
    case 'update_question':
     message = `${items.length} ${items.length === 1 ? 'question' : 'questions'} updated`
     break
    default:
     message = `${items.length} ${type} ${items.length === 1 ? 'activity' : 'activities'}`
   }

   return { icon, message, timestamp: latestDate.toISOString() }
  })
 ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

function getHumanReadableTimeStamp(date: Date) {
 let timestamp
 if (isToday(date)) {
  timestamp = `Today, ${format(date, 'h:mm a')}`
 } else if (isYesterday(date)) {
  timestamp = `Yesterday, ${format(date, 'h:mm a')}`
 } else if (isThisWeek(date)) {
  timestamp = format(date, 'EEEE, h:mm a')
 } else if (isThisMonth(date)) {
  timestamp = format(date, 'MMMM d, h:mm a')
 } else {
  timestamp = format(date, 'MMMM d, yyyy')
 }
 return timestamp
}

async function fetchRecentActivity(accessToken: string) {
 const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/recent-activities`, {
  method: "GET",
  headers: {
   "Authorization": `Bearer ${accessToken}`
  }
 });
 const { message, data } = await response.json();
 if (!response.ok) {
  throw new Error(message || "Failed to get recent activities");
 }
 return data;
}

export const DashboardActivityLog: React.FC = () => {
 const { user } = useContext(AuthContext);
 const { data, isError, isLoading, error } = useQuery<ActivityItem[]>({
  queryKey: ['recent-activities', user?.accessToken],
  queryFn: () => fetchRecentActivity(user?.accessToken || ''),
  enabled: !!user?.accessToken
 });

 const groupedActivities = useMemo(() => {
  if (data) {
   return groupActivities(data);
  }
  return [];
 }, [data]);
 if (isLoading) {
  return <Skeleton count={5} height={10} style={{ width: "100%" }} />
 }

 if (isError) {
  throw new Error("Failed to fetch recent activities. Check your network and try again.");
 }

 return (
  <Card className="h-full flex flex-col">
   <CardHeader>
    <CardTitle>Recent Activity</CardTitle>
    <CardDescription>An overview of recent activity</CardDescription>
   </CardHeader>
   <ScrollArea className="p-6 pt-0 pl-0 h-full">
    <CardContent className={"flex flex-col flex-1 h-full"}>
     {(groupActivities.length === 0) ? <div className="h-full w-full gap-2 flex flex-col items-center justify-center">
      <FolderX size={50} />
      <span className="text-xl">No activity yet...</span>
     </div> : groupedActivities.map((activity, index) => (
      <div key={index} className="flex items-start mb-4">
       <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
        {activity.icon}
       </div>
       <div className="ml-4">
        <p className="text-sm font-medium">{activity.message}</p>
        <p className="text-xs text-gray-500">{getHumanReadableTimeStamp(new Date(activity.timestamp))}</p>
       </div>
      </div>
     ))}
    </CardContent>
   </ScrollArea>
  </Card >
 )
}