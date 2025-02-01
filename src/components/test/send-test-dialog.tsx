'use client'

import React, { useContext, useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
 DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, Copy, LoaderCircle, Mail, Plus, PlusCircle, SendHorizonal, UserPlus, Users, X } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import AddStudent from "@/components/test/add-student"
import { AuthContext } from "@/contexts/auth.context"
import { errorToast, successToast } from "@/helpers/show-toasts"
import { useParams } from "next/navigation"
import Loader from "@/components/loader/loader"
import { cn } from "@/lib/utils"

interface IClass {
 id: string;
 name: string;
 students: IStudent[];
}

interface IStudent {
 id: string;
 firstName: string;
 middleName?: string;
 lastName: string;
 email: string;
 regNumber?: string;
 removeAfter: string;
 isParticipant?: boolean;
 origin?: string
}


export function SendTest({ test, questions, revokeStatus }) {
 const { id } = useParams();
 const { user } = useContext(AuthContext);
 const [classes, setClasses] = useState<IClass[]>([]);
 const [isOpen, setIsOpen] = useState(false)
 const [selectedClass, setSelectedClass] = useState<string>('');
 const [participants, setParticipants] = useState<IStudent[]>([])
 const [generatedLink, setGeneratedLink] = useState('')
 const [isAddStudentOpen, setIsAddStudentOpen] = useState<boolean>(false)
 const [isLoading, setIsLoading] = useState(true);
 const [isTestMailSending, setIsTestMailSending] = useState(false);
 const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
 const [newClassName, setNewClassName] = useState('');
 const [addingParticipants, setAddingParticipants] = useState<string[]>([]);
 const [removingParticipants, setRemovingParticipants] = useState<string[]>([]);

 useEffect(() => {
  if (isOpen) {
   const link = `${process.env.NEXT_PUBLIC_FE_URL}/t/${test.code}`
   setGeneratedLink(link)
  }
 }, [isOpen]);

 useEffect(() => {
  async function fetchClasses() {
   setIsLoading(true);
   try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/class/?showTestParticipationStatus=${test.id}`, {
     headers: { Authorization: `Bearer ${user.accessToken}` }
    });
    const result = await response.json();
    if (!response.ok) {
     throw new Error(response.status === 404 ? result.message : "Something went wrong. Please try again!")
    }
    setClasses(result.data);
    setParticipants(result.data.flatMap((course: IClass) =>
     course.students.filter((student) => student.isParticipant)
    ).filter((student, index, self) =>
     index === self.findIndex((s) => s.id === student.id)
    ));
   } catch (e) {
    errorToast("Failed to fetch classes", {
     description: (e as Error).message || "Unknown error occurred.",
    });
    console.error("Error fetching classes", e);
   }
   setIsLoading(false);
  }

  fetchClasses();
 }, [user.accessToken]);

 const handleClassSelect = (classId: string) => {
  setSelectedClass(classId)
 }

 const handleAddParticipants = async (students: IStudent[]) => {

  let previousParticipants: IStudent[] = participants;
  const updatedStudents = students.map(student => ({
   ...student,
   origin: selectedClass,
  }));
  setAddingParticipants((prev) => [...prev, ...students.map(s => s.id)])

  try {
   const data = updatedStudents.map(s => ({ ...s, studentId: s.id, id: undefined, testId: test.id }));
   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tests/${test.id}/participants/add`, {
    method: "POST",
    headers: {
     Authorization: `Bearer ${user.accessToken}`,
     "Content-Type": "application/json"
    },
    body: JSON.stringify({ students: data })
   });
   const result = await response.json();
   if (!response.ok) throw new Error(result.message || "An error occurred.");
   setParticipants(prev => {
    const newParticipants = updatedStudents.filter(
     student => !prev.some(p => p.id === student.id)
    );
    return [...prev, ...newParticipants].filter((student, index, self) =>
     index === self.findIndex((s) => s.id === student.id)
    );
   });
   setAddingParticipants((prev) => prev.filter(x => !updatedStudents.map(s => s.id).includes(x)));
   return;
  } catch (e) {
   errorToast("Failed to add participant(s)", { description: (e as Error).message })
   console.error("Something went wrong!")
   setParticipants(previousParticipants)
  }
  setAddingParticipants([]);
 };

 const handleRemoveParticipants = async (studentsIds: string[]) => {
  setRemovingParticipants((prev) => [...prev, ...studentsIds]);
  let updatedParticipants: IStudent[];

  try {
   const data = studentsIds.map(s => ({ studentId: s, testId: test.id }))
   // API Request to remove participant
   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tests/${test.id}/participants/remove`, {
    method: "POST",
    headers: {
     Authorization: `Bearer ${user.accessToken}`,
     "Content-Type": "application/json"
    },
    body: JSON.stringify({ students: data })
   });


   const result = await response.json();
   if (!response.ok) throw new Error(result.message || "An error occurred.");

   // On success, update the participants list
   setParticipants(prev => {
    updatedParticipants = prev.filter(p => !studentsIds.includes(p.id))
    return updatedParticipants;
   });
   setRemovingParticipants((prev) => prev.filter(x => updatedParticipants.map(p => p.id).includes(x)));
   return;
  } catch (e) {
   // Error handling: rollback to the previous state if something fails
   errorToast("Failed to remove participant", { description: (e as Error).message });
   console.error("Something went wrong!");
   setParticipants(participants);  // Rollback state
  }
  setRemovingParticipants([])

 };


 const handleSendInvitation = async () => {
  try {
   setIsTestMailSending(true);
   const data = { testId: id, students: participants.map(p => p.id) };
   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tests/send-test/`, {
    method: "POST",
    headers: {
     Authorization: `Bearer ${user.accessToken}`,
     "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
   });

   const result = await response.json();
   if (!response.ok) throw new Error(result.message || "An error occurred.");

   successToast('Invitations Sent', {
    description: `Participants should get an email within 5 minutes.`,
   });
  } catch (e) {
   errorToast("Failed to send invitations", {
    description: (e as Error).message || "Unknown error occurred.",
   });
  } finally {
   setIsTestMailSending(false)
  }
 };

 const handleAddStudent = (newStudent: IStudent) => {
  if (selectedClass && newStudent.email && newStudent.firstName && newStudent.lastName) {
   const updatedStudents = [...(classes.find(c => c.id === selectedClass)!.students || []), {
    ...newStudent as IStudent
   }]
   setClasses(prevClasses => prevClasses.map(c =>
    c.id === selectedClass ? { ...c, students: updatedStudents } : c
   ))

   successToast("Student added", { description: `${newStudent.firstName} ${newStudent.lastName} has been added to this class.` })
   setIsAddStudentOpen(false)
  }
 }

 const handleCreateClass = async () => {
  if (newClassName) {
   setIsLoading(true);
   try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/class/`, {
     method: 'POST',
     headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user.accessToken}`
     },
     body: JSON.stringify({ name: newClassName })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "An error occurred.");
    setClasses(prevClasses => [...prevClasses, result.data]);
    setSelectedClass(result.data.id);
    successToast('Class Created', {
     description: `Successfully created class: ${newClassName}`,
    });
    setNewClassName('');
    setIsCreateClassOpen(false);
   } catch (e) {
    errorToast("Failed to create class", {
     description: (e as Error).message || "Unknown error occurred.",
    });
   } finally {
    setIsLoading(false);
   }
  }
 }

 return (
  <>
   <Dialog open={isOpen} onOpenChange={setIsOpen}>
    <TooltipProvider delayDuration={0}>
     <Tooltip>
      <TooltipTrigger asChild>
       <div className="inline-flex">
        <DialogTrigger asChild disabled={questions.length === 0 || revokeStatus}>
         <Button
          variant="outline"
          size="sm"
          className={`bg-gradient-to-tr from-blue-300 via-blue-500 to-blue-700 text-white hover:from-blue-700 hover:drop-shadow-2xl transition-all flex gap-2 ${questions.length === 0 ? "opacity-50 cursor-not-allowed" : ""
           }`}
         >
          <SendHorizonal className="w-4 h-4" />
          <span>Send</span>
         </Button>
        </DialogTrigger>
        {questions.length === 0 || revokeStatus && (
         <TooltipContent>
          <p>{revokeStatus ? "You must allow access first" : "You must add questions to your test first"}</p>
         </TooltipContent>
        )}
       </div>
      </TooltipTrigger>
     </Tooltip>
    </TooltipProvider>
    <DialogContent className="max-w-6xl max-h-[95%] overflow-y-auto">
     <DialogHeader>
      <DialogTitle>Send Test</DialogTitle>
      <DialogDescription>
       Select a class and students to send the test to.
      </DialogDescription>
     </DialogHeader>
     <div className="">
      <div className="space-y-4">
       {!isLoading && (
        classes.length > 0 ? (
         <div className="grid gap-2">
          <div className="flex justify-between items-center">
           <Label htmlFor="class-select">Select Class</Label>
           <Button variant="secondary" size="sm"
            onClick={() => setIsCreateClassOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Class
           </Button>
          </div>
          <Select onValueChange={handleClassSelect} value={selectedClass}>
           <SelectTrigger>
            <SelectValue placeholder="Select a class" />
           </SelectTrigger>
           <SelectContent>
            {classes?.map((cls) => (
             <SelectItem key={cls.id} value={cls.id}>
              <div className="flex items-center">
               <Users className="mr-2 h-4 w-4" />
               {cls.name}
               <Badge variant="secondary" className="ml-2">
                {cls.students.length} students
               </Badge>
              </div>
             </SelectItem>
            ))}
           </SelectContent>
          </Select>
         </div>
        ) : null)}
       {selectedClass && (
        <div className="grid grid-cols-2 gap-2">
         <div className="space-y-4">
          <div className={"flex justify-between items-center"}>
           <Label>Students in this class</Label>
          </div>
          <ScrollArea className="h-[350px] border rounded-md p-2">
           {classes.find(c => c.id === selectedClass)!.students?.length > 0 ? (
            classes.find(c => c.id === selectedClass)?.students?.map((student) => (
             <div
              key={student.id}
              className="flex flex-row-reverse items-center space-x-2 py-2 px-2 rounded-md hover:bg-accent"
             >
              <Button
               variant="outline"
               size="sm"
               className={`rounded-full w-fit h-fit p-2 ${participants.find(x => x.id === student.id) || addingParticipants.includes(student.id) ? "bg-blue-600 text-white pointer-events-none" : ""}`}
               disabled={isTestMailSending}
               onClick={() => handleAddParticipants([student])}
              >
               {!participants.find(x => x.id === student.id) && !addingParticipants.includes(student.id) ?
                <Plus className="h-4 w-4" /> :
                (addingParticipants.includes(student.id)) ?
                 <LoaderCircle className={"h-4 w-4 animate-spin"} /> :
                 <Check className="h-4 w-4" />}
              </Button>
              <div className="flex-grow">
               <Label htmlFor={`student-${student.id}`}
                className="font-medium">
                {student.firstName} {student.middleName} {student.lastName}
               </Label>
               <p className="text-sm text-muted-foreground">{student.email} {student.regNumber && `• ${student.regNumber}`}</p>
              </div>
             </div>
            ))
           ) : (
            <div
             className="flex items-center justify-center h-full text-muted-foreground">
             No students in this class
            </div>
           )}
          </ScrollArea>
          <div className={'flex gap-2'}>
           <Button variant="outline" size="sm"
            onClick={() => setIsAddStudentOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Create student
           </Button>
           <Button variant="outline" size="sm"
            disabled={addingParticipants.length > 0 || removingParticipants.length > 0 || classes.find(c => c.id === selectedClass)?.students.length === 0 || participants.map(p => p.id).filter(x => classes.find(c => c.id === selectedClass)?.students?.map(s => s.id).includes(x)).length === classes.find(c => c.id === selectedClass)?.students.length || isTestMailSending}
            onClick={() => handleAddParticipants(classes.find(c => c.id === selectedClass)?.students)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add all students
           </Button>
          </div>
         </div>
         <div className="space-y-4">
          <div className="flex justify-between items-center">
           <Label>Participants of this test
            ({addingParticipants.length > 0 || removingParticipants.length > 0 ? "Updating..." : participants.length}) </Label>
          </div>
          <ScrollArea className="h-[350px] border rounded-md p-2">
           {participants.length > 0 ? (
            participants.slice().reverse().map((student) => (
             <div
              key={student.id}
              className="flex flex-row-reverse items-center space-x-2 py-2 px-2 rounded-md hover:bg-accent"
             >
              <Button
               variant="outline"
               size="sm"
               disabled={isTestMailSending}
               className={`rounded-full w-fit h-fit p-2 hover:bg-red-600 hover:text-white ${removingParticipants.includes(student.id) ? "pointer-events-none" : ""}`}
               onClick={() => handleRemoveParticipants([student.id])}
              >
               {!removingParticipants.includes(student.id) ?
                <X className="h-4 w-4" /> :
                <LoaderCircle className={"h-4 w-4 animate-spin"} />}
              </Button>
              <div className="flex-grow">
               <Label htmlFor={`participant-${student.id}`}
                className="font-medium">
                {student.firstName} {student.middleName} {student.lastName}
                <Badge
                 variant="secondary">{classes.find(x => x.id === student?.origin)?.name}</Badge>
               </Label>
               <p className="text-sm text-muted-foreground">{student.email} {student.regNumber && `• ${student.regNumber}`}</p>
              </div>
             </div>
            ))
           ) : (
            <div
             className="flex flex-col gap-2 items-center justify-center h-full text-muted-foreground">
             <p>No participants selected</p>
             <span className={"text-sm w-3/4 text-center"}>Select the &quot;+&quot; icon next to a student to add them to the list of participants.</span>
            </div>
           )}
          </ScrollArea>
          <div className={'flex gap-2 justify-end'}>
           <Button variant="outline" size="sm"
            disabled={addingParticipants.length > 0 || removingParticipants.length > 0 || participants.length === 0 || isTestMailSending}
            onClick={() => handleRemoveParticipants(participants.map(p => p.id))}>
            <UserPlus className="mr-2 h-4 w-4" />
            Remove all participants
           </Button>
          </div>
         </div>
        </div>
       )}
       {!selectedClass ? (
        <ScrollArea className="h-[250px] border rounded-md p-2">
         <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
           {isLoading ? (
            <><Loader /> Fetching your classes...</>
           ) : classes.length > 0 ? (
            "Please select a class to view students"
           ) : (
            <div className="text-center">
             <p className="mb-4">You haven&apos;t created any classes yet.</p>
             <Button onClick={() => setIsCreateClassOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Your First Class
             </Button>
            </div>
           )}
          </div>
         </div>
        </ScrollArea>
       ) : null}
      </div>
     </div>

     {/*{(classes.length > 0 && selectedClass) && <div className="flex items-center space-x-2 mt-1">*/}
     {/*    <Info className="h-4 w-4 text-muted-foreground"/>*/}
     {/*    */}
     {/*</div>}*/}

     <div className="grid gap-2 mt-4">
      <Label htmlFor="generated-link">Test Link</Label>
      <div className={'flex items-center gap-2'}>
       <Textarea
        id="generated-link"
        readOnly
        value={generatedLink}
        rows={1}
        className={cn("bg-gray-100 font-mono text-gray-800 text-sm rounded-md focus:outline-none overflow-hidden resize-none min-h-0 ")}
       />
       <Button
        onClick={() => {
         navigator.clipboard.writeText(generatedLink)
         successToast("Link Generated and Copied")
        }}
        variant="outline"
       >
        <Copy className="h-4 w-4 mr-2" />
        Copy Link
       </Button>
      </div>
     </div>
     <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
      <Button onClick={handleSendInvitation}
       className={'flex items-center gap-2'}
       disabled={participants.length === 0 || isTestMailSending || addingParticipants.length > 0 || removingParticipants.length > 0 || !selectedClass}>
       {isTestMailSending ? <Loader className='animate-spin' /> : <Mail className="h-4 w-4" />}
       {isTestMailSending ? "Sending..." : "Send Invitation Email"}
      </Button>
     </DialogFooter>
    </DialogContent>
   </Dialog>

   <Dialog open={isCreateClassOpen} onOpenChange={setIsCreateClassOpen}>
    <DialogContent className="max-w-xl">
     <DialogHeader>
      <DialogTitle>Create New Class</DialogTitle>
      <DialogDescription>
       Enter a name for your new class.
      </DialogDescription>
     </DialogHeader>
     <form onSubmit={(e) => {
      e.preventDefault();
      handleCreateClass();
     }} className="flex flex-col gap-4 py-4">
      <div className="flex flex-col gap-4 items-start">
       <Label htmlFor="className" className="text-right">
        Class Name
       </Label>
       <Input
        id="className"
        value={newClassName}
        onChange={(e) => setNewClassName(e.target.value)}
        className="col-span-3"
       />
      </div>
      <div className="flex justify-end">
       <Button disabled={!newClassName || isLoading} type={'submit'} className={'w-fit'}>
        {isLoading ? <Loader color={'white'} size={'15'} /> : null}
        {isLoading ? "Creating" : "Create Class"}
       </Button>
      </div>
     </form>
    </DialogContent>
   </Dialog>

   <AddStudent setIsAddStudentOpen={setIsAddStudentOpen} isAddStudentOpen={isAddStudentOpen}
    classId={selectedClass} handleAddStudent={handleAddStudent} />
  </>
 )
}