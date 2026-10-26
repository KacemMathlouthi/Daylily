import { parseDayKey } from "@daylily/core/day";
import { isThoughtTime } from "@daylily/core/thoughts-file";
import { z } from "zod";
import {
  type AppInfo,
  type JournalConfigChanges,
  WINDOW_ACTIONS,
} from "./channels";
import {
  COVER_EXTENSIONS,
  COVER_NAME,
  MAX_IMAGE_BYTES,
  MAX_NAME_LENGTH,
  MAX_QUERY_LENGTH,
  REMINDER_TIME,
} from "./journal";

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

/** A day the renderer names: only a real date, so it can never become a path elsewhere. */
export const daySchema = z.string().transform((text, context) => {
  const day = parseDayKey(text);
  if (!day) {
    context.addIssue({ code: "custom", message: "Not a day" });
    return z.NEVER;
  }
  return day;
});

/** A day's page is words; this is far beyond any page a person writes in a day. */
const MAX_PAGE_CHARS = 5_000_000;

export const pageSchema = z.object({
  body: z.string().max(MAX_PAGE_CHARS),
  // Only the cover the app copied in, never a path elsewhere
  cover: z.string().regex(COVER_NAME).nullable(),
  title: z.string().max(1000),
});

/** A day's thoughts as the page sends them; far more than anyone writes in a day. */
export const thoughtsSchema = z
  .array(
    z.object({
      body: z.string().max(MAX_PAGE_CHARS),
      time: z.string().refine(isThoughtTime).nullable(),
    })
  )
  .max(10_000);

export const imageOwnerSchema = z.enum(["page", "thoughts"]);

export const imageBytesSchema = z
  .instanceof(Uint8Array)
  .refine((bytes) => bytes.byteLength > 0, "Empty image")
  .refine((bytes) => bytes.byteLength <= MAX_IMAGE_BYTES, "Image too large");

export const coverExtensionSchema = z.enum(COVER_EXTENSIONS);

export const configChangesSchema = z.strictObject({
  galleryCovers: z.boolean().optional(),
  ghostPrompts: z.boolean().optional(),
  // An empty name is kept as none, so the computer's name for them is used
  name: z
    .string()
    .trim()
    .max(MAX_NAME_LENGTH)
    .transform((name) => name || null)
    .nullable()
    .optional(),
  reminder: z
    .strictObject({
      enabled: z.boolean().optional(),
      time: z.string().regex(REMINDER_TIME).optional(),
    })
    .optional(),
}) satisfies z.ZodType<JournalConfigChanges>;

export const deviceChangesSchema = z.strictObject({
  onboarded: z.boolean().optional(),
  sidebarOpen: z.boolean().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
});

/** A journal folder the page passes back; the main process checks it offered it. */
export const folderPathSchema = z.string().min(1).max(4096);

export const flowerColorSchema = z.enum([
  "daylily",
  "petal",
  "saffron",
  "cornflower",
]);

/** A cover file's stamp, as the main process gave it: its size and time, which can be fractional or before 1970. */
export const coverStampSchema = z.string().regex(/^\d+--?\d+(?:\.\d+)?$/);

export const windowActionSchema = z.enum(WINDOW_ACTIONS);

/** What someone typed to search, as long as the field allows. */
export const searchQuerySchema = z.string().max(MAX_QUERY_LENGTH);
