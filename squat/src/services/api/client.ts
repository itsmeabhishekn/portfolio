export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly debug: string;

  constructor(
    message: string,
    code = "unknown",
    status = 500,
    debug = message,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.debug = debug;
  }
}

export const notFound = (entity: string, id: string): ApiError =>
  new ApiError(`${entity} ${id} was not found.`, "not_found", 404);

const NETWORK_MESSAGE =
  "Unable to load your workout. Check your connection and try again.";

function apiBaseUrl(): string {
  const value = import.meta.env.VITE_API_BASE_URL;
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ApiError(
      "The app is missing its API configuration.",
      "config",
      500,
      "VITE_API_BASE_URL is not set",
    );
  }
  return value.replace(/\/$/, "");
}

function joinUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${apiBaseUrl()}${normalized}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function messageFromErrorBody(payload: unknown, fallback: string): string {
  if (!isRecord(payload)) {
    return fallback;
  }
  const message = payload.message;
  if (typeof message === "string" && message.trim().length > 0) {
    return message;
  }
  if (Array.isArray(message)) {
    const first = message.find((item) => typeof item === "string");
    if (typeof first === "string" && first.trim().length > 0) {
      return first;
    }
  }
  return fallback;
}

function statusCodeFromErrorBody(payload: unknown, fallback: number): number {
  if (isRecord(payload) && typeof payload.statusCode === "number") {
    return payload.statusCode;
  }
  return fallback;
}

function errorNameFromBody(payload: unknown, fallback: string): string {
  if (isRecord(payload) && typeof payload.error === "string") {
    return payload.error;
  }
  return fallback;
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.trim().length === 0) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError(
      "The server returned an unexpected response.",
      "invalid_response",
      response.status,
      text.slice(0, 300),
    );
  }
}

function unwrapData(payload: unknown, status: number): unknown {
  if (!isRecord(payload) || !("data" in payload)) {
    throw new ApiError(
      "The server returned an unexpected response.",
      "invalid_response",
      status,
      "Missing data envelope",
    );
  }
  return payload.data;
}

function logFailure(path: string, error: ApiError): void {
  console.error(`[Squat API] ${path} ${error.status} ${error.code}: ${error.debug}`);
}

export async function apiRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH";
    body?: unknown;
    parse: (value: unknown) => T;
    notFoundValue?: T;
  },
): Promise<T> {
  const url = joinUrl(path);
  const method = options.method ?? "GET";
  let response: Response;

  try {
    response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(options.body !== undefined
          ? { "Content-Type": "application/json" }
          : {}),
      },
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch (caught: unknown) {
    const debug =
      caught instanceof Error ? caught.message : "Network request failed";
    const error = new ApiError(NETWORK_MESSAGE, "network", 0, debug);
    logFailure(path, error);
    throw error;
  }

  const payload = await readJson(response);

  if (response.status === 404 && options.notFoundValue !== undefined) {
    return options.notFoundValue;
  }

  if (!response.ok) {
    const debug = messageFromErrorBody(payload, response.statusText);
    const status = statusCodeFromErrorBody(payload, response.status);
    const code = errorNameFromBody(payload, "http_error")
      .toLowerCase()
      .replace(/\s+/g, "_");
    const message =
      status === 404
        ? "We couldn't find that workout."
        : status === 400 || status === 409
          ? debug
          : status === 0
            ? NETWORK_MESSAGE
            : method === "PATCH"
              ? "We couldn't save that set. Try again."
              : method === "GET"
                ? "We couldn't load your workout. Try again."
                : "We couldn't complete that request. Try again.";
    const error = new ApiError(message, code, status, debug);
    logFailure(path, error);
    throw error;
  }

  try {
    return options.parse(unwrapData(payload, response.status));
  } catch (caught: unknown) {
    if (caught instanceof ApiError) {
      logFailure(path, caught);
      throw caught;
    }
    const error = new ApiError(
      "The server returned an unexpected response.",
      "invalid_response",
      response.status,
      caught instanceof Error ? caught.message : "Parse failed",
    );
    logFailure(path, error);
    throw error;
  }
}

export function loadFailureCopy(error: Error | null): {
  title: string;
  body: string;
} {
  if (error instanceof ApiError && error.code === "network") {
    return {
      title: "Unable to load your workout.",
      body: "Check your connection and try again.",
    };
  }
  if (error instanceof ApiError && error.status === 404) {
    return {
      title: "Workout not found.",
      body: "We couldn't find that workout. Try again from Home.",
    };
  }
  return {
    title: "Something went wrong.",
    body: "We couldn't load your workout. Try again.",
  };
}
