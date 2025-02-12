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
import Webcam from 'react-webcam'
import WebcamFeed from './webcam-feed'
import { useErrorBoundary } from 'react-error-boundary'
import ResultsDialog from './results-dialog'
import { errorToast } from '../../helpers/show-toasts'

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
 media?: { id: string, url: string, type: string }
}

interface QuestionPageProps {
 companyName: string
 accessToken: string
 resultReady: Boolean
 disableCopyPaste: Boolean
 requireFullScreen: Boolean
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

function detectDevTools() {
 const threshold = 100;
 const start = performance.now();
 debugger;
 const end = performance.now();
 return end - start > threshold;
}

export function QuestionAnswerPage({ companyName, data, accessToken, resultReady, disableCopyPaste, requireFullScreen }: QuestionPageProps) {
 const [triggerScreenshot, setTriggerScreenshot] = useState(false);
 const [screenshot, setScreenshot] = useState<string | null>(null);
 const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
 const { showBoundary } = useErrorBoundary();



 useEffect(() => {
  if (requireFullScreen) {
   const handleFullscreen = () => {
    if (!document.fullscreenElement) {
     document.body.requestFullscreen().catch((err) => {
      console.error("Failed to enter fullscreen:", err);
     });
    }
   };

   document.addEventListener("click", handleFullscreen);
   document.addEventListener("keypress", handleFullscreen);

   return () => {
    document.removeEventListener("click", handleFullscreen);
    document.removeEventListener("keypress", handleFullscreen);
   };
  }
 }, [requireFullScreen]);


 useEffect(() => {
  const checkDevTools = setInterval(() => {
   if (detectDevTools()) {
    window.location.href = "about:blank";
   }
  }, 1000);

  return () => clearInterval(checkDevTools);
 }, []);

 useEffect(() => {
  if (disableCopyPaste) {
   const handleCopy = (e) => {
    e.preventDefault();
    errorToast('Copying is disabled.');
   };

   const handlePaste = (e) => {
    e.preventDefault();
    errorToast('Pasting is disabled.');
   };

   const handleContextMenu = (e) => {
    e.preventDefault();
    errorToast('Right-click is disabled.');
   };

   document.addEventListener('copy', handleCopy);
   document.addEventListener('paste', handlePaste);
   document.addEventListener('contextmenu', handleContextMenu);

   return () => {
    document.removeEventListener('copy', handleCopy);
    document.removeEventListener('paste', handlePaste);
    document.removeEventListener('contextmenu', handleContextMenu);
   };
  }
 }, [disableCopyPaste]);


 const handleScreenshotTaken = async (imageSrc: string | null) => {
  if (!imageSrc) {
   console.error("No image source provided!");
   return;
  }

  const formData = new FormData();

  // Create an Image object
  const image = new Image();
  image.src = imageSrc as string;

  // Use a promise to ensure image is loaded before proceeding
  const createFileFromImage = new Promise<File>((resolve, reject) => {
   image.onload = () => {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
     reject('Canvas context creation failed');
     return;
    }

    // Set canvas dimensions to match the image
    canvas.width = image.width;
    canvas.height = image.height;

    // Draw the image onto the canvas
    ctx.drawImage(image, 0, 0);

    // Convert the image to a compressed JPEG format
    const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.5); // Adjust 0.7 for quality (0-1)

    // Convert the base64 to Blob
    const byteString = atob(jpegDataUrl.split(',')[1]);
    const mimeString = jpegDataUrl.split(',')[0].split(':')[1].split(';')[0];

    const arrayBuffer = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
     arrayBuffer[i] = byteString.charCodeAt(i);
    }

    // Create a compressed File object
    const file = new File([arrayBuffer], 'screenshot.jpg', { type: mimeString });
    resolve(file); // Resolve the promise with the created file
   };

   image.onerror = (error) => {
    reject('Error loading image');
   };
  });

  try {
   // Wait for the image to load and the file to be created
   const file = await createFileFromImage;
   // Append the file to FormData
   formData.append('file', file);

   // Send the form data to the server
   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/storage/upload-webcam/${data.id ? "?testId=" + data.id : ""}`, {
    method: 'POST',
    body: formData,
    headers: {
     'x-access-token': accessToken
    }
   });

   const { message, data: json } = await response.json();
   console.log(message);

   setScreenshot(imageSrc); // Store the screenshot
   setTriggerScreenshot(false); // Reset the trigger for screenshot
  } catch (error) {
   console.error("Error capturing screenshot:", error);
  }
 };


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
 // My suspision lies here. 
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
   if (currentQuestion) setAnswers(prev => ({ ...prev, [currentQuestion.id]: selectedAnswer || '' }));

   if (currentQuestionIndex < data.questions.length - 1) {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setSelectedAnswer(null);
   } else {
    await submitTest();
   }
  } catch (error) {
   showBoundary(error);
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
 }, [data.startedAt, data.durationMin, currentQuestion, getServerTime,isLoadingQuestion, isSubmitting, isTestComplete])

 useEffect(() => {
  if (data.questions[currentQuestionIndex]) {
   fetchQuestion(data.questions[currentQuestionIndex])
  }
 }, [currentQuestionIndex, data.questions])

 const fetchQuestion = async (questionId: string) => {
  setIsLoadingQuestion(true);
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
    setIsLoadingQuestion(false);
   } else {
    throw new Error(result.message || "Failed to fetch question")
   }
  } catch (error) {
   showBoundary(error);
   console.error('Error fetching question:', error);
  }
  setIsLoadingQuestion(false);
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
   const result = await response.json();
   if (result.data.serverTime) {
    serverTimeRef.current = new Date(result.data.serverTime).getTime()
    clientTimeRef.current = Date.now()
   } else {
    throw new Error('Server time not provided in API response');
   }
  } catch (error) {
   throw error
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

   const { message } = await response.json();
   if (!response.ok) {
    throw new Error(message || 'Failed to submit test');
   }
   setIsTestComplete(true);

   // Handle successful test submission (e.g., redirect to results page)
  } catch (error) {
   console.error('Error submitting test:', error);
   throw error;
  }
 };

 if (isLoadingQuestion) {
  return <div className='flex gap-2 h-screen items-center justify-center bg-white w-screen z-10'><Loader className='animate-spin' /> Loading next question...</div>
 }
 if (isTestComplete) {
  return (
   <div className='flex items-center justify-center h-screen '>
    <Card className="lg:w-[25vw] border-green-200 bg-green-50 text-green-700 w-screen">
     <CardHeader className="flex"><BookCheck size={40} /></CardHeader>
     <CardContent className="font-bold text-lg -mt-3">
      Submission successful
     </CardContent>
     <CardFooter className="text-sm -mt-3 flex flex-col w-full gap-2">
      {resultReady ? <ResultsDialog accessToken={accessToken} testId={data.id} /> : <div className='flex items-start text-left w-full'>You can close this page now.</div>}
     </CardFooter>
    </Card>
   </div>
  )
 }

 if (currentQuestion && !isTestComplete) return (
  <div className="min-h-screen w-screen">
   {!isTestComplete ? <WebcamFeed className='absolute invisible' triggerScreenshot={triggerScreenshot} onScreenshotTaken={handleScreenshotTaken} /> : null}
   <header className="bg-white shadow-md">
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
       {data.title}
      </h1>

      {/* Action Section */}
      <div className="flex flex-wrap items-center gap-3">
       {/* Test Time */}
       <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">Test time: {formatTime(testTimeRemaining)}</span>
       </div>

       {/* Instructions Dialog */}
       <Dialog>
        <DialogTrigger asChild>
         <Button variant="outline" className="flex items-center">
          <HelpCircle className="mr-1 h-4 w-4" />
          Instructions
         </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
         <DialogHeader>
          <DialogTitle>Test Instructions</DialogTitle>
          <DialogDescription>
           <p className="leading-relaxed whitespace-pre-wrap">{data.instructions}</p>
          </DialogDescription>
         </DialogHeader>
        </DialogContent>
       </Dialog>

       {/* Next/Submit Button */}
       <Button onClick={() => handleNextOrSubmit()} disabled={!selectedAnswer || isSubmitting}>
        {isSubmitting ? <Loader className="animate-spin mr-2" /> : null}
        {!isSubmitting ? (currentQuestionIndex < data.questions.length - 1 ? 'Next Question' : 'Submit Test') : 'Submitting'}
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
        {currentQuestion?.media && (
         <div className="space-y-2 flex items-center justify-center relative">
          {currentQuestion.media.type === "image" ? (
           <img src={new URL(currentQuestion.media.url).toString()} width={400} height={400} alt="media" />
          ) : currentQuestion.media.type === "audio" ? (
           <audio controls src={new URL(currentQuestion.media.url).toString()} className="w-full" />
          ) : currentQuestion.media.type === "video" ? (
           <video controls src={new URL(currentQuestion.media.url).toString()} />
          ) : null}
         </div>
        )
        }

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