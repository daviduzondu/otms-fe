import {z} from "zod";

// Schema definition
export const QuestionSchema = z
    .object({
        testId: z.string().optional(),

        index: z.number().optional(),

        id: z.string().optional(),

        body: z
            .string({required_error: "Title cannot be empty"})
            .min(5, "Text cannot have fewer than 5 characters"),

        type: z.enum(["mcq", "shortAnswer", "trueOrFalse", "essay"], {
            message: "Question Type must be Multiple Choice, Short Answer, True or False, or Essay",
        }),

        points: z.preprocess(
            (val) => (typeof val === "string" ? parseFloat(val) : val),
            z
                .number({
                    required_error: "Points cannot be empty",
                    invalid_type_error: "Points must be a number",
                })
                .min(0, {message: "Points for this question cannot be lower than 0"})
        ),

        // Options validation only if it's an MCQ
        options: z
            .array(z.string().min(1, "None of the options can be empty"))
            .optional(),

        correctAnswer: z.string().optional(),
    })
    .refine((data) => {
            // If type is 'mcq', check that options are provided and valid
            if (data.type === "mcq") {
                const options = data.options || [];  // Default to an empty array if options are undefined
                if (options.length < 2 || options.some(option => option.trim() === "")) {
                    return false;  // Return false if there are fewer than 2 options or if any option is empty
                }
            }
            return true;  // Return true if the checks pass
        }, {
            message: "At least two non-empty options are required for multiple-choice questions.",
            path: ["options"],  // Assign error to the options field
        }
    )
    .refine((data) => {
        // Ensure correctAnswer is provided for 'mcq' and 'trueOrFalse'
        if ((data.type === "mcq" || data.type === "trueOrFalse") && !data.correctAnswer) {
            return false;
        }
        return true;
    }, {
        message: "Correct answer is required for Multiple Choice and True/False questions",
        path: ["correctAnswer"],
    });

// Type inference for schema
export type QuestionSchemaProps = z.infer<typeof QuestionSchema>;
