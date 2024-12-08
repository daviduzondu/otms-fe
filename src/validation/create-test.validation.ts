import { z } from 'zod';

export const CreateTestSchema = z.object({
 title: z.string({ required_error: "Title cannot be empty" }).min(5, "Title cannot have fewer than 5 Characters"),
 instructions: z.string().optional(),
 passingScore: z.number({ required_error: "Passing Score cannot be empty", invalid_type_error: "Passing Score must be a number" }).min(50, { message: "Passing Score cannot be lower than 50" }).max(100, { message: "Passing Score cannot be higher than 100" }),
 requireFullScreen: z.boolean(),
 showCorrectAnswers: z.boolean(),
 disableCopyPaste: z.boolean(),
 provideExplanations: z.boolean(),
 randomizeQuestions: z.boolean()
})

export type CreateTestSchemaProps = z.infer<typeof CreateTestSchema>;