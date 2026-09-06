"use client";

import { useEffect, useState } from "react";

/** Avoid SSR painting Framer Motion's opacity:0 initial state. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
