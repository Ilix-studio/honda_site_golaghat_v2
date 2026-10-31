import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

interface RevealOnScrollProps {
  children: ReactNode;
  /** Space held open until the section mounts, so the page doesn't jump. */
  minHeight?: number;
  /** Pixels before the viewport edge at which the section starts loading. */
  preload?: number;
}

/**
 * Mounts its children only once they are about to scroll into view, then fades
 * them up. Because the children don't exist until then, their data fetches
 * (reviews, bikes, visitor count...) don't fire for visitors — or bots — that
 * never scroll that far.
 */
export function RevealOnScroll({
  children,
  minHeight = 320,
  preload = 200,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    once: true,
    margin: `0px 0px ${preload}px 0px`,
  });
  const reduceMotion = useReducedMotion();

  return (
    <div ref={ref} style={inView ? undefined : { minHeight }}>
      {inView && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}
