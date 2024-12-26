'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Check, X, Edit2, MinusCircle } from 'lucide-react'
import { Switch } from "@/components/ui/switch"

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

interface StudentAnswerCardProps {
 answer: Answer
 onGrade: (answerId: string, points: number) => void
 onOverrideAutoGrade: (answerId: string) => void
 editingAnswerId: string | null
 setEditingAnswerId: (id: string | null) => void
}

export function StudentAnswerCard({
 answer,
 onGrade,
 onOverrideAutoGrade,
 editingAnswerId,
 setEditingAnswerId
}: StudentAnswerCardProps) {
 const getGradeStatus = (answer: Answer) => {
  if (answer.point === null) return
  if (answer.point === answer.maxPoints) return 'Correct'
  if (answer.point === 0) return 'Incorrect'
  return 'Partial Credit'
 }


 const [points, setPoints] = useState(answer.point || 0)
 const [isHovered, setIsHovered] = useState(false)
 const [localGradeStatus, setLocalGradeStatus] = useState(getGradeStatus(answer))

 useEffect(() => {
  setLocalGradeStatus(getGradeStatus(answer))
 }, [answer.point, answer.maxPoints])


 const getGradeStatusColor = (status: string) => {
  switch (status) {
   case 'Correct': return 'text-green-500'
   case 'Incorrect': return 'text-red-500'
   case 'Partial Credit': return 'text-yellow-500'
   default: return 'text-gray-500'
  }
 }

 const cardBackgroundColor = answer.graded ? 'bg-white' : 'bg-gray-100'
 const isGradingDisabled = !answer.answer

 const handleGrade = (points: number) => {
  onGrade(answer.id, points)
  setPoints(points)
  setLocalGradeStatus(getGradeStatus({ ...answer, point: points }))
 }

 const handlePartialCredit = () => {
  const partialPoints = Math.floor(answer.maxPoints / 2)
  handleGrade(partialPoints)
 }

 return (
  <Card
   className={`overflow-hidden transition-all duration-200 ${cardBackgroundColor} hover:shadow-md`}
   onMouseEnter={() => setIsHovered(true)}
   onMouseLeave={() => setIsHovered(false)}
  >
   <CardHeader className="py-3">
    <div className="flex justify-between items-center">
     <div>
      <CardTitle className="text-lg font-normal" dangerouslySetInnerHTML={{ __html: answer.body }}></CardTitle>
      <CardDescription className="flex items-center mt-1 space-x-2">
       <span className="text-xs">{answer.type}</span>
       {answer.autoGraded && (
        <Badge variant="secondary" className="text-xs">Auto-graded</Badge>
       )}
       {!answer.graded && (
        <Badge variant="outline" className="text-xs">Not graded</Badge>
       )}
      </CardDescription>
     </div>
     <div className="flex items-center space-x-2">
      <span className={`text-sm font-medium ${getGradeStatusColor(localGradeStatus)}`}>
       {localGradeStatus}
      </span>
      <span className="text-sm font-medium">
       {answer.point !== null ? answer.point : 'N/A'} / {answer.maxPoints}
      </span>
     </div>
    </div>
   </CardHeader>
   <CardContent className="py-3 relative">
    <div className="text-sm mb-2">
     <strong>Student's Answer:</strong> {answer.answer || 'No answer provided'}
    </div>
    <div className="flex items-center justify-end mt-2">

     {['mcq', 'trueOrFalse'].includes(answer.type) && answer.answer &&
      <>
       <span className="text-sm mr-2">Override Auto-grade</span>
       <Switch
        checked={!answer.autoGraded}
        onCheckedChange={() => onOverrideAutoGrade(answer.id)}
        disabled={answer.type === 'essay'}
       />
      </>
     }
    </div>
    {(!answer.autoGraded || answer.type === 'essay') && !isGradingDisabled && (
     editingAnswerId === answer.id ? (
      <div className="flex items-center mt-2">
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
      <div className="flex items-center justify-end mt-2">
       <TooltipProvider>
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
       <TooltipProvider>
        <Tooltip>
         <TooltipTrigger asChild>
          <Button
           size="sm"
           variant="outline"
           onClick={handlePartialCredit}
           className="ml-2"
           disabled={isGradingDisabled}
          >
           <MinusCircle className="h-4 w-4 text-yellow-500" />
          </Button>
         </TooltipTrigger>
         <TooltipContent>
          <p>Award partial credit</p>
         </TooltipContent>
        </Tooltip>
       </TooltipProvider>
       <TooltipProvider>
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
        onClick={() => setEditingAnswerId(answer.id)}
        disabled={isGradingDisabled}
       >
        <Edit2 className="h-4 w-4" />
       </Button>
      </div>
     )
    )}
   </CardContent>
  </Card>
 )
}