import { useState, useEffect } from "react";
const MOBILE_BREAKPOINT = 768;
/**
 * Hook to determine if the current viewport width is considered mobile.
 *
 * Returns `true` when the viewport width is less than {@link MOBILE_BREAKPOINT}px.
 * The hook is SSR‑safe: it returns `false` during server rendering and only
 * attaches listeners on the client side.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    // Guard against server‑side rendering where `window` is undefined.
    if (typeof window === "undefined") {
      return;
    }
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    // Initial state
    setIsMobile(mediaQuery.matches);
    // Event handler for media query changes
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };
    // Attach listener
    mediaQuery.addEventListener("change", handleChange);
    // Cleanup on unmount
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);
  return isMobile;
}