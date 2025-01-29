'use client'

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useContext, useEffect, useState, useMemo } from "react"
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
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, Loader, PlusCircle, SearchIcon, UserPlus2 } from 'lucide-react'
import Link from "next/link"
import { useShellContext } from "../../../contexts/providers/main-action-btn.provider"
import React from "react"
import AddStudent from "../../../components/test/add-student"

interface Student {
 id: string
 email: string
 regNumber: string
 firstName: string
 lastName: string
 middleName: string | null
 createdAt: string
}

const fetchStudents = async (accessToken: string) => {
 const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/students`, {
  headers: {
   'Authorization': `Bearer ${accessToken}`,
  },
 })

 const { message, data } = await res.json()
 if (!res.ok) {
  throw new Error(message || "Failed to fetch students")
 }

 return data
}

export default function Students() {
 const { user } = useContext(AuthContext)
 const { setComponentProps } = useShellContext();
 const [sorting, setSorting] = useState<SortingState>([
  { id: "createdAt", desc: true }
 ])
 const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
 const [isAddStudentOpen, setIsAddStudentOpen] = useState<boolean>(false)
 const queryClient = useQueryClient()

 const { data, isError, isLoading, error } = useQuery<Student[]>({
  queryKey: ['students', user?.accessToken],
  queryFn: () => fetchStudents(user?.accessToken || ''),
  staleTime: 10000,
  enabled: !!user?.accessToken,
 })

 useEffect(() => {
  setComponentProps({
   Component: Button,
   props: {
    onClick: () => setIsAddStudentOpen(true),
    className: "absolute right-5 bottom-5 lg:relative lg:right-auto lg:bottom-auto",
    children: (
     <>
      <UserPlus2 className="w-4 h-4 mr-2" />
      Add New Student
     </>
    ),
   },
  });
 }, [setComponentProps]);

 // <Button variant="outline" size="sm"
 //            onClick={() => setIsAddStudentOpen(true)}>
 //            <UserPlus className="mr-2 h-4 w-4" />
 //            Create student
 //           </Button>

 const columns = useMemo<ColumnDef<Student>[]>(() => [
  {
   accessorFn: (student) =>
    `${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim(),
   id: "fullName",
   filterFn: (row, columnId, filterValue) => {
    const name = row.getValue(columnId) as string;
    return filterValue
     .toLowerCase()
     .split(" ") // Split input into words
     .every((word: string) => name.toLowerCase().includes(word)); // Check if all words match
   },
   header: "Full Name",
   cell: ({ row }) => {
    const student = row.original
    return `${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim()
   },
  },
  {
   accessorKey: "email",
   header: "Email",
  },
  {
   accessorKey: "regNumber",
   header: "Registration Number",
   cell: ({ row }) => { return (row.original.regNumber || "[NO REG. NUMBER]") }
  },
  {
   accessorKey: "createdAt",
   header: "Added",
   cell: ({ row }) => formatDistance(new Date(row.getValue("createdAt")), new Date(), { addSuffix: true }),
  },
  {
   id: "actions",
   header: "Actions",
   cell: ({ row }) => {
    const student = row.original
    return (
     <div className="space-x-2 flex items-center invisible">
      <Link href={`/student/${student.id}`}>
       <Button variant="outline" size="sm">
        <Eye className="mr-2 h-4 w-4" />
        View
       </Button>
      </Link>
     </div>
    )
   },
  },
 ], [])

 const table = useReactTable({
  data: data || [],
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  sortDescFirst: true,
  onSortingChange: setSorting,
  getSortedRowModel: getSortedRowModel(),
  onColumnFiltersChange: setColumnFilters,
  getFilteredRowModel: getFilteredRowModel(),
  initialState: {
   sorting: [{ id: "createdAt", desc: true }]
  },
  state: {
   sorting,
   columnFilters,
  },
 })

 function handleAddStudent(studentData: Student) {
  console.log(studentData);
  queryClient.setQueryData(['students', user?.accessToken], (oldData: Student[] | undefined) => {
   if (!oldData) return oldData;
   return [...oldData, studentData];
  })
 }

 if (isLoading) {
  return <div className="h-full w-full flex items-center justify-center">
   <Loader className={'animate-spin text-gray-600'} size={'70'} />
  </div>
 }

 if (isError) {
  throw new Error("Failed to fetch students. Please check your network connection and try again.")
 }

 return (
  <div className="space-y-4">
   <div className="relative flex items-center justify-center">
    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground" />
    <Input
     placeholder="Search students..."
     value={(table.getColumn("fullName")?.getFilterValue() as string) ?? ""}
     onChange={(event) => {
      return table.getColumn("fullName")?.setFilterValue(event.target.value)
     }
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
         className="border-l-0"
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
         No students found.
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

   <AddStudent setIsAddStudentOpen={setIsAddStudentOpen} isAddStudentOpen={isAddStudentOpen}
    classId={undefined} handleAddStudent={handleAddStudent} />
  </div>
 )
}