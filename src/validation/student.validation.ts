import { z } from 'zod';

export const AddStudentToClassSchema = z.object({
    studentId: z.string().uuid({ message: "studentId must be a valid UUID" }),
    classId: z.string().uuid({ message: "classId must be a valid UUID" }),
    removeAfter: z.string().optional()
});

export const StudentSchema = z.object({
    id: z.string().uuid({ message: "id must be a valid UUID" }).optional(), // For existing students
    firstName: z.string().min(2, { message: "First name must be at least 2 characters long" }),
    middleName: z.string().optional(),
    lastName: z.string().min(2, { message: "Last name must be at least 2 characters long" }),
    regNumber: z.string().optional(), // Made optional as it might not be available for new students
    email: z.string().email({ message: "Invalid email address" }),
    removeAfter: z.string().optional(),
    classId: z.string().uuid({ message: "classId must be a valid UUID" }).optional(),
});

export type StudentSchemaProps = z.infer<typeof StudentSchema>;
export type AddStudentToClassSchemaProps = z.infer<typeof AddStudentToClassSchema>;