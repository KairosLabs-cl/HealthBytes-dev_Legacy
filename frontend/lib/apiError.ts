/**
 * Centralized API error parser
 * Extracts meaningful error messages from backend responses
 */
export class ApiError extends Error {
  public status: number;
  public detail: unknown;

  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

/**
 * Throws a typed ApiError if the response is not ok.
 * Call after every fetch() in api/*.ts modules.
 */
export async function throwIfNotOk(
  res: Response,
  fallbackMessage: string
): Promise<void> {
  if (res.ok) return;

  let message = fallbackMessage;
  let detail: unknown;

  try {
    const body = await res.json();
    detail = body;

    if (typeof body?.detail === "string") {
      message = body.detail;
    } else if (typeof body?.detail?.message === "string") {
      message = body.detail.message;
    } else if (typeof body?.message === "string") {
      message = body.message;
    } else if (typeof body?.error === "string") {
      message = body.error;
    } else if (res.status) {
      message = `Error ${res.status}`;
    }
  } catch {
    // Response body is not JSON, use fallback
  }

  throw new ApiError(res.status, message, detail);
}
