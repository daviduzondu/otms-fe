import { z } from 'zod';

export const CreateTestSchema = z.object({
 title: z.string({ required_error: "Title cannot be empty" }).min(5, "Title cannot have fewer than 5 Characters"),
 instructions: z.string().optional(),
 durationMin: z.number().int().min(30).max(180),
 requireFullScreen: z.boolean(),
 disableCopyPaste: z.boolean(),
 provideExplanations: z.boolean(),
 showResultsAfterTest: z.boolean(),
 randomizeQuestions: z.boolean()
})

export type CreateTestSchemaProps = z.infer<typeof CreateTestSchema>;