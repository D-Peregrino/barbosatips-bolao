export const HOME_ONBOARDING_KEY = "barbosatips_onboarding_home_v1";

export type HomeOnboardingState = "pending" | "done" | "dismissed";

export function readHomeOnboardingState(): HomeOnboardingState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(HOME_ONBOARDING_KEY);
    if (raw === "done" || raw === "dismissed") return raw;
    return raw ? "pending" : null;
  } catch {
    return null;
  }
}

export function writeHomeOnboardingState(state: HomeOnboardingState): void {
  try {
    localStorage.setItem(HOME_ONBOARDING_KEY, state);
  } catch {
    /* noop */
  }
}
