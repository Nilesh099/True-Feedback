
import { z } from "zod";

export const signInSchema = z.object({
  identifier: z.string()
    .min(3, { message: "Username or email is required (min 3 characters)" })
    .max(100, { message: "Username or email cannot exceed 100 characters" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" }),
});
