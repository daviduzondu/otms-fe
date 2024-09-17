import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs"
import { Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@radix-ui/react-select"
import { Textarea } from "../ui/textarea"
import { Input } from "../ui/input"
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group"
import { Button } from "react-day-picker"
import { Question, QuestionType } from "../../types/test"

export default function CreateQuestion({ currentQuestion }: { currentQuestion: Question }) {
 return <Card>
  <CardHeader>
   <CardTitle>Edit Question</CardTitle>
  </CardHeader>
  <CardContent>
   <Tabs defaultValue="content" className="w-full">
    <TabsList>
     <TabsTrigger value="content">Question Content</TabsTrigger>
     <TabsTrigger value="settings">Question Settings</TabsTrigger>
    </TabsList>
    <TabsContent value="content">
     <div className="space-y-4">
      <div className="space-y-2">
       <Label htmlFor="question-type">Question Type</Label>
       <Select
        value={currentQuestion.type}
        onValueChange={(value: QuestionType) => updateQuestion({ ...currentQuestion, type: value })}
       >
        <SelectTrigger id="question-type">
         <SelectValue placeholder="Select question type" />
        </SelectTrigger>
        <SelectContent>
         <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
         <SelectItem value="true-false">True/False</SelectItem>
         <SelectItem value="short-answer">Short Answer</SelectItem>
         <SelectItem value="essay">Essay</SelectItem>
         <SelectItem value="matching">Matching</SelectItem>
        </SelectContent>
       </Select>
      </div>
      <div className="space-y-2">
       <Label htmlFor="question-text">Question Text</Label>
       <Textarea
        id="question-text"
        value={currentQuestion.text}
        onChange={(e) => updateQuestion({ ...currentQuestion, text: e.target.value })}
        placeholder="Enter your question here"
       />
      </div>
      {currentQuestion.type === 'multiple-choice' && (
       <div className="space-y-2">
        <Label>Answer Options</Label>
        {currentQuestion.options?.map((option, index) => (
         <div key={index} className="flex items-center space-x-2">
          <Input
           value={option}
           onChange={(e) => {
            const newOptions = [...(currentQuestion.options || [])]
            newOptions[index] = e.target.value
            updateQuestion({ ...currentQuestion, options: newOptions })
           }}
           placeholder={`Option ${index + 1}`}
          />
          <RadioGroup value={currentQuestion.correctAnswer as string} onValueChange={(value) => updateQuestion({ ...currentQuestion, correctAnswer: value })}>
           <RadioGroupItem value={option} id={`option-${index}`} />
          </RadioGroup>
         </div>
        ))}
        <Button
         onClick={() => {
          const newOptions = [...(currentQuestion.options || []), '']
          updateQuestion({ ...currentQuestion, options: newOptions })
         }}
        >
         Add Option
        </Button>
       </div>
      )}
      {currentQuestion.type === 'true-false' && (
       <div className="space-y-2">
        <Label>Correct Answer</Label>
        <RadioGroup
         value={currentQuestion.correctAnswer as string}
         onValueChange={(value) => updateQuestion({ ...currentQuestion, correctAnswer: value })}
        >
         <div className="flex items-center space-x-2">
          <RadioGroupItem value="true" id="true" />
          <Label htmlFor="true">True</Label>
         </div>
         <div className="flex items-center space-x-2">
          <RadioGroupItem value="false" id="false" />
          <Label htmlFor="false">False</Label>
         </div>
        </RadioGroup>
       </div>
      )}
      {currentQuestion.type === 'short-answer' && (
       <div className="space-y-2">
        <Label htmlFor="correct-answer">Correct Answer</Label>
        <Input
         id="correct-answer"
         value={currentQuestion.correctAnswer as string}
         onChange={(e) => updateQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
         placeholder="Enter the correct answer"
        />
       </div>
      )}
      {currentQuestion.type === 'essay' && (
       <div className="space-y-2">
        <Label htmlFor="answer-guideline">Answer Guideline</Label>
        <Textarea
         id="answer-guideline"
         value={currentQuestion.correctAnswer as string}
         onChange={(e) => updateQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
         placeholder="Enter guidelines for grading the essay"
        />
       </div>
      )}
      {currentQuestion.type === 'matching' && (
       <div className="space-y-2">
        <Label>Matching Pairs</Label>
        {(currentQuestion.options || []).map((option, index) => (
         <div key={index} className="flex items-center space-x-2">
          <Input
           value={option}
           onChange={(e) => {
            const newOptions = [...(currentQuestion.options || [])]
            newOptions[index] = e.target.value
            updateQuestion({ ...currentQuestion, options: newOptions })
           }}
           placeholder={`Item ${index + 1}`}
          />
          <Input
           value={(currentQuestion.correctAnswer as string[])[index] || ''}
           onChange={(e) => {
            const newAnswers = [...(currentQuestion.correctAnswer as string[] || [])]
            newAnswers[index] = e.target.value
            updateQuestion({ ...currentQuestion, correctAnswer: newAnswers })
           }}
           placeholder={`Match ${index + 1}`}
          />
         </div>
        ))}
        <Button
         onClick={() => {
          const newOptions = [...(currentQuestion.options || []), '']
          const newAnswers = [...(currentQuestion.correctAnswer as string[] || []), '']
          updateQuestion({ ...currentQuestion, options: newOptions, correctAnswer: newAnswers })
         }}
        >
         Add Pair
        </Button>
       </div>
      )}
     </div>
    </TabsContent>
    <TabsContent value="settings">
     <div className="space-y-4">
      <div className="space-y-2">
       <Label htmlFor="points">Points</Label>
       <Input
        id="points"
        type="number"
        value={currentQuestion.points}
        onChange={(e) => updateQuestion({ ...currentQuestion, points: parseInt(e.target.value) })}
       />
      </div>
      <div className="space-y-2">
       <Label htmlFor="difficulty">Difficulty Level</Label>
       <Select>
        <SelectTrigger id="difficulty">
         <SelectValue placeholder="Select difficulty" />
        </SelectTrigger>
        <SelectContent>
         <SelectItem value="easy">Easy</SelectItem>
         <SelectItem value="medium">Medium</SelectItem>
         <SelectItem value="hard">Hard</SelectItem>
        </SelectContent>
       </Select>
      </div>
      <div className="space-y-2">
       <Label htmlFor="tags">Tags</Label>
       <Input id="tags" placeholder="Enter tags separated by commas" />
      </div>
      <div className="flex items-center space-x-2">
       <Switch id="randomize-options" />
       <Label htmlFor="randomize-options">Randomize Options</Label>
      </div>
      {(currentQuestion.type === 'short-answer' || currentQuestion.type === 'essay') && (
       <div className="space-y-2">
        <Label htmlFor="word-limit">Word Limit</Label>
        <Input id="word-limit" type="number" placeholder="Enter word limit (optional)" />
       </div>
      )}
      {currentQuestion.type === 'essay' && (
       <div className="space-y-2">
        <Label>Rubric</Label>
        <Textarea placeholder="Enter grading rubric for the essay" />
       </div>
      )}
     </div>
    </TabsContent>
   </Tabs>
  </CardContent>
 </Card>
}