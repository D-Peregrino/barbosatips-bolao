export const ANALYTICS_EVENTS = [
  "click_vip",
  "click_bolao",
  "click_loja",
  "click_banner",
  "click_checkout",
  "click_telegram",
  "click_youtube",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export type AnalyticsEventParams = Record<
  string,
  string | number | boolean | null | undefined
>;

type AnalyticsWindow = Window & {
  gtag?: unknown;
};

export function trackEvent(
  eventName: AnalyticsEventName,
  params: AnalyticsEventParams = {},
): void {
  if (typeof window === "undefined") return;
  const gtag = (window as AnalyticsWindow).gtag;
  if (typeof gtag === "function") {
    gtag("event", eventName, params);
  }
}
