import { useEffect, useRef, useState } from "react";

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

interface Result<T> {
  key: string;
  data: T | null;
  error: Error | null;
}

export function useAsyncValue<T>(
  loader: () => Promise<T>,
  key = "default",
): AsyncState<T> {
  const loaderRef = useRef(loader);
  const [result, setResult] = useState<Result<T>>({
    key: "",
    data: null,
    error: null,
  });

  useEffect(() => {
    loaderRef.current = loader;
  });

  useEffect(() => {
    let cancelled = false;

    void loaderRef
      .current()
      .then((data) => {
        if (!cancelled) {
          setResult({ key, data, error: null });
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          const error =
            caught instanceof Error ? caught : new Error("Something went wrong.");
          setResult({ key, data: null, error });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  const loading = result.key !== key;

  return {
    data: loading ? null : result.data,
    error: loading ? null : result.error,
    loading,
  };
}
