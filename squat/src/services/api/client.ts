export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code = "unknown", status = 500) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export const notFound = (entity: string, id: string): ApiError =>
  new ApiError(`${entity} ${id} was not found.`, "not_found", 404);
