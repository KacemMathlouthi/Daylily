import { z } from "zod";
import type { AppInfo } from "./channels";

/** Validates what the main process sends back, so the contract can't drift silently. */
export const appInfoSchema = z.object({
  platform: z.string(),
  version: z.string(),
}) satisfies z.ZodType<AppInfo>;
