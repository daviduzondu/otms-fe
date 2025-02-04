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
  return <Button variant={'outline'} className={`w-full ${isLoading ? "cursor-not-allowed" : null}`} disabled={isLoading}> <Loader className='animate-spin' /> Loading results...</Button>
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
    <DialogTitle>Your result for: {data.title}</DialogTitle>
    <div className='flex gap-3 flex-col'>

     <div className='flex flex-col gap-2 items-center justify-center'>
      <span>
       Your score is:
      </span>
      <span className='text-7xl font-semibold'>{data.results[0].finalScore}<span className='text-5xl'>/{data.totalTestPoints}</span>
      </span>
     </div>

     <div className='flex flex-col gap-2 items-center justify-center text-black'>
      <Table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden ">
       <TableHeader className="bg-gray-100 [&>*]:text-black">
        <TableRow className="uppercase text-black text-sm leading-normal">
         <TableHead className="py-3 px-6 text-left">BREAKDOWN</TableHead>
        </TableRow>
       </TableHeader>
       <TableBody className="text-black text-sm [&>*]:text-black">
        <TableRow className="border-b border-gray-200 hover:bg-gray-100 [&>*]:text-black">
         <TableCell className="py-3 px-6 text-left whitespace-nowrap">Correct Answers</TableCell>
         <TableCell className="py-3 px-6 text-left whitespace-nowrap">{data.results[0].breakdown.correctAnswerCount}</TableCell>
        </TableRow>
        <TableRow className="border-b border-gray-200 hover:bg-gray-100 [&>*]:text-black">
         <TableCell className="py-3 px-6 text-left whitespace-nowrap">Incorrect Answers</TableCell>
         <TableCell className="py-3 px-6 text-left whitespace-nowrap">{data.results[0].breakdown.incorrectAnswerCount}</TableCell>
        </TableRow>
        <TableRow className="border-b border-gray-200 hover:bg-gray-100 [&>*]:text-black">
         <TableCell className="py-3 px-6 text-left whitespace-nowrap">Partially Correct Answers</TableCell>
         <TableCell className="py-3 px-6 text-left whitespace-nowrap">{data.results[0].breakdown.partiallyCorrectAnswerCount}</TableCell>
        </TableRow>
       </TableBody>
      </Table>
     </div>
    </div>
   </DialogContent>
  </Dialog>
 );
};

export default ResultsDialog;