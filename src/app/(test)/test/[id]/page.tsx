'use client'

import React, { useState, useContext, useEffect } from 'react'
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { PlusCircle, Edit, Trash2, Image, Music, Video, FileText, Lock, Clock, Printer, Link } from 'lucide-react'
import { format, differenceInMinutes, isBefore, startOfDay } from 'date-fns'
import { AuthContext } from '../../../../contexts/auth.context'
import { errorToast, successToast } from '../../../../helpers/show-toasts'
import QuestionForm from '../../../../components/test/question-form'


// Define the schema for test details
const TestDetailsSchema = z.object({
 title: z.string().min(1, "Title is required"),
 instructions: z.string().optional(),
 startsAt: z.date(),
 endsAt: z.date(),
 passingScore: z.number().min(0).max(100),
 accessCode: z.string().optional(),
 randomizeQuestions: z.boolean(),
 showResults: z.boolean(),
 showCorrectAnswers: z.boolean(),
 provideExplanations: z.boolean(),
 disableCopyPaste: z.boolean(),
 requireFullScreen: z.boolean(),
})

type TestDetailsSchemaType = z.infer<typeof TestDetailsSchema>

export default function EnhancedTestQuestionManagement({ params }) {
 const { user } = useContext(AuthContext)
 const [testDetails, setTestDetails] = useState({})
 const [questions, setQuestions] = useState([])
 const [isEditTestOpen, setIsEditTestOpen] = useState(false)
 const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false)
 const [editingQuestion, setEditingQuestion] = useState(null)

 const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<TestDetailsSchemaType>({
  resolver: zodResolver(TestDetailsSchema),
  defaultValues: testDetails,
 })
 
 useEffect(() => {
  const fetchData = async () => {
   try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tests/${params.id}`, { headers: { Authorization: `Bearer ${user.accessToken}` } });
    const { data, message } = await res.json();

    if (!res.ok) throw new Error(message);
    setTestDetails(data)
   } catch (e) {
    console.error(e);
   }
  };

  fetchData(); // call the async function
 }, [params.id]); // add params.id as a dependency to avoid unnecessary re-fetching


 const handleAddQuestion = (question) => {
  setQuestions([...questions, { ...question, id: Date.now().toString() }])
  setIsAddQuestionOpen(false)
 }

 const handleEditQuestion = (question) => {
  setQuestions(questions.map(q => q.id === question.id ? question : q))
  setEditingQuestion(null)
 }

 const handleDeleteQuestion = (id) => {
  setQuestions(questions.filter(q => q.id !== id))
 }

 const onDragEnd = (result) => {
  if (!result.destination) return

  const newQuestions = Array.from(questions)
  const [reorderedItem] = newQuestions.splice(result.source.index, 1)
  newQuestions.splice(result.destination.index, 0, reorderedItem)

  setQuestions(newQuestions)
 }

 const calculateDuration = () => {
  const durationInMinutes = differenceInMinutes(testDetails.endsAt, testDetails.startsAt)
  const hours = Math.floor(durationInMinutes / 60)
  const minutes = durationInMinutes % 60
  return `${hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}` : ''}${hours > 0 && minutes > 0 ? ' and ' : ''}${minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`
 }

 const onSubmit = async (data: TestDetailsSchemaType) => {
  try {
   // Here you would typically send the data to your API
   console.log(data)
   setTestDetails(data)
   setIsEditTestOpen(false)
   successToast("Test details updated successfully")
  } catch (error) {
   errorToast("Failed to update test details")
  }
 }

 const handlePrintTest = () => {
  window.print()
 }

 const handleGenerateTestLink = () => {
  // This would typically involve creating a unique URL for the test
  const testLink = `https://yourdomain.com/test/${Date.now()}`
  successToast(`Test link generated: ${testLink}`)
 }

 const RequiredAsterisk = () => <span className="text-red-500">*</span>

 return (
  <div className="container mx-auto p-4 w-[60vw]">
   <header className="mb-6">
    <h1 className="text-3xl font-bold">{testDetails.title}</h1>
    <div className="flex justify-between items-center mt-2">
     <div className="text-sm text-muted-foreground">
      {/* Duration: {calculateDuration()} | Start: {format(testDetails.startsAt, "PPP p")} | End: {format(testDetails.endsAt, "PPP p")} */}
     </div>
     <div className="flex space-x-2">
      <Button variant="outline" size="sm" onClick={handlePrintTest}>
       <Printer className="w-4 h-4 mr-2" />
       Print Test
      </Button>
      <Button variant="outline" size="sm" onClick={handleGenerateTestLink}>
       <Link className="w-4 h-4 mr-2" />
       Generate Test Link
      </Button>
      <Dialog open={isEditTestOpen} onOpenChange={setIsEditTestOpen}>
       <DialogTrigger asChild>
        <Button variant="outline" size="sm">
         <Edit className="w-4 h-4 mr-2" />
         Edit Test
        </Button>
       </DialogTrigger>
       <DialogContent className="max-w-3xl">
        <DialogHeader>
         <DialogTitle>Edit Test Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
         <Tabs defaultValue="general">
          <TabsList>
           <TabsTrigger value="general">General</TabsTrigger>
           <TabsTrigger value="schedule">Schedule</TabsTrigger>
           <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
           <div className="space-y-4">
            <div>
             <Label htmlFor="title">Test Title <RequiredAsterisk /></Label>
             <Controller
              name="title"
              control={control}
              render={({ field }) => <Input id="title" {...field} />}
             />
             {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
            </div>
            <div>
             <Label htmlFor="instructions">Instructions</Label>
             <Controller
              name="instructions"
              control={control}
              render={({ field }) => <Textarea id="instructions" {...field} />}
             />
            </div>
            <div>
             <Label htmlFor="passingScore">Passing Score (%)</Label>
             <Controller
              name="passingScore"
              control={control}
              render={({ field }) => <Input id="passingScore" type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />}
             />
             {errors.passingScore && <p className="text-red-500 text-sm">{errors.passingScore.message}</p>}
            </div>
           </div>
          </TabsContent>
          <TabsContent value="schedule">
           <div className="space-y-4">
            <div>
             <Label>Start Date & Time <RequiredAsterisk /></Label>
             <Controller
              name="startsAt"
              control={control}
              render={({ field }) => (
               <Popover>
                <PopoverTrigger asChild>
                 <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Clock className="mr-2 h-4 w-4" />
                  {format(field.value, "PPP p")}
                 </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                 <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                   if (date) {
                    const newDate = new Date(date)
                    newDate.setHours(field.value.getHours(), field.value.getMinutes())
                    field.onChange(newDate)
                   }
                  }}
                  disabled={(date) => isBefore(date, startOfDay(new Date()))}
                  initialFocus
                 />
                 <div className="p-3 border-t">
                  <Input
                   type="time"
                   value={format(field.value, "HH:mm")}
                   onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':')
                    const newDate = new Date(field.value)
                    newDate.setHours(parseInt(hours), parseInt(minutes))
                    field.onChange(newDate)
                   }}
                  />
                 </div>
                </PopoverContent>
               </Popover>
              )}
             />
             {errors.startsAt && <p className="text-red-500 text-sm">{errors.startsAt.message}</p>}
            </div>
            <div>
             <Label>End Date & Time <RequiredAsterisk /></Label>
             <Controller
              name="endsAt"
              control={control}
              render={({ field }) => (
               <Popover>
                <PopoverTrigger asChild>
                 <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Clock className="mr-2 h-4 w-4" />
                  {format(field.value, "PPP p")}
                 </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                 <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                   if (date) {
                    const newDate = new Date(date)
                    newDate.setHours(field.value.getHours(), field.value.getMinutes())
                    field.onChange(newDate)
                   }
                  }}
                  disabled={(date) => isBefore(date, startOfDay(testDetails.startsAt))}
                  initialFocus
                 />
                 <div className="p-3 border-t">
                  <Input
                   type="time"
                   value={format(field.value, "HH:mm")}
                   onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':')
                    const newDate = new Date(field.value)
                    newDate.setHours(parseInt(hours), parseInt(minutes))
                    field.onChange(newDate)
                   }}
                  />
                 </div>
                </PopoverContent>
               </Popover>
              )}
             />
             {errors.endsAt && <p className="text-red-500 text-sm">{errors.endsAt.message}</p>}
            </div>
           </div>
          </TabsContent>
          <TabsContent value="settings">
           <div className="space-y-4">
            <div>
             <Label htmlFor="accessCode">Access Code</Label>
             <Controller
              name="accessCode"
              control={control}
              render={({ field }) => <Input id="accessCode" {...field} />}
             />
            </div>
            <div className="space-y-2">
             <Label className="text-base">Test Options</Label>
             <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
               <Label htmlFor="randomizeQuestions">Randomize Questions</Label>
               <Controller
                name="randomizeQuestions"
                control={control}
                render={({ field }) => (
                 <Switch
                  id="randomizeQuestions"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                 />
                )}
               />
              </div>
              <div className="flex items-center justify-between">
               <Label htmlFor="showResults">Show Results Immediately</Label>
               <Controller
                name="showResults"
                control={control}
                render={({ field }) => (
                 <Switch
                  id="showResults"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                 />
                )}
               />
              </div>
              <div className="flex items-center justify-between">
               <Label htmlFor="showCorrectAnswers">Show Correct Answers</Label>
               <Controller
                name="showCorrectAnswers"
                control={control}
                render={({ field }) => (
                 <Switch
                  id="showCorre ctAnswers"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                 />
                )}
               />
              </div>
              <div className="flex items-center justify-between">
               <Label htmlFor="provideExplanations">Provide Explanations</Label>
               <Controller
                name="provideExplanations"
                control={control}
                render={({ field }) => (
                 <Switch
                  id="provideExplanations"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                 />
                )}
               />
              </div>
             </div>
            </div>
            <div className="space-y-2">
             <Label className="text-base">Security</Label>
             <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
               <Label htmlFor="disableCopyPaste">Disable Copy/Paste</Label>
               <Controller
                name="disableCopyPaste"
                control={control}
                render={({ field }) => (
                 <Switch
                  id="disableCopyPaste"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                 />
                )}
               />
              </div>
              <div className="flex items-center justify-between">
               <Label htmlFor="requireFullScreen">Require Full Screen Mode</Label>
               <Controller
                name="requireFullScreen"
                control={control}
                render={({ field }) => (
                 <Switch
                  id="requireFullScreen"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                 />
                )}
               />
              </div>
             </div>
            </div>
           </div>
          </TabsContent>
         </Tabs>
         <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setIsEditTestOpen(false)}>
           Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
           {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
         </div>
        </form>
       </DialogContent>
      </Dialog>
     </div>
    </div>
   </header>

   <div className="flex flex-col md:flex-row gap-6">
    <div className="w-full md:w-1/3">
     <div className='sticky top-7'>
      <Card className='overflow-y-auto max-h-[75vh]'>
       <CardHeader>
        <CardTitle>Question List</CardTitle>
        <div className='text-muted-foreground text-sm pt-1'>{questions.length ? `${questions.length} questions in total` : "No questions yet"}</div>
       </CardHeader>
       <CardContent>
        <DragDropContext onDragEnd={onDragEnd}>
         <Droppable droppableId="questions">
          {(provided) => (
           <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
            {questions.map((question, index) => (
             <Draggable key={question.id} draggableId={question.id} index={index}>
              {(provided) => (
               <li
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className="flex justify-between items-center bg-muted p-2 rounded"
               >
                <span>Question {index + 1}</span>
                <Button variant="ghost" size="sm" onClick={() => setEditingQuestion(question)}>
                 <Edit className="w-4 h-4" />
                </Button>
               </li>
              )}
             </Draggable>
            ))}
            {provided.placeholder}
           </ul>
          )}
         </Droppable>
        </DragDropContext>
       </CardContent>
      </Card>
      <Button className="w-full mt-4" onClick={() => setIsAddQuestionOpen(true)}>
       <PlusCircle className="w-4 h-4 mr-2" />
       Add Question
      </Button>
     </div>
    </div>

    <div className="w-full md:w-2/3 ">
     {/* <Card className='px-0'>
      <CardContent> */}
     {questions.length === 0 ? (
      <div className="text-center text-muted-foreground py-8">
       No questions added yet. Click "Add Question" to get started.
      </div>
     ) : (
      questions.map((question) => (
       <Card key={question.id} className="mb-4">
        <CardContent className="pt-6">
         <h3 className="font-semibold mb-2">{question.text}</h3>
         <p className="text-sm text-muted-foreground mb-2">{question.type}</p>
         {(question.type === 'multiple-choice' || question.type === 'true-false') && (
          <div className="mb-2">
           <p className="text-sm font-medium">Correct Answer: {question.correctAnswer}</p>
          </div>
         )}
         {question.media && (
          <div className="mb-2">
           <p className="text-sm font-medium">Attached Media:</p>
           <div className="flex items-center">
            {question.media.type === 'image' && <Image className="w-4 h-4 mr-1" />}
            {question.media.type === 'audio' && <Music className="w-4 h-4 mr-1" />}
            {question.media.type === 'video' && <Video className="w-4 h-4 mr-1" />}
            <span className="text-sm">{question.media.filename}</span>
           </div>
          </div>
         )}
         {question.partialCredit && (
          <p className="text-sm mb-2">Partial credit allowed</p>
         )}
         <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={() => setEditingQuestion(question)}>
           <Edit className="w-4 h-4 mr-2" />
           Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleDeleteQuestion(question.id)}>
           <Trash2 className="w-4 h-4 mr-2" />
           Delete
          </Button>
         </div>
        </CardContent>
       </Card>
      ))
     )}
     {/* </CardContent>
     </Card> */}
    </div>
   </div>

   <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
    <DialogContent className="max-w-3xl">
     <DialogHeader>
      <DialogTitle>Add New Question</DialogTitle>
     </DialogHeader>
     <QuestionForm onSubmit={handleAddQuestion} onCancel={() => setIsAddQuestionOpen(false)} />
    </DialogContent>
   </Dialog>

   <Dialog open={editingQuestion !== null} onOpenChange={() => setEditingQuestion(null)}>
    <DialogContent className="max-w-3xl">
     <DialogHeader>
      <DialogTitle>Edit Question</DialogTitle>
     </DialogHeader>
     {editingQuestion && (
      <QuestionForm
       initialData={editingQuestion}
       onSubmit={handleEditQuestion}
       onCancel={() => setEditingQuestion(null)}
      />
     )}
    </DialogContent>
   </Dialog>
  </div>
 )
}
