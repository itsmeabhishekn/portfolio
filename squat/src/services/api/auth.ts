import { currentUser } from "@/services/api/mock/data";
import type { User } from "@/types/domain";

export function getCurrentUser(): Promise<User | null> {
  return Promise.resolve(currentUser);
}
