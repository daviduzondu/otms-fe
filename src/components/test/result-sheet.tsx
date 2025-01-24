import { FileSpreadsheet, GraduationCap } from "lucide-react";
import { Dialog, DialogHeader, DialogTrigger, DialogContent, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Submission, TestDetails } from "../../types/test";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { ibm, sourceSerif4 } from "../../app/fonts";
import { cn } from "../../lib/utils";
import Link from "next/link";
import Image from 'next/image';

export default function ResultSheet({ submissions, testDetails }: { submissions: (Submission & { totalScore: number })[], testDetails: TestDetails }) {
 const printableRef = useRef<HTMLTableElement>(null)

 const handlePrint = useReactToPrint({
  contentRef: printableRef,
  documentTitle: 'Results for test',
  pageStyle: '@page { size: landscape; }',
  // onAfterPrint: () => s.,
 })


 // const simulatedSubmissions = Array.from({ length: 100 }, (_, i) => ({
 //  ...submissions[i % submissions.length], // Repeats mock data in a cycle
 //  id: i + 1, // Ensure each submission has a unique id
 // }));

 return <Dialog>
  <DialogTrigger>
   <Button className="w-full" disabled={submissions.length <= 0}>
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
   <div className=" overflow-y-auto max-h-[80vh]">
    <div ref={printableRef} className={`${sourceSerif4.className}`}>
     {/* Branding */}

     <div className="">
      <div className="flex w-full flex-col items-center gap-1">
       <img src="https://networks.au-ibar.org/show/bayero-university-kano-buk-along-new-site-bayero-university-kano-kano-around-janbulo-second-gate-rd-n/image/2008090514-1099-3156-400x300/AU+REC+logos+-+2022-03-31T100332.997.png" width={100} height={100} alt="Logo" />
       <div className="uppercase text-base">Bayero University Kano</div>
       <div className="uppercase text-base">Faculty of Computing</div>
       <div className="uppercase text-base">Department of Computer Science</div>
      </div>
     </div>
     <div className=" my-4">
      <div className="text-center w-full uppercase">
       <div className="text-xl font-bold "> {testDetails.title} <br /> TEST RESULTS </div>
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
   <DialogFooter>
    <Button onClick={() => handlePrint()}>Download as PDF</Button>
   </DialogFooter>
  </DialogContent>
 </Dialog>
}