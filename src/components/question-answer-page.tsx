'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { AlertCircle, ChevronRight, Clock, HelpCircle } from 'lucide-react'
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from "@/components/ui/dialog"

interface Question {
 body: string
 mediaId: string | null
 options: string[] | null
 points: number
 timeLimit: number
 type: 'mcq' | 'trueOrFalse' | 'essay' | 'shortAnswer'
}

interface QuestionPageProps {
 companyName: string
 accessToken: string
 data: {
  title: string
  instructions: string
  teacherId: string
  passingScore: number
  durationMin: number
  id: string
  questions: string[]
  startedAt: string
 }
}

export function QuestionAnswerPage({ companyName, data, accessToken }: QuestionPageProps) {
 const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
 const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
 const [selectedAnswer, setSelectedAnswer] = useState<string>('')
 const [questionTimeRemaining, setQuestionTimeRemaining] = useState<number>(0)
 const [testTimeRemaining, setTestTimeRemaining] = useState<number>(data.durationMin * 60)
 const [answers, setAnswers] = useState<Record<string, string>>({})
 const [overallProgress, setOverallProgress] = useState<number>(100)

 useEffect(() => {
  const testTimer = setInterval(() => {
   setTestTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0))
  }, 1000)

  return () => clearInterval(testTimer)
 }, [])

 useEffect(() => {
  if (currentQuestion?.timeLimit) {
   setQuestionTimeRemaining(currentQuestion.timeLimit)
   const timer = setInterval(() => {
    setQuestionTimeRemaining((prev) => {
     if (prev <= 1) {
      clearInterval(timer)
      handleNext()
      return 0
     }
     return prev - 1
    })
    setOverallProgress((prev) => {
     const newProgress = (questionTimeRemaining / currentQuestion.timeLimit) * 100
     return newProgress > prev ? prev : newProgress
    })
   }, 1000)
   return () => clearInterval(timer)
  } else {
   setOverallProgress(100)
  }
 }, [currentQuestion])

 useEffect(() => {
  fetchQuestion(data.questions[currentQuestionIndex])
 }, [currentQuestionIndex])

 const fetchQuestion = async (questionId: string) => {
  console.log(data.questions)
  try {
   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tests/${data.id}/question/${questionId}`, { headers: { 'x-access-token': accessToken } })
   const result = await response.json()
   if (response.ok) {
    setCurrentQuestion(result.data)
   } else {
    console.error('Failed to fetch question:', result.message)
   }
  } catch (error) {
   console.error('Error fetching question:', error)
  }
 }

 const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
 }

 const progress = currentQuestion?.timeLimit ? (questionTimeRemaining / currentQuestion.timeLimit) * 100 : 100

 const renderQuestionContent = () => {
  if (!currentQuestion) return null

  switch (currentQuestion.type) {
   case 'mcq':
    return (
     <RadioGroup
      value={selectedAnswer}
      onValueChange={setSelectedAnswer}
      className="space-y-2"
     >
      {currentQuestion.options?.map((option, index) => (
       <div key={index} className="flex items-center space-x-2 rounded-md border p-4 hover:bg-gray-50 transition-colors">
        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
        <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">
         {option}
        </Label>
       </div>
      ))}
     </RadioGroup>
    )
   case 'trueOrFalse':
    return (
     <RadioGroup
      value={selectedAnswer}
      onValueChange={setSelectedAnswer}
      className="space-y-2"
     >
      <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-gray-50 transition-colors">
       <RadioGroupItem value="true" id="true" />
       <Label htmlFor="true" className="flex-grow cursor-pointer">
        True
       </Label>
      </div>
      <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-gray-50 transition-colors">
       <RadioGroupItem value="false" id="false" />
       <Label htmlFor="false" className="flex-grow cursor-pointer">
        False
       </Label>
      </div>
     </RadioGroup>
    )
   case 'essay':
    return (
     <Textarea
      placeholder="Type your answer here..."
      className="min-h-[200px]"
      value={selectedAnswer}
      onChange={(e) => setSelectedAnswer(e.target.value)}
     />
    )
   case 'shortAnswer':
    return (
     <Input
      placeholder="Type your answer here..."
      value={selectedAnswer}
      onChange={(e) => setSelectedAnswer(e.target.value)}
     />
    )
   default:
    return null
  }
 }

 const handleNext = () => {
  setAnswers(prev => ({ ...prev, [data.questions[currentQuestionIndex]]: selectedAnswer }))
  setSelectedAnswer('')
  setOverallProgress(100)
  if (currentQuestionIndex < data.questions.length - 1) {
   setCurrentQuestionIndex(currentQuestionIndex + 1)
  } else {
   handleSubmit()
  }
 }

 const handleSubmit = () => {
  const finalAnswers = { ...answers, [data.questions[currentQuestionIndex]]: selectedAnswer }
  console.log('Test submitted with answers:', finalAnswers)
  // Here you would typically send the answers to your backend
 }

 if (!currentQuestion) {
  return <div>Loading question...</div>
 }

 return (
  <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
   <header className="bg-white shadow-md">
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
     <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">{data.title}</h1>
      <div className="flex items-center space-x-4">
       <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">Test time: {formatTime(testTimeRemaining)}</span>
       </div>
       <Dialog>
        <DialogTrigger asChild>
         <Button variant="outline">
          <HelpCircle className="mr-2 h-4 w-4" />
          ? Instructions
         </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
         <DialogHeader>
          <DialogTitle>Test Instructions</DialogTitle>
          <DialogDescription>
           {data.instructions}
          </DialogDescription>
         </DialogHeader>
        </DialogContent>
       </Dialog>
       <Button onClick={handleSubmit}>Submit Test</Button>
      </div>
     </div>
    </div>
   </header>
   <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
    <div className="mb-4 flex items-center justify-between">
     <h2 className="text-xl font-semibold text-gray-900">{companyName}</h2>
     <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
       <span className="text-sm font-medium text-gray-700">
        Question {currentQuestionIndex + 1} of {data.questions.length}
       </span>
      </div>
     </div>
    </div>
    <Card
     className="overflow-hidden"
     style={{
      position: 'relative',
     }}
    >
     {currentQuestion.timeLimit ? (
      <div
       className={`h-2 bg-red-300`}
       style={{
        width: `${progress}%`,
        transition: "width 400ms ease-out"
       }}
      />
     ) : null}

     <CardHeader className="flex flex-row items-center justify-between bg-gray-50 border-b">
      <h3 className="text-lg font-semibold">Question {currentQuestionIndex + 1}</h3>
      {currentQuestion.timeLimit && (
       <div className="flex items-center space-x-2 text-orange-600">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Time left: {formatTime(questionTimeRemaining)}</span>
       </div>
      )}
     </CardHeader>
     <CardContent className="p-6 bg-white">
      <div className="lg:grid lg:grid-cols-2 lg:gap-6">
       <div className="space-y-4">
        <div dangerouslySetInnerHTML={{ __html: currentQuestion.body }} />
        {currentQuestion.mediaId && (
         <img src={`/media/${currentQuestion.mediaId}`} alt="Question media" className="my-4 rounded-lg shadow-md" />
        )}
       </div>
       <div className="mt-6 lg:mt-0 space-y-4">
        <h4 className="font-medium text-gray-900">
         {currentQuestion.type === 'mcq' && 'Select only one answer'}
         {currentQuestion.type === 'trueOrFalse' && 'Select True or False'}
         {currentQuestion.type === 'essay' && 'Write your essay'}
         {currentQuestion.type === 'shortAnswer' && 'Write your answer'}
        </h4>
        {renderQuestionContent()}
       </div>
      </div>
     </CardContent>
     <CardFooter className="bg-gray-50 border-t">
      <div className="w-full flex justify-between items-center">
       <div className="text-sm text-gray-500">
        {currentQuestion.timeLimit ? 'Timed question' : 'No time limit'}
       </div>
       <Button onClick={handleNext} disabled={!selectedAnswer} className="gap-2">
        Next
        <ChevronRight className="h-4 w-4" />
       </Button>
      </div>
     </CardFooter>
    </Card>
   </main>
  </div>
 )
}