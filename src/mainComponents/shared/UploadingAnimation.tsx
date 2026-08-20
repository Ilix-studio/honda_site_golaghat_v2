import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import circleLoadingSrc from "@/assets/uploadAnimations/CircleLoading.webm";
import settingSrc from "@/assets/uploadAnimations/Setting.webm";
import doneSrc from "@/assets/uploadAnimations/Done.webm";

/** Mirrors the shape every upload form's local loading state already takes (or is trivially mapped to). */
export type UploadAnimationStatus = "idle" | "uploading" | "success" | "error";

type Phase = "hidden" | "uploading" | "processing" | "done";

const UPLOADING_MIN_MS = 4000;
const DONE_MS = 2000;

const PHASE_COPY: Record<Exclude<Phase, "hidden">, string> = {
  uploading: "Uploading...",
  processing: "Processing...",
  done: "Done!",
};

/** Resize-tracked viewport size, just enough for react-confetti's required width/height props. */
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    const onResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
}

export interface UploadingAnimationProps {
  status: UploadAnimationStatus;
  /** Fires once the Done stage's 2s window elapses — reset your own status to "idle" here. */
  onComplete: () => void;
}

/**
 * Reusable 3-stage upload overlay: CircleLoading.webm for a fixed 4s, then
 * Setting.webm looped until the real request resolves, then Done.webm +
 * confetti for a fixed 2s. On error the overlay is dismissed immediately —
 * callers are expected to already have their own error UI ready to show.
 */
export default function UploadingAnimation({
  status,
  onComplete,
}: UploadingAnimationProps) {
  const [phase, setPhase] = useState<Phase>("hidden");
  const resolvedRef = useRef(false);
  const uploadingTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const doneTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (status === "uploading") {
      resolvedRef.current = false;
      setPhase("uploading");
      uploadingTimerRef.current = setTimeout(() => {
        setPhase(resolvedRef.current ? "done" : "processing");
      }, UPLOADING_MIN_MS);
      return;
    }

    if (status === "success") {
      resolvedRef.current = true;
      // Only the "processing" phase can move straight to "done" here — the
      // mandatory 4s "uploading" phase handles a same-tick resolution itself
      // once its timer fires.
      setPhase((prev) => (prev === "processing" ? "done" : prev));
      return;
    }

    if (status === "error") {
      clearTimeout(uploadingTimerRef.current);
      clearTimeout(doneTimerRef.current);
      setPhase("hidden");
    }
  }, [status]);

  useEffect(() => {
    if (phase !== "done") return;
    doneTimerRef.current = setTimeout(() => {
      setPhase("hidden");
      onComplete();
    }, DONE_MS);
    return () => clearTimeout(doneTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    return () => {
      clearTimeout(uploadingTimerRef.current);
      clearTimeout(doneTimerRef.current);
    };
  }, []);

  if (phase === "hidden") return null;

  const videoSrc =
    phase === "uploading"
      ? circleLoadingSrc
      : phase === "processing"
        ? settingSrc
        : doneSrc;

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="flex flex-col items-center justify-center gap-4 border-none bg-transparent p-8 shadow-none sm:max-w-md [&>button]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">{PHASE_COPY[phase]}</DialogTitle>
        <DialogDescription className="sr-only">
          Upload in progress
        </DialogDescription>
        {phase === "done" && (
          <Confetti
            width={width}
            height={height}
            numberOfPieces={250}
            recycle={false}
            className="!fixed !inset-0 !z-[60]"
          />
        )}
        <video
          key={videoSrc}
          src={videoSrc}
          autoPlay
          loop={phase !== "done"}
          muted
          playsInline
          className="h-40 w-40 rounded-lg bg-white object-contain shadow-lg"
        />
        <p className="text-sm font-medium text-white drop-shadow">
          {PHASE_COPY[phase]}
        </p>
      </DialogContent>
    </Dialog>
  );
}
