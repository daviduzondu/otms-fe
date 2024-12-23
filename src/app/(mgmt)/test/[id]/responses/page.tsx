'use client'

import React, { useState, useEffect } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, X, Edit2, Clock, FileText, Mail, Download, Eye, EyeOff, CheckCircle, ChevronDown, ChevronUp, AlertTriangle, FileSpreadsheet, Settings, FileUp } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { infoToast, successToast } from '../../../../../helpers/show-toasts'

interface Test {
 id: string
 title: string
 subject: string
 totalQuestions: number
 maxScore: number
 date: string
}

interface Submission {
 id: string
 studentName: string
 registrationNumber: string
 submissionTime: string
 answers: Answer[]
 completed: boolean
 webcamCaptures: WebcamCapture[]
}

interface Answer {
 id: string
 questionText: string
 questionType: 'essay' | 'multiple-choice' | 'true-false'
 studentAnswer: string
 correctAnswer?: string
 options?: string[]
 maxPoints: number
 awardedPoints: number
 autoGraded: boolean
 graded: boolean
 overrideAutoGrade: boolean
}

interface WebcamCapture {
 id: string
 url: string
 timestamp: string
}

const mockTest: Test = {
 id: 'TEST001',
 title: 'Midterm Examination',
 subject: 'General Science',
 totalQuestions: 10,
 maxScore: 100,
 date: '2023-05-15',
}

const mockSubmissions: Submission[] = [
 {
  id: '1',
  studentName: 'John Doe',
  registrationNumber: 'REG001',
  submissionTime: '2023-05-15T14:30:00Z',
  answers: [
   { id: 'q1', questionText: 'What is the capital of France?', questionType: 'multiple-choice', studentAnswer: 'Paris', correctAnswer: 'Paris', options: ['London', 'Berlin', 'Paris', 'Madrid'], maxPoints: 5, awardedPoints: 5, autoGraded: true, graded: true, overrideAutoGrade: false },
   { id: 'q2', questionText: 'Explain the water cycle.', questionType: 'essay', studentAnswer: 'The water cycle involves evaporation, condensation, and precipitation.', maxPoints: 10, awardedPoints: 0, autoGraded: false, graded: false, overrideAutoGrade: false },
   { id: 'q3', questionText: 'Is the Earth flat?', questionType: 'true-false', studentAnswer: 'false', correctAnswer: 'false', maxPoints: 5, awardedPoints: 5, autoGraded: true, graded: true, overrideAutoGrade: false },
   { id: 'q4', questionText: 'What is the chemical symbol for water?', questionType: 'multiple-choice', studentAnswer: 'H2O', correctAnswer: 'H2O', options: ['CO2', 'H2O', 'NaCl', 'O2'], maxPoints: 5, awardedPoints: 5, autoGraded: true, graded: true, overrideAutoGrade: false },
   { id: 'q5', questionText: 'Describe the process of photosynthesis.', questionType: 'essay', studentAnswer: 'Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce oxygen and energy in the form of sugar.', maxPoints: 15, awardedPoints: 0, autoGraded: false, graded: false, overrideAutoGrade: false },
  ],
  completed: false,
  webcamCaptures: [
   { id: 'wc1', url: 'https://tangiblejs.com/wp-content/uploads/2017/09/Montage-1.jpg', timestamp: '2023-05-15T14:35:00Z' },
   { id: 'wc2', url: 'https://tangiblejs.com/wp-content/uploads/2017/09/Montage-1.jpg', timestamp: '2023-05-15T14:40:00Z' },
   { id: 'wc3', url: 'https://tangiblejs.com/wp-content/uploads/2017/09/Montage-1.jpg', timestamp: '2023-05-15T14:45:00Z' },
  ]
 },
 {
  id: '2',
  studentName: 'Jane Smith',
  registrationNumber: 'REG002',
  submissionTime: '2023-05-15T15:15:00Z',
  answers: [
   { id: 'q1', questionText: 'What is the capital of France?', questionType: 'multiple-choice', studentAnswer: 'London', correctAnswer: 'Paris', options: ['London', 'Berlin', 'Paris', 'Madrid'], maxPoints: 5, awardedPoints: 0, autoGraded: true, graded: true, overrideAutoGrade: false },
   { id: 'q2', questionText: 'Explain the water cycle.', questionType: 'essay', studentAnswer: 'Water evaporates, forms clouds, and then rains.', maxPoints: 10, awardedPoints: 0, autoGraded: false, graded: false, overrideAutoGrade: false },
   { id: 'q3', questionText: 'Is the Earth flat?', questionType: 'true-false', studentAnswer: 'true', correctAnswer: 'false', maxPoints: 5, awardedPoints: 0, autoGraded: true, graded: true, overrideAutoGrade: false },
   { id: 'q4', questionText: 'What is the chemical symbol for water?', questionType: 'multiple-choice', studentAnswer: 'CO2', correctAnswer: 'H2O', options: ['CO2', 'H2O', 'NaCl', 'O2'], maxPoints: 5, awardedPoints: 0, autoGraded: true, graded: true, overrideAutoGrade: false },
   { id: 'q5', questionText: 'Describe the process of photosynthesis.', questionType: 'essay', studentAnswer: 'Photosynthesis is how plants make food using sunlight.', maxPoints: 15, awardedPoints: 0, autoGraded: false, graded: false, overrideAutoGrade: false },
  ],
  completed: false,
  webcamCaptures: [
   { id: 'wc1', url: 'https://tangiblejs.com/wp-content/uploads/2017/09/Montage-1.jpg', timestamp: '2023-05-15T14:35:00Z' },
   { id: 'wc2', url: 'https://tangiblejs.com/wp-content/uploads/2017/09/Montage-1.jpg', timestamp: '2023-05-15T14:40:00Z' },
   { id: 'wc3', url: 'https://tangiblejs.com/wp-content/uploads/2017/09/Montage-1.jpg', timestamp: '2023-05-15T14:45:00Z' },
  ]
 },
]

export default function Responses() {
 const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
 const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions)
 const [resultsReleased, setResultsReleased] = useState(false)
 const [selectedWebcamCapture, setSelectedWebcamCapture] = useState<WebcamCapture | null>(null)
 const [isWebcamSectionOpen, setIsWebcamSectionOpen] = useState(false)
 const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null)

 useEffect(() => {
  // Automatically grade multiple-choice and true-false questions
  const gradedSubmissions = submissions.map(submission => ({
   ...submission,
   answers: submission.answers.map(answer => {
    if (answer.questionType === 'multiple-choice' || answer.questionType === 'true-false') {
     return {
      ...answer,
      awardedPoints: answer.studentAnswer === answer.correctAnswer ? answer.maxPoints : 0,
      autoGraded: true,
      graded: true
     }
    }
    return answer
   })
  }))
  setSubmissions(gradedSubmissions)
 }, [])

 const handleSubmissionSelect = (submission: Submission) => {
  setSelectedSubmission(submission)
  setSelectedWebcamCapture(null)
  setEditingAnswerId(null)
 }

 const handleGrade = (answerId: string, points: number) => {
  if (!selectedSubmission) return

  setSubmissions(prevSubmissions => {
   return prevSubmissions.map(submission => {
    if (submission.id === selectedSubmission.id) {
     const updatedAnswers = submission.answers.map(answer => {
      if (answer.id === answerId) {
       return {
        ...answer,
        awardedPoints: Math.min(Math.max(points, 0), answer.maxPoints),
        autoGraded: false,
        graded: true
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
    if (answer.id === answerId) {
     return {
      ...answer,
      awardedPoints: Math.min(Math.max(points, 0), answer.maxPoints),
      autoGraded: false,
      graded: true
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

  setSubmissions(prevSubmissions => {
   return prevSubmissions.map(submission => {
    if (submission.id === selectedSubmission.id) {
     const updatedAnswers = submission.answers.map(answer => {
      if (answer.id === answerId) {
       return {
        ...answer,
        overrideAutoGrade: !answer.overrideAutoGrade
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
    if (answer.id === answerId) {
     return {
      ...answer,
      overrideAutoGrade: !answer.overrideAutoGrade
     }
    }
    return answer
   })
   return { ...prevSubmission, answers: updatedAnswers }
  })
 }

 const calculateTotalScore = (submission: Submission) => {
  return submission.answers.reduce((total, answer) => total + answer.awardedPoints, 0)
 }

 const calculateMaxScore = (submission: Submission) => {
  return submission.answers.reduce((total, answer) => total + answer.maxPoints, 0)
 }

 const calculateGradedQuestions = (submission: Submission) => {
  return submission.answers.filter(answer => answer.graded).length
 }

 const handleCompleteGrading = () => {
  if (!selectedSubmission) return

  setSubmissions(prevSubmissions => {
   return prevSubmissions.map(submission => {
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
   description: `Grading for ${selectedSubmission.studentName} has been marked as complete.`,
  })
 }

 const handleReverseCompleteGrading = () => {
  if (!selectedSubmission) return

  setSubmissions(prevSubmissions => {
   return prevSubmissions.map(submission => {
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
   description: `Grading for ${selectedSubmission.studentName} has been marked as incomplete.`,
  })
 }

 const handleSendResultsEmail = () => {
  if (!selectedSubmission) return

  successToast("Results Sent", {
   description: `Results for ${selectedSubmission.studentName} have been sent via email.`,
  })
 }

 const handleReleaseResults = () => {
  setResultsReleased(!resultsReleased)
  infoToast(`${resultsReleased ? "Results Hidden" : "Results Released"}`, {
   description: resultsReleased
    ? "Students can no longer view their results."
    : "Students can now view their results.",
  })
 }

 const handleExport = (format: string) => {
  infoToast("Export Initiated", {
   description: `Exporting results to ${format.toUpperCase()} format.`,
  })
 }

 const handleWebcamCaptureSelect = (capture: WebcamCapture) => {
  setSelectedWebcamCapture(capture)
 }

 const handleGenerateResultsSheet = () => {
  successToast("Results Sheet Generated", {
   description: "The results sheet has been generated and is ready for download.",
  })
 }

 const getGradeStatus = (answer: Answer) => {
  if (answer.awardedPoints === answer.maxPoints) {
   return "Correct"
  } else if (answer.awardedPoints === 0) {
   return "Incorrect"
  } else {
   return "Partial Credit"
  }
 }

 const getGradeStatusColor = (answer: Answer) => {
  if (answer.awardedPoints === answer.maxPoints) {
   return "text-green-500"
  } else if (answer.awardedPoints === 0) {
   return "text-red-500"
  } else {
   return "text-yellow-500"
  }
 }

 return (
  <div className="flex gap-4">
   <div className='block md:w-1/3'>    
   <Card className="bg-white border-r sticky top-4">
    <div className='p-6 flex flex-col-reverse gap-3 border-b'>
      <div className="text-sm text-gray-500 text-center flex items-center gap-2 justify-center">
       <Progress
        value={(submissions.filter(s => s.completed).length / submissions.length) * 100}
        className="mb-2"
       />
       <span className="text-sm whitespace-nowrap">
        {submissions.filter(s => s.completed).length} / {submissions.length} graded
       </span>
      </div>

     <div className="flex flex-col space-y-2">
      <Button onClick={handleGenerateResultsSheet} className="w-full">
       <FileSpreadsheet className="mr-2 h-4 w-4" />
       Generate Results Sheet
      </Button>
      <DropdownMenu>
       <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full">
         <FileUp className="mr-2 h-4 w-4" />
         Export...
        </Button>
       </DropdownMenuTrigger>
       <DropdownMenuContent>
        <DropdownMenuItem onClick={handleReleaseResults}>
         {resultsReleased ? "Hide Results" : "Release Results"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('xlsx')}>Export to Excel</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>Export to PDF</DropdownMenuItem>
       </DropdownMenuContent>
      </DropdownMenu>
     </div>
    </div>
    {submissions.map(submission => (
     <div
      key={submission.id}
      className={`p-4 cursor-pointer hover:bg-gray-100 ${selectedSubmission?.id === submission.id ? 'bg-gray-200' : ''}`}
      onClick={() => handleSubmissionSelect(submission)}
     >
      <h3 className="font-medium">{submission.studentName}</h3>
      <p className="text-sm text-gray-500">{submission.registrationNumber}</p>
      {submission.completed && (
       <Badge variant="secondary" className="mt-1">
        Graded
       </Badge>
      )}
     </div>
    ))}
   </Card>
   </div>
   <div className="w-full md:w-2/3 rounded-lg p-3 mb-3 bg-gray-200">
    {selectedSubmission ? (
     <>
      <Card className="mb-6">
       <CardHeader>
        <CardTitle>{selectedSubmission.studentName}</CardTitle>
        <CardDescription>{selectedSubmission.registrationNumber}</CardDescription>
       </CardHeader>
       <CardContent>
        <div className="flex justify-between text-sm">
         <div className="flex items-center">
          <Clock className="mr-1 h-4 w-4" />
          {new Date(selectedSubmission.submissionTime).toLocaleString()}
         </div>
         <div className="flex items-center">
          <FileText className="mr-1 h-4 w-4" />
          Score: {calculateTotalScore(selectedSubmission)} / {calculateMaxScore(selectedSubmission)}
         </div>
        </div>
       </CardContent>
       <CardFooter className="justify-between">
        {calculateGradedQuestions(selectedSubmission) === selectedSubmission.answers.length && (
         <>
          <Button variant="outline" onClick={handleSendResultsEmail}>
           <Mail className="mr-2 h-4 w-4" />
           Send Results Email
          </Button>
          {selectedSubmission.completed ? (
           <Button onClick={handleReverseCompleteGrading}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Reverse Grading Completion
           </Button>
          ) : (
           <Button onClick={handleCompleteGrading}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Complete Grading
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
       <CollapsibleContent className="mt-4">
        <div className="grid grid-cols-3 gap-4">
         {selectedSubmission.webcamCaptures.map((capture) => (
          <div
           key={capture.id}
           className="cursor-pointer border rounded-lg overflow-hidden"
           onClick={() => handleWebcamCaptureSelect(capture)}
          >
           <img src={capture.url} alt={`Webcam capture ${capture.id}`} className="w-full h-32 object-cover" />
          </div>
         ))}
        </div>
       </CollapsibleContent>
      </Collapsible>
      <div className="space-y-4">
       {selectedSubmission.answers.map(answer => (
        <Card key={answer.id} className={`overflow-hidden transition-all duration-200 ${answer.graded ? 'bg-white' : 'bg-gray-50'}`}>
         <CardHeader className="py-3">
          <div className="flex justify-between items-center">
           <div>
            <CardTitle className="text-lg">{answer.questionText}</CardTitle>
            <CardDescription className="flex items-center mt-1">
             <span className="text-xs">{answer.questionType}</span>
             {answer.autoGraded && !answer.overrideAutoGrade && (
              <Badge variant="secondary" className="ml-2 text-xs">Auto-graded</Badge>
             )}
            </CardDescription>
           </div>
           <div className="flex items-center space-x-2">
            {answer.graded ? (
             <span className={`text-sm font-medium ${getGradeStatusColor(answer)}`}>
              {getGradeStatus(answer)}
             </span>
            ) : (
             <Badge variant="outline" className="text-xs">Not graded</Badge>
            )}
            <span className="text-sm font-medium">
             {answer.awardedPoints} / {answer.maxPoints}
            </span>
           </div>
          </div>
         </CardHeader>
         <CardContent className="py-3 relative group">
          <div className="text-sm mb-2">
           <strong>Student's Answer:</strong> {answer.studentAnswer}
          </div>
          {answer.autoGraded && !answer.overrideAutoGrade ? (
           <div className="flex justify-end">
            <Button
             size="sm"
             variant="outline"
             onClick={() => handleOverrideAutoGrade(answer.id)}
            >
             Override Auto-grade
            </Button>
           </div>
          ) : (
           editingAnswerId === answer.id ? (
            <div className="flex items-center mt-2">
             <Input
              type="number"
              min="0"
              max={answer.maxPoints}
              value={answer.awardedPoints}
              onChange={(e) => handleGrade(answer.id, parseInt(e.target.value))}
              className="w-20 mr-2"
             />
             <span>/ {answer.maxPoints}</span>
             <Button size="sm" variant="outline" className="ml-2" onClick={() => setEditingAnswerId(null)}>
              Save
             </Button>
            </div>
           ) : (
            <div className="flex items-center justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
             <TooltipProvider>
              <Tooltip>
               <TooltipTrigger asChild>
                <Button
                 size="sm"
                 variant="outline"
                 onClick={() => handleGrade(answer.id, answer.maxPoints)}
                >
                 <Check className="h-4 w-4 text-green-500" />
                </Button>
               </TooltipTrigger>
               <TooltipContent>
                <p>Award full points</p>
               </TooltipContent>
              </Tooltip>
             </TooltipProvider>
             <TooltipProvider>
              <Tooltip>
               <TooltipTrigger asChild>
                <Button
                 size="sm"
                 variant="outline"
                 onClick={() => handleGrade(answer.id, 0)}
                 className="ml-2"
                >
                 <X className="h-4 w-4 text-red-500" />
                </Button>
               </TooltipTrigger>
               <TooltipContent>
                <p>Award zero points</p>
               </TooltipContent>
              </Tooltip>
             </TooltipProvider>
             <Button
              size="sm"
              variant="outline"
              className="ml-2"
              onClick={() => setEditingAnswerId(answer.id)}
             >
              <Edit2 className="h-4 w-4" />
             </Button>
            </div>
           )
          )}
          {answer.autoGraded && answer.overrideAutoGrade && (
           <div className="mt-2 text-sm text-gray-500">
            <Button
             size="sm"
             variant="link"
             onClick={() => handleOverrideAutoGrade(answer.id)}
            >
             Revert to auto-grade
            </Button>
           </div>
          )}
         </CardContent>
        </Card>
       ))}
      </div>
     </>
    ) : (
     <div className="flex items-center justify-center h-full text-gray-500">
      Select a submission to review
     </div>
    )}
   </div>
   {selectedWebcamCapture && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
     <div className="bg-white p-4 rounded-lg max-w-3xl max-h-[90vh] overflow-auto">
      <img src={selectedWebcamCapture.url} alt="Selected webcam capture" className="w-full object-contain mb-4" />
      <p className="text-sm text-gray-500">Captured at: {new Date(selectedWebcamCapture.timestamp).toLocaleString()}</p>
      <Button className="mt-4" onClick={() => setSelectedWebcamCapture(null)}>Close</Button>
     </div>
    </div>
   )}
  </div>
 )
}