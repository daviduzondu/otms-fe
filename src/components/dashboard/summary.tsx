'use client'
import { Users, ClipboardList, Activity, School } from "lucide-react";
import { Card } from "../ui/card"
import { useQuery } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import { useContext } from "react";
import { AuthContext } from "../../contexts/auth.context";

async function fetchDashboardSummary(accessToken: string) {
 const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/dashboard`, {
  headers: {
   'Authorization': `Bearer ${accessToken}`,
  },
 });

 const { message, data } = await res.json();
 if (!res.ok) {
  throw new Error(message || "Failed to fetch recent tests");
 }

 return data;
}

export default function DashboardSummary() {
 const {user} = useContext(AuthContext);


 const { data, isError, isLoading, error } = useQuery({
  queryKey: ['analytics-summary', user?.accessToken], 
  queryFn: () => fetchDashboardSummary(user.accessToken),
  staleTime: 10000,
  enabled: !!user?.accessToken, 
 });

 // While the data is loading, show the skeleton loader
 if (isLoading) {
  return <div className="pb-3"> <Skeleton count={1} height={100} style={{width:"100%"}} /></div>
 }

 // If an error occurred, it will be handled by React Error Boundary
 if (isError) {
  throw new Error("Failed to fetch tests. Check your network and try again.");
 }
 return <div className={"grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4"}>
  <StatCard title="Total Students" value={data.totalStudents} icon={<Users className="h-8 w-8" />} />
  <StatCard title="Active Classes" value={data.classes} icon={<School className="h-8 w-8" strokeWidth="2"/>} />
  <StatCard title="Tests Created" value={data.testCount} icon={<ClipboardList className="h-8 w-8" />} />
  <StatCard title="Avg. Performance" value={`${Math.round(data.averagePerformance)}%`} icon={<Activity className="h-8 w-8" />} />
 </div>
}

function StatCard({ title, value, icon }) {
 return (
  <Card className="flex items-center p-6">
   <div className="p-3 rounded-full border-2 border-black bg-opacity-10">
    {icon}
   </div>
   <div className="ml-4">
    <h3 className="mb-2 text-sm font-medium text-gray-600 ">{title}</h3>
    <p className="text-lg font-semibold text-gray-700">{value}</p>
   </div>
  </Card>
 )
}
