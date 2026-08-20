import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Horizontal scroll container for a TabsList, with a slider underneath showing
 * how much of the strip is visible and where you are in it.
 *
 * The native scrollbar is hidden (it looks wrong under a sticky pill bar), which
 * otherwise leaves no hint that the tabs scroll at all — this restores that
 * affordance. The slider appears only when the content actually overflows, so it
 * shows up on narrow/mobile viewports and stays out of the way on desktop
 * without hard-coding a breakpoint.
 */
export default function ScrollableTabs({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // ratio = visible fraction of the strip (thumb width); offset = how far in.
  const [{ ratio, offset }, setMetrics] = useState({ ratio: 1, offset: 0 });

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollWidth, clientWidth, scrollLeft } = el;
    if (scrollWidth <= clientWidth || scrollWidth === 0) {
      setMetrics({ ratio: 1, offset: 0 });
      return;
    }
    setMetrics({
      ratio: clientWidth / scrollWidth,
      offset: scrollLeft / scrollWidth,
    });
  }, []);

  useEffect(() => {
    measure();

    const el = scrollRef.current;
    if (!el) return;

    // Watch the container (viewport resize) and its content (tab count or
    // label changes) — either can flip whether the strip overflows.
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);

    return () => observer.disconnect();
  }, [measure]);

  const isScrollable = ratio < 1;

  return (
    <div>
      <div
        ref={scrollRef}
        onScroll={measure}
        className={cn(
          "overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          className,
        )}
      >
        {children}
      </div>

      {isScrollable && (
        <div
          aria-hidden='true'
          className='mx-auto mt-1.5 h-1 w-24 overflow-hidden rounded-full bg-gray-200'
        >
          <div
            className='h-full rounded-full bg-gray-400'
            style={{
              width: `${ratio * 100}%`,
              // translateX is a percentage of the thumb's own width, so the
              // track-relative offset has to be divided by the thumb's ratio.
              transform: `translateX(${(offset / ratio) * 100}%)`,
            }}
          />
        </div>
      )}
    </div>
  );
}
