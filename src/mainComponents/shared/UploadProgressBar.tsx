import { formatEta, type UploadProgress } from "@/lib/uploadWithProgress";

export interface UploadProgressBarProps {
  progress: UploadProgress | null;
  label: string;
}

/**
 * Percent + ETA bar for uploads driven by `uploadWithProgress` (see
 * `@/lib/uploadWithProgress` — RTK Query's fetchBaseQuery can't expose
 * upload progress events, so any upload that wants a real progress bar
 * bypasses it via XHR and renders this).
 */
export default function UploadProgressBar({
  progress,
  label,
}: UploadProgressBarProps) {
  const percent = progress?.percent ?? 0;
  return (
    <div className='space-y-1.5'>
      <div className='flex items-center justify-between text-xs text-gray-500'>
        <span>
          {label}... {percent}%
        </span>
        <span>{formatEta(progress?.etaSeconds ?? null)}</span>
      </div>
      <div className='h-2 w-full rounded-full bg-gray-100 overflow-hidden'>
        <div
          className='h-full bg-blue-600 transition-[width] duration-200'
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
