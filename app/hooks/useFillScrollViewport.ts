import { useLayoutEffect, type RefObject } from "react";

// Sizes the page from its top to the bottom of the nearest scrolling ancestor,
// following window resizes and header wrapping, so that ancestor never scrolls.
export function useFillScrollViewport(ref: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const page = ref.current;
    if (!page) return;

    let viewport = page.parentElement;
    while (
      viewport &&
      !/(auto|scroll)/.test(getComputedStyle(viewport).overflowY)
    ) {
      viewport = viewport.parentElement;
    }
    if (viewport) viewport.scrollTop = 0;
    const resize = () => {
      const bottom = viewport
        ? viewport.getBoundingClientRect().bottom
        : (window.visualViewport?.height ?? window.innerHeight);
      page.style.height = `${Math.max(0, bottom - page.getBoundingClientRect().top)}px`;
    };
    resize();
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(resize);
    if (viewport) observer?.observe(viewport);
    if (page.firstElementChild) observer?.observe(page.firstElementChild);
    window.addEventListener("resize", resize);
    window.visualViewport?.addEventListener("resize", resize);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      window.visualViewport?.removeEventListener("resize", resize);
      page.style.height = "";
    };
  }, [ref]);
}
