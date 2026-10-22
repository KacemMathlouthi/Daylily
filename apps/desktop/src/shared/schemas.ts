import { z } from "zod";
import type { AppInfo, PickedImage } from "./channels";

/** Validates what the main process sends back, so the contract can't drift silently. */
export const appInfoSchema = z.object({
  platform: z.string(),
  userName: z.string().nullable(),
  version: z.string(),
}) satisfies z.ZodType<AppInfo>;

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
/** A share card is a few megabytes at most; anything far larger isn't one. */
const MAX_PNG_BYTES = 40 * 1024 * 1024;

/** Checked in the main process: the renderer is never trusted with what it sends. */
export const pngSchema = z
  .instanceof(Uint8Array)
  .refine((bytes) => bytes.byteLength <= MAX_PNG_BYTES, "Image too large")
  .refine(
    (bytes) => PNG_SIGNATURE.every((byte, index) => bytes[index] === byte),
    "Not a PNG"
  );

/** The suggested file name, without a path: letters, digits, spaces and a few marks. */
export const imageNameSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[\p{L}\p{N} ._-]+$/u);

export const pickedImageSchema = z
  .object({
    dataUrl: z.string().startsWith("data:image/"),
    name: z.string().min(1),
  })
  .nullable() satisfies z.ZodType<PickedImage | null>;
