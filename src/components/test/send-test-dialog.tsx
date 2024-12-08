'use client'

import React, {useContext, useEffect, useState} from 'react'
import {Button} from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Checkbox} from "@/components/ui/checkbox"
import {ScrollArea} from "@/components/ui/scroll-area"
import {Copy, Info, Mail, Plus, PlusCircle, SendHorizonal, UserPlus, Users} from 'lucide-react'
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import {Badge} from "@/components/ui/badge"
import AddStudentToClass from "@/components/test/add-student-to-class"
import {AuthContext} from "@/contexts/auth.context"
import {errorToast, successToast} from "@/helpers/show-toasts"
import {useParams} from "next/navigation"
import Loader from "@/components/loader/loader"
import {cn} from "@/lib/utils";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

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
}

export function SendTest({test, questions}) {
    const {id} = useParams();
    const {user} = useContext(AuthContext);
    const [classes, setClasses] = useState<IClass[]>([]);
    const [isOpen, setIsOpen] = useState(false)
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedStudents, setSelectedStudents] = useState<string[]>([])
    const [generatedLink, setGeneratedLink] = useState('')
    const [isAllSelected, setIsAllSelected] = useState(true)
    const [isAddStudentOpen, setIsAddStudentOpen] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState(true);
    const [isTestMailSending, setIsTestMailSending] = useState(false);
    const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
    const [newClassName, setNewClassName] = useState('');

    useEffect(() => {
        if (isOpen) {
            const link = `https://otms.ng/t/${test.code}`
            setGeneratedLink(link)
        }
    }, [isOpen]);

    useEffect(() => {
        async function fetchClasses() {
            setIsLoading(true);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/class/`, {
                    headers: {Authorization: `Bearer ${user.accessToken}`}
                });
                const result = await response.json();
                if (!response.ok) {
                    throw new Error(response.status === 404 ? result.message : "Something went wrong. Please try again!")
                }
                setClasses(result.data);
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

    useEffect(() => {
        if (selectedClass) {
            setSelectedStudents(classes.find(c => c.id === selectedClass)?.students?.map(student => student.id) || [])
            setIsAllSelected(true)
        } else {
            setSelectedStudents([])
            setIsAllSelected(false)
        }
    }, [selectedClass, classes])

    const handleClassSelect = (classId: string) => {
        setSelectedClass(classId)
    }

    const handleStudentSelect = (studentId: string) => {
        setSelectedStudents(prev => {
            const newSelection = prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
            setIsAllSelected(newSelection.length === (classes.find(c => c.id === selectedClass)?.students?.length || 0))
            return newSelection
        })
    }

    const handleToggleAll = () => {
        if (isAllSelected) {
            setSelectedStudents([])
        } else {
            setSelectedStudents(classes.find(c => c.id === selectedClass)?.students?.map(student => student.id) || [])
        }
        setIsAllSelected(!isAllSelected)
    }

    const handleSendInvitation = async () => {
        try {
            setIsTestMailSending(true);
            const data = {testId: id, students: selectedStudents};
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
                description: `Sent invitations to ${selectedStudents.length} student${selectedStudents.length > 1 ? "s" : ""}.`,
            });
        } catch (e) {
            errorToast("Failed to send invitations", {
                description: (e as Error).message || "Unknown error occurred.",
            });
        } finally {
            setIsTestMailSending(false)
        }
    };

    // const handleGenerateAndCopyLink = () => {
    //
    //     navigator.clipboard.writeText(link)
    //     successToast("Link Generated and Copied")
    // }

    const handleAddStudent = (newStudent: IStudent) => {
        if (selectedClass && newStudent.email && newStudent.firstName && newStudent.lastName) {
            const updatedStudents = [...(classes.find(c => c.id === selectedClass)!.students || []), {
                ...newStudent as IStudent
            }]
            setClasses(prevClasses => prevClasses.map(c =>
                c.id === selectedClass ? {...c, students: updatedStudents} : c
            ))

            successToast("Student added", {description: `${newStudent.firstName} ${newStudent.lastName} has been added to this class.`})
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
                    body: JSON.stringify({name: newClassName})
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
                                <DialogTrigger asChild disabled={questions.length === 0}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`bg-gradient-to-tr from-blue-300 via-blue-500 to-blue-700 text-white hover:from-blue-700 hover:drop-shadow-2xl transition-all flex gap-2 ${
                                            questions.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                                        }`}
                                    >
                                        <SendHorizonal className="w-4 h-4"/>
                                        <span>Send</span>
                                    </Button>
                                </DialogTrigger>
                                {questions.length === 0 && (
                                    <TooltipContent>
                                        <p>You must add questions to your test first</p>
                                    </TooltipContent>
                                )}
                            </div>
                        </TooltipTrigger>
                    </Tooltip>
                </TooltipProvider>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Send Test</DialogTitle>
                        <DialogDescription>
                            Select a class and students to send the test to.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {!isLoading && (
                            classes.length > 0 ? (
                                <div className="grid gap-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="class-select">Select Class</Label>
                                        <Button variant="secondary" size="sm"
                                                onClick={() => setIsCreateClassOpen(true)}>
                                            <Plus className="mr-2 h-4 w-4"/>
                                            Create Class
                                        </Button>
                                    </div>
                                    <Select onValueChange={handleClassSelect} value={selectedClass}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a class"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes?.map((cls) => (
                                                <SelectItem key={cls.id} value={cls.id}>
                                                    <div className="flex items-center">
                                                        <Users className="mr-2 h-4 w-4"/>
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
                            <div className="grid gap-2">
                                <div className="flex justify-between items-center">
                                    <Label>Select Students</Label>
                                    <div className="space-x-2">
                                        <Button variant="outline" size="sm" onClick={handleToggleAll}>
                                            {isAllSelected ? 'Unselect All' : 'Select All'}
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => setIsAddStudentOpen(true)}>
                                            <UserPlus className="mr-2 h-4 w-4"/>
                                            Add Student
                                        </Button>
                                    </div>
                                </div>
                                <ScrollArea className="h-[250px] border rounded-md p-2">
                                    {classes.find(c => c.id === selectedClass)!.students?.length > 0 ? (
                                        classes.find(c => c.id === selectedClass)?.students?.map((student) => (
                                            <div
                                                key={student.id}
                                                className="flex items-center space-x-2 py-2 px-2 rounded-md hover:bg-accent"
                                            >
                                                <Checkbox
                                                    id={`student-${student.id}`}
                                                    checked={selectedStudents.includes(student.id)}
                                                    onCheckedChange={() => handleStudentSelect(student.id)}
                                                />
                                                <div className="flex-grow">
                                                    <Label htmlFor={`student-${student.id}`} className="font-medium">
                                                        {student.firstName} {student.middleName} {student.lastName}
                                                    </Label>
                                                    <p className="text-sm text-muted-foreground">{student.email} {student.regNumber && `• ${student.regNumber}`}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            No students in this class
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        )}
                        {!selectedClass ? (
                            <ScrollArea className="h-[250px] border rounded-md p-2">
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <div className="flex items-center justify-center gap-2">
                                        {isLoading ? (
                                            <><Loader/> Fetching your classes...</>
                                        ) : classes.length > 0 ? (
                                            "Please select a class to view students"
                                        ) : (
                                            <div className="text-center">
                                                <p className="mb-4">You haven&apos;t created any classes yet.</p>
                                                <Button onClick={() => setIsCreateClassOpen(true)}>
                                                    <PlusCircle className="mr-2 h-4 w-4"/>
                                                    Create Your First Class
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </ScrollArea>
                        ) : null}
                        {(classes.length > 0 && selectedClass) && <div className="flex items-center space-x-2 mt-1">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-4 w-4 text-muted-foreground"/>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>The test link will only work for the selected students&apos; email
                                            addresses.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <p className="text-sm text-muted-foreground">
                                Only students in this list will be able to access the test.
                            </p>
                        </div>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="generated-link">Text Link</Label>
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
                                <Copy className="h-4 w-4 mr-2"/>
                                Copy Link
                            </Button>
                        </div>
                    </div>
                    {classes.length > 0 && <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
                        <Button onClick={handleSendInvitation}
                                className={'flex items-center gap-2'}
                                disabled={selectedStudents.length === 0 || isTestMailSending}>
                            {isTestMailSending ? <Loader color={'white'} size={'15'}/> : <Mail className="h-4 w-4"/>}
                            {isTestMailSending ? "Sending..." : "Send Invitation Email"}
                        </Button>
                    </DialogFooter>}
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
                                {isLoading ? <Loader color={'white'} size={'15'}/> : null}
                                {isLoading ? "Creating" : "Create Class"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <AddStudentToClass setIsAddStudentOpen={setIsAddStudentOpen} isAddStudentOpen={isAddStudentOpen}
                               classId={selectedClass} handleAddStudent={handleAddStudent}/>
        </>
    )
}