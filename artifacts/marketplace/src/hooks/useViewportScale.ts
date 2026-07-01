import { useEffect } from "react";

const DESIGN_WIDTH = 1440;
const DESKTOP_MIN = 768; // below this px, native responsive layout is used (mobile)

export function useViewportScale() {
  useEffect(() => {
    function apply() {
      const vw = window.innerWidth;
      if (vw >= DESKTOP_MIN) {
        // Desktop / tablet-landscape: proportional zoom so the 1440 px
        // design scales down like a vector graphic without layout reflow.
        const zoom = Math.min(1, vw / DESIGN_WIDTH);
        document.documentElement.style.zoom = String(zoom);
        document.body.style.minWidth = `${DESIGN_WIDTH}px`;
      } else {
        // Mobile: disable zoom + min-width so native responsive CSS applies.
        document.documentElement.style.zoom = "";
        document.body.style.minWidth = "";
      }
    }

    apply();
    window.addEventListener("resize", apply, { passive: true });
    return () => window.removeEventListener("resize", apply);
  }, []);
}
