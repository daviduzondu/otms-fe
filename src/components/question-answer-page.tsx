'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { AlertCircle, BookCheck, Clock, HelpCircle, Loader } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { differenceInSeconds, addSeconds, isValid } from 'date-fns'

interface Question {
  id: string;
  body: string
  mediaId: string | null
  options: string[] | null
  points: number
  timeLimit: number
  type: 'mcq' | 'trueOrFalse' | 'essay' | 'shortAnswer'
  startedAt: string
  endAt?: string
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
    currentQuestionId: string
    questions: string[]
    startedAt: string
    serverTime: string
  }
}

export function QuestionAnswerPage({ companyName, data, accessToken }: QuestionPageProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(data.questions.findIndex(q => q === data.currentQuestionId))
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState<number>(0)
  const [testTimeRemaining, setTestTimeRemaining] = useState<number>(0)
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const initialAnswers: Record<string, string> = {};
    data.questions.forEach((questionId) => {
      initialAnswers[questionId] = '';
    });
    return initialAnswers;
  })
  const [overallProgress, setOverallProgress] = useState<number>(100)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTestComplete, setIsTestComplete] = useState(false)

  const serverTimeRef = useRef<number>(new Date(data.serverTime).getTime())
  const clientTimeRef = useRef<number>(Date.now())

  const getServerTime = useCallback(() => {
    const elapsed = Date.now() - clientTimeRef.current
    return new Date(serverTimeRef.current + elapsed)
  }, [])

  const handleNextOrSubmit = useCallback(async (isTimeout: boolean = false) => {
    if (isSubmitting || isTestComplete) return;

    setIsSubmitting(true);

    try {
      await submitAnswer();
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: selectedAnswer || '' }));

      if (currentQuestionIndex < data.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      } else {
        await submitTest();
        setIsTestComplete(true);
      }
    } catch (error) {
      console.error('Error in handleNextOrSubmit:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, isTestComplete, currentQuestion, currentQuestionIndex, data.questions.length, selectedAnswer]);

  useEffect(() => {
    const updateTimers = () => {
      const currentServerTime = getServerTime()

      // Update test timer
      const testStartTime = new Date(data.startedAt)
      const testEndTime = addSeconds(testStartTime, data.durationMin * 60)

      if (isValid(testEndTime) && isValid(currentServerTime)) {
        const testRemaining = Math.max(0, differenceInSeconds(testEndTime, currentServerTime))
        setTestTimeRemaining(testRemaining)

        // Automatically submit the test when overall time runs out
        if (testRemaining <= 0 && !isTestComplete) {
          handleNextOrSubmit(true);
        }
      } else {
        console.error('Invalid test end time or current server time', { testEndTime, currentServerTime })
      }

      // Update question timer
      if (currentQuestion?.timeLimit && currentQuestion.startedAt && currentQuestion.endAt) {
        const questionStartTime = new Date(currentQuestion.startedAt)
        const questionEndTime = new Date(currentQuestion.endAt)

        if (isValid(questionEndTime) && isValid(currentServerTime)) {
          const questionRemaining = Math.max(0, differenceInSeconds(questionEndTime, currentServerTime))
          setQuestionTimeRemaining(questionRemaining)
          setOverallProgress((questionRemaining / (currentQuestion.timeLimit * 60)) * 100)

          // Automatically move to the next question or submit the test when question time runs out
          if (questionRemaining <= 0 && !isSubmitting) {
            handleNextOrSubmit(true);
          }
        } else {
          console.error('Invalid question end time or current server time', { questionEndTime, currentServerTime })
        }
      }
    }

    const timerInterval = setInterval(updateTimers, 1000)
    return () => clearInterval(timerInterval)
  }, [data.startedAt, data.durationMin, currentQuestion, getServerTime, handleNextOrSubmit, isSubmitting, isTestComplete])

  useEffect(() => {
    if (data.questions[currentQuestionIndex]) {
      fetchQuestion(data.questions[currentQuestionIndex])
    }
  }, [currentQuestionIndex, data.questions])

  const fetchQuestion = async (questionId: string) => {
    if (!questionId) {
      console.error('Invalid questionId:', questionId);
      return;
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tests/${data.id}/question/${questionId}`, {
        headers: { 'x-access-token': accessToken }
      })
      const result = await response.json()
      if (response.ok) {
        setCurrentQuestion(result.data)
        if (result.data.serverTime) {
          serverTimeRef.current = new Date(result.data.serverTime).getTime()
          clientTimeRef.current = Date.now()
        } else {
          console.error('Server time not provided in API response')
        }
      } else {
        console.error('Failed to fetch question:', result.message)
      }
    } catch (error) {
      console.error('Error fetching question:', error)
    }
  }

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds)) {
      console.error('Invalid time value:', seconds)
      return '00:00:00'
    }
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const renderQuestionContent = () => {
    if (!currentQuestion) return null;
    const currentAnswer = answers[currentQuestion.id] || '';

    const isDisabled = (currentQuestion.timeLimit === null && testTimeRemaining === 0) ||
      (currentQuestion.timeLimit !== null && questionTimeRemaining === 0);

    const cursorClass = isDisabled ? "cursor-not-allowed" : "cursor-pointer";

    switch (currentQuestion.type) {
      case 'mcq':
        return (
          <RadioGroup
            value={currentAnswer}
            onValueChange={(value) => {
              setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
              setSelectedAnswer(currentQuestion?.options[parseInt(value)]);
            }}
            disabled={isDisabled}
            className="space-y-2"
          >
            {currentQuestion.options?.map((option, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 rounded-md border p-4 hover:bg-gray-50 transition-colors ${cursorClass}`}
              >
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label
                  htmlFor={`option-${index}`}
                  className={`flex-grow ${cursorClass}`}
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'trueOrFalse':
        return (
          <RadioGroup
            value={currentAnswer}
            onValueChange={(value) => {
              setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
              setSelectedAnswer(value);
            }}
            disabled={isDisabled}
            className="space-y-2"
            title={isDisabled ? "You've run out of time" : "Select one"}
          >
            <div
              className={`flex items-center space-x-2 rounded-md border p-4 hover:bg-gray-50 transition-colors ${cursorClass}`}
            >
              <RadioGroupItem value="true" id="true" />
              <Label
                htmlFor="true"
                className={`flex-grow ${cursorClass}`}
              >
                True
              </Label>
            </div>
            <div
              className={`flex items-center space-x-2 rounded-md border p-4 hover:bg-gray-50 transition-colors ${cursorClass}`}
            >
              <RadioGroupItem value="false" id="false" />
              <Label
                htmlFor="false"
                className={`flex-grow ${cursorClass}`}
              >
                False
              </Label>
            </div>
          </RadioGroup>
        );

      case 'essay':
        return (
          <Textarea
            placeholder="Type your answer here..."
            className="min-h-[200px]"
            value={currentAnswer}
            onChange={(e) => {
              setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }));
              setSelectedAnswer(e.target.value);
            }}
            disabled={isDisabled}
          />
        );

      case 'shortAnswer':
        return (
          <Input
            placeholder="Type your answer here..."
            value={currentAnswer}
            onChange={(e) => {
              setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }));
              setSelectedAnswer(e.target.value);
            }}
            disabled={isDisabled}
          />
        );

      default:
        return null;
    }
  };

  const submitAnswer = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tests/${data.id}/question/${data.questions[currentQuestionIndex]}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': accessToken
        },
        body: JSON.stringify({ answer: selectedAnswer || '' })
      })
      if (!response.ok) {
        throw new Error('Failed to submit answer')
      }
      const result = await response.json()
      if (result.data.serverTime) {
        serverTimeRef.current = new Date(result.data.serverTime).getTime()
        clientTimeRef.current = Date.now()
      } else {
        console.error('Server time not provided in API response')
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
    }
  }

  const submitTest = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tests/${data.id}/submit`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': accessToken
        },
      });
      if (!response.ok) {
        throw new Error('Failed to submit test');
        // TODO: Make sure to handle situations where test fails to submit (e.g., show error message)
      }
      const result = await response.json();
      console.log('Test submitted successfully:', result);
      // Handle successful test submission (e.g., redirect to results page)
    } catch (error) {
      console.error('Error submitting test:', error);
    }
  };

  if (!currentQuestion) {
    return <div className='flex gap-2 h-screen items-center justify-center bg-white w-screen z-10'><Loader className='animate-spin' /> Loading next question...</div>
  }

  if (isTestComplete) {
    return (
      <div className='flex items-center justify-center h-screen '>
        <Card className="lg:w-[25vw] border-green-200 bg-green-100 text-green-700 w-screen">
          <CardHeader className="flex"><BookCheck size={40} /></CardHeader>
          <CardContent className="font-bold text-lg -mt-3">
            Submission successful
          </CardContent>
          <CardFooter className="text-sm -mt-3">You can close this page now</CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-screen">
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
                    <HelpCircle className="mr-1 h-4 w-4" />
                    Instructions
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
              <Button onClick={() => handleNextOrSubmit()} disabled={!selectedAnswer || isSubmitting}>
                {isSubmitting ? <Loader className='animate-spin mr-2' /> : null}
                {!isSubmitting ? currentQuestionIndex < data.questions.length - 1 ? 'Next Question' : 'Submit Test' : "Submitting"}
              </Button>
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
          {currentQuestion?.timeLimit ? (
            <div
              className={`h-2 bg-orange-600`}
              style={{
                width: `${overallProgress}%`,
                transition: "width 400ms ease-out"
              }}
            />
          ) : null}

          <CardHeader className="flex flex-row items-center justify-between bg-gray-50 border-b pt-4 pl-6 pb-6 pr-6">
            <h3 className="text-lg font-semibold">Question {currentQuestionIndex + 1}</h3>
            {currentQuestion?.timeLimit && (
              <div className="flex items-center space-x-2 text-orange-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Time left: {formatTime(questionTimeRemaining)}</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-6 bg-white">
            <div className="lg:grid lg:grid-cols-2 lg:gap-6">
              <div className="space-y-4">
                <div dangerouslySetInnerHTML={{ __html: currentQuestion?.body }} />
                {currentQuestion?.mediaId && (
                  <img src={`/media/${currentQuestion.mediaId}`} alt="Question media" className="my-4 rounded-lg shadow-md" />
                )}
              </div>
              <div className="mt-6 lg:mt-0 space-y-4">
                <h4 className="font-medium text-gray-900">
                  {currentQuestion?.type === 'mcq' && 'Select only one answer'}
                  {currentQuestion?.type === 'trueOrFalse' && 'Select True or False'}
                  {currentQuestion?.type === 'essay' && 'Write your essay'}
                  {currentQuestion?.type === 'shortAnswer' && 'Write your answer'}
                </h4>
                {renderQuestionContent()}
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 border-t p-6">
            <div className="w-full flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {currentQuestion?.timeLimit ? 'Timed question' : 'No time limit'}
              </div>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}