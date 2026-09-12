import { notFound } from "@/services/api/client";
import { programs } from "@/services/api/mock/data";
import type { Program } from "@/types/domain";

export function listPrograms(): Promise<readonly Program[]> {
  return Promise.resolve(programs);
}

export function getProgram(programId: string): Promise<Program> {
  const program = programs.find((item) => item.id === programId);
  if (!program) {
    return Promise.reject(notFound("Program", programId));
  }
  return Promise.resolve(program);
}
