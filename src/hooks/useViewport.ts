import { useEffect } from "react";
import { useAppDispatch } from "./redux";
import { setViewport } from "../redux-store/slices/comparisonSlice";

const VIEWPORT_BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 1024,
};

export const useViewport = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < VIEWPORT_BREAKPOINTS.MOBILE) {
        dispatch(setViewport("MOBILE"));
      } else if (width < VIEWPORT_BREAKPOINTS.TABLET) {
        dispatch(setViewport("TABLET"));
      } else {
        dispatch(setViewport("DESKTOP"));
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);
};
