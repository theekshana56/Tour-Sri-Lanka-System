import { AxiosError } from "axios";

type ApiErrorBody = {
  message?: string;
  error?: string;
  fields?: Record<string, string>;
};

export function getApiErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (err instanceof AxiosError) {
    if (!err.response) {
      return "Cannot reach the server. Check that the backend is running and NEXT_PUBLIC_API_URL is correct.";
    }

    const data = err.response.data as ApiErrorBody | undefined;
    if (data?.message) return data.message;

    if (data?.fields) {
      const first = Object.values(data.fields)[0];
      if (first) return first;
    }

    if (data?.error) return data.error;

    if (err.response.status === 403) {
      return "You do not have permission to perform this action.";
    }
  }

  return fallback;
}
