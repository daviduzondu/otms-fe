import {z} from 'zod';

export const AddStudentToClassSchema = z.object({
    studentId: z.string().uuid({message: "studentId must be a valid UUID"}),
    classId: z.string().uuid({message: "classId must be a valid UUID"}),
    removeAfter: z.string().datetime({message: "Please select a valid removal date"})
});

export const StudentSchema = z.object({
    id: z.string().uuid({message: "id must be a valid UUID"}).optional(),
    firstName: z.string().min(2, {message: "First name must be at least 2 characters long"}),
    middleName: z.string().nullable().optional(),
    lastName: z.string().min(2, {message: "Last name must be at least 2 characters long"}),
    regNumber: z.string().optional(),
    email: z.string().email({message: "Invalid email address"}),
    removeAfter: z.string({message: "Please select a valid removal date"}).datetime({message: "Please select a valid removal date"}), // Required and datetime format
    classId: z.string().uuid({message: "classId must be a valid UUID"}).nullable().optional(),
});

export type StudentSchemaProps = z.infer<typeof StudentSchema>;
export type AddStudentToClassSchemaProps = z.infer<typeof AddStudentToClassSchema>;