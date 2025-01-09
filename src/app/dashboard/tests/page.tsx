'use client'

import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { AuthContext } from "../../../contexts/auth.context";
import { Table, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { cn } from "../../../lib/utils";
import { TestDetails } from "../../../types/test";

const fetchTests = async (accessToken: string) => {
 const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tests`, {
  headers: {
   'Authorization': `Bearer ${accessToken}`,
  },
 });

 const { message, data } = await res.json();
 if (!res.ok) {
  throw new Error(message || "Failed to fetch recent tests");
 }

 return data;
};


export default function DashboardTests() {
 const { user } = useContext(AuthContext);

 const { data, isError, isLoading, error } = useQuery<TestDetails[]>({
  queryKey: ['tests', user?.accessToken],
  queryFn: () => fetchTests(user.accessToken),
  staleTime: 10000,
  enabled: !!user?.accessToken,
 });

 return <div>
  <h2 className="text-2xl font-semibold">All Tests</h2>
  {console.log(data)}
  <div>
   <Table>
    <TableRow >
     <TableHead>Title</TableHead>
     <TableHead>Created At</TableHead>
     <TableHead>No. of Participant</TableHead>
     <TableHead>Actions</TableHead>
    </TableRow>
   </Table>
  </div>
 </div>
}