import { apiRequest } from "@/services/api/client";
import { parseProgramDetail, parseProgramList } from "@/services/api/map";
import type { Program, ProgramListItem, WorkoutSummary } from "@/types/domain";

export function listPrograms(): Promise<readonly ProgramListItem[]> {
  return apiRequest("/programs", {
    parse: parseProgramList,
  });
}

export async function getProgram(programId: string): Promise<Program> {
  const detail = await getProgramDetail(programId);
  return detail.program;
}

export function getProgramDetail(programId: string): Promise<{
  program: Program;
  workouts: readonly WorkoutSummary[];
}> {
  return apiRequest(`/programs/${programId}`, {
    parse: parseProgramDetail,
  });
}
