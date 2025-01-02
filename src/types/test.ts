export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'matching'

export interface Question {
 id: string
 type: QuestionType
 text: string
 options?: string[]
 correctAnswer?: string | string[]
 points: number
}

export interface Submission {
 id: string
 email: string
 regNumber: string
 firstName: string
 lastName: string
 middleName: string
 addedBy: string
 testId: string
 startedAt: string
 submittedAt: string
 endsAt: string
 origin: string
 answers: Answer[]
 webcamCaptures: WebcamCapture[]
 pendingSubmissionsCount: number,
 completed: boolean
}

export interface Answer {
 id: string;
 questionId: string
 body: string
 options: string[] | null
 correctAnswer: string | null
 type: 'trueOrFalse' | 'mcq' | 'essay'
 startedAt: string | null
 isTouched: boolean | null
 index: number
 answer: string | null
 point: number | null
 isWithinTime: boolean | null
 autoGraded: boolean
 graded: boolean
 maxPoints: number
}

export interface WebcamCapture {
 id: string
 url: string
 timestamp: string
}

export interface TestDetails {
 id: string;
 title: string;
 instructions?: string;
 startsAt: Date;
 durationMin: number;
 endsAt: Date;
 code: string;
 passingScore: number;
 accessCode?: string;
 randomizeQuestions: boolean;
 showResults: boolean;
 showCorrectAnswers: boolean;
 provideExplanations: boolean;
 disableCopyPaste: boolean;
 requireFullScreen: boolean;
}