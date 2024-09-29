'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
// import { toast } from "@/components/ui/use-toast"

type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'essay'

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
}

const sampleQuestions: Question[] = [
  {
    id: '1',
    text: 'What is the capital of France?',
    type: 'short-answer',
  },
  {
    id: '2',
    text: 'The Earth is flat.',
    type: 'true-false',
  },
  {
    id: '3',
    text: 'Explain the process of photosynthesis.',
    type: 'essay',
  },
  {
    id: '4',
    text: 'Which of the following is a prime number?',
    type: 'multiple-choice',
    options: ['1', '4', '7', '9'],
  },
]

const EXAM_DURATION = 60 * 60 // 1 hour in seconds

export default function StudentAnswerPageClient() {
  const [answers, setAnswers] = useState<{ [key: string]: string }>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION)
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleAnswerChange = useCallback((questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }, [])

  const handleSubmit = useCallback(() => {
    console.log('Submitted answers:', answers)
    // Here you would typically send the answers to a server
    console.log({
      title: "Exam Submitted",
      description: "Your answers have been successfully submitted.",
    })
    // Redirect to a completion page or show a completion message
  }, [answers])

  const currentQuestion = sampleQuestions[currentQuestionIndex]

  const navigateQuestion = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    } else if (direction === 'next' && currentQuestionIndex < sampleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }, [currentQuestionIndex])

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  const progress = (Object.keys(answers).length / sampleQuestions.length) * 100

  const renderQuestionInput = useCallback((question: Question) => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <RadioGroup
            value={answers[question.id] || ''}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )
      case 'true-false':
        return (
          <RadioGroup
            value={answers[question.id] || ''}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id={`${question.id}-true`} />
              <Label htmlFor={`${question.id}-true`}>True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id={`${question.id}-false`} />
              <Label htmlFor={`${question.id}-false`}>False</Label>
            </div>
          </RadioGroup>
        )
      case 'short-answer':
        return (
          <Input
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Type your answer here..."
          />
        )
      case 'essay':
        return (
          <Textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Type your essay here..."
            className="min-h-[200px]"
          />
        )
      default:
        return null
    }
  }, [answers, handleAnswerChange])

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Student Exam</h1>
        <div className="text-xl font-semibold">
          Time Left: {formatTime(timeLeft)}
        </div>
      </div>
      <Progress value={progress} className="mb-4" />
      <Card>
        <CardHeader>
          <CardTitle>Question {currentQuestion.id}</CardTitle>
          <CardDescription>
            {currentQuestion.type === 'multiple-choice' && 'Choose the correct answer'}
            {currentQuestion.type === 'true-false' && 'Select True or False'}
            {currentQuestion.type === 'short-answer' && 'Provide a brief answer'}
            {currentQuestion.type === 'essay' && 'Write a detailed response'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div>{currentQuestion.text}</div>
          </div>
          {renderQuestionInput(currentQuestion)}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            onClick={() => navigateQuestion('prev')}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          <Button
            onClick={() => navigateQuestion('next')}
            disabled={currentQuestionIndex === sampleQuestions.length - 1}
          >
            Next
          </Button>
        </CardFooter>
      </Card>
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Question {currentQuestionIndex + 1} of {sampleQuestions.length}
        </div>
        <AlertDialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button>Submit Exam</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Make sure you have answered all questions to the best of your ability.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <Separator className="my-4" />
      <Card>
        <CardHeader>
          <CardTitle>All Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            {sampleQuestions.map((question, index) => (
              <div
                key={question.id}
                className={`p-2 cursor-pointer ${
                  index === currentQuestionIndex ? 'bg-primary text-primary-foreground' : ''
                } ${answers[question.id] ? 'font-semibold' : ''}`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                Question {question.id}: {question.text.substring(0, 50)}...
                {answers[question.id] && ' (Answered)'}
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}