import { notFound } from "@/services/api/client";
import type { Program } from "@/types/domain";

export function listPrograms(): Promise<readonly Program[]> {
  return Promise.resolve([]);
}

export function getProgram(programId: string): Promise<Program> {
  return Promise.reject(notFound("Program", programId));
}
