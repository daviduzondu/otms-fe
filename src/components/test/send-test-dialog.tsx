'use client'

import React, {useEffect, useState} from 'react'
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
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import {toast} from "@/hooks/use-toast"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Checkbox} from "@/components/ui/checkbox"
import {ScrollArea} from "@/components/ui/scroll-area"
import {Copy, Info, Mail, SendHorizonal, UserPlus, Users} from 'lucide-react'
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import {Badge} from "@/components/ui/badge"

interface Class {
    id: string;
    name: string;
    studentCount: number;
}

interface Student {
    id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    registrationNumber?: string;
    removeAfter: string;
}

const classes: Class[] = [
    {id: '1', name: 'Class A', studentCount: 3},
    {id: '2', name: 'Class B', studentCount: 0},
    {id: '3', name: 'Advanced Math', studentCount: 2},
]

const students: { [key: string]: Student[] } = {
    '1': [
        {id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', removeAfter: '2024-12-31'},
        {id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', removeAfter: '2024-12-31'},
        {id: '3', firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com', removeAfter: '2024-12-31'},
    ],
    '3': [
        {id: '4', firstName: 'Bob', lastName: 'Williams', email: 'bob@example.com', removeAfter: '2024-12-31'},
        {id: '5', firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com', removeAfter: '2024-12-31'},
    ],
}

export function SendTest() {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedClass, setSelectedClass] = useState<string>('')
    const [selectedStudents, setSelectedStudents] = useState<string[]>([])
    const [generatedLink, setGeneratedLink] = useState('')
    const [isAllSelected, setIsAllSelected] = useState(true)
    const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
    const [newStudent, setNewStudent] = useState<Partial<Student>>({email: ''})

    useEffect(() => {
        if (selectedClass) {
            setSelectedStudents(students[selectedClass]?.map(student => student.id) || [])
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
            setIsAllSelected(newSelection.length === (students[selectedClass]?.length || 0))
            return newSelection
        })
    }

    const handleToggleAll = () => {
        if (isAllSelected) {
            setSelectedStudents([])
        } else {
            setSelectedStudents(students[selectedClass]?.map(student => student.id) || [])
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
            const updatedStudents = [...(students[selectedClass] || []), {
                // @ts-ignore
                id: Math.random().toString(36).substr(2, 9),
                ...newStudent as Student
            }]
            students[selectedClass] = updatedStudents
            classes.find(c => c.id === selectedClass)!.studentCount = updatedStudents.length

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
                        Send
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
                        <div className="grid gap-2">
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
                                                    {cls.studentCount} students
                                                </Badge>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
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
                                    {students[selectedClass]?.length > 0 ? (
                                        students[selectedClass].map((student) => (
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
                                                    <p className="text-sm text-muted-foreground">{student.email}</p>
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
                                    Please select a class to view students
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

            <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add Student to Class</DialogTitle>
                        <DialogDescription>
                            Enter the details of the new student.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-4">
                            <Label htmlFor="email" className="text-left">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={newStudent.email}
                                onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                                placeholder="student@example.com"
                                className="col-span-3"
                            />
                        </div>
                        {newStudent.email && (
                            <>
                                <div className="flex flex-col gap-4">
                                    <Label htmlFor="firstName" className="text-left">
                                        First Name
                                    </Label>
                                    <Input
                                        id="firstName"
                                        value={newStudent.firstName}
                                        onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="flex flex-col gap-4">
                                    <Label htmlFor="middleName" className="text-left">
                                        Middle Name
                                    </Label>
                                    <Input
                                        id="middleName"
                                        value={newStudent.middleName}
                                        onChange={(e) => setNewStudent({...newStudent, middleName: e.target.value})}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="flex flex-col gap-4">
                                    <Label htmlFor="lastName" className="text-left">
                                        Last Name
                                    </Label>
                                    <Input
                                        id="lastName"
                                        value={newStudent.lastName}
                                        onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="flex flex-col gap-4">
                                    <Label htmlFor="registrationNumber" className="text-left">
                                        Registration Number (Optional)
                                    </Label>
                                    <Input
                                        id="registrationNumber"
                                        value={newStudent.registrationNumber}
                                        onChange={(e) => setNewStudent({
                                            ...newStudent,
                                            registrationNumber: e.target.value
                                        })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="flex flex-col gap-4">
                                    <Label htmlFor="removeAfter" className="text-left">
                                        Remove student from class after
                                    </Label>
                                    <Input
                                        id="removeAfter"
                                        type="date"
                                        value={newStudent.removeAfter || getDefaultRemoveAfterDate()}
                                        onChange={(e) => setNewStudent({...newStudent, removeAfter: e.target.value})}
                                        className="col-span-3"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={handleAddStudent}
                                disabled={!newStudent.email || !newStudent.firstName || !newStudent.lastName}>Add
                            Student</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}