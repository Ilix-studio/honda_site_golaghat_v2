import { API_CONFIG } from "./apiConfig";

export interface UploadProgress {
  loaded: number;
  total: number;
  /** 0-100, rounded */
  percent: number;
  /** Estimated seconds remaining, or null until enough data has streamed to estimate. */
  etaSeconds: number | null;
}

export interface UploadWithProgressError {
  status: number | "FETCH_ERROR" | "PARSE_ERROR";
  data: { message?: string };
}

/**
 * Raw XHR upload (not RTK Query — fetchBaseQuery/fetch() don't expose
 * upload progress events in a cross-browser way) so the UI can show a real
 * percent + time-remaining while a file is uploading. Callers are
 * responsible for any cache invalidation RTK Query would otherwise have
 * done via `invalidatesTags`.
 */
export function uploadWithProgress<T>(
  path: string,
  formData: FormData,
  token: string | null | undefined,
  onProgress: (p: UploadProgress) => void,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const startedAt = Date.now();

    xhr.open("POST", `${API_CONFIG.BASE_URL}${path}`);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const elapsedSeconds = (Date.now() - startedAt) / 1000;
      const speed = elapsedSeconds > 0 ? e.loaded / elapsedSeconds : 0;
      const remainingBytes = e.total - e.loaded;
      onProgress({
        loaded: e.loaded,
        total: e.total,
        percent: Math.round((e.loaded / e.total) * 100),
        etaSeconds: speed > 0 ? remainingBytes / speed : null,
      });
    };

    xhr.onload = () => {
      let data: unknown;
      try {
        data = xhr.responseText ? JSON.parse(xhr.responseText) : {};
      } catch {
        reject({
          status: "PARSE_ERROR",
          data: { message: "Invalid server response" },
        } satisfies UploadWithProgressError);
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data as T);
      } else {
        reject({
          status: xhr.status,
          data: data as { message?: string },
        } satisfies UploadWithProgressError);
      }
    };

    xhr.onerror = () => {
      reject({
        status: "FETCH_ERROR",
        data: { message: "Network error. Please check your connection and try again." },
      } satisfies UploadWithProgressError);
    };

    xhr.send(formData);
  });
}

export function formatEta(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return "estimating...";
  if (seconds < 1) return "almost done";
  if (seconds < 60) return `~${Math.ceil(seconds)}s remaining`;
  const minutes = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `~${minutes}m ${secs}s remaining`;
}
