'use client'

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useContext, useEffect, useMemo, useState } from "react"
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
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, Loader, PlusCircle, PlusIcon, SearchIcon, Trash2, UserCircle, UserPlus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import { Label } from "../../../components/ui/label"
import { errorToast, successToast } from "../../../helpers/show-toasts"
import { ScrollArea } from "../../../components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import AddStudentToClass from "../../../components/test/add-student-to-class"
import React from "react"
import { useShellContext } from "../../../contexts/providers/main-action-btn.provider"

interface Student {
 id: string
 firstName: string
 lastName: string
 email: string
 regNumber: string
}

interface Class {
 id: string
 name: string
 students: Student[]
 createdAt: string
}

const fetchClasses = async (accessToken: string) => {
 const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/class`, {
  headers: {
   'Authorization': `Bearer ${accessToken}`,
  },
 })

 const { message, data } = await res.json()
 if (!res.ok) {
  throw new Error(message || "Failed to fetch classes")
 }

 return data
}



export default function Classes() {
 const { user } = useContext(AuthContext)
 const { setComponentProps } = useShellContext();

 const [sorting, setSorting] = useState<SortingState>([
  { id: "createdAt", desc: true }
 ])
 const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
 const [isCreateClassOpen, setIsCreateClassOpen] = useState(false)
 const [newClassName, setNewClassName] = useState("")
 const [selectedClass, setSelectedClass] = useState<Class | null>(null)
 const [isAddStudentOpen, setIsAddStudentOpen] = useState<boolean>(false)
 const queryClient = useQueryClient()

 const { data, isError, isLoading, error, refetch } = useQuery<Class[]>({
  queryKey: ['classes', user?.accessToken],
  queryFn: () => fetchClasses(user?.accessToken || ''),
  staleTime: 10000,
  enabled: !!user?.accessToken,
 })
 const columns: ColumnDef<Class>[] = useMemo(() => [
  {
   accessorKey: "name",
   header: "Class Name",
   cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
   accessorKey: "studentCount",
   header: "Number of Students",
   cell: ({ row }) => row.original.students.length,
  },
  {
   accessorKey: "createdAt",
   header: "Created",
   cell: ({ row }) => formatDistance(new Date(row.getValue("createdAt")), new Date(), { addSuffix: true }),
  },
  {
   id: "actions",
   header: "Actions",
   cell: ({ row }) => {
    const classItem = row.original
    return (
     <div className="space-x-2 flex items-center">
      <Button variant="outline" size="sm" onClick={() => setSelectedClass(classItem)}>
       <Eye className="mr-2 h-4 w-4" />
       View
      </Button>
      {/* <Button variant="destructive" size="sm" onClick={() => console.log("Delete", classItem.id)}>
       <Trash2 className="mr-2 h-4 w-4" />
       Delete
      </Button> */}
     </div>
    )
   },
  },
 ], []);

 useEffect(() => {
  const setCustomComponent = () => {
   setComponentProps({
    Component: Button,
    props: {
     onClick: () => setIsCreateClassOpen(true),
     children: (
      <>
       <PlusCircle className="mr-2 h-4 w-4" />
       Create new Class
      </>
     ),
    },
   });
  };
  setCustomComponent();
 }, [setComponentProps]);

 const handleAddStudent = (studentData: Student) => {
  // Update the cache with the new data
  queryClient.setQueryData(['classes', user?.accessToken], (oldData: Class[] | undefined) => {
   if (!oldData) return oldData;
   return oldData.map(c => {
    if (c.id === selectedClass?.id) {
     return {
      ...c,
      students: [...c.students, studentData]
     };
    }
    return c;
   });
  });

  // Update the selected class state
  setSelectedClass(prev => prev ? {
   ...prev,
   students: [...prev.students, studentData]
  } : null);

  // Show success toast
  successToast('Student Added', {
   description: `Successfully added student to class: ${selectedClass?.name}`,
  });

  // Close the add student dialog
  setIsAddStudentOpen(false);
 };

 const createClassMutation = useMutation({
  mutationFn: async (name: string) => {
   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/class/`, {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
     Authorization: `Bearer ${user.accessToken}`
    },
    body: JSON.stringify({ name })
   });
   const result = await response.json();
   if (!response.ok) throw new Error(result.message || "An error occurred.");
   return result.data;
  },
  onSuccess: (newClass) => {
   queryClient.invalidateQueries(['classes', user?.accessToken]);
   successToast('Class Created', {
    description: `Successfully created class: ${newClass.name}`,
   });
   setNewClassName('');
   setIsCreateClassOpen(false);
  },
  onError: (error: Error) => {
   errorToast("Failed to create class", {
    description: error.message || "Unknown error occurred.",
   });
  },
 });

 const handleCreateClass = async () => {
  if (newClassName) {
   createClassMutation.mutate(newClassName);
  }
 }

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
  onRowSelectionChange: (updater) => {
   const selectedRows = table.getSelectedRowModel().flatRows
   if (selectedRows.length > 0) {
    setSelectedClass(selectedRows[0].original)
   } else {
    setSelectedClass(null)
   }
  },
 })

 if (isLoading) {
  return <div className="h-full w-full flex items-center justify-center">
   <Loader className={'animate-spin text-gray-600'} size={'70'} />
  </div>
 }

 if (isError) {
  throw new Error("Failed to fetch classes. Please check your network connection and try again.")
 }

 return (
  <div className="space-y-4">
   <div className="flex items-center justify-between">
    <div className="relative flex items-center w-full">
     <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground" />
     <Input
      placeholder="Search classes..."
      value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
      onChange={(event) =>
       table.getColumn("name")?.setFilterValue(event.target.value)
      }
      className="pl-10"
     />
    </div>
    {/* <Button onClick={() => setIsCreateClassOpen(true)} variant={'outline'}>
     <PlusIcon className="mr-2 h-4 w-4" />
     Create new Class
    </Button> */}
   </div>

   <div className="rounded-md border">
    <Table>
     <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
       <TableRow key={headerGroup.id}>
        {headerGroup.headers.map((header) => (
         <TableHead key={header.id}>
          {header.isPlaceholder
           ? null
           : flexRender(
            header.column.columnDef.header,
            header.getContext()
           )}
         </TableHead>
        ))}
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
         No classes found.
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

   <Dialog open={isCreateClassOpen} onOpenChange={setIsCreateClassOpen}>
    <DialogContent className="max-w-xl">
     <DialogHeader>
      <DialogTitle>Create New Class</DialogTitle>
      <DialogDescription>
       Enter a name for your new class.
      </DialogDescription>
     </DialogHeader>
     <form onSubmit={(e) => {
      e.preventDefault();
      handleCreateClass();
     }} className="flex flex-col gap-4 py-4">
      <div className="flex flex-col gap-4 items-start">
       <Label htmlFor="className" className="text-right">
        Class Name
       </Label>
       <Input
        id="className"
        value={newClassName}
        onChange={(e) => setNewClassName(e.target.value)}
        className="col-span-3"
       />
      </div>
      <div className="flex justify-end">
       <Button disabled={!newClassName || createClassMutation.isLoading} type={'submit'} className={'w-fit'}>
        {createClassMutation.isLoading ? <Loader className="mr-2 h-4 w-4" /> : null}
        {createClassMutation.isLoading ? "Creating" : "Create Class"}
       </Button>
      </div>
     </form>
    </DialogContent>
   </Dialog>

   <Dialog open={!!selectedClass} onOpenChange={() => setSelectedClass(null)}>
    <DialogContent className="max-w-3xl">
     <DialogHeader>
      <DialogTitle>{selectedClass?.name}</DialogTitle>
      <DialogDescription>
       {selectedClass?.students.length} students enrolled in this class
      </DialogDescription>
     </DialogHeader>
     <Button variant="outline"
      onClick={() => setIsAddStudentOpen(true)}>
      <UserPlus className="mr-2 h-4 w-4" />
      Add student to class
     </Button>
     <AddStudentToClass setIsAddStudentOpen={setIsAddStudentOpen} isAddStudentOpen={isAddStudentOpen}
      classId={selectedClass?.id} handleAddStudent={handleAddStudent} />
     <ScrollArea className="h-[400px] w-full rounded-md border p-4 relative">
      {selectedClass?.students.length === 0 ? (
       <div className="text-center text-gray-500">No students enrolled in this class.</div>
      ) : (
       <div className="space-y-4 relative">
        {selectedClass?.students.slice().reverse().map((student) => (
         <div key={student.id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-100">
          <Avatar>
           <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${student.firstName} ${student.lastName}`} />
           <AvatarFallback><UserCircle /></AvatarFallback>
          </Avatar>
          <div className="space-y-1">
           <h3 className="font-medium">{student.firstName} {student.lastName}</h3>
           <p className="text-sm text-gray-500">{student.email}</p>
           {student.regNumber && <p className="text-xs text-gray-400">Reg. Number: {student.regNumber}</p>}
          </div>
         </div>
        ))}

       </div>
      )}
     </ScrollArea>
    </DialogContent>
   </Dialog>
  </div>
 )
}