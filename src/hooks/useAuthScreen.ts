import { useEffect } from "react";

/**
 * Full-screen auth pages (login) render on a dark background. The global
 * `html { scrollbar-gutter: stable }` reserves a gutter that shows the white
 * app canvas as a strip on the right — looking like an empty scrollbar. While
 * an auth screen is mounted we darken the canvas and release the reserved
 * gutter, then restore both on unmount.
 */
export function useAuthScreen() {
  useEffect(() => {
    document.documentElement.classList.add("auth-screen");
    return () => document.documentElement.classList.remove("auth-screen");
  }, []);
}
