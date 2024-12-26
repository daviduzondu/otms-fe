'use client'

import React, { useState, useContext } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, X, Edit2, Clock, FileText, Mail, Download, Eye, EyeOff, CheckCircle, ChevronDown, ChevronUp, AlertTriangle, FileSpreadsheet, Settings, FileUp, CameraOff } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { infoToast, successToast, errorToast } from '../../helpers/show-toasts'
import { StudentAnswerCard } from './student-answer-card'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AuthContext } from '../../contexts/auth.context'

interface Submission {
  id: string
  email: string
  regNumber: string
  firstName: string
  lastName: string
  middleName: string
  addedBy: string
  studentId: string
  testId: string
  createdAt: string
  updatedAt: string
  origin: string
  answers: Answer[]
  webcamCaptures: WebcamCapture[]
  completed: boolean
}

interface Answer {
  id: string
  body: string
  options: string[] | null
  correctAnswer: string | null
  type: 'trueOrFalse' | 'mcq' | 'essay'
  startedAt: string | null
  isTouched: boolean | null
  index: number
  answer: string | null
  point: number | null
  isCorrect: boolean | null
  isWithinTime: boolean | null
  autoGraded: boolean
  graded: boolean
  maxPoints: number
}

interface WebcamCapture {
  id: string
  url: string
  timestamp: string
}

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

export default function Responses({ testId }: { testId: string }) {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [resultsReleased, setResultsReleased] = useState(false)
  const [selectedWebcamCapture, setSelectedWebcamCapture] = useState<WebcamCapture | null>(null)
  const [isWebcamSectionOpen, setIsWebcamSectionOpen] = useState(false)
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null)
  const { user } = useContext(AuthContext)
  const queryClient = useQueryClient()

  const { data: submissions = [], isError, error, isLoading } = useQuery<Submission[], Error>({
    queryKey: ['submissions', testId, user?.accessToken],
    queryFn: () => fetchSubmissions(testId, user?.accessToken || ''),
    enabled: Boolean(user?.accessToken),
  })

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
            if (answer.id === answerId) {
              return {
                ...answer,
                point: points,
                graded: true,
                autoGraded: false
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
            point: points,
            graded: true,
            autoGraded: false
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
            if (answer.id === answerId) {
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
        if (answer.id === answerId) {
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
    // Assuming max score is not provided in the new data structure
    // You might need to adjust this based on your actual requirements
    return submission.answers.length * 10 // Assuming each question is worth 10 points
  }

  const calculateGradedQuestions = (submission: Submission) => {
    return submission.answers.filter(answer => answer.graded).length
  }

  const handleCompleteGrading = () => {
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

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading submissions...</div>
  }

  if (isError) {
    return <div className="flex items-center justify-center h-full text-red-500">{error.message}</div>
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
            </div>
          </div>
          {submissions.map(submission => (
            <div
              key={submission.id}
              className={`p-4 cursor-pointer hover:bg-gray-100 ${selectedSubmission?.id === submission.id ? 'bg-gray-200' : ''}`}
              onClick={() => handleSubmissionSelect(submission)}
            >
              <h3 className="font-medium">{submission.firstName} {submission.lastName}</h3>
              <p className="text-sm text-gray-500">{submission.regNumber}</p>
              {submission.completed && (
                <Badge variant="secondary" className="mt-1">
                  Graded
                </Badge>
              )}
            </div>
          ))}
        </Card>
      </div>
      <div className="w-full md:w-2/3 rounded-lg mb-3 ">
        {selectedSubmission ? (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{selectedSubmission.firstName} {selectedSubmission.lastName}</CardTitle>
                <CardDescription>{selectedSubmission.email} • {selectedSubmission.regNumber}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {new Date(selectedSubmission.createdAt).toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    <FileText className="mr-1 h-4 w-4" />
                    Total Score: {calculateTotalScore(selectedSubmission)} / {calculateMaxScore(selectedSubmission)}
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
                {selectedSubmission.webcamCaptures.length === 0 ? <div className='flex items-center justify-center'><CameraOff className='mr-2' /> Nothing to see here</div> : <div className="grid grid-cols-3 gap-4">
                  {selectedSubmission.webcamCaptures.map((capture) => (
                    <div
                      key={capture.id}
                      className="cursor-pointer border rounded-lg overflow-hidden"
                      onClick={() => handleWebcamCaptureSelect(capture)}
                    >
                      <img src={capture.url} alt={`Webcam capture ${capture.id}`} className="w-full h-32 object-cover" />
                    </div>
                  ))}
                </div>}
              </CollapsibleContent>
            </Collapsible>
            <div className="space-y-4">
              {selectedSubmission.answers.map(answer => (
                <StudentAnswerCard
                  key={answer.id}
                  answer={answer}
                  onGrade={handleGrade}
                  onOverrideAutoGrade={handleOverrideAutoGrade}
                  editingAnswerId={editingAnswerId}
                  setEditingAnswerId={setEditingAnswerId}
                />
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