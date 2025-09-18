import { z } from "zod";
export const RegisterSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  confirm: z.string().min(8),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  accept: z.literal(true, { errorMap: () => ({ message: "Please accept terms" }) }),
}).refine(v => v.password === v.confirm, { message: "Passwords do not match", path: ["confirm"] });
export type RegisterForm = z.infer<typeof RegisterSchema>;
