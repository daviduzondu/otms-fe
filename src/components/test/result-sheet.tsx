import { FileSpreadsheet, GraduationCap } from "lucide-react";
import { Dialog, DialogHeader, DialogTrigger, DialogContent, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Submission } from "../../types/test";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { ibm, sourceSerif4 } from "../../app/fonts";
import { cn } from "../../lib/utils";
import Link from "next/link";

export default function ResultSheet({ submissions }: { submissions: (Submission & { totalScore: number })[] }) {
 const printableRef = useRef<HTMLTableElement>(null)

 const handlePrint = useReactToPrint({
  contentRef: printableRef,
  documentTitle: 'Results for test',
  pageStyle: '@page { size: A4; }',
  // onAfterPrint: () => s.,
 })

 return <Dialog>
  <DialogTrigger>
   <Button className="w-full">
    <FileSpreadsheet className="mr-2 h-4 w-4" />
    Generate results sheet
   </Button>
  </DialogTrigger>
  <DialogContent className="max-w-6xl">
   <DialogHeader>
    <DialogTitle>
     Results for the test
    </DialogTitle>
   </DialogHeader>
   <div ref={printableRef} className={`${sourceSerif4.className}`}>
    {/* Branding */}

    <div className="print-only">
     <div className="text-center w-full uppercase">
      Results for test
     </div>
    </div>
    <Table>
     <TableHeader>
      <TableRow className={cn("uppercase [&>*]:border [&>*]:border-black [&>*]:text-black [&>*]:font-bold [&>*]:p-2")} >
       <TableHead>Name</TableHead>
       <TableHead>Registration Number</TableHead>
       <TableHead>Email</TableHead>
       <TableHead>Score</TableHead>
      </TableRow>
     </TableHeader>
     <TableBody className="">
      {/* <TableRow>
      <TableCell className="font-medium">David Uzondu</TableCell>
      <TableCell>CST/19/COM/00341</TableCell>
      <TableCell>daviduzondu@duck.com</TableCell>
      <TableCell className="text-left">23</TableCell>
     </TableRow> */}


      {/* Loop through each sub. and render a row */}
      {submissions.map((submission, index) => (<TableRow key={submission.id} className={cn(`[&>*]:border-black [&>*]:p-2 ${submissions.map(x => x.totalScore).sort((a, b) => b - a)[0] === submission.totalScore && submission.totalScore > 0 ? "font-bold" : ""}`)}>
       <TableCell>{submission.firstName} {" "}{submission?.middleName && submission.middleName + " "}{submission.firstName}</TableCell>
       <TableCell>{submission.regNumber || "N/A"}</TableCell>
       <TableCell>{submission.email}</TableCell>
       <TableCell className="text-left">{submission.totalScore}</TableCell>
      </TableRow>))}
     </TableBody>
    </Table>

    <div className="print-only absolute bottom-0">
     <div className={`flex flex-col items-center justify-center ${ibm.variable}`}>
      <span className="font-plex flex gap-2 items-center justify-center">
       <GraduationCap /> ONLINE TEST MANAGEMENT SYSTEM
      </span>
      <span className={`text-xs`}>Final year project by David Uzondu</span>
     </div>
    </div>
   </div>
   <DialogFooter>
    <Button onClick={() => handlePrint()}>Download as PDF</Button>
   </DialogFooter>
  </DialogContent>
 </Dialog>
}