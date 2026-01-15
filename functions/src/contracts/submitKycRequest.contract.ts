import { z } from "zod";

export const SubmitKycRequestSchema = z.object({
  fullName: z.string().min(3),
  dob: z.string(), // ISO date (yyyy-mm-dd)
  // documentType: z.enum(["AADHAR", "PAN", "PASSPORT"]),
  documentNumberMasked: z.string().min(4),
  documentUrl: z.string().url(),
  selfieUrl: z.string().url(),
});

export type SubmitKycRequestInput = z.infer<
  typeof SubmitKycRequestSchema
>;

export function validateSubmitKycRequest(input: unknown) {
  const res = SubmitKycRequestSchema.safeParse(input);
  if (!res.success) {
    throw new Error("Invalid KYC input");
  }
  return res.data;
}
