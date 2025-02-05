'use client'

import React, { useContext, useEffect, useState } from 'react'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, ArrowLeftCircle, BookText, ChartColumn, Edit, GripVertical, List, Loader, PlusIcon, Printer, RefreshCcwIcon, RefreshCwIcon, Settings } from 'lucide-react'
import { differenceInMinutes } from 'date-fns'
import { AuthContext } from '../../../../contexts/auth.context'
import { errorToast } from '../../../../helpers/show-toasts'
import QuestionForm from '../../../../components/test/question-form'
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary'
import QuestionCard from '../../../../components/test/question-card'
import { Oval } from 'react-loader-spinner'
import { SendTest } from "@/components/test/send-test-dialog"
import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, useSortable } from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { CSS } from "@dnd-kit/utilities"
import { cn } from '@/lib/utils'
import { CreateQuestionSchema, QuestionSchemaProps } from "@/validation/create-question.validation"
import Responses from '../../../../components/test/responses'
import { TestPDFPreview } from '../../../../components/test/test-pdf-preview'
import LocalErrorFallback from '../../../../components/errors/local-error-fallback'
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import { TestDetails } from '../../../../types/test'
import { TestAnalytics } from '../../../../components/dashboard/analytics'
import { Switch } from '../../../../components/ui/switch'
import EditTest from '../../../../components/test/edit-test'
import { useQueryClient } from '@tanstack/react-query'



export default function EnhancedTestQuestionManagement({ params }: { params: { id: string } }) {
 const { showBoundary } = useErrorBoundary()
 const { user } = useContext(AuthContext)
 const searchParams = useSearchParams()
 const router = useRouter()
 const pathname = usePathname()
 const [testDetails, setTestDetails] = useState<TestDetails>({})
 const [questions, setQuestions] = useState<Array<QuestionSchemaProps>>([])
 const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false)
 const [editingQuestion, setEditingQuestion] = useState<QuestionSchemaProps | null>(null)
 const [isLoading, setIsLoading] = useState(true)
 const reqHeaders = { Authorization: `Bearer ${user.accessToken}` }
 const [isIndexUpdating, setIsIndexUpdating] = useState(false)
 const [revokeStatus, setRevokeStatus] = useState<null | Boolean>(null);
 const [revokeStatusUpdating, setRevokeStatusUpdating] = useState(false);
 const [refreshingResponses, setRefreshingResponses] = useState(false);
 const showResponses = searchParams.get('showResponses') === 'true';
 const queryClient = useQueryClient();


 useEffect(() => {
  const fetchData = async () => {
   try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tests/${params.id}`, { headers: reqHeaders })
    const { data, message } = await res.json()
    if (!res.ok) {
     showBoundary({
      message: `${message}`,
      heading: res.status === 404 ? "Failed to retrieve test" : undefined
     })
     return
    }
    console.log(data.id)
    setTestDetails(data)
    setQuestions(data.questions)
    setRevokeStatus(data.isRevoked)
    setIsLoading(false)
   } catch (e) {
    showBoundary(e)
    console.error(e)
   }
  }

  fetchData()
 }, [params.id])

 const handleAddQuestion = (question: QuestionSchemaProps) => {
  setQuestions([...questions, { ...question }])
  setIsAddQuestionOpen(false)
 }

 const handleEditQuestion = (question: QuestionSchemaProps) => {
  setQuestions(questions.map(q => q.id === question.id ? question : q))
  setEditingQuestion(null)
 }

 const handleDeleteQuestion = (id: string) => {
  setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== id))
 }

 const handleEditTest = (data: TestDetails) => {
  setTestDetails(prevData => ({ ...prevData, ...data }));
 }

 const onDragEnd = async (event: DragEndEvent) => {
  if (isIndexUpdating) return

  const { active, over } = event

  if (!over || active.id === over.id) return

  const newQuestions = Array.from(questions)
  const sourceIndex = newQuestions.findIndex((q) => q.id === active.id)
  const destinationIndex = newQuestions.findIndex((q) => q.id === over.id)

  if (sourceIndex < 0 || destinationIndex < 0) {
   errorToast('Invalid drag operation')
   return
  }

  const [reorderedItem] = newQuestions.splice(sourceIndex, 1)
  newQuestions.splice(destinationIndex, 0, reorderedItem)

  const data = newQuestions.map((q, index) => ({
   id: q.id,
   index,
   testId: params.id,
   body: q.body,
  }))

  const previousQuestions = questions

  setIsIndexUpdating(true)
  try {
   setQuestions(newQuestions)
   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questions/update-index`, {
    method: "PATCH",
    headers: {
     ...reqHeaders,
     'Content-Type': 'application/json',
    },
    body: JSON.stringify({
     questions: data,
    }),
   })

   if (!res.ok) {
    const { message } = await res.json()
    throw new Error(message)
   }

   await res.json()
  } catch (e: any) {
   errorToast(e.message)
   setQuestions(previousQuestions)
  } finally {
   setIsIndexUpdating(false)
  }
 }

 const QuestionList = () => (
  <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToVerticalAxis]}>
   <SortableContext items={questions.map((q) => q.id)}>
    <div className="flex flex-col -ml-2" style={{
     justifyContent: "space-between",
     height: "inherit",
     padding: "8px 0px 8px 0px"
    }}>
     {questions.map((item, index) => (
      <li key={item.id} className="flex justify-center items-center p-2">
       <div>
        <span>{index + 1}.</span>
       </div>
      </li>
     ))}
    </div>
    <ul className="flex flex-col gap-2 overflow-hidden inherit flex-1">
     {questions.map((question) => (
      <SortableItem key={question.id} question={question} />
     ))}
    </ul>
   </SortableContext>
  </DndContext>
 )

 const SortableItem = ({ question }) => {
  const { attributes, listeners, setNodeRef, transform, transition, setDraggableNodeRef } =
   useSortable({ id: question.id })

  const style = {
   transform: CSS.Transform.toString(transform),
   transition,
  }

  return (
   <li ref={setNodeRef} style={style} className="flex items-center bg-muted p-2 rounded border gap-4">
    <Button
     {...attributes}
     {...listeners}
     variant="ghost"
     ref={setDraggableNodeRef}
     size="sm"
     className="cursor-grab active:cursor-grabbing drag-handle"
    >
     <GripVertical className="w-4 h-4" />
    </Button>
    <span className="truncate flex-1">
     {new DOMParser().parseFromString(question.body, "text/html").body.textContent}
    </span>
    <Button
     variant="ghost"
     size="sm"
     className="-pr-[8px]"
     onClick={() => setEditingQuestion(question)}
    >
     <Edit className="w-5 h-5" />
    </Button>
   </li>
  )
 }

 const toggleResponses = () => {
  const newSearchParams = new URLSearchParams(searchParams)
  if (showResponses) {
   newSearchParams.delete('showResponses')
  } else {
   newSearchParams.set('showResponses', 'true')
  }
  router.replace(`${pathname}?${newSearchParams.toString()}`)
 }

 const refreshResponses = async () => {
  setRefreshingResponses(true);
  await queryClient.invalidateQueries({ queryKey: ['submissions', params.id, user?.accessToken] });
  setRefreshingResponses(false);
 }

 const toggleRevoked = async (checked: boolean) => {
  try {
   setRevokeStatusUpdating(true)
   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tests/${params.id}/revoke`, {
    method: "PATCH",
    headers: {
     ...reqHeaders,
     'Content-Type': 'application/json',
    },
    body: JSON.stringify({
     revoked: checked,
    }),
   })

   if (!res.ok) {
    const { message } = await res.json()
    throw new Error(message)
   }

   await res.json()
   setRevokeStatus(checked)
  } catch (e: any) {
   errorToast(e.message)
   // setRevokeStatus(!revokeStatus)
   // setQuestions(previousQuestions)
  } finally {
   setRevokeStatusUpdating(false)
  }
 }
 // if (isLoading) return <div className="flex items-center justify-center h-full"><Loader className={'animate-spin text-gray-600'} size={'70'} /></div>

 if (!isLoading) return (
  <div className="lg:w-[60vw] w-screen px-6">
   <Card className={cn('p-0 mb-4')}>
    <CardHeader className="flex justify-between flex-wrap gap-3">
     <div className='flex justify-between overflow-hidden'>
      <h1 className="lg:text-3xl text-2xl w-fit font-bold flex-shrink">
       {showResponses ? 'Submissions for: ' : null}{testDetails.title}
      </h1>
      {revokeStatus !== null ? (
       <div className='flex w-fit space-x-2 text-sm overflow-hidden h-fit flex-shrink-0'>
        {revokeStatusUpdating ? (
         <Loader className={'animate-spin text-gray-600'} size={'20'} />
        ) : (
         <Switch checked={!!!revokeStatus} onCheckedChange={(checked) => toggleRevoked(!checked)} />
        )}
        <span className='whitespace-nowrap flex items-center'>
         {revokeStatusUpdating ? "Updating" : "Allow access"}
        </span>
       </div>
      ) : null}
     </div>


     <div className="flex justify-between w-full">
      <div className="flex gap-2">
       {!showResponses ? (
        <>
         <TestPDFPreview
          testTitle={testDetails.title}
          questions={questions}
          instructions={testDetails.instructions}
         />
         <EditTest testDetails={testDetails} onEditSuccessful={handleEditTest} />
         <Button variant="outline" size="sm" className="flex gap-2" onClick={toggleResponses}>
          <BookText className="w-4 h-4" />
          <span className="hidden lg:block">Submissions</span>
         </Button>
         {/* <Button variant="outline" size="sm" className="flex gap-2" onClick={toggleResponses}>
         </Button> */}
        </>
       ) : (
        <div className='flex items-center gap-2'>
         <Button variant="outline" size="sm" className="flex gap-2" onClick={toggleResponses}>
          <ArrowLeftCircle className="w-4 h-4" />
          <span>Back to questions</span>
         </Button>
         <TestAnalytics testId={testDetails.id}>
          <Button variant={'outline'} size={'sm'}>
           <ChartColumn />
           <span className="hidden lg:block">Analytics</span>
          </Button>
         </TestAnalytics>
         <Button variant="outline" size="sm" className="flex gap-2" onClick={refreshResponses} disabled={refreshingResponses}>
          <div className={`w-4 h-4 flex items-center justify-center ${refreshingResponses ? "animate-spin" : ""}`}>
          <RefreshCwIcon />
          </div>
          <span>{!refreshingResponses ? "Refresh" : "Refreshing..."}</span>
         </Button>
        </div>
       )}
      </div>
      <div className="flex gap-2">
       <Dialog>
        <DialogTrigger asChild>
         <Button variant="default" size="sm" className="flex gap-2 lg:hidden">
          <List className="w-4 h-4" />
          <span>Overview</span>
         </Button>
        </DialogTrigger>
        <DialogContent>
         <DialogHeader>
          <div className="flex justify-between items-center">
           <DialogTitle className="text-lg flex gap-2 items-center"><List />Overview</DialogTitle>
           {isIndexUpdating && (
            <Oval width={20} height={20} color="black" strokeWidth={5} secondaryColor="gray" />
           )}
          </div>
          <div className="text-muted-foreground text-sm pt-1 text-left">
           {questions.length ? `${questions.length} questions in total` : "No questions yet"}
          </div>
         </DialogHeader>
         <div className="flex gap-2">
          {QuestionList()}
         </div>
        </DialogContent>
       </Dialog>
       {!showResponses && <SendTest test={testDetails} questions={questions} revokeStatus={revokeStatus || revokeStatusUpdating} />}
      </div>
     </div>
    </CardHeader>
   </Card>

   {!showResponses && (
    <Button className="fixed lg:hidden bottom-4 right-4" onClick={() => setIsAddQuestionOpen(true)}>
     <PlusIcon className="w-6 h-4 mr-2" />
     Add Question
    </Button>
   )}

   {showResponses ? (
    <ErrorBoundary FallbackComponent={LocalErrorFallback}>
     <Responses testDetails={testDetails} />
    </ErrorBoundary>
   ) : (
    <>
     <div className="flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-1/3 lg:block hidden">
       <div className="sticky top-4">
        <Card className="overflow-y-auto max-h-[75vh] h-auto">
         <CardHeader>
          <div className="flex justify-between items-center">
           <CardTitle className="text-lg flex gap-2 items-center">
            <List /> Overview
           </CardTitle>
           {isIndexUpdating && (
            <Oval width={20} height={20} color="black" strokeWidth={5} secondaryColor="gray" />
           )}
          </div>
          <div className="text-muted-foreground text-sm pt-1">
           {questions.length ? `${questions.length} questions in total` : "No questions yet"}
          </div>
         </CardHeader>
         <CardContent className="flex w-full">
          {QuestionList()}
         </CardContent>
        </Card>
        <Button className="w-full mt-4" onClick={() => setIsAddQuestionOpen(true)}>
         <PlusIcon className="w-6 h-4 mr-2" />
         Add Question
        </Button>
       </div>
      </div>
      <div className="w-full md:w-2/3 rounded-lg mb-3 ">
       {questions.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
         No questions added yet. Click &apos;Add Question&apos; to get started.
        </div>
       ) : (
        questions.map((question, index) => (
         <QuestionCard
          question={question}
          key={question.id}
          setEditingQuestion={setEditingQuestion}
          handleDeleteQuestion={handleDeleteQuestion}
          index={index}
          testId={testDetails.id}
         />
        ))
       )}
      </div>
     </div>

     <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen} >
      <DialogContent className="max-w-3xl" onInteractOutside={(e)=>e.preventDefault()}>
       <DialogHeader>
        <DialogTitle>Add New Question</DialogTitle>
       </DialogHeader>
       <QuestionForm
        onSubmit={(q) => handleAddQuestion(q)}
        questions={questions}
        onCancel={() => setIsAddQuestionOpen(false)}
        minLeft={Math.max(0, testDetails.durationMin - questions.filter(q => q.timeLimit).reduce((a, c) => a + c!.timeLimit, 0))}
       />
      </DialogContent>
     </Dialog>

     <Dialog open={editingQuestion !== null} onOpenChange={() => setEditingQuestion(null)}>
      <DialogContent className="max-w-3xl" onInteractOutside={(e)=>e.preventDefault()}>
       <DialogHeader>
        <DialogTitle>Edit Question</DialogTitle>
       </DialogHeader>
       {editingQuestion && (
        <QuestionForm
         initialData={editingQuestion}
         questions={questions}
         onSubmit={(q) => handleEditQuestion(q)}
         onCancel={() => setEditingQuestion(null)}
         minLeft={Math.max(0, testDetails.durationMin - questions.filter(q => q.timeLimit).reduce((a, c) => a + c!.timeLimit, 0))}
        />
       )}
      </DialogContent>
     </Dialog>
    </>
   )}
  </div>
 )
}