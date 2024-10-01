'use client'

import React, { useState, useContext, useEffect } from 'react'
import * as z from 'zod'
import { DragDropContext, Droppable, Draggable, DragUpdate } from '@hello-pangea/dnd'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusCircle, Edit, Trash2, Image, Music, Video, FileText, Lock, Clock, Printer, Link, Edit3, Settings, SendHorizonal } from 'lucide-react'
import { format, differenceInMinutes } from 'date-fns'
import { AuthContext } from '../../../../contexts/auth.context'
import { errorToast, successToast } from '../../../../helpers/show-toasts'
import QuestionForm from '../../../../components/test/question-form'
import { useErrorBoundary } from 'react-error-boundary'
import Loader from '../../../../components/loader/loader'
import QuestionCard from '../../../../components/test/question-card'
import { CreateQuestionSchemaProps } from '../../../../validation/create-question.validation'
import { Oval } from 'react-loader-spinner'

const TestDetailsSchema = z.object({
 title: z.string().min(1, "Title is required"),
 instructions: z.string().optional(),
 startsAt: z.date(),
 endsAt: z.date(),
 code: z.string(),
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
type TQuestion = CreateQuestionSchemaProps & { id: string, index?: number }

export default function EnhancedTestQuestionManagement({ params }: { params: { id: string } }) {
 const { showBoundary } = useErrorBoundary();
 const { user } = useContext(AuthContext)
 const [testDetails, setTestDetails] = useState<TestDetailsSchemaType | Record<string, any>>({})
 const [questions, setQuestions] = useState<Array<TQuestion>>([])
 const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false)
 const [editingQuestion, setEditingQuestion] = useState<TQuestion | null>(null)
 const [isLoading, setIsLoading] = useState(true);
 const reqHeaders = { Authorization: `Bearer ${user.accessToken}` }
 const [isIndexUpdating, setIsIndexUpdating] = useState(false);

 useEffect(() => {
  const fetchData = async () => {
   try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tests/${params.id}`, { headers: reqHeaders });
    const { data, message } = await res.json();
    if (!res.ok) {
     showBoundary({
      message: `${message}`,
      heading: res.status === 404 ? "Failed to retrieve test" : undefined
     });
     return;
    }
    setTestDetails(data);
    // console.log(data.questions.sort((a: TQuestion, b: TQuestion) => a.index - b.index))
    setQuestions(data.questions);

    setIsLoading(false);
   } catch (e) {
    showBoundary(e);
    console.error(e);
   }
  };

  fetchData();
 }, [params.id]);


 const handleAddQuestion = (question: TQuestion) => {
  setQuestions([...questions, { ...question, id: Date.now().toString() }])
  setIsAddQuestionOpen(false)
 }

 const handleEditQuestion = (question: TQuestion) => {
  setQuestions(questions.map(q => q.id === question.id ? question : q))
  setEditingQuestion(null)
 }

 const handleDeleteQuestion = (id: string) => {
  setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== id));
 }

 const onDragEnd = async (result: DragUpdate) => {
  if (isIndexUpdating) return;
  if (!result.destination) return;
  setIsIndexUpdating(true);

  const newQuestions = Array.from(questions);
  const sourceIndex = result.source.index;
  const destinationIndex = result.destination.index;

  if (sourceIndex === destinationIndex) return;
  // Validate indexes
  if (sourceIndex < 0 || sourceIndex >= newQuestions.length || destinationIndex < 0 || destinationIndex >= newQuestions.length) {
   errorToast('Invalid drag operation');
   return;
  }

  const [reorderedItem] = newQuestions.splice(sourceIndex, 1);
  newQuestions.splice(destinationIndex, 0, reorderedItem);

  const data = questions.map((q, index) => ({ id: q.id, index: index, testId: params.id }))
  console.log(data);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questions/update-index`, {
   method: "PATCH",
   headers: {
    ...reqHeaders,
    'Content-Type': 'application/json',
   },
   body: JSON.stringify({
    questions: data
   }),
  });

  if (!res.ok) {
   const { message } = await res.json();
   errorToast(message);
   setIsIndexUpdating(false);
   return;
  }

  const { message } = await res.json();
  setQuestions(newQuestions);
  setIsIndexUpdating(false);
 };


 const calculateDuration = () => {
  const durationInMinutes = differenceInMinutes(testDetails.endsAt, testDetails.startsAt)
  const hours = Math.floor(durationInMinutes / 60)
  const minutes = durationInMinutes % 60
  return `${hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}` : ''}${hours > 0 && minutes > 0 ? ' and ' : ''}${minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`
 }

 const handlePrintTest = () => {
  window.print()
 }

 const handleGenerateTestLink = () => {
  const testLink = `${location.origin}/t/${testDetails.code}`
  successToast(`Test link generated: ${testLink}`)
 }

 const RequiredAsterisk = () => <span className="text-red-500">*</span>

 if (isLoading) return <Loader />

 if (!isLoading) {
  return (
   <div className="mt-4 w-[60vw]">
    <header className="mb-6">
     <h1 className="text-3xl font-bold">{testDetails.title}</h1>
     <div className="flex justify-between items-center mt-2">
      <div className="text-sm text-muted-foreground">
       Duration: {calculateDuration()} | Start: {format(testDetails.startsAt, "PPP p")} | End: {format(testDetails.endsAt, "PPP p")}
      </div>
      <div className="flex space-x-2">
       <Button variant="outline" size="sm" onClick={handlePrintTest}>
        <Printer className="w-4 h-4 mr-2" />
        Print Test
       </Button>
       <Button variant="outline" size="sm">
        <Settings className="w-4 h-4 mr-2" />
        Test Settings
       </Button>
       <Button
        variant="default"
        size="sm"
        className="bg-gradient-to-b from-blue-300 via-blue-500 to-blue-700 text-white hover:from-blue-400 transition-all"
       >
        <SendHorizonal className="w-4 h-4 mr-2" />
        Send
       </Button>

      </div>
     </div>
    </header>

    <div className="flex flex-col md:flex-row gap-6 p-3 border-dotted border-2 rounded-lg bg-gray-200">
     <div className="w-full md:w-1/3 ">
      <div className='sticky top-7 block'>
       <Card className='overflow-y-auto max-h-[75vh] h-auto'>
        <CardHeader>
         <div className='flex justify-between items-center'>
          <CardTitle>Question List</CardTitle>
          {isIndexUpdating ? <Oval width={20} height={20} color='black' strokeWidth={5} secondaryColor='gray' /> : null}
          {/* <div className='w-4 h-4 bg-black'></div> */}
         </div>
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
                 <div className='whitespace-nowrap'>
                  <span>Question {index + 1}:</span>
                  <span style={{
                   whiteSpace: 'nowrap',
                   overflow: 'hidden',
                   textOverflow: 'ellipsis',
                   maxWidth: '250px',
                   display: 'block',
                  }}>{new DOMParser().parseFromString(question.body, 'text/html').children[0].textContent}</span>
                 </div>
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
      {questions.length === 0 ? (
       <div className="text-center text-muted-foreground py-8">
        No questions added yet. Click &quot;Add Question&quot; to get started.
       </div>
      ) : (
       questions.map((question, index) => (
        <QuestionCard question={question} setEditingQuestion={setEditingQuestion} handleDeleteQuestion={handleDeleteQuestion} />
       ))
      )}
     </div>
    </div>

    <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
     <DialogContent className="max-w-3xl">
      <DialogHeader>
       <DialogTitle>Add New Question</DialogTitle>
      </DialogHeader>
      <QuestionForm onSubmit={(q) => handleAddQuestion(q)} questions={questions} onCancel={() => setIsAddQuestionOpen(false)} />
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
        questions={questions}
        onSubmit={(q) => handleEditQuestion(q)}
        onCancel={() => setEditingQuestion(null)}
       />
      )}
     </DialogContent>
    </Dialog>
   </div >
  )
 }
}
