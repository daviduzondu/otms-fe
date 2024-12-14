'use client'

import React, {useEffect, useState} from 'react'
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card"
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group"
import {Label} from "@/components/ui/label"
import {Button} from "@/components/ui/button"
import {Textarea} from "@/components/ui/textarea"
import {Input} from "@/components/ui/input"
import {AlertCircle, ChevronRight, Clock, HelpCircle} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

type QuestionType = 'mcq' | 'true-false' | 'essay' | 'short-answer'

interface Choice {
    id: string
    text: string
}

interface Question {
    id: string
    type: QuestionType
    text: string
    choices?: Choice[]
    timeLimit?: number // in seconds
    imageUrl?: string
    additionalInfo?: string[]
}

const sampleQuestions: Question[] = [
    {
        id: '1',
        type: 'mcq',
        text: 'Which of the following is not a JavaScript data type?',
        choices: [
            {id: '1', text: 'Number'},
            {id: '2', text: 'Boolean'},
            {id: '3', text: 'String'},
            {id: '4', text: 'Float'}
        ],
        timeLimit: 300,
    },
    {
        id: '2',
        type: 'true-false',
        text: 'JavaScript is a statically typed language.',
        timeLimit: 30
    },
    {
        id: '3',
        type: 'essay',
        text: 'Explain the concept of closures in JavaScript and provide an example.',
    },
    {
        id: '4',
        type: 'short-answer',
        text: 'What does the acronym "DOM" stand for in web development?',
        timeLimit: 45
    },
    {
        id: '5',
        type: 'mcq',
        text: 'Which of the following methods is used to add an element at the end of an array in JavaScript?',
        choices: [
            {id: '1', text: 'push()'},
            {id: '2', text: 'append()'},
            {id: '3', text: 'addToEnd()'},
            {id: '4', text: 'insert()'}
        ],
    }
]

interface QuestionPageProps {
    companyName: string
}

export function QuestionAnswerPage({companyName}: QuestionPageProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<string>('')
    const [questionTimeRemaining, setQuestionTimeRemaining] = useState<number>(0)
    const [testTimeRemaining, setTestTimeRemaining] = useState<number>(3600) // 1 hour test duration
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [overallProgress, setOverallProgress] = useState<number>(100)

    const question = sampleQuestions[currentQuestionIndex]

    useEffect(() => {
        const testTimer = setInterval(() => {
            setTestTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)

        return () => clearInterval(testTimer)
    }, [])

    useEffect(() => {
        if (question?.timeLimit) {
            setQuestionTimeRemaining(question.timeLimit)
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
                    const newProgress = (questionTimeRemaining / question.timeLimit) * 100
                    return newProgress > prev ? prev : newProgress
                })
            }, 1000)
            return () => clearInterval(timer)
        } else {
            setOverallProgress(100)
        }
    }, [question])

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const progress = question?.timeLimit ? (questionTimeRemaining / question.timeLimit) * 100 : 100

    const renderQuestionContent = () => {
        if (!question) return null

        switch (question.type) {
            case 'mcq':
                return (
                    <RadioGroup
                        value={selectedAnswer}
                        onValueChange={setSelectedAnswer}
                        className="space-y-2"
                    >
                        {question.choices?.map((choice) => (
                            <div key={choice.id}
                                 className="flex items-center space-x-2 rounded-md border p-4 hover:bg-gray-50 transition-colors">
                                <RadioGroupItem value={choice.id} id={choice.id}/>
                                <Label htmlFor={choice.id} className="flex-grow cursor-pointer">
                                    {choice.text}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                )
            case 'true-false':
                return (
                    <RadioGroup
                        value={selectedAnswer}
                        onValueChange={setSelectedAnswer}
                        className="space-y-2"
                    >
                        <div
                            className="flex items-center space-x-2 rounded-md border p-4 hover:bg-gray-50 transition-colors">
                            <RadioGroupItem value="true" id="true"/>
                            <Label htmlFor="true" className="flex-grow cursor-pointer">
                                True
                            </Label>
                        </div>
                        <div
                            className="flex items-center space-x-2 rounded-md border p-4 hover:bg-gray-50 transition-colors">
                            <RadioGroupItem value="false" id="false"/>
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
            case 'short-answer':
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
        setAnswers(prev => ({...prev, [question.id]: selectedAnswer}))
        setSelectedAnswer('')
        setOverallProgress(100)
        if (currentQuestionIndex < sampleQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
        } else {
            handleSubmit()
        }
    }

    const handleSubmit = () => {
        const finalAnswers = {...answers, [question.id]: selectedAnswer}
        console.log('Test submitted with answers:', finalAnswers)
        // Here you would typically send the answers to your backend
    }

    if (!question) {
        return <div>No more questions available</div>
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <header className="bg-white shadow-md">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">JavaScript Fundamentals
                            Test</h1>
                        <div className="flex items-center space-x-4">
                            <div
                                className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                <Clock className="h-4 w-4"/>
                                <span className="text-sm font-medium">Test time: {formatTime(testTimeRemaining)}</span>
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <HelpCircle className="mr-2 h-4 w-4"/>
                                        ? Instructions
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Test Instructions</DialogTitle>
                                        <DialogDescription>
                                            Please read the following instructions carefully before starting the test:
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="mt-4 space-y-4">
                                        <p>1. The test has a total duration of 1 hour.</p>
                                        <p>2. Some questions have individual time limits. When the time is up, you'll
                                            automatically move to the next question.</p>
                                        <p>3. There are multiple types of questions: multiple choice, true/false, short
                                            answer, and essay.</p>
                                        <p>4. You can navigate between questions using the 'Next' button.</p>
                                        <p>5. Your progress is automatically saved.</p>
                                        <p>6. Click 'Submit' when you've completed all questions or wish to finish the
                                            test.</p>
                                        <p>7. Good luck!</p>
                                    </div>
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
                Question {currentQuestionIndex + 1} of {sampleQuestions.length}
              </span>
                        </div>
                    </div>
                </div>
                <Card
                    className="overflow-hidden"
                    style={{
                        position: 'relative', // Ensure the card can position the pseudo-element
                    }}
                >
                    {question.timeLimit ? <div className={`h-2 bg-red-300`}
                                               style={{
                                                   width: `${progress}%`,
                                                   transition: "width 400ms ease-out"
                                               }}></div> : null}

                    <CardHeader className="flex flex-row items-center justify-between bg-gray-50 border-b">
                        <h3 className="text-lg font-semibold">Question {currentQuestionIndex + 1}</h3>
                        {question.timeLimit && (
                            <div className="flex items-center space-x-2 text-orange-600">
                                <AlertCircle className="h-4 w-4"/>
                                <span
                                    className="text-sm font-medium">Time left: {formatTime(questionTimeRemaining)}</span>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="p-6 bg-white">
                        <div className="lg:grid lg:grid-cols-2 lg:gap-6">
                            <div className="space-y-4">
                                <p className="text-gray-700">{question.text}</p>
                                {question.imageUrl && (
                                    <img src={question.imageUrl} alt="Question illustration"
                                         className="my-4 rounded-lg shadow-md"/>
                                )}
                                {question.additionalInfo && (
                                    <div className="space-y-2 bg-blue-50 p-4 rounded-md">
                                        {question.additionalInfo.map((info, index) => (
                                            <p key={index} className="text-sm text-blue-800">• {info}</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="mt-6 lg:mt-0 space-y-4">
                                <h4 className="font-medium text-gray-900">
                                    {question.type === 'mcq' && 'Select only one answer'}
                                    {question.type === 'true-false' && 'Select True or False'}
                                    {question.type === 'essay' && 'Write your essay'}
                                    {question.type === 'short-answer' && 'Write your answer'}
                                </h4>
                                {renderQuestionContent()}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-gray-50 border-t">
                        <div className="w-full flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                                {question.timeLimit ? 'Timed question' : 'No time limit'}
                            </div>
                            <Button onClick={handleNext} disabled={!selectedAnswer} className="gap-2">
                                Next
                                <ChevronRight className="h-4 w-4"/>
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </main>
        </div>
    )
}

