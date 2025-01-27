import { z } from 'zod';

export const CreateOrEditTestSchema = z.object({
 testId: z.string().uuid().optional(),
 title: z.string({ required_error: "Title cannot be empty" }).min(5, "Title cannot have fewer than 5 Characters"),
 instructions: z.string().optional(),
 durationMin: z.number().int().min(30).max(180),
 requireFullScreen: z.boolean(),
 disableCopyPaste: z.boolean(),
 showResultsAfterTest: z.boolean(),
 randomizeQuestions: z.boolean(),
 platform: z.enum(['desktop', 'mobileAndDesktop'])
})

export type CreateorEditTestSchemaProps = z.infer<typeof CreateOrEditTestSchema>;