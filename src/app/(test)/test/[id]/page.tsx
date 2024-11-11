'use client'

import React, {useContext, useEffect, useState} from 'react'
import * as z from 'zod'
import {DragDropContext, Draggable, DragUpdate, Droppable} from '@hello-pangea/dnd'
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Edit, GripVertical, PlusCircle, Printer, SendHorizonal, Settings} from 'lucide-react'
import {differenceInMinutes, format} from 'date-fns'
import {AuthContext} from '../../../../contexts/auth.context'
import {errorToast, successToast} from '../../../../helpers/show-toasts'
import QuestionForm from '../../../../components/test/question-form'
import {useErrorBoundary} from 'react-error-boundary'
import Loader from '../../../../components/loader/loader'
import QuestionCard from '../../../../components/test/question-card'
import {QuestionSchemaProps} from '../../../../validation/create-question.validation'
import {Oval} from 'react-loader-spinner'
import {SendTest} from "@/components/test/send-test-dialog";

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

export default function EnhancedTestQuestionManagement({params}: { params: { id: string } }) {
    const {showBoundary} = useErrorBoundary();
    const {user} = useContext(AuthContext)
    const [testDetails, setTestDetails] = useState<TestDetailsSchemaType | Record<string, any>>({})
    const [questions, setQuestions] = useState<Array<QuestionSchemaProps>>([])
    const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState<QuestionSchemaProps | null>(null)
    const [isLoading, setIsLoading] = useState(true);
    const reqHeaders = {Authorization: `Bearer ${user.accessToken}`}
    const [isIndexUpdating, setIsIndexUpdating] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tests/${params.id}`, {headers: reqHeaders});
                const {data, message} = await res.json();
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


    const handleAddQuestion = (question: QuestionSchemaProps) => {
        setQuestions([...questions, {...question}])
        setIsAddQuestionOpen(false)
    }

    const handleEditQuestion = (question: QuestionSchemaProps) => {
        setQuestions(questions.map(q => q.id === question.id ? question : q))
        setEditingQuestion(null)
    }

    const handleDeleteQuestion = (id: string) => {
        setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== id));
    }

    const onDragEnd = async (result: DragUpdate) => {
        if (isIndexUpdating) return;
        if (!result.destination) return;

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

        const data = newQuestions.map((q, index) => ({id: q.id, index: index, testId: params.id, body: q.body}))

        setIsIndexUpdating(true);
        const previousQuestions = questions;
        try {
            setQuestions(newQuestions);
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
                const {message} = await res.json();
                throw new Error(message);
            }

            await res.json();
        } catch (e: any) {
            errorToast(e.message);
            setQuestions(previousQuestions);
        } finally {
            setIsIndexUpdating(false);
        }

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

    // if (isLoading) return <Loader/>

    if (!isLoading) {
        return (
            <div className="mt-4 w-[60vw]">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold">{testDetails.title}</h1>
                    <div className="flex justify-between items-center mt-2">
                        <div className="text-sm text-muted-foreground">
                            Duration: {calculateDuration()} | Start: {format(testDetails.startsAt, "PPP p")} |
                            End: {format(testDetails.endsAt, "PPP p")}
                        </div>
                        <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={handlePrintTest}>
                                <Printer className="w-4 h-4 mr-2"/>
                                Print Test
                            </Button>
                            <Button variant="outline" size="sm">
                                <Settings className="w-4 h-4 mr-2"/>
                                Test Settings
                            </Button>
                         <SendTest />
                        </div>
                    </div>
                </header>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-1/3 ">
                        <div className='sticky top-4 block'>
                            <Card className='overflow-y-auto max-h-[75vh] h-auto'>
                                <CardHeader>
                                    <div className='flex justify-between items-center'>
                                        <CardTitle>Question List</CardTitle>
                                        {isIndexUpdating ? <Oval width={20} height={20} color='black' strokeWidth={5}
                                                                 secondaryColor='gray'/> : null}
                                        {/* <div className='w-4 h-4 bg-black'></div> */}
                                    </div>
                                    <div
                                        className='text-muted-foreground text-sm pt-1'>{questions.length ? `${questions.length} questions in total` : "No questions yet"}</div>
                                </CardHeader>
                                <CardContent className="flex gap-2 ">
                                    <div className={"w-[10%] flex flex-col -ml-2"} style={{
                                        justifyContent: "space-between",
                                        height: "inherit",
                                        padding: "8px 0px 8px 0px"
                                    }}>
                                        {questions.map((item, index) => (
                                            <li
                                                key={item.id}
                                                className="flex justify-center items-center p-2"
                                            >
                                                <div>
                                                    {/*<span className={"h-9 rounded-md px-3"}></span>*/}
                                                    <span>{index + 1}.</span>
                                                    {/*<span className={"h-9 rounded-md px-3"}></span>*/}
                                                </div>
                                            </li>
                                        ))}
                                    </div>
                                    <DragDropContext onDragEnd={onDragEnd}>
                                        <Droppable droppableId="questions">
                                            {(provided) => (
                                                <ul {...provided.droppableProps} ref={provided.innerRef}
                                                    className="flex flex-col gap-2 w-full sm:w-[90%]">
                                                    {questions.map((question, index) => (
                                                        <Draggable key={question.id}
                                                                   draggableId={question.id as unknown as string}
                                                                   index={index}>
                                                            {(provided) => (
                                                                <li
                                                                    {...provided.dragHandleProps}
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    className="flex items-center bg-muted p-2 rounded border gap-4"
                                                                >
                                                                    {/* Drag handle button */}
                                                                    <Button variant="ghost" size="sm"
                                                                            className={"cursor-grab active:cursor-grabbing"}>
                                                                        <GripVertical className="w-4 h-4"/>
                                                                    </Button>

                                                                    {/* Question text */}
                                                                    <span className="flex-1 truncate">
                                                                        {new DOMParser().parseFromString(question.body, "text/html").body.textContent}
                                                                    </span>

                                                                    {/* Edit button */}
                                                                    <Button variant="ghost" size="sm"
                                                                            onClick={() => setEditingQuestion(question)}>
                                                                        <Edit className="w-4 h-4"/>
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
                                <PlusCircle className="w-6 h-4 mr-2"/>
                                Add Question
                            </Button>
                        </div>
                    </div>

                    <div className="w-full md:w-2/3 rounded-lg p-3 mb-3 bg-gray-200">
                        {questions.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                No questions added yet. Click &quot;Add Question&quot; to get started.
                            </div>
                        ) : (
                            questions.map((question, index) => (
                                <QuestionCard question={question} key={question.id}
                                              setEditingQuestion={setEditingQuestion}
                                              handleDeleteQuestion={handleDeleteQuestion} index={index}/>
                            ))
                        )}
                    </div>
                </div>

                <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Add New Question</DialogTitle>
                        </DialogHeader>
                        <QuestionForm onSubmit={(q) => handleAddQuestion(q)} questions={questions}
                                      onCancel={() => setIsAddQuestionOpen(false)}/>
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
            </div>
        )
    }
}
