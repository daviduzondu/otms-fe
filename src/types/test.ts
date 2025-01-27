export type QuestionType = 'mcq' | 'trueOrFalse' | 'shortAnswer' | 'essay'

export interface Question {
 id: string
 type: QuestionType
 body: string
 options?: string[]
 correctAnswer?: string | string[]
 points: number
 timeLimit: number
 mediaId: string
 media: {
  id: string
  type: string
  url: string
 }
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
 graded: boolean
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
 maxPoints: number
 media: {
  id: string
  type: string
  url: string
 }
}

export interface WebcamCapture {
 id: string
 url: string
 timestamp: string
}
export interface Branding {
 id: string
 field1: string
 field2?: string
 field3?: string
 media: {
  id: string
  url: string
 }
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
 showResultsAfterTest: boolean;
 showCorrectAnswers: boolean;
 provideExplanations: boolean;
 disableCopyPaste: boolean;
 requireFullScreen: boolean;
 brandingEnabled: Boolean;
 platform: 'mobileAndDesktop' | 'desktop';
 isRevoked: Boolean;
}