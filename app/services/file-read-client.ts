import {
  fileReadInputSchema,
  fileReadResultSchema,
  type FileReadPayload,
  type FileReadResult,
} from "~/lib/ai-contract";
import { AIRequestError, postAI } from "./ai-request";

export type { FileReadPayload, FileReadResult };

/** Transcription (one file per call) or interpretation (a set) of work files. */
export async function readWorkFiles(
  payload: FileReadPayload,
): Promise<FileReadResult> {
  const parsed = fileReadInputSchema.safeParse(payload);
  if (!parsed.success) throw new AIRequestError(400);
  const result = fileReadResultSchema.safeParse(
    await postAI(JSON.stringify(parsed.data)),
  );
  if (!result.success || result.data.intent !== parsed.data.intent)
    throw new AIRequestError(502);
  return result.data;
}
