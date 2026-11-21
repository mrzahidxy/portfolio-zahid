export const isVisitCounterEnabled =
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PUBLIC_VISIT_COUNTER_ENABLED === "true";
