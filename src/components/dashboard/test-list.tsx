'use client'
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Link from "next/link";
import { useContext } from "react";
import { AuthContext } from "../../contexts/auth.context";
import { formatDistance, subDays } from "date-fns";
import { FolderX } from "lucide-react";
import { TestDetails } from "../../types/test";

// Function to fetch tests
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

export default function TestList() {
 const { user } = useContext(AuthContext);

 // Use React Query to fetch the tests
 const { data, isError, isLoading, error } = useQuery<(TestDetails & { createdAt: string })[]>({
  queryKey: ['tests', user?.accessToken], // Unique key that includes accessToken
  queryFn: () => fetchTests(user.accessToken),
  staleTime: 10000,
  enabled: !!user?.accessToken, // Only run if user has an accessToken
  // throwOnError: (error) => error.message,
  // onError: , // React Query's error handling
 });

 // While the data is loading, show the skeleton loader
 if (isLoading) {
  return <Skeleton count={3} height={20} />;
 }

 // If an error occurred, it will be handled by React Error Boundary
 if (isError) {
  throw new Error("Failed to fetch tests. Check your network and try again.");
 }

 if (data && data.length === 0)
  return <div className="h-full w-full gap-2 flex flex-col items-center justify-center">
   <FolderX size={50} />
   <span className="text-xl">Nothing to see here...</span>
  </div>
 // Display the list of tests if available
 return (
  <ul className="space-y-4">
   {data && data.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).filter((x, i) => i <= 7).map((test, index) => (
    <li key={index} className="flex items-center justify-between">
     <div>
      <h3 className="font-semibold">{test.title}</h3>
      <p className="text-sm text-muted-foreground" title={test.createdAt}>{formatDistance(test.createdAt, new Date(), { addSuffix: true })}</p>
     </div>

     <Link href={`/test/${test.id}`}>
      <Button variant="outline" size="sm">View</Button>
     </Link>
    </li>
   ))}
  </ul>
 );
}
