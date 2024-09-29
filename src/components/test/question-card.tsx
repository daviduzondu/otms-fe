'use client'

import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/auth.context";
import { errorToast, successToast } from "../../helpers/show-toasts";

export default function QuestionCard({ question, setEditingQuestion, handleDeleteQuestion }) {
 const { user } = useContext(AuthContext);
 const [isDeleting, setIsDeleting] = useState(false);
 
 async function handleDelete(id: string) {
  const deleteQuestion = confirm("Are you sure you want to delete this question?");
  if (deleteQuestion) {
   setIsDeleting(true)
   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questions/delete/${id}`, {
    method: 'DELETE',
    headers: {
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${user.accessToken}`,
    },
   });

   const { message } = await res.json();
   if (!res.ok) errorToast(message)
   else handleDeleteQuestion(question.id)
   setIsDeleting(false)
  }
 }
 return <Card key={question.id} className="mb-4">
  <CardContent className="pt-6">
   <span className="mb-2" dangerouslySetInnerHTML={{ __html: question.body }}></span>
   <p className="text-sm text-muted-foreground mb-2">{question.type}</p>
   {(question.type === 'multiple-choice' || question.type === 'true-false') && (
    <div className="mb-2">
     <p className="text-sm font-medium">Correct Answer: {question.correctAnswer}</p>
    </div>
   )}
   {/* {question.media && (
   <div className="mb-2">
    <p className="text-sm font-medium">Attached Media:</p>
    <div className="flex items-center">
     {question.media.type === 'image' && <Image className="w-4 h-4 mr-1" />}
     {question.media.type === 'audio' && <Music className="w-4 h-4 mr-1" />}
     {question.media.type === 'video' && <Video className="w-4 h-4 mr-1" />}
     <span className="text-sm">{question.media.filename}</span>
    </div>
   </div>
  )} */}
   <div className="flex justify-end space-x-2">
    <Button variant="link" size="sm" onClick={() => setEditingQuestion(question)}>
     <Edit className="w-4 h-4 mr-2" />
     Edit
    </Button>
    <Button size="sm" variant={'link'} onClick={() => handleDelete(question.id)} disabled={isDeleting} className="text-red-500">
     <Trash2 className="w-4 h-4 mr-2 text-red-500" />
     {(!isDeleting) ? "Delete" : "Deleted"}
    </Button>
   </div>
  </CardContent>
 </Card>
}