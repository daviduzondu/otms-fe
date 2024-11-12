'use client'

import React, {useContext, useEffect, useState} from "react"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Label} from "@/components/ui/label"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {ScrollArea} from "@/components/ui/scroll-area"
import {DatePicker} from "@/components/ui/date-picker"
import {Loader2, Search, UserCheck, UserX} from "lucide-react"
import {AuthContext} from "@/contexts/auth.context"
import {AddStudentToClassSchema, StudentSchema, StudentSchemaProps} from '@/validation/student.validation'
import Loader from "@/components/loader/loader";
import {errorToast} from "@/helpers/show-toasts";

export default function AddStudentToClass({isAddStudentOpen, setIsAddStudentOpen, classId, handleAddStudent}) {
    const {user} = useContext(AuthContext)
    const {
        register,
        watch,
        setError,
        getValues,
        setValue,
        setFocus,
        formState: {errors, isValid},
        handleSubmit,
        trigger,
        reset
    } = useForm<StudentSchemaProps>({
        resolver: zodResolver(StudentSchema),
        mode: "onChange",
    })

    const [studentExists, setStudentExists] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [removeAfter, setRemoveAfter] = useState<Date | undefined>(undefined)

    const searchStudent = async (email: string) => {
        setIsLoading(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/find-student?email=${email}`, {
                headers: {Authorization: `Bearer ${user.accessToken}`}
            })
            const result = await response.json()

            if (response.ok) {
                Object.entries(result.data).forEach(([key, value]) => setValue(key as keyof StudentSchemaProps, value))
                setStudentExists(true)
            } else if (response.status === 404) {
                setStudentExists(false)
                setFocus("firstName")
                reset({email: email})
            }
        } catch (error) {
            setError("email", {type: "manual", message: "Server error, try again"})
        } finally {
            setIsLoading(false)
            setIsLoaded(true)
        }
    }

    useEffect(() => {
        const email = watch("email")
        if (email) {
            const debounceTimer = setTimeout(async () => {
                const isEmailValid = await trigger("email")
                if (isEmailValid) {
                    await searchStudent(email)
                }
            }, 500)
            return () => clearTimeout(debounceTimer)
        } else {
            setIsLoaded(false)
            setStudentExists(false)
        }
    }, [watch("email")])

    const onSubmit = async (data: StudentSchemaProps) => {
        setIsLoading(true)
        try {
            let response
            if (studentExists) {
                const addStudentData = AddStudentToClassSchema.parse({
                    studentId: data.id,
                    classId,
                    removeAfter: data.removeAfter.toString()
                })
                response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/class/add-student`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${user.accessToken}`
                    },
                    body: JSON.stringify(addStudentData)
                })
            } else {
                const newStudentData = StudentSchema.parse({
                    ...data,
                    classId,
                    removeAfter: data.removeAfter.toString()
                })
                response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/add-student`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${user.accessToken}`
                    },
                    body: JSON.stringify(newStudentData)
                })
            }
            const result = await response.json();
            if (!response.ok) {
                console.log(result);
                errorToast("Failed to add student", {description: result?.message || "Something went wrong. Please try again!"});
            } else {
                handleAddStudent(data);
            }

        } catch (error) {
            console.log(error)
            setError("root", {type: "manual", message: "Failed to add student. Please try again."})
        } finally {
            setIsLoading(false)
            reset({email: ''})
            setRemoveAfter(undefined)
        }
    }

    return (
        <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Add Student to Class</DialogTitle>
                    <DialogDescription>Let&apos;s find your student and add them to the class.</DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[70vh] -mx-3">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-3">
                        <div className="space-y-2">
                            <Label htmlFor="email">Student&apos;s Email</Label>
                            <div className="relative">
                                <Input
                                    id="email"
                                    type="email"
                                    {...register("email")}
                                    placeholder="student@example.com"
                                    className="pr-10"
                                />
                                <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground"/>
                            </div>
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center space-x-2 py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-primary"/>
                                <p className="text-lg font-medium text-muted-foreground">Searching for student...</p>
                            </div>
                        ) : (
                            <>
                                {isLoaded && studentExists && (
                                    <Card className="border-green-200 bg-green-50">
                                        <CardHeader>
                                            <CardTitle className="flex items-center text-green-700 text-base">
                                                <UserCheck className="mr-2 h-5 w-5"/>
                                                Student Found
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="font-semibold">First Name</p>
                                                <p>{getValues("firstName")}</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold">Last Name</p>
                                                <p>{getValues("lastName")}</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold">Middle Name</p>
                                                <p>{getValues("middleName") || "N/A"}</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold">Registration Number</p>
                                                <p>{getValues("regNumber") || "N/A"}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {isLoaded && !studentExists && (
                                    <>
                                        <Card className="border-red-200 bg-red-50 shadow-card">
                                            <CardHeader>
                                                <CardTitle className="flex items-center text-red-700 text-base">
                                                    <UserX className="mr-2 h-5 w-5"/>
                                                    Student Not Found
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-red-700 text-sm">
                                                    We could not find a student with this email in our system.
                                                    Please enter the student&apos;s details below to add them.
                                                </p>
                                            </CardContent>
                                        </Card>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="firstName">First Name</Label>
                                                <Input id="firstName" {...register("firstName")} />
                                                {errors.firstName &&
                                                    <p className="text-sm text-red-500">{errors.firstName.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="middleName">Middle Name (Optional)</Label>
                                                <Input id="middleName" {...register("middleName")} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="lastName">Last Name</Label>
                                                <Input id="lastName" {...register("lastName")} />
                                                {errors.lastName &&
                                                    <p className="text-sm text-red-500">{errors.lastName.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="regNumber">Registration Number (Optional)</Label>
                                                <Input id="regNumber" {...register("regNumber")} />
                                                {errors.regNumber &&
                                                    <p className="text-red-500 text-sm">{errors.regNumber.message}</p>}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {!isLoading && isLoaded && (
                            <div className="space-y-2 flex flex-col">
                                <Label htmlFor="removeAfter">Remove student from this class on</Label>
                                <DatePicker
                                    date={removeAfter}
                                    setDate={(date) => {
                                        if (date) {
                                            const isoString = new Date(date.toString()).toISOString();
                                            setRemoveAfter(date);
                                            setValue("removeAfter", isoString); // Ensure it's a string
                                            trigger("removeAfter");
                                        }
                                    }}
                                />
                                {errors.removeAfter &&
                                    <p className="text-red-500 text-sm">{errors.removeAfter.message}</p>}
                            </div>
                        )}

                        {errors.root && <p className="text-red-500 text-sm">{errors.root.message}</p>}

                        <DialogFooter>
                            <Button type="submit" disabled={isLoading || !isValid}>
                                {isLoading ? (
                                    <>
                                        <Loader/>
                                        Please wait
                                    </>
                                ) : (
                                    'Add Student to Class'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}