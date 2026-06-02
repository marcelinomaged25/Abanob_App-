import axios from 'axios';

export function getApiErrorMessage(
  error: unknown,
  fallback = 'حدث خطأ. يرجى المحاولة مرة أخرى.'
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) {
      return data.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
