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
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import {toast} from "@/hooks/use-toast"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Checkbox} from "@/components/ui/checkbox"
import {ScrollArea} from "@/components/ui/scroll-area"
import {Copy, Info, Mail, SendHorizonal, UserPlus, Users} from 'lucide-react'
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import {Badge} from "@/components/ui/badge"
import AddStudentToClass from "@/components/test/add-student-to-class";
import {AuthContext} from "@/contexts/auth.context";
import {errorToast} from "@/helpers/show-toasts";
import {ring2} from 'ldrs'

ring2.register()

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


export function SendTest() {

    const {user} = useContext(AuthContext);
    const [classes, setClasses] = useState<IClass[]>([]);
    const [isOpen, setIsOpen] = useState(false)
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedStudents, setSelectedStudents] = useState<string[]>([])
    const [generatedLink, setGeneratedLink] = useState('')
    const [isAllSelected, setIsAllSelected] = useState(true)
    const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
    const [newStudent, setNewStudent] = useState<Partial<IStudent>>({email: ''})
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchClasses() {
            setIsLoading(true);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/class/`, {
                    headers: {Authorization: `Bearer ${user.accessToken}`}
                });
                const result = await response.json();
                setClasses(result.data);
                if (!response.ok) {
                    throw new Error(response.status === 404 ? result.message : "Something went wrong. Please try again!")
                }
                // setClasses(data.data);
            } catch (e) {
                errorToast(e);
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
    }, [selectedClass])

    const handleClassSelect = (classId: string) => {
        setSelectedClass(classId)
        setGeneratedLink('')
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

    const handleSendInvitation = () => {
        toast({
            title: "Invitations Sent",
            description: `Sent invitations to ${selectedStudents.length} students.`,
        })
    }

    const handleGenerateAndCopyLink = () => {
        const link = `https://example.com/test/${Math.random().toString(36).substr(2, 9)}`
        setGeneratedLink(link)
        navigator.clipboard.writeText(link)
        toast({
            title: "Link Generated and Copied",
            description: (
                <div className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                    <p className="text-white">Test link:</p>
                    <p className="mt-2 w-[300px] rounded-md bg-slate-800 p-2 text-xs text-white">
                        {link}
                    </p>
                </div>
            ),
        })
    }

    const handleAddStudent = () => {
        if (selectedClass && newStudent.email && newStudent.firstName && newStudent.lastName) {
            const updatedStudents = [...(classes.find(c => c.id === selectedClass)!.students || []), {
                ...newStudent as IStudent
            }]
            classes.find(c => c.id === selectedClass)!.students = updatedStudents
            classes.find(c => c.id === selectedClass)!.students.length = updatedStudents.length

            toast({
                title: "Student Added",
                description: `Added ${newStudent.firstName} ${newStudent.lastName} to the class.`,
            })
            setIsAddStudentOpen(false)
            setNewStudent({email: ''})
        }
    }

    const getDefaultRemoveAfterDate = () => {
        const date = new Date()
        date.setMonth(date.getMonth() + 6)
        return date.toISOString().split('T')[0]
    }


    // if (isLoading) {
    //     return <div>Loading...</div>
    // }
    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>

                <DialogTrigger asChild>
                    <Button
                        variant="default"
                        size="sm"
                        className="bg-gradient-to-b from-blue-300 via-blue-500 to-blue-700 text-white hover:from-blue-400 transition-all"
                    >
                        <SendHorizonal className="w-4 h-4 mr-2"/>
                        <span>Send</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Send Test</DialogTitle>
                        <DialogDescription>
                            Select a class and students to send the test to.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {!isLoading ? <div className="grid gap-2">
                            <Label htmlFor="class-select">Select Class</Label>
                            <Select onValueChange={handleClassSelect} value={selectedClass}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a class"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map((cls) => (
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
                        </div> : null}
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
                                        classes.find(c => c.id === selectedClass)?.students.map((student) => (
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
                                                    <p className="text-sm text-muted-foreground">{student.email} • {student.regNumber}</p>
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
                        {!selectedClass && (
                            <ScrollArea className="h-[250px] border rounded-md p-2">
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <div className={"flex items-center justify-center gap-2"}>
                                        {isLoading ? <LoadingSpinner/> : null}
                                        {!isLoading ? "Please select a class to view students" : "Fetching your classes..."}
                                    </div>
                                </div>
                            </ScrollArea>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
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
                        </div>
                    </div>
                    {generatedLink && (
                        <div className="grid gap-2 mt-4">
                            <Label htmlFor="generated-link">Generated Link</Label>
                            <Textarea
                                id="generated-link"
                                readOnly
                                value={generatedLink}
                                className="bg-muted"
                            />
                        </div>
                    )}
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button onClick={handleSendInvitation} disabled={selectedStudents.length === 0}>
                            <Mail className="mr-2 h-4 w-4"/>
                            Send Invitation Email
                        </Button>
                        <Button
                            onClick={handleGenerateAndCopyLink}
                            disabled={selectedStudents.length === 0}
                        >
                            <Copy className="mr-2 h-4 w-4"/>
                            Generate and Copy Test Link
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            <AddStudentToClass setIsAddStudentOpen={setIsAddStudentOpen} isAddStudentOpen={isAddStudentOpen}/>
        </>
    )
}

export function LoadingSpinner() {
    return <l-ring-2
        size="17"
        stroke="2"
        stroke-length="0.25"
        bg-opacity="0.1"
        speed="0.8"
        color="black"
    ></l-ring-2>
}