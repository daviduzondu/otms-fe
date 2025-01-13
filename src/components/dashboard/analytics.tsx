'use client'

import React, { useState, useMemo, useEffect } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts"
import { Info } from 'lucide-react'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658']

interface Response {
 id: string
 firstName: string
 lastName: string
 point: number | null
 answer: string | null
 submittedAt: string | null
}

interface QuestionStat {
 questionId: string
 points: number
 body: string
 index: number
 responses: Response[]
 averageTimeSpentInSeconds: number
 answerCount: number
}

interface Class {
 id: string
 name: string
 teacherId: string
}

interface Attempt {
 class: Class
 id: string
 firstName: string
 lastName: string
 totalPoints: number
}

interface TestData {
 id: string
 title: string
 durationMin: number
 attempts: Attempt[]
 questionStats: QuestionStat[]
}

export const ChartDialog: React.FC<{ data: TestData }> = ({ data }) => {
 const [selectedQuestion, setSelectedQuestion] = useState<QuestionStat | null>(null)

 const studentScores = useMemo(() => data.attempts.map((attempt) => ({
  name: `${attempt.firstName} ${attempt.lastName}`,
  score: attempt.totalPoints,
  class: attempt.class.name,
 })), [data.attempts])


 const questionStats = useMemo(() => data.questionStats.sort((a, b) => Number(a.index) - Number(b.index)).map((stat) => ({
  index: `Q${stat.index + 1}`,
  points: stat.points,
  avgTime: stat.averageTimeSpentInSeconds,
  body: stat.body,
  studentsAnswered: stat.answerCount,
  correctAnswers: stat.responses.filter(r => r.point === stat.points).length,
  incorrectAnswers: stat.responses.filter(r => r.point !== null && r.point !== stat.points).length,
  partiallyCorrect: stat.responses.filter(r => r.point === null).length,
 })), [data.questionStats])

 const classDistribution = useMemo(() => {
  const distribution = data.attempts.reduce((acc, attempt) => {
   acc[attempt.class.name] = (acc[attempt.class.name] || 0) + 1
   return acc
  }, {} as Record<string, number>)
  return Object.entries(distribution).map(([name, value]) => ({ name, value }))
 }, [data.attempts])

 const stats = useMemo(() => {
  const scores = studentScores.map(s => s.score)
  return {
   highestScore: Math.max(...scores),
   lowestScore: Math.min(...scores),
   // highestScoringStudent
   averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
   totalParticipants: data.attempts.length,
   totalQuestions: data.questionStats.length,
   totalPoints: data.questionStats.reduce((sum, q) => sum + q.points, 0),
  }
 }, [studentScores, data.attempts.length, data.questionStats])

 const getResponseDistribution = (responses: Response[], maxPoints: number) => {
  const distribution = {
   correct: 0,
   incorrect: 0,
   partiallyCorrect: 0,
  }

  responses.forEach(response => {
   if (response.point === null || response.point === 0) {
    distribution.incorrect++
   } else if (response.point === maxPoints) {
    distribution.correct++
   } else {
    distribution.partiallyCorrect++
   }
  })

  return [
   { name: 'Correct', value: distribution.correct },
   { name: 'Incorrect', value: distribution.incorrect },
   { name: 'Partially Correct', value: distribution.partiallyCorrect },
  ]
 }

 return (
  <Dialog>
   <DialogTrigger asChild>
    <Button>View Test Metrics</Button>
   </DialogTrigger>
   <DialogContent className="max-w-7xl max-h-[90vh] overflow-auto">
    <DialogTitle>Test Metrics - {data.title}</DialogTitle>
    <DialogDescription>
     Duration: {data.durationMin} minutes
    </DialogDescription>
    <div className="space-y-8 mt-6">
     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 [&>*]:bg-slate-100">
      <Card>
       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
       </CardHeader>
       <CardContent>
        <div className="text-2xl font-bold">{stats.totalParticipants}</div>
       </CardContent>
      </Card>
      <Card>
       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total points</CardTitle>
       </CardHeader>
       <CardContent>
        <div className="text-2xl font-bold">{stats.totalPoints.toFixed(2)}</div>
       </CardContent>
      </Card>
      <Card>
       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
       </CardHeader>
       <CardContent>
        <div className="text-2xl font-bold">{stats.totalQuestions}</div>
       </CardContent>
      </Card>
      <Card>
       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Average Score</CardTitle>
       </CardHeader>
       <CardContent>
        <div className="text-2xl font-bold">{stats.averageScore.toFixed(2)}</div>
       </CardContent>
      </Card>
      <Card>
       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Highest score</CardTitle>
       </CardHeader>
       <CardContent>
        <div className="text-2xl font-bold">{stats.highestScore.toFixed(2)}</div>
       </CardContent>
      </Card>
      <Card>
       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Lowest score</CardTitle>
       </CardHeader>
       <CardContent>
        <div className="text-2xl font-bold">{stats.lowestScore.toFixed(2)}</div>
       </CardContent>
      </Card>
     </div>

     <div className="flex gap-2 flex-wrap w-full">
      <Card className="flex-1">
       <CardHeader>
        <CardTitle>Class Distribution</CardTitle>
       </CardHeader>
       <CardContent>
        <div className="h-[300px]">
         <ResponsiveContainer width="100%" height="100%">
          <PieChart>
           <Pie
            data={classDistribution}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
           >
            {classDistribution.map((entry, index) => (
             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
           </Pie>
           <Tooltip />
           <Legend />
          </PieChart>
         </ResponsiveContainer>
        </div>
       </CardContent>
      </Card>

      <Card className="flex-1">
       <CardHeader>
        <CardTitle>Student Scores</CardTitle>
       </CardHeader>
       <CardContent>
        <div className="h-[400px]">
         <ResponsiveContainer width="100%" height="100%">
          <BarChart data={studentScores}>
           <CartesianGrid strokeDasharray="3 3" />
           <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
           <YAxis />
           <Tooltip />
           <Legend />
           <Bar dataKey="score" fill="#8884d8" name="Score" />
          </BarChart>
         </ResponsiveContainer>
        </div>
       </CardContent>
      </Card>
     </div>

     <div className="flex w-full h-min gap-2 justify-between">
      <Card className="w-full">
       <CardHeader>
        <CardTitle className="flex items-center gap-2">
         Question Statistics

        </CardTitle>
       </CardHeader>
       <CardContent>
        <div className="h-[600px]">
         <ResponsiveContainer width="100%" height="100%">
          <BarChart
           data={questionStats}
           onClick={(e) => {
            const question = data.questionStats.find(q => `Q${q.index + 1}` === e?.activePayload?.[0]?.payload.index);
            if (question) {
             setSelectedQuestion(question);
            }
           }}
           layout="vertical"
          >

           <XAxis
            type="number"
            domain={[0, Math.ceil(Math.max(...questionStats.map(q=>q.avgTime), ...questionStats.map(q=>q.points)))]}
            tickCount={30040} // Specifies the number of ticks
            allowDecimals={false}
           />
           <YAxis dataKey="index" type="category" />
           <Tooltip />
           <CartesianGrid strokeDasharray="3 3" />
           <Legend />
           <Bar dataKey="points" fill="#0800FE" name="Maximum Points"></Bar>
           <Bar dataKey="avgTime" fill="purple" name="Average Time (seconds)" />
           <Bar fill="ORANGE" dataKey="correctAnswers" name="Students who answered correctly" />
          </BarChart>
         </ResponsiveContainer>
        </div>
       </CardContent>
      </Card>


      <Card className="w-full">
       {selectedQuestion ? (
        <>
         <CardHeader>
          <CardTitle>Question {selectedQuestion.index + 1}</CardTitle>
         </CardHeader>
         <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
           <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: selectedQuestion.body }}
           ></div>
           <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
             <PieChart>
              <Pie
               data={getResponseDistribution(selectedQuestion.responses, selectedQuestion.points).filter(
                (x) => Number(x.value) !== 0
               )}
               cx="50%"
               cy="50%"
               labelLine={false}
               label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
               }
               innerRadius={40}
               outerRadius={80}
               fill="#8884d8"
               dataKey="value"
              >
               {getResponseDistribution(selectedQuestion.responses, selectedQuestion.points).map(
                (entry, index) => (
                 <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                 />
                )
               )}
              </Pie>
              <Tooltip />
              <Legend />
             </PieChart>
            </ResponsiveContainer>
           </div>
          </div>
          <div>
           <h4 className="text-lg font-semibold mb-2">Response Distribution</h4>
           <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
             <BarChart
              data={selectedQuestion.responses.map((r, i) => ({
               student: `${r.firstName} ${r.lastName}`,
               points: r.point || 0,
              }))}
             >
              <XAxis
               dataKey="student"
               angle={-45}
               textAnchor="end"
               fontSize={"12"}
              />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />

              <Legend />
              <Bar dataKey="points" fill="#8884d8" name="Points" />
             </BarChart>
            </ResponsiveContainer>
           </div>
          </div>
         </CardContent>
        </>
       ) : (
        <CardContent className="flex flex-col items-center h-full justify-center gap-4  text-muted-foreground">
         <Info className="h-6 w-6" />
         <span className="text-sm font-normal text-center">
          Click on a bar to view question details
         </span>
        </CardContent>
       )}
      </Card>

     </div>
    </div>
   </DialogContent>
  </Dialog>
 )
}