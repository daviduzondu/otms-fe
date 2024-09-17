import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";

export const RegSchema = z.object({
 firstName: z.string({ required_error: "Name is required" }).min(4, { message: "Name must be longer than 4 characters" }).regex(/^[A-Za-z\s]+$/, { message: "First Name must only contain English alphabets and spaces" }),
 lastName: z.string({ required_error: "Name is required" }).min(4, { message: "Name must be longer than 4 characters" }).regex(/^[A-Za-z\s]+$/, { message: "Last Name must only contain English alphabets and spaces" }),
 email: z.string().min(1, { message: "Email must be longer than 1 character" }).email({ message: "Entry must be a valid email" }),
 password: z.string()
  .min(8, "Password must be at least 8 characters long.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/\d/, "Password must contain at least one number.")
  .regex(
   /[!@#$%^&*]/,
   "Password must contain at least one special character (!@#$%^&*)."
  ),
 confirmPassword: z.string()
  .min(8, "Password confirmation must be at least 8 characters long.")
}).superRefine(({ confirmPassword, password }, ctx) => {
 if (confirmPassword !== password) {
  ctx.addIssue({
   code: "custom",
   message: "Passwords do not match",
   path: ['confirmPassword']
  });
 }
});
;


export const LoginSchema = z.object({ email: RegSchema._def.schema.shape.email, password: z.string({ required_error: "Password cannot be empty" }).min(8, "Password must be at least 8 characters long") })
export type LoginSchemaProps = z.infer<typeof LoginSchema>;
export type RegSchemaProps = z.infer<typeof RegSchema>;



