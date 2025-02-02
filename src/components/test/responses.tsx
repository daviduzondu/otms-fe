'use client'

import React, { useState, useContext, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Check, X, Edit2, Clock, FileText, Mail, Download, Eye, EyeOff, CheckCircle, ChevronDown, ChevronUp, AlertTriangle, FileSpreadsheet, Settings, FileUp, CameraOff, File, ArrowLeftCircle, ArrowRightCircle, Loader } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { infoToast, successToast, errorToast } from '../../helpers/show-toasts'
import { StudentAnswerCard } from './student-answer-card'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AuthContext } from '../../contexts/auth.context'
import ResultSheet from './result-sheet'
import { Submission, Answer, WebcamCapture, TestDetails } from '../../types/test'
import Papa from 'papaparse';
import * as xlsx from 'xlsx';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const fetchSubmissions = async (testId: string, accessToken: string) => {
 const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tests/${testId}/responses`, {
  headers: {
   'Authorization': `Bearer ${accessToken}`
  }
 })

 if (!response.ok) {
  throw new Error('Failed to fetch submissions')
 }

 const { data } = await response.json()
 return data
}

export default function Responses({ testDetails }: { testDetails: TestDetails }) {
 const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
 const [selectedWebcamCapture, setSelectedWebcamCapture] = useState<WebcamCapture | null>(null)
 const [isWebcamSectionOpen, setIsWebcamSectionOpen] = useState(false)
 const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null)
 const [currentCaptureIndex, setCurrentCaptureIndex] = useState(0);
 const { user } = useContext(AuthContext)
 const queryClient = useQueryClient()
 const manualUpdateRef = useRef(false)
 const testId = testDetails.id
 const [sendingResult, setSendingResult] = useState(false);

 const { data: submissions = [], isError, error, isLoading } = useQuery<Submission[], Error>({
  queryKey: ['submissions', testId, user?.accessToken],
  queryFn: () => fetchSubmissions(testId, user?.accessToken || ''),
  enabled: Boolean(user?.accessToken),
  // refetchInterval: 1000,
 })

 useEffect(() => {

  // submission.answers.filter(x => x.answer !== null).every(answer => answer.point !== null && answer.point >= 0)

  console.log(submissions.map(sub => sub.answers.filter(x => x.answer !== null && x.point !== null)));

  if (manualUpdateRef.current) return;
  queryClient.setQueryData(
   ['submissions', testId, user?.accessToken],
   (oldData: Submission[] | undefined) => {
    if (!oldData) return [];
    return oldData.map(submission => ({
     ...submission,
     completed: submission.answers.map(x => ({ ...x, point: x.answer === null ? 0 : x.point })).filter(x => x.answer !== null).every(answer => answer.point !== null && answer.point >= 0)
    }));
   }
  );
 });


 // answer.answer && answer.point === null

 const handleSubmissionSelect = (submission: Submission) => {
  setSelectedSubmission(submission)
  setSelectedWebcamCapture(null)
  setEditingAnswerId(null)
 }

 const handleGrade = (answerId: string, points: number) => {
  if (!selectedSubmission) return

  queryClient.setQueryData(['submissions', testId, user?.accessToken], (oldData: Submission[] | undefined) => {
   if (!oldData) return []
   return oldData.map(submission => {
    if (submission.id === selectedSubmission.id) {
     const updatedAnswers = submission.answers.map(answer => {
      if (answer.questionId === answerId) {
       return {
        ...answer,
        point: points,
        graded: true,
        autoGraded: ['mcq', 'trueOrFalse'].includes(answer.type) ? answer.autoGraded : false
       }
      }
      return answer
     })
     return { ...submission, answers: updatedAnswers }
    }
    return submission
   })
  })

  setSelectedSubmission(prevSubmission => {
   if (!prevSubmission) return null
   const updatedAnswers = prevSubmission.answers.map(answer => {
    if (answer.questionId === answerId) {
     return {
      ...answer,
      point: points,
      graded: true,
      autoGraded: ['mcq', 'trueOrFalse'].includes(answer.type) ? answer.autoGraded : false
     }
    }
    return answer
   })
   return { ...prevSubmission, answers: updatedAnswers }
  })

  setEditingAnswerId(null)
 }

 const handleOverrideAutoGrade = (answerId: string) => {
  if (!selectedSubmission) return

  queryClient.setQueryData(['submissions', testId, user?.accessToken], (oldData: Submission[] | undefined) => {

   if (!oldData) return []
   return oldData.map(submission => {
    if (submission.id === selectedSubmission.id) {
     const updatedAnswers = submission.answers.map(answer => {
      if (answer.questionId === answerId) {
       return {
        ...answer,
        autoGraded: !answer.autoGraded
       }
      }
      return answer
     })
     return { ...submission, answers: updatedAnswers }
    }
    return submission
   })
  })

  setSelectedSubmission(prevSubmission => {
   if (!prevSubmission) return null
   const updatedAnswers = prevSubmission.answers.map(answer => {
    if (answer.questionId === answerId) {
     return {
      ...answer,
      autoGraded: !answer.autoGraded
     }
    }
    return answer
   })
   return { ...prevSubmission, answers: updatedAnswers }
  })
 }

 const calculateTotalScore = (submission: Submission) => {
  return submission.answers.reduce((total, answer) => total + (answer.point || 0), 0)
 }

 const calculateMaxScore = (submission: Submission) => {
  return submission.answers.reduce((a, c) => a + Number(c.maxPoints || 0), 0);

 }

 const calculateGradedQuestions = (submission: Submission) => {
  return submission.answers.filter(answer => answer.graded && answer.answer).length
 }

 const handleCompleteGrading = () => {
  manualUpdateRef.current = true;
  if (!selectedSubmission) return

  queryClient.setQueryData(['submissions', testId, user?.accessToken], (oldData: Submission[] | undefined) => {
   if (!oldData) return []
   return oldData.map(submission => {
    if (submission.id === selectedSubmission.id) {
     return { ...submission, completed: true }
    }
    return submission
   })
  })

  setSelectedSubmission(prevSubmission => {
   if (!prevSubmission) return null
   return { ...prevSubmission, completed: true }
  })

  infoToast("Grading Completed", {
   description: `Grading for ${selectedSubmission.firstName} has been marked as complete.`,
  })
 }

 const handleReverseCompleteGrading = () => {
  manualUpdateRef.current = true;
  if (!selectedSubmission) return

  queryClient.setQueryData(['submissions', testId, user?.accessToken], (oldData: Submission[] | undefined) => {
   if (!oldData) return []
   return oldData.map(submission => {
    if (submission.id === selectedSubmission.id) {
     return { ...submission, completed: false }
    }
    return submission
   })
  })

  setSelectedSubmission(prevSubmission => {
   if (!prevSubmission) return null
   return { ...prevSubmission, completed: false }
  })

  successToast("Grading Reversed", {
   description: `Grading for ${selectedSubmission.firstName} has been marked as incomplete.`,
  })
 }

 const handleSendResultsEmail = () => {
  if (!selectedSubmission) return

  successToast("Results Sent", {
   description: `Results for ${selectedSubmission.firstName} have been sent via email.`,
  })
 }


 const handleExport = (format: string) => {
  infoToast("Export Initiated", {
   description: `Exporting results to ${format.toUpperCase()} format.`,
  })
 }


 const handleWebcamCaptureSelect = (capture: WebcamCapture) => {
  setSelectedWebcamCapture(capture);
  const index = selectedSubmission?.webcamCaptures.findIndex(c => c.id === capture.id) ?? 0;
  setCurrentCaptureIndex(index);
 }

 const sendResultsEmail = async () => {
  setSendingResult(true)
  const data = {
   testId: testDetails.id,
   students: submissions.filter(s => s.completed).map(s => s.id)
  }
  try {
   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tests/send-results`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
     "Content-Type": "application/json",
     "Authorization": `Bearer ${user.accessToken}`
    }
   });
   const { message } = await response.json();
   if (!response.ok) throw new Error(message || "Failed to send results")
   successToast("Successfully sent results to students")
  } catch (error) {
   errorToast((error as Error).message)
   console.error((error as Error).message)
  }
  setSendingResult(false)
 }
 // const handleGenerateResultsSheet = () => {
 //  console.log(submissions.map(s=>({...s, totalScore: calculateTotalScore(s)})))
 //  successToast("Results Sheet Generated", {
 //   description: "The results sheet has been generated and is ready for download.",
 //  })
 // }

 if (isLoading) {
  return <div className="flex items-center justify-center h-full">Loading submissions...</div>
 }

 if (isError) {
  return <div className="flex items-center justify-center h-full text-red-500">{error.message}</div>
 }

 return (
  <div className="flex gap-4">
   <div className='block md:w-1/3'>
    <Card className="bg-white border-r sticky top-4 ">
     <div className={'p-6 flex flex-col-reverse gap-3 border-b'}>
      <div className={`text-sm text-gray-500 text-center flex items-center gap-2 justify-center  ${submissions.length <= 0 ? "invisible" : "visible"}`}>
       <Progress
        value={(submissions.filter(s => s.completed).length / submissions.length) * 100}
        className="mb-2"
       />
       <span className={`text-sm whitespace-nowrap`}>
        {submissions.filter(s => s.completed).length} / {submissions.length} graded
       </span>
      </div>

      <div className="flex flex-col space-y-2">
       <ResultSheet testDetails={testDetails} submissions={submissions.map(s => ({ ...s, totalScore: calculateTotalScore(s) }))} />
       <Button className="w-full" variant={'outline'} onClick={() => confirm("Are you sure?") && sendResultsEmail()} disabled={submissions.length <= 0 || sendingResult}>
        {!sendingResult ? <Mail className="mr-2 h-4 w-4" /> : <Loader className='animate-spin' />}
        {!sendingResult ? "Send results via email" : "Sending..."}
       </Button>

       <div className='space-y-2 border p-2 rounded-md bg-slate-100'>
        <span className='flex text-sm text-muted-foreground justify-center items-center '>Export Options</span>
        <div className='flex gap-2'>
         <Button variant={'outline'} className='lg:w-1/2' disabled={submissions.length <= 0} onClick={() => {
          const data = submissions.map(s => ({ Name: s.firstName + " " + s.lastName, Email: s.email, "Registration Number": s.regNumber, Score: calculateTotalScore(s) }))
          const csv = Papa.unparse(data);
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `Test results for ${testDetails.title}.csv`;
          link.click();

          URL.revokeObjectURL(link.href);
         }}> <File className="mr-1 h-4 w-4" />CSV</Button>
         <Button variant={'outline'} className='lg:w-1/2' disabled={submissions.length <= 0} onClick={() => {
          const data = submissions.map(s => ({ Name: s.firstName + " " + s.lastName, Email: s.email, "Registration Number": s.regNumber, Score: calculateTotalScore(s) }));
          const csv = Papa.unparse(data);
          const workbook = xlsx.read(csv, { type: 'string' });

          const worksheet = workbook.Sheets[workbook.SheetNames[0]];

          worksheet['!cols'] = data[0] ? Object.keys(data[0]).map(() => ({ width: 20 })) : [];

          const result = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
          const blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `Test results for ${testDetails.title}.xlsx`;
          link.click();

          URL.revokeObjectURL(link.href);
         }}> <FileSpreadsheet className="mr-1 h-4 w-4" />XLSX</Button>
        </div>
       </div>

      </div>
     </div>
     <div className='max-h-72 overflow-y-auto'>
      {submissions.map(submission => (
       <div
        key={submission.id}
        className={`p-4 cursor-pointer hover:bg-gray-100 ${selectedSubmission?.id === submission.id ? 'bg-gray-200' : ''}`}
        onClick={() => handleSubmissionSelect(submission)}
       >
        <h3 className="font-medium">{submission.firstName} {submission.lastName}</h3>
        <p className="text-sm text-gray-500 text-ellipsis">{submission.email} {submission.regNumber && "•"} {submission.regNumber}</p>
        <Badge variant="secondary" className={`mt-1 ${submission.completed ? "visible" : "invisible"}`}>
         Graded
        </Badge>
       </div>
      ))}
     </div>
     {submissions[0]?.pendingSubmissionsCount ? <CardFooter className=' p-2 border-t flex items-center justify-center text-sm text-gray-600'>{submissions[0]?.pendingSubmissionsCount} student{submissions[0]?.pendingSubmissionsCount > 1 ? "s" : ""} yet to submit</CardFooter> : null}
    </Card>
   </div>
   <div className="w-full md:w-2/3 rounded-lg mb-3 ">
    {selectedSubmission ? (
     <>
      <Card className="mb-6">
       <CardHeader>
        <CardTitle>{selectedSubmission.firstName} {selectedSubmission.lastName}</CardTitle>
        <CardDescription>{selectedSubmission.email}  {selectedSubmission.regNumber && "•"} {selectedSubmission.regNumber}</CardDescription>
       </CardHeader>
       <CardContent>
        <div className="flex justify-between text-sm">
         <div className="flex items-start flex-col">
          <span className='flex gap-2 items-center'>
           <Clock className="h-4 w-4" />
           <span className='font-semibold'>Started at: {" "}</span>
           {new Date(selectedSubmission.startedAt).toLocaleString()}
          </span>
          <span className='flex gap-2 items-center'>
           <Clock className="h-4 w-4" />
           <span className='font-semibold'>Submitted at: {" "}</span>
           {new Date(selectedSubmission.submittedAt || selectedSubmission.endsAt).toLocaleString()}
          </span>
         </div>
         <div className="flex items-center">
          <FileText className="mr-1 h-4 w-4" />
          Total Score: {calculateTotalScore(selectedSubmission)} / {calculateMaxScore(selectedSubmission)}
         </div>
        </div>
       </CardContent>
       <CardFooter className="justify-end">
        {calculateGradedQuestions(selectedSubmission) === selectedSubmission.answers.filter(answer => answer.graded && answer.answer).length && (
         <>
          {selectedSubmission.completed ? (
           <Button onClick={handleReverseCompleteGrading}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Unmark as graded
           </Button>
          ) : (
           <Button onClick={handleCompleteGrading}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark as graded
           </Button>
          )}
         </>
        )}
       </CardFooter>
      </Card>
      <Collapsible
       open={isWebcamSectionOpen}
       onOpenChange={setIsWebcamSectionOpen}
       className="mb-6"
      >
       <CollapsibleTrigger asChild>
        <Button variant="outline" className="flex justify-between w-full">
         <span>Webcam Captures</span>
         {isWebcamSectionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
       </CollapsibleTrigger>
       <CollapsibleContent className="mt-4 overflow-y-auto max-h-[400px] bg-white shadow-sm rounded-sm p-2">
        {selectedSubmission.webcamCaptures.length === 0 ? <div className='flex items-center justify-center h-full w-full'><CameraOff className='mr-2' /> Nothing to see here</div> : <div className="grid grid-cols-3 gap-4">
         {selectedSubmission.webcamCaptures.map((capture) => (
          <div
           key={capture.id}
           className="cursor-pointer border rounded-lg overflow-hidden"
           onClick={() => handleWebcamCaptureSelect(capture)}
          >
           <img src={new URL(capture.url).toString()} alt={`Webcam capture ${capture.id}`} className="w-full h-32 object-cover" />
          </div>
         ))}
        </div>}
       </CollapsibleContent>
      </Collapsible>
      <div className="space-y-4">
       {selectedSubmission.answers.map(answer => (
        <StudentAnswerCard
         key={answer.questionId}
         answer={answer}
         onGrade={handleGrade}
         onOverrideAutoGrade={handleOverrideAutoGrade}
         editingAnswerId={editingAnswerId}
         setEditingAnswerId={setEditingAnswerId}
         testId={testId}
         studentId={selectedSubmission.id}
        />
       ))}
      </div>
     </>
    ) : (
     <div className="flex items-center justify-center h-full text-gray-500">
      {!(submissions.length <= 0) ? "Select a submission to review" : "No submission yet"}
     </div>
    )}
   </div>
   {selectedWebcamCapture && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 " onClick={() => setSelectedWebcamCapture(null)}>
     <div className="bg-white p-4 rounded-lg max-w-3xl max-h-[90vh] flex flex-col overflow-hidden relative">
      {/* Image Container */}
      <div className="relative flex-1 h-full bg-black">
       <Slider {...{
        dots: true,
        infinite: false,
        lazyLoad: 'progressive',
        speed: 200,
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: currentCaptureIndex,
        className: "[&>.slick-prev]:left-[20px] [&>button]:z-10  [&>.slick-next]:right-[20px]",
        afterChange: (currentSlide) => setSelectedWebcamCapture(selectedSubmission?.webcamCaptures[currentSlide] ?? null),
       }}>
        {selectedSubmission?.webcamCaptures.map(capture => (
         <div key={capture.id} className="flex items-center justify-center relative">
          <img
           src={new URL(capture.url).toString()}
           alt="Webcam capture"
           className="object-contain max-h-[75vh] w-full"
          />
         </div>
        ))}
       </Slider>
       <span className="text-sm absolute bg-[#ffffff5d] text-white backdrop-blur-md bottom-6 right-4 p-2 rounded-full">
        Captured at: {new Date(selectedWebcamCapture.timestamp).toLocaleString()}
       </span>
      </div>
      {/* Close Button */}
      <Button className="mt-4 self-end flex" onClick={() => setSelectedWebcamCapture(null)}>
       Close
      </Button>
     </div>
    </div>
   )}

  </div>
 )
}