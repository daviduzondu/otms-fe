'use client'

import React, { useContext, useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DatePicker } from "@/components/ui/date-picker"
import { Loader, Loader2, Search, UserCheck, UserX } from "lucide-react"
import { AuthContext } from "@/contexts/auth.context"
import { AddStudentToClassSchema, StudentSchema, StudentSchemaProps } from '@/validation/student.validation'
import { errorToast } from "@/helpers/show-toasts";

export default function AddStudent({ isAddStudentOpen, setIsAddStudentOpen, classId, handleAddStudent }) {
 const { user } = useContext(AuthContext)
 const defaultRemoveAfter = new Date(new Date().getFullYear(), new Date().getMonth() + 6)

 const {
  register,
  watch,
  setError,
  getValues,
  setValue,
  control,
  setFocus,
  formState: { errors, isValid },
  handleSubmit,
  trigger,
  reset
 } = useForm<StudentSchemaProps>({
  resolver: zodResolver(StudentSchema),
  mode: "all"
 })

 const [studentExists, setStudentExists] = useState(false)
 const [isSearching, setIsSearching] = useState(false)
 const [isLoaded, setIsLoaded] = useState(false)
 const [isLoading, setIsLoading] = useState(false)
 const [removeAfter, setRemoveAfter] = useState<Date>(defaultRemoveAfter)

 const searchStudent = async (email: string) => {
  setIsSearching(true)
  setValue("removeAfter", new Date(removeAfter!.toString()).toISOString());

  try {
   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/find-student?email=${email}`, {
    headers: { Authorization: `Bearer ${user.accessToken}` }
   })
   const result = await response.json()

   if (response.ok) {
    Object.entries(result.data).forEach(([key, value]) => setValue(key as keyof StudentSchemaProps, value, { shouldValidate: true }))
    setStudentExists(true)
   } else if (response.status === 404) {
    setStudentExists(false)
    setFocus("firstName")
    reset({ email: email })
   }
  } catch (error) {
   errorToast("Failed to search student", { description: (error as Error)?.message || "Something went wrong. Please try again!" });
   setError("email", { type: "manual", message: "Server error, try again" })
  } finally {
   setIsSearching(false)
   setIsLoaded(true)
  }
 }


 useEffect(() => {
  // Trigger validation for removeAfter field on component mount
  trigger("removeAfter")
 }, [trigger])


 useEffect(() => {
  const email = watch("email")
  console.log(errors)

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
  console.log(data)
  try {
   let response
   if (studentExists) {
    const addStudentData = AddStudentToClassSchema.parse({
     studentId: data.id,
     classId,
     removeAfter: data?.removeAfter.toString()
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
     removeAfter: classId ? data?.removeAfter.toString() : undefined
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
    throw new Error(result.message);
   } else {
    handleAddStudent(Object.assign(data, { ...result.data }));
   }

  } catch (error) {
   errorToast("Failed to add student", { description: (error as Error)?.message || "Something went wrong. Please try again!" });
   setError("root", { type: "manual", message: "Failed to add student. Please try again." })
  } finally {
   setIsLoading(false)
   reset({ email: '' })
  }
 }

 return (
  <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
   <DialogContent className="max-w-xl">
    <DialogHeader>
     <DialogTitle>{classId ? "Add student to class" : "Add student"}</DialogTitle>
     <DialogDescription>{classId ? "Let's find your student and add them to the class." : "Start by entering your student's email"}</DialogDescription>
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
        <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
       </div>
       {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>

      {isSearching ? (
       <div className="flex items-center justify-center space-x-2 py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-lg font-medium text-muted-foreground">Searching for student...</p>
       </div>
      ) : (
       <>
        {isLoaded && studentExists && (
         <Card className="border-green-200 bg-green-50">
          <CardHeader>
           <CardTitle className="flex items-center text-green-700 text-base">
            <UserCheck className="mr-2 h-5 w-5" />
            {classId ? "Student Found" : "Student already exists"}
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
          {classId ? <Card className="border-red-200 bg-red-50 shadow-card">
           <CardHeader>
            <CardTitle className="flex items-center text-red-700 text-base">
             <UserX className="mr-2 h-5 w-5" />
             Student Not Found
            </CardTitle>
           </CardHeader>
           <CardContent>
            <p className="text-red-700 text-sm">
             We could not find a student with this email in our system.
             Please enter the student&apos;s details below to add them.
            </p>
           </CardContent>
          </Card> : null}
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

      {!isSearching && isLoaded && classId && (
       <div className="space-y-2 flex flex-col">
        <Label htmlFor="removeAfter">Remove student from this class on</Label>
        <Controller
         name="removeAfter"
         control={control}
         defaultValue={defaultRemoveAfter.toISOString()}
         rules={{ required: "Please select a date" }}
         render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
           <DatePicker
            date={new Date(value)}
            setDate={(date) => {
             if (date) {
              const isoString = new Date(date.toString()).toISOString();
              onChange(isoString); // Update the form value
              // setRemoveAfter(date); // Update local state if needed
             }
            }}
           />
           {error && <p className="text-red-500 text-sm">{error.message}</p>}
          </>
         )}
        />
       </div>
      )}


      {errors.root && <p className="text-red-500 text-sm">{errors.root.message}</p>}

      <DialogFooter>
       <Button type="submit" disabled={isSearching || isLoading || !isValid || (studentExists && !classId)}>
        {(isSearching || isLoading) ? (
         <>
          <div><Loader className="animate-spin" /></div>
          Please wait
         </>
        ) : classId ? (
         'Add student to Class'
        ) : "Add student"}
       </Button>
      </DialogFooter>
     </form>
    </ScrollArea>
   </DialogContent>
  </Dialog>
 )
}