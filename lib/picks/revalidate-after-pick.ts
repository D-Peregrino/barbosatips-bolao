import { revalidatePath } from "next/cache";

/** Invalida páginas que dependem do estado das quick picks. */
export function revalidateAfterQuickPickChange(): void {
  revalidatePath("/picks");
  revalidatePath("/admin-picks");
  revalidatePath("/premium");
  revalidatePath("/performance");
  revalidatePath("/");
  revalidatePath("/live");
  revalidatePath("/tipster/barbosa");
}
