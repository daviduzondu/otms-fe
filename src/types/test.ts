export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'matching'

export interface Question {
 id: string
 type: QuestionType
 text: string
 options?: string[]
 correctAnswer?: string | string[]
 points: number
}