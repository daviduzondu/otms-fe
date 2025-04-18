'use client'

import React, { useState, useEffect, useContext } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Check, X, Edit2, MinusCircle, Loader } from 'lucide-react'
import { Switch } from "@/components/ui/switch"
import { QuestionTypeMap } from './question-card'
import { AuthContext } from '../../contexts/auth.context'
import { errorToast } from '../../helpers/show-toasts'
import { Answer } from '../../types/test'
import { useQueryClient } from '@tanstack/react-query'

interface StudentAnswerCardProps {
 answer: Answer
 onGrade: (answerId: string, points: number) => void
 onOverrideAutoGrade: (answerId: string) => void
 editingAnswerId: string | null
 setEditingAnswerId: (id: string | null) => void
 testId: string
 studentId: string
}

export function StudentAnswerCard({
 answer,
 onGrade,
 onOverrideAutoGrade,
 editingAnswerId,
 setEditingAnswerId,
 testId,
 studentId
}: StudentAnswerCardProps) {
 const { user } = useContext(AuthContext);
 const getGradeStatus = (answer: Answer) => {
  if (answer.point === null) return;
  if (answer.point === answer.maxPoints) return 'Correct'
  if (answer.point === 0) return 'Incorrect'
  return 'Partial credit'
 }

 const [updatingScore, setUpdatingScore] = useState(false);
 const [points, setPoints] = useState(answer.point || 0)
 const [isHovered, setIsHovered] = useState(false)
 const [localGradeStatus, setLocalGradeStatus] = useState(getGradeStatus(answer))
 const queryClient = useQueryClient();

 useEffect(() => {
  setLocalGradeStatus(getGradeStatus(answer))
 }, [answer.point, answer.maxPoints])


 const getGradeStatusColor = (status: string) => {
  switch (status) {
   case 'Correct': return 'text-green-600'
   case 'Incorrect': return 'text-red-600'
   case 'Partial credit': return 'text-yellow-600'
   default: return 'text-gray-600'
  }
 }

 const cardBackgroundColor = answer.graded || answer?.point >= 0 || answer.autoGraded ? 'bg-white' : 'bg-slate-100'
 const isGradingDisabled = !answer.answer

 const handleGrade = async (points: number | undefined, autoGrade = false) => {
  try {


   if (autoGrade) points = String(answer.answer) === String(answer.correctAnswer) ? answer.maxPoints : 0;
   setUpdatingScore(true);
   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tests/${testId}/grade${autoGrade ? "?autoGrade=true" : "?autoGrade=false"}`, {
    method: 'POST',
    body: JSON.stringify({
     point: Number(points),
     studentId,
     questionId: answer.questionId
    }),
    headers: {
     "Authorization": `Bearer ${user.accessToken}`,
     'Content-Type': 'application/json'
    }
   });

   const { message } = await res.json();
   queryClient.invalidateQueries(['analytics-summary', user?.accessToken]);

   if (!res.ok) throw new Error(message);

   onGrade(answer.questionId, points as number)
   setPoints(points => {
    return points;
   })
   setLocalGradeStatus(getGradeStatus({ ...answer, point: points as number }))
  } catch (error) {
   errorToast("Failed to update score", { description: (error as Error).message })
  }
  setUpdatingScore(false);

 }

 return (
  <Card
   className={`overflow-hidden transition-all duration-200 ${cardBackgroundColor}`}
   onMouseEnter={() => setIsHovered(true)}
   onMouseLeave={() => setIsHovered(false)}
  >
   <CardHeader className="py-3">
    <div className="flex justify-between items-center">
     <div>
      <CardTitle className="text-lg font-normal" dangerouslySetInnerHTML={{ __html: answer.body }}></CardTitle>
      <CardDescription className="flex items-center mt-1 space-x-2">
       <span className="text-xs">{QuestionTypeMap[answer.type]}{" "}</span>
      </CardDescription>
     </div>

     {!updatingScore ? <div className="flex items-center space-x-2 whitespace-nowrap">
      <span className={`text-sm font-medium ${getGradeStatusColor(localGradeStatus)}`}>
       {localGradeStatus}
      </span>
      <span className="text-sm font-medium whitespace-nowrap">
       {(answer.answer && answer.point === null)
        ? "Not graded yet"
        : `${answer.point !== null ? answer.point : 0} / ${answer.maxPoints}`}
      </span>

     </div> : <div className='flex  text-sm items-center'> <Loader className='animate-spin mr-2' size={20} /> Updating...</div>}
    </div>
   </CardHeader>
   <CardContent className="py-3 relative">
    {answer.media ? <div className="space-y-2 flex items-center justify-center relative">
     {

      answer.media.type === "image" ? (
       <img src={new URL(answer.media.url).toString()} width={400} height={400} alt="media" />
      ) :
       // Check if mediaUrl is an mp3
       answer.media.type === "audio" ? (
        <audio controls src={new URL(answer.media.url).toString()} className="w-full" />
       ) :
        // Check if mediaUrl is an mp4
        answer.media.type === "video" ? (
         <video controls src={new URL(answer.media.url).toString()} />
        ) : null
     }
    </div> : null}
    <div className="text-sm mb-2 bg-gray-100 rounded-lg -m-2 p-2" >
     <strong className='text-gray-600'>Student&apos;s Answer</strong>
     <br />
     {answer.answer
      ? answer.answer.split('\n').map((line, index) => (
       <span key={index}>
        {line}
        <br />
       </span>
      ))
      : 'No answer provided'}
    </div>

    {!updatingScore ? <div className="flex items-center justify-between mt-2 gap-2">
     <Badge
      variant="default"
      className={`text-xs ${answer.autoGraded && answer.answer ? 'bg-blue-500' : 'invisible'}`}
     >
      {answer.autoGraded && answer.answer ? 'Automatically graded' : 'Not graded'}
     </Badge>


     <div className='flex items-center gap-4 h-10'>
      {(!answer.autoGraded || answer.type === 'essay') && !isGradingDisabled && (
       editingAnswerId === answer.questionId ? (
        <div className={`flex items-center justify-end ${isHovered ? "visible" : "invisible"}`}>
         <Input
          type="number"
          min="0"
          max={answer.maxPoints}
          value={points}
          onChange={(e) => setPoints(parseInt(e.target.value))}
          className="w-20 mr-2"
         />
         <span>/ {answer.maxPoints}</span>
         <Button size="sm" variant="outline" className="ml-2" onClick={() => handleGrade(points)}>
          Save
         </Button>
        </div>
       ) : (
        <div className={`flex items-center justify-end ${isHovered ? "visible" : "invisible"}`}>
         <TooltipProvider delayDuration={0}>
          <Tooltip>
           <TooltipTrigger asChild>
            <Button
             size="sm"
             variant="outline"
             onClick={() => handleGrade(answer.maxPoints)}
             disabled={isGradingDisabled}
            >
             <Check className="h-4 w-4 text-green-500" />
            </Button>
           </TooltipTrigger>
           <TooltipContent>
            <p>Award full points</p>
           </TooltipContent>
          </Tooltip>
         </TooltipProvider>
         <TooltipProvider delayDuration={0}>
          <Tooltip>
           <TooltipTrigger asChild>
            <Button
             size="sm"
             variant="outline"
             onClick={() => handleGrade(0)}
             className="ml-2"
             disabled={isGradingDisabled}
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
          onClick={() => setEditingAnswerId(answer.questionId)}
          disabled={isGradingDisabled}
         >
          <Edit2 className="h-4 w-4" />
         </Button>
        </div>
       )
      )}
      {['mcq', 'trueOrFalse'].includes(answer.type) && answer.answer &&
       <div className='flex items-center '>
        <span className="text-sm mr-1">Override</span>
        <Switch
         checked={!answer.autoGraded}
         onCheckedChange={() => {
          onOverrideAutoGrade(answer.questionId);
          if (!answer.autoGraded) handleGrade(undefined, true)
          // return handleGrade(prevPoints);
         }}
         disabled={answer.type === 'essay'}
        />
       </div>
      }
     </div>
    </div> : <div className='h-10'></div>}

   </CardContent>
  </Card>
 )
}