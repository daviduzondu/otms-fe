import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Check, X, Edit2 } from 'lucide-react'

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
    if (answer.isCorrect === true) return 'Correct'
    if (answer.isCorrect === false) return 'Incorrect'
    return 'Not Evaluated'
  }

  const getGradeStatusColor = (answer: Answer) => {
    if (answer.isCorrect === true) return 'text-green-500'
    if (answer.isCorrect === false) return 'text-red-500'
    return 'text-yellow-500'
  }

  const [points, setPoints] = useState(answer.point || 0);

  const maxPoints = 10; // Assuming max points is 10, adjust as needed

  return (
    <Card className={`overflow-hidden transition-all duration-200 ${answer.graded ? 'bg-white' : 'bg-gray-50'}`}>
      <CardHeader className="py-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-normal" dangerouslySetInnerHTML={{__html: answer.body}}></CardTitle>
            <CardDescription className="flex items-center mt-1">
              <span className="text-xs">{answer.type}</span>
              {answer.autoGraded && (
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
              {answer.point !== null ? answer.point : 'N/A'} / {maxPoints}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-3 relative group">
        <div className="text-sm mb-2">
          <strong>Student's Answer:</strong> {answer.answer || 'No answer provided'}
        </div>
        {answer.autoGraded ? (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOverrideAutoGrade(answer.id)}
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
                max={maxPoints}
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value))}
                className="w-20 mr-2"
              />
              <span>/ {maxPoints}</span>
              <Button size="sm" variant="outline" className="ml-2" onClick={() => (setEditingAnswerId(null), onGrade(answer.id, points))}>
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
                      onClick={() => onGrade(answer.id, maxPoints)}
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
                      onClick={() => onGrade(answer.id, 0)}
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
        {answer.autoGraded && (
          <div className="mt-2 text-sm text-gray-500">
            <Button
              size="sm"
              variant="link"
              onClick={() => onOverrideAutoGrade(answer.id)}
            >
              Revert to auto-grade
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}