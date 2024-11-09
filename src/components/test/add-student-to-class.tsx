import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { StudentSchema, StudentSchemaProps } from "@/validation/student.validation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, UserCheck, UserX } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthContext } from "@/contexts/auth.context";
// Import the ScrollArea component
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AddStudentToClass({ isAddStudentOpen, setIsAddStudentOpen }) {
    const { user } = useContext(AuthContext);
    const {
        register,
        watch,
        setError,
        getValues,
        setValue,
        setFocus,
        formState: { errors, isValid },
        handleSubmit,
        trigger,
    } = useForm<StudentSchemaProps>({
        resolver: zodResolver(StudentSchema),
        mode: "onChange",
    });

    const [studentExists, setStudentExists] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const searchStudent = async (email) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/find-student?email=${email}`, {
                headers: { Authorization: `Bearer ${user.accessToken}` }
            });
            const result = await response.json();

            if (response.ok) {
                Object.entries(result.data).forEach(([key, value]) => setValue(key, value));
                setStudentExists(true);
            } else if (response.status === 404) {
                setStudentExists(false);
                setFocus("firstName")
                Object.keys(getValues()).forEach((key) => {
                    if (key !== "email") setValue(key, "");
                });
            }
        } catch (error) {
            setError("email", { type: "manual", message: "Server error, try again" });
        } finally {
            setIsLoading(false);
            setIsLoaded(true);
        }
    };

    useEffect(() => {
        const email = getValues("email");

        if (!email) {
            // If email field is empty, immediately reset the states to hide elements
            setIsLoaded(false);
            setStudentExists(false);
        } else {
            // If email field is not empty, debounce the search
            const debounceTimer = setTimeout(async () => {
                const isEmailValid = await trigger("email"); // Validate email

                if (isEmailValid) {
                    searchStudent(email);
                }
            }, 500);

            // Clear debounce timer on unmount or when email changes
            return () => clearTimeout(debounceTimer);
        }
    }, [watch("email")]);

    const onSubmit = (data) => {
        console.log(data);
    };

    return (
        <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add Student to Class</DialogTitle>
                    <DialogDescription>Let&apos;s find your student and add them to the class.</DialogDescription>
                </DialogHeader>

                {/* Add ScrollArea wrapper around the form */}
                <ScrollArea className="max-h-[70vh] px-4 -mx-3">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Show "Student Not Found" card only when search is complete and student is not found */}
                        {isLoaded && !studentExists && !isLoading && (
                            <Card className="border-red-200 bg-red-50 shadow-card ">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-red-700 text-base">
                                        <UserX className="mr-2 h-5 w-5"/>
                                        Student Not Found
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-red-700 text-sm">
                                        We could not find student with email <strong>{getValues("email")}</strong> in our
                                        system. Please enter the student&apos;s details below to add them to
                                        the system.</p>
                                </CardContent>
                            </Card>
                        )}

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
                                    <Card className="border-green-200 bg-green-50 ">
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
                                            <Label htmlFor="registrationNumber">Registration Number (Optional)</Label>
                                            <Input id="registrationNumber" {...register("regNumber")} />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Render "removeAfter" field only after search is complete and student is found or not found */}
                        {!isLoading && isLoaded && (
                            <div className="space-y-2">
                                <Label htmlFor="removeAfter">Remove student from class after</Label>
                                <Input
                                    id="removeAfter"
                                    type="date"
                                    {...register("removeAfter")}
                                    onChange={(e) => {
                                        setValue("removeAfter", e.target.value);
                                        trigger("removeAfter");
                                    }}
                                />
                                {errors.removeAfter && <p className="text-sm text-red-500">{errors.removeAfter.message}</p>}
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="submit" disabled={!isValid || isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
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
    );
}
