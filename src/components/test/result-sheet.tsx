'use client'


import { DeleteIcon, Edit2, FileSpreadsheet, FileText, Trash2, Loader, PlusIcon } from "lucide-react";
import { Dialog, DialogHeader, DialogTrigger, DialogContent, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Branding, Submission, TestDetails } from "../../types/test";
import { useContext, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { ibm, sourceSerif4 } from "../../app/fonts";
import { cn } from "../../lib/utils";
import { useQuery } from '@tanstack/react-query'
import { BrandingDialog } from '../branding-dialog'
import { AuthContext } from "../../contexts/auth.context";
import { errorToast } from "../../helpers/show-toasts";

async function fetchBranding(accessToken: string) {
 const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/branding/`, {
  headers: {
   'Authorization': `Bearer ${accessToken}`,
  },
 })

 const { message, data } = await res.json()
 if (!res.ok) {
  throw new Error(message || "Failed to fetch branding")
 }

 return data
}

async function removeBranding(accessToken: string) {
 const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/branding/`, {
  method: "Delete",
  headers: {
   'Authorization': `Bearer ${accessToken}`,
  },
 })

 const { message, data } = await res.json()
 if (!res.ok) {
  errorToast("Failed to remove branding", { description: message })
  throw new Error(message || "Failed to fetch branding")
 }

 return true
}

export default function ResultSheet({ submissions, testDetails }: { submissions: (Submission & { totalScore: number })[], testDetails: TestDetails }) {
 const { user } = useContext(AuthContext)
 const printableRef = useRef<HTMLTableElement>(null)
 const [isDeleting, setIsDeleting] = useState(false)
 const handlePrint = useReactToPrint({
  contentRef: printableRef,
  documentTitle: `Results for test (${testDetails.title})`,
  pageStyle: '@page { size: landscape; }',
  // onAfterPrint: () => s.,
 })
 const { data: branding, isError, isLoading, error, refetch, isRefetching } = useQuery<Branding>({
  queryKey: ['branding'],
  queryFn: () => fetchBranding(user?.accessToken),
  staleTime: 10000,
  enabled: !!user?.accessToken,
 })

 const simulatedSubmissions = Array.from({ length: 100 }, (_, i) => ({
  ...submissions[i % submissions.length], // Repeats mock data in a cycle
  id: i + 1, // Ensure each submission has a unique id
 }));

 return <Dialog>
  <DialogTrigger>
   <Button className="w-full" disabled={submissions.length <= 0}>
    <FileText className="mr-2 h-4 w-4" />
    Generate results sheet
   </Button>
  </DialogTrigger>
  <DialogContent className="max-w-6xl">
   <DialogHeader>
    <DialogTitle className="mb-4">
     Preview
    </DialogTitle>
   </DialogHeader>
   <div className=" overflow-y-auto max-h-[80vh] border p-2">
    <div ref={printableRef} className={`${sourceSerif4.className} p-10`} style={{ fontFamily: 'serif' }}>
     {/* Branding */}

     {branding ?
      <div>
       <div className="flex w-full flex-row relative items-center justify-center  gap-1">
        <div className="absolute top-0 left-0">
         <img src={branding?.media.url} width={120} height={120} alt="Logo" />
        </div>
        <div className="flex flex-col text-center items-center justify-center">
         <div className="uppercase text-xl">{branding?.field1}</div>
         {branding?.field2 ? <div className="uppercase text-base">{branding.field2}</div> : null}
         {branding?.field3 ? <div className="uppercase text-base">{branding?.field3}</div> : null}
        </div>
       </div>
      </div>
      : null}
     <div className=" my-4">
      <div className="text-center w-full uppercase">
       <div className="text-base font-bold "> {testDetails.title} <br /> TEST RESULTS </div>
      </div>
     </div>
     <Table>
      <TableHeader>
       <TableRow className={cn("uppercase [&>*]:border [&>*]:border-black [&>*]:text-black [&>*]:font-bold [&>*]:p-2")} >
        <TableHead>S/N</TableHead>
        <TableHead>Name</TableHead>
        <TableHead>Registration Number</TableHead>
        <TableHead>Score</TableHead>
       </TableRow>
      </TableHeader>
      <TableBody>
       {/* <TableRow>
      <TableCell className="font-medium">David Uzondu</TableCell>
      <TableCell>CST/19/COM/00341</TableCell>
      <TableCell>daviduzondu@duck.com</TableCell>
      <TableCell className="text-left">23</TableCell>
     </TableRow> */}


       {/* Loop through each sub. and render a row */}
       {submissions.map((submission, index) => (<TableRow key={submission.id} className={cn(`[&>*]:border-black [&>*]:p-2 ${submissions.map(x => x.totalScore).sort((a, b) => b - a)[0] === submission.totalScore && submission.totalScore > 0 ? "font-bold" : ""}`)}>
        <TableCell className="w-fit">{index + 1}</TableCell>
        <TableCell>{submission.firstName} {" "}{submission?.middleName && submission.middleName + " "}{submission.lastName}</TableCell>
        <TableCell>{submission.regNumber || "N/A"}</TableCell>
        <TableCell className="text-left">{submission.totalScore}</TableCell>
       </TableRow>))}
      </TableBody>
     </Table>

     {/* <div className=" absolute bottom-0">
     <div className={`flex flex-col items-center justify-center ${ibm.variable}`}>
      <span className="font-plex flex gap-2 items-center justify-center">
       <GraduationCap /> ONLINE TEST MANAGEMENT SYSTEM
      </span>
      <span className={`text-xs`}>Final year project by David Uzondu</span>
     </div>
    </div> */}
    </div>

   </div>
   <DialogFooter className="flex justify-between items-center w-full">
    <div className='flex gap-2 items-start flex-1'>
     {isError ? <div className='flex items-center justify-center text-sm'>Failed to load branding info <Button size={'sm'} variant={'outline'} className='ml-2' onClick={() => refetch()}>Retry</Button></div> : null}
     {isLoading ? <div className='flex items-center text-sm gap-2'><Loader className="animate-spin" />Loading...</div> : null}

     {branding && !isLoading ? (
      <div>
       <BrandingDialog initialData={branding}>
        <Button variant="link" size="sm">
         <Edit2 className="w-4 h-4" />
         Edit Branding
        </Button>
       </BrandingDialog>
       <Button variant="link" className="text-red-600" size="sm" disabled={isDeleting} onClick={async () => {
        setIsDeleting(true);
        confirm("Are you sure you want to remove branding?") && (await removeBranding(user?.accessToken)) && refetch()
        setIsDeleting(false)
       }
       }>
        <Trash2 className="w-4 h-4" />
        {isDeleting ? "Removing Branding..." : "Remove Branding"}
       </Button>
      </div>
     ) : (
      <BrandingDialog>
       <Button variant="outline" size="sm">
        <PlusIcon className="w-4 h-4" />
        Add Branding
       </Button>
      </BrandingDialog>
     )}
    </div>
    <Button onClick={() => handlePrint()}>Download as PDF</Button>
   </DialogFooter>
  </DialogContent>
 </Dialog>
}