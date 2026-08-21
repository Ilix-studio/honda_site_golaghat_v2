/**
 * Pull a human-readable message out of an RTK Query error without reaching for
 * `any`. The shape varies: fetchBaseQuery surfaces the parsed response body on
 * `.data`, while thrown/serialized errors carry `.message` instead.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === "object" && data !== null) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string" && message.trim()) return message;
    }

    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}
