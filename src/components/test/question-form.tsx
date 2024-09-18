import { useState, ChangeEvent, FormEvent } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { FunctionSquare, X, PlusCircle, Trash, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type QuestionFormProps = {
 initialData?: QuestionData
 onSubmit: (data: QuestionData) => void
 onCancel: () => void
}

type QuestionData = {
 text: string
 type: "multiple-choice" | "true-false" | "short-answer" | "essay"
 options: string[]
 correctAnswer: string | boolean
 media: Media | null
 partialCredit: boolean
}

type Media = {
 type: string
 filename: string
}

export default function QuestionForm({ initialData, onSubmit, onCancel }: QuestionFormProps) {
 const [questionData, setQuestionData] = useState<QuestionData>({
  text: "",
  type: "multiple-choice",
  options: ["", "", ""],
  correctAnswer: "",
  media: null,
  partialCredit: false,
  ...initialData,
 })

 const handleSubmit = (e: FormEvent) => {
  e.preventDefault()
  onSubmit(questionData)
 }

 const handleMediaUpload = (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (file) {
   setQuestionData({
    ...questionData,
    media: {
     type: file.type.split("/")[0],
     filename: file.name,
    },
   })
  }
 }

 const handleOptionChange = (index: number, value: string) => {
  const updatedOptions = [...questionData.options]
  updatedOptions[index] = value
  setQuestionData({ ...questionData, options: updatedOptions })
 }

 const addOption = () => {
  setQuestionData({
   ...questionData,
   options: [...questionData.options, ""],
  })
 }

 const removeOption = (index: number) => {
  const updatedOptions = questionData.options.filter((_, i) => i !== index)
  setQuestionData({
   ...questionData,
   options: updatedOptions,
   correctAnswer: updatedOptions.includes(questionData.correctAnswer as string)
    ? questionData.correctAnswer
    : "",
  })
 }

 const handleEquationEditor = () => {
  // Implement equation editor functionality here
  console.log("Equation Editor clicked")
 }

 return (
  <form onSubmit={handleSubmit} className="space-y-4">
   <div className="space-y-2">
    <Label htmlFor="questionText">Question Text</Label>
    <div className="flex flex-col items-start space-y-2">
     <Textarea
      id="questionText"
      value={questionData.text}
      onChange={(e) => setQuestionData({ ...questionData, text: e.target.value })}
      required
     />
     <div className="flex space-x-2">
      <Button type="button" onClick={handleEquationEditor} className="flex gap-1 text-blue-600 p-0 m-0" variant={'link'}>
       <FunctionSquare />
       Add Equation
      </Button>
     </div>
    </div>
   </div>

   <div className="space-y-2">
    <Label htmlFor="questionType">Question Type</Label>
    <Select
     value={questionData.type}
     onValueChange={(value: QuestionData["type"]) => setQuestionData({ ...questionData, type: value, correctAnswer: "" })}
    >
     <SelectTrigger>
      <SelectValue placeholder="Select question type" />
     </SelectTrigger>
     <SelectContent>
      <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
      <SelectItem value="true-false">True/False</SelectItem>
      <SelectItem value="short-answer">Short Answer</SelectItem>
      <SelectItem value="essay">Essay</SelectItem>
     </SelectContent>
    </Select>
   </div>

   {questionData.type === "multiple-choice" && (
    <div className="space-y-2">
     <Label>Options</Label>
     {questionData.options.map((option, index) => (
      <div key={index} className="flex items-center space-x-2">
       <Input
        value={option}
        onChange={(e) => handleOptionChange(index, e.target.value)}
        placeholder={`Option ${index + 1}`}
       />
       <Button type="button" onClick={() => removeOption(index)} className="flex gap-2" variant="destructive">
        <Trash size={18} />
       </Button>
      </div>
     ))}
     <Button type="button" onClick={addOption} className="flex gap-1 p-0 m-0 text-blue-600" variant={'link'}>
      <Plus />
      Add Option
     </Button>

     <div className="space-y-2">
      <Label htmlFor="correctAnswer">Correct Answer</Label>
      <Select
       value={questionData.correctAnswer as string}
       onValueChange={(value) => setQuestionData({ ...questionData, correctAnswer: value })}
      >
       <SelectTrigger>
        <SelectValue placeholder="Select correct answer" />
       </SelectTrigger>
       <SelectContent>
        {questionData.options
         .filter(option => option.trim() !== "")
         .map((option, index) => (
          <SelectItem key={index} value={option}>
           {option}
          </SelectItem>
         ))}
       </SelectContent>
      </Select>
     </div>
    </div>
   )}
   {/* <View /> */}
   {questionData.type === "true-false" && (
    <div className="space-y-2">
     <Label>Correct Answer</Label>
     <Select
      value={questionData.correctAnswer as string}
      onValueChange={(value) => setQuestionData({ ...questionData, correctAnswer: value })}
     >
      <SelectTrigger>
       <SelectValue placeholder="Select correct answer" />
      </SelectTrigger>
      <SelectContent>
       <SelectItem value="true">True</SelectItem>
       <SelectItem value="false">False</SelectItem>
      </SelectContent>
     </Select>
    </div>
   )}

   <div className="space-y-2">
    <Label htmlFor="mediaUpload">Upload Media (Image, Audio, or Video)</Label>
    <Input
     id="mediaUpload"
     type="file"
     accept="image/*,audio/*,video/*"
     onChange={handleMediaUpload}
    />
   </div>

   <div className="flex justify-end space-x-2">
    <Button type="button" variant="outline" onClick={onCancel}>
     Cancel
    </Button>
    <Button type="submit">Save Question</Button>
   </div>
  </form>
 )
}
