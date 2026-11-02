import "server-only";

import { revalidatePath } from "next/cache";
import { routing } from "@/routing";

// Pages that render scores from the store; refresh them whenever the store changes.
export function revalidateScorePages(): void {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/program`);
  }
}
