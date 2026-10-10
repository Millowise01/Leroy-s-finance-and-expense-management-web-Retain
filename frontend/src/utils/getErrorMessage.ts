import axios from "axios";

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
