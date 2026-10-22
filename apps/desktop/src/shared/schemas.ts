import { z } from "zod";
import type { AppInfo, CaptureRect, PickedImage } from "./channels";

/** Validates what the main process sends back, so the contract can't drift silently. */
export const appInfoSchema = z.object({
  platform: z.string(),
  userName: z.string().nullable(),
  version: z.string(),
}) satisfies z.ZodType<AppInfo>;

const pixels = z.number().finite().min(0).max(20_000);

/** Checked in the main process: the renderer is never trusted with what it sends. */
export const captureRectSchema = z.object({
  height: pixels.positive(),
  width: pixels.positive(),
  x: pixels,
  y: pixels,
}) satisfies z.ZodType<CaptureRect>;

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
