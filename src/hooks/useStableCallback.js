"use client";

import { useCallback, useEffect, useRef } from "react";

export function useStableCallback(callback) {
  const ref = useRef(callback);
  useEffect(() => {
    ref.current = callback;
  }, [callback]);
  return useCallback((...args) => ref.current?.(...args), []);
}
