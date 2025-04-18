'use client'

import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Edit, Timer, TimerOff, Trash2 } from "lucide-react";
import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/auth.context";
import { errorToast } from "../../helpers/show-toasts";
import { QuestionSchemaProps } from "@/validation/create-question.validation";
import { useParams } from "next/navigation";
import { Question } from "../../types/test";

export const QuestionTypeMap = {
 "mcq": "Multiple Choice",
 "trueOrFalse": "True or False",
 "shortAnswer": "Short Answer",
 "essay": "Essay",
}

export default function QuestionCard({ question, setEditingQuestion, handleDeleteQuestion, index, testId }: {
 question: Question,
 setEditingQuestion: React.Dispatch<React.SetStateAction<QuestionSchemaProps | null>>,
 handleDeleteQuestion: (data: string) => void,
 index: number
 testId: string
}) {
 const { user } = useContext(AuthContext);
 const [isDeleting, setIsDeleting] = useState(false);

 async function handleDelete(id: string) {
  const deleteQuestion = confirm("Are you sure you want to delete this question?");
  if (deleteQuestion) {
   setIsDeleting(true)
   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questions/delete/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({
     testId,
    }),
    headers: {
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${user.accessToken}`,
    },
   });

   const { message } = await res.json();
   if (!res.ok) errorToast(message)
   else handleDeleteQuestion(question.id!)
   setIsDeleting(false)
  }
 }

 return <Card key={question.id} className="mb-4 last-of-type:-mb-0">
  <CardContent className="pt-6 flex flex-col gap-2">
   <div className={"flex items-center justify-between"}>
    <div className={'flex items-center gap-2'}>
     <span className={"text-base text-muted-foreground"}>Question {index + 1}</span>
     <p className="text-sm text-muted-foreground px-2 text-white rounded-full w-fit bg-muted-foreground select-none">{QuestionTypeMap[question.type]}</p>
    </div>
    <p className="text-sm select-none flex gap-1 items-center">


     {question?.timeLimit ? <Timer size={16} /> : <TimerOff size={16} />}
     {question?.timeLimit ? question.timeLimit + "min" : "No limit"} </p>
   </div>

   <span className="mb-2 text-lg" dangerouslySetInnerHTML={{ __html: question.body }}></span>
   {question.media ? <div className="space-y-2 flex items-center justify-center relative">
    {

     question.media.type === "image" ? (
      <img src={new URL(question.media.url).toString()} width={400} height={400} alt="media" />
     ) :
      // Check if mediaUrl is an mp3
      question.media.type === "audio" ? (
       <audio controls src={new URL(question.media.url).toString()} className="w-full" />
      ) :
       // Check if mediaUrl is an mp4
       question.media.type === "video" ? (
        <video controls src={new URL(question.media.url).toString()} />
       ) : null
    }
   </div> : null}

   {question.type === "mcq" && (
    <div className={"bg-muted p-4 relative"}>
     <div className={"-mt-2 text-sm pb-2 text-muted-foreground"}>Options</div>
     <div className="grid grid-cols-2 gap-2">
      {question.options!.map((option, index) => (
       <div key={index} className="flex items-start">
        {/* Prefix with letters (a), (b), etc. */}
        <span className="mr-2">({String.fromCharCode(97 + index)})</span>
        <div>{option}</div>
       </div>
      ))}
     </div>
    </div>
   )}

   {(question.type === 'mcq' || question.type === 'trueOrFalse') ? (
    <div className="mb-2">
     <p className="text-sm font-medium">Correct Answer: {question.correctAnswer}</p>
    </div>
   ) : null}
   <div className="flex justify-end space-x-2">
    <Button variant="link" size="sm" onClick={() => setEditingQuestion(question)}>
     <Edit className="w-4 h-4 mr-2" />
     Edit
    </Button>
    <Button size="sm" variant={'link'} onClick={() => handleDelete(question.id!)} disabled={isDeleting}
     className="text-red-500">
     <Trash2 className="w-4 h-4 mr-2 text-red-500" />
     {(!isDeleting) ? "Delete" : "Deleting"}
    </Button>
   </div>
  </CardContent>
 </Card>
}