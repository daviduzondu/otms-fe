'use client'
import React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { useQuery } from "@tanstack/react-query";
import { Loader } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';

async function getResults(accessToken: string, testId: string) {
 const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tests/${testId}/result`, {
  headers: {
   'X-Access-Token': `${accessToken}`,
  },
 });
 const { message, data } = await res.json();
 if (!res.ok) {
  throw new Error(message || "Failed to fetch recent tests");
 }

 return data;
}

const ResultsDialog = ({ accessToken, testId }: { accessToken: string, testId: string }) => {
 const { data, isError, isLoading, error } = useQuery({
  queryKey: ['analytics-summary', accessToken],
  queryFn: () => getResults(accessToken, testId),
  staleTime: 10000,
  enabled: !!accessToken
 });

 if (isLoading) {
  return <Button variant={'outline'} className={`w-full ${isLoading ? "cursor-not-allowed" : null}`} disabled={isLoading}> <Loader className='animate-spin' /> Loading results</Button>
 }

 // If an error occurred, it will be handled by React Error Boundary
 if (isError) {
  throw new Error("Failed to fetch result.");
 }

 return (
  <Dialog>
   <DialogTrigger asChild>
    <Button variant={'outline'} className="w-full" disabled={isLoading}>View Results</Button>
   </DialogTrigger>
   <DialogContent>
    <DialogTitle>Results</DialogTitle>
    <DialogDescription>
     Here are the results of your test.
    </DialogDescription>
    <div>
     <h2>{data.title}</h2>
     <p><strong>Final Score:</strong> {data.results[0].finalScore}</p>

     <h3>Breakdown</h3>
     <Table>
      <TableHeader>
       <TableRow className="uppercase [&>*]:border [&>*]:border-black [&>*]:text-black [&>*]:font-bold [&>*]:p-2">
        <TableHead>Partially Correct Answers</TableHead>
        <TableHead>Correct Answers</TableHead>
        <TableHead>Incorrect Answers</TableHead>
       </TableRow>
      </TableHeader>
      <TableBody>
       <TableRow className="[&>*]:border-black [&>*]:p-2">
        <TableCell>{data.results[0].breakdown.partiallyCorrectAnswerCount}</TableCell>
        <TableCell>{data.results[0].breakdown.correctAnswerCount}</TableCell>
        <TableCell>{data.results[0].breakdown.incorrectAnswerCount}</TableCell>
       </TableRow>
      </TableBody>
     </Table>
    </div>
   </DialogContent>
  </Dialog>
 );
};

export default ResultsDialog;