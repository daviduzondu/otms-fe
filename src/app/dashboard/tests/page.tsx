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
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader } from 'lucide-react'
import { TestDetails } from "../../../types/test"
import Skeleton from "react-loading-skeleton"
import Link from "next/link"

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
    accessorKey: "participantCount",
    header: "No. of Participants",
    cell: ({ row }) => row.original.participantCount || "0",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const test = row.original
      return (
        <div className="space-x-2">
         <Link href={`/test/${test.id}`}>
          <Button variant="outline" size="sm">View</Button>
         </Link>
          <Button variant="destructive" size="sm" onClick={() => console.log("Delete", test.id)}>Delete</Button>
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
    <Loader className="animate-spin" size={70} />
  </div>
  
  }

  if (isError) {
    throw new Error("Failed to fetch tests. Check your network and try again.")
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">All Tests</h2>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter tests..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
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