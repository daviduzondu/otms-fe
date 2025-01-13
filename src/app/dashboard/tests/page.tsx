'use client'

import { useQuery } from "@tanstack/react-query"
import { useContext, useState } from "react"
import { AuthContext } from "../../../contexts/auth.context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { formatDistance } from "date-fns"
import {
 ColumnDef,
 flexRender,
 getCoreRowModel,
 useReactTable,
 getPaginationRowModel,
 SortingState,
 getSortedRowModel,
 ColumnFiltersState,
 getFilteredRowModel,
} from "@tanstack/react-table"
import { ChartNoAxesColumn, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, Loader, Search, SearchIcon, Trash2 } from 'lucide-react'
import { TestDetails } from "../../../types/test"
import Skeleton from "react-loading-skeleton"
import Link from "next/link"
import { ChartDialog } from "../../../components/dashboard/analytics"

const testData = {
 message: "Test metrics retrieve successfully",
 data: {
   id: "7949439e-c4f4-4ef2-a90e-087812a9e16a",
   institutionId: null,
   code: "lofmyjm",
   printCount: null,
   instructions: "",
   title: "Introduction to Python",
   isDeleted: false,
   isRevoked: false,
   disableCopyPaste: false,
   provideExplanations: false,
   randomizeQuestions: false,
   requireFullScreen: false,
   teacherId: "c41f4b4d-e439-44e5-96ed-e9ee08e72a22",
   durationMin: 60,
   showResultsAfterTest: false,
   attempts: [
     {
       class: {
         id: "cb9ac5b6-905b-464a-b127-c34242489522",
         name: "Data Communications and Networking",
         teacherId: "c41f4b4d-e439-44e5-96ed-e9ee08e72a22"
       },
       id: "07e5d1fc-d47a-4e9d-9206-5022d919b426",
       firstName: "Silas",
       lastName: "Gaines",
       totalPoints: 0
     },
     {
       class: {
         id: "cb9ac5b6-905b-464a-b127-c34242489522",
         name: "Data Communications and Networking",
         teacherId: "c41f4b4d-e439-44e5-96ed-e9ee08e72a22"
       },
       id: "f6cb5ea1-8368-46f0-a124-32fbd5c88b86",
       firstName: "Wayne",
       lastName: "Ugo",
       totalPoints: 10
     }
   ],
   questionStats: [
     {
       questionId: "5ac3569b-e2c0-4bed-baac-c8f1de82b8be",
       points: 3,
       body: "<p>Write a short note on what you understand by <strong>Generative Pretrained Transformers</strong></p>",
       index: 4,
       responses: [
         {
           id: "e74dcc3c-d8a1-481c-b209-ad7b80cbf4e8",
           firstName: "Silas",
           lastName: "Gaines",
           point: null,
           answer: "Fuck this shit!",
           submittedAt: "2025-01-09T08:31:55.109"
         },
         {
           id: "45e885e3-ab4a-4bc3-8027-b17ecaa62397",
           firstName: "Wayne",
           lastName: "Ugo",
           point: null,
           answer: "What the fuck?",
           submittedAt: "2025-01-09T08:31:09.69"
         }
       ],
       averageTimeSpentInSeconds: 5.27,
       answerCount: 2
     },
     {
       questionId: "c46f3691-ac3a-4555-ac75-5ceac23596cf",
       points: 10,
       body: "<p>Give a short history of Python and its versions.</p>",
       index: 1,
       responses: [
         {
           id: "615d1279-6381-49ca-b07b-5300c897fa59",
           firstName: "Silas",
           lastName: "Gaines",
           point: null,
           answer: null,
           submittedAt: null
         },
         {
           id: "161726d8-aa90-482e-b1ba-4d2764cecd77",
           firstName: "Wayne",
           lastName: "Ugo",
           point: null,
           answer: "Will?",
           submittedAt: "2025-01-09T08:31:15.856"
         }
       ],
       averageTimeSpentInSeconds: 6.15,
       answerCount: 1
     },
     {
       questionId: "ccb3cb0a-5195-4cab-b5b8-d7539088efe3",
       points: 10,
       body: "<p>What the actual fuck?</p>",
       index: 3,
       responses: [
         {
           id: "e3673da1-b9b7-4b96-8988-f1f739fe2860",
           firstName: "Silas",
           lastName: "Gaines",
           point: 0,
           answer: "s",
           submittedAt: "2025-01-09T08:31:45.116"
         },
         {
           id: "2d6e19e4-0e55-43a8-895c-994fb21c3b75",
           firstName: "Wayne",
           lastName: "Ugo",
           point: 0,
           answer: "s",
           submittedAt: "2025-01-09T08:30:17.922"
         }
       ],
       averageTimeSpentInSeconds: 4.2665,
       answerCount: 2
     },
     {
       questionId: "d4190d1c-8315-4888-9e06-f8d6131b261d",
       points: 10,
       body: "<p><strong>Something interesting...</strong></p>",
       index: 0,
       responses: [
         {
           id: "cf606476-0b45-4ca6-80be-5d0a7d4edc29",
           firstName: "Silas",
           lastName: "Gaines",
           point: 0,
           answer: "true",
           submittedAt: "2025-01-09T08:31:47.233"
         },
         {
           id: "8672d5ba-3e51-4aff-ab58-7caeb1f06bba",
           firstName: "Wayne",
           lastName: "Ugo",
           point: 0,
           answer: "true",
           submittedAt: "2025-01-09T08:30:58.361"
         }
       ],
       averageTimeSpentInSeconds: 21.253,
       answerCount: 2
     },
     {
       questionId: "e4f143e5-092d-48c6-b13f-a4d088c0a3fb",
       points: 10,
       body: "<p>What is the result of the following equation?</p><p><span class=\"ql-formula\" data-value=\"2+2=?\">﻿<span contenteditable=\"false\"><span class=\"katex\"><span class=\"katex-mathml\"><math xmlns=\"http://www.w3.org/1998/Math/MathML\"><semantics><mrow><mn>2</mn><mo>+</mo><mn>2</mn><mo>=</mo><mo stretchy=\"false\">?</mo></mrow><annotation encoding=\"application/x-tex\">2+2=?</annotation></semantics></math></span><span class=\"katex-html\" aria-hidden=\"true\"><span class=\"base\"><span class=\"strut\" style=\"height: 0.7278em; vertical-align: -0.0833em;\"></span><span class=\"mord\">2</span><span class=\"mspace\" style=\"margin-right: 0.2222em;\"></span><span class=\"mbin\">+</span><span class=\"mspace\" style=\"margin-right: 0.2222em;\"></span></span><span class=\"base\"><span class=\"strut\" style=\"height: 0.6444em;\"></span><span class=\"mord\">2</span><span class=\"mspace\" style=\"margin-right: 0.2778em;\"></span><span class=\"mrel\">=</span></span><span class=\"base\"><span class=\"strut\" style=\"height: 0.6944em;\"></span><span class=\"mclose\">?</span></span></span></span></span>﻿</span></p><p><br></p><p><strong>Show your work.</strong></p>",
       index: 2,
       responses: [
         {
           id: "3f695b1e-11a1-4ec2-9171-395a7feef889",
           firstName: "Silas",
           lastName: "Gaines",
           point: 0,
           answer: "5",
           submittedAt: "2025-01-09T08:31:49.258"
         },
         {
           id: "eb2bd26e-7f60-4328-b5c6-f747d58a0d74",
           firstName: "Wayne",
           lastName: "Ugo",
           point: 10,
           answer: "4",
           submittedAt: "2025-01-09T08:31:04.948"
         }
       ],
       averageTimeSpentInSeconds: 4.279,
       answerCount: 2
     }
   ]
 }
};


const fetchTests = async (accessToken: string) => {
 const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tests`, {
  headers: {
   'Authorization': `Bearer ${accessToken}`,
  },
 })

 const { message, data } = await res.json()
 if (!res.ok) {
  throw new Error(message || "Failed to fetch recent tests")
 }

 return data
}

const columns: ColumnDef<TestDetails>[] = [
 {
  accessorKey: "title",
  header: "Title",
  cell: ({ row }) => <div className="capitalize">{row.getValue("title")}</div>,
 },
 {
  accessorKey: "createdAt",
  header: "Created",
  cell: ({ row }) => formatDistance(new Date(row.getValue("createdAt")), new Date(), { addSuffix: true }),
 },
 {
  accessorKey: "durationMin",
  header: "Duration (minutes)",
  cell: ({ row }) => <div>{row.original.durationMin}</div>,
 },
 {
  accessorKey: "participantCount",
  header: "No. of Participants",
  cell: ({ row }) => row.original.participantCount || "0",
 },
 {
  id: "actions",
  header: "Actions",
  cell: ({ row }) => {
   const test = row.original
   return (
    <div className="space-x-2">
     <Link href={`/test/${test.id}`}>
      <Button variant="outline" size="sm">
       <Eye />
       View</Button>
     </Link>
     <Button variant={"outline"}>
      <ChartNoAxesColumn />
      Analytics</Button>
     <ChartDialog data={testData.data} />
     <Button variant="destructive" size="sm" onClick={() => console.log("Delete", test.id)}>
      <Trash2 />
      Delete</Button>
    </div>
   )
  },
 },
]

export default function DashboardTests() {
 const { user } = useContext(AuthContext)
 const [sorting, setSorting] = useState<SortingState>([])
 const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

 const { data, isError, isLoading, error } = useQuery<TestDetails[]>({
  queryKey: ['tests', user?.accessToken],
  queryFn: () => fetchTests(user?.accessToken || ''),
  staleTime: 10000,
  enabled: !!user?.accessToken,
 })

 const table = useReactTable({
  data: data || [],
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  onSortingChange: setSorting,
  getSortedRowModel: getSortedRowModel(),
  onColumnFiltersChange: setColumnFilters,
  getFilteredRowModel: getFilteredRowModel(),
  state: {
   sorting,
   columnFilters,
  },
 })

 if (isLoading) {
  return <div className="h-full w-full flex items-center justify-center">
   <Loader className={'animate-spin text-gray-600'} size={'70'} />
  </div>

 }

 if (isError) {
  throw new Error("Failed to fetch tests. Check your network and try again.")
 }

 return (
  <div className="space-y-4">
   <div className="relative flex items-center justify-center">
    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground" />
    <Input
     placeholder="Search tests..."
     value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
     onChange={(event) =>
      table.getColumn("title")?.setFilterValue(event.target.value)
     }
     className="pl-10"
    />
   </div>

   <div className="rounded-md border">
    <Table>
     <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
       <TableRow key={headerGroup.id}>
        {headerGroup.headers.map((header) => {
         return (
          <TableHead key={header.id}>
           {header.isPlaceholder
            ? null
            : flexRender(
             header.column.columnDef.header,
             header.getContext()
            )}
          </TableHead>
         )
        })}
       </TableRow>
      ))}
     </TableHeader>
     <TableBody>
      {table.getRowModel().rows?.length ? (
       table.getRowModel().rows.map((row) => (
        <TableRow
         key={row.id}
         data-state={row.getIsSelected() && "selected"}
        >
         {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
           {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
         ))}
        </TableRow>
       ))
      ) : (
       <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
         No results.
        </TableCell>
       </TableRow>
      )}
     </TableBody>
    </Table>
   </div>
   <div className="flex items-center justify-end space-x-2 py-4">
    <Button
     variant="outline"
     size="sm"
     onClick={() => table.setPageIndex(0)}
     disabled={!table.getCanPreviousPage()}
    >
     <ChevronsLeft className="h-4 w-4" />
    </Button>
    <Button
     variant="outline"
     size="sm"
     onClick={() => table.previousPage()}
     disabled={!table.getCanPreviousPage()}
    >
     <ChevronLeft className="h-4 w-4" />
    </Button>
    <Button
     variant="outline"
     size="sm"
     onClick={() => table.nextPage()}
     disabled={!table.getCanNextPage()}
    >
     <ChevronRight className="h-4 w-4" />
    </Button>
    <Button
     variant="outline"
     size="sm"
     onClick={() => table.setPageIndex(table.getPageCount() - 1)}
     disabled={!table.getCanNextPage()}
    >
     <ChevronsRight className="h-4 w-4" />
    </Button>
   </div>
  </div>
 )
}