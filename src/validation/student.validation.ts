import {z} from 'zod';

export const AddStudentToClassSchema = z.object({
    studentId: z.string().uuid({message: "studentId must be a valid UUID"}),
    classId: z.string().uuid({message: "classId must be a valid UUID"}),
    removeAfter: z.date(),  // Change this line
});

export const StudentSchema = z.object({
    firstName: z.string().min(5),
    middleName: z.string().optional(),
    lastName: z.string().min(5),
    regNumber: z.string(),
    email: z.string().email(),
})

export type StudentSchemaProps = z.infer<typeof StudentSchema>
export type AddStudentToClassSchemaProps = z.infer<typeof AddStudentToClassSchema>;
