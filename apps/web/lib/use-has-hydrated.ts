"use client";

import { useEffect, useState } from "react";

/** True only after the first client-side render, so persisted (localStorage) state
 * never causes a server/client markup mismatch. */
export function useHasHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
