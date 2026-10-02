import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import { CELEBRATE_EVENT } from "@/lib/celebrate";

const CONFETTI_MS = 4000;

/** Listens for `celebrate()` and rains confetti over the whole viewport. Mount once at the app root. */
export default function ConfettiHost() {
  const [active, setActive] = useState(false);
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const onCelebrate = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
      setActive(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setActive(false), CONFETTI_MS);
    };
    window.addEventListener(CELEBRATE_EVENT, onCelebrate);
    return () => {
      window.removeEventListener(CELEBRATE_EVENT, onCelebrate);
      clearTimeout(timerRef.current);
    };
  }, []);

  if (!active) return null;
  return (
    <Confetti
      width={size.width}
      height={size.height}
      numberOfPieces={250}
      recycle={false}
      className="!fixed !inset-0 !z-[100] pointer-events-none"
    />
  );
}
