import { useLayoutEffect, useState, type RefObject } from "react";
import { readVisibleViewport } from "~/hooks/useVisibleViewport";

// Smallest writing region kept below the column's controls (about four lines
// plus the compact editor toolbar). Larger values would push the text behind
// the iOS keyboard in landscape.
export const MIN_WRITING_HEIGHT = 144;

// A panel whose writing scroll area is shorter than this cannot show the
// regular layout's controls (4:5 preview, wrapping toolbar, 320px minimum
// column) together with a usable writing region; phones in landscape land at
// roughly 150–250px, tablets and desktop windows well above it. Leaving the
// short layout needs a clearly taller area, so small resizes near the limit
// do not switch layouts back and forth.
export const SHORT_PANEL_ENTER_HEIGHT = 480;
export const SHORT_PANEL_EXIT_HEIGHT = 560;
// From @[47rem]/action the tab places media beside the text (desktop layout);
// short desktop windows keep that container-query layout.
export const SIDE_BY_SIDE_MIN_WIDTH = 752;

/**
 * True when a panel that is not phone-width is still too short for the regular
 * writing layout (a landscape phone: the panel is 672px wide). It measures
 * the actual scroll area inside the drawer, whose bounds already follow the
 * visible viewport, including the software keyboard. Hysteresis keeps small
 * height changes near the threshold from repeatedly changing the toolbar.
 */
export function useShortWritingPanel(
  scrollerRef: RefObject<HTMLElement | null>,
) {
  const [short, setShort] = useState(false);
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const measure = () => {
      const { width, height } = scroller.getBoundingClientRect();
      // A hidden panel reports zero; keep its last real layout until shown.
      if (width <= 0 || height <= 0) return;
      setShort(
        (previous) =>
          width < SIDE_BY_SIDE_MIN_WIDTH &&
          height <
            (previous ? SHORT_PANEL_EXIT_HEIGHT : SHORT_PANEL_ENTER_HEIGHT),
      );
    };
    measure();
    window.addEventListener("resize", measure);
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    observer?.observe(scroller);
    return () => {
      window.removeEventListener("resize", measure);
      observer?.disconnect();
    };
  }, [scrollerRef]);
  return short;
}

/**
 * Sizes the Instagram writing column when the writing layout is active: the
 * part of the tab's scroll area that is actually visible (iOS keeps the layout
 * viewport when the keyboard opens, so the visual viewport is intersected),
 * never less than the column's own controls plus a minimal writing region.
 * Media above the column scrolls away within the same scroll area.
 *
 * Because the scroll area itself still extends under the keyboard,
 * `keyboardInset` is the height of that hidden part: a trailing spacer of that
 * size lets the column scroll fully into the visible area. The spacer changes
 * only the scrolled content, never the scroll area's box, so it does not feed
 * back into the measurement.
 *
 * The column's controls are marked with `data-writing-controls`; `height` is
 * null when disabled or before a real measurement is available.
 */
export function useWritingAreaHeight({
  enabled,
  scrollerRef,
  columnRef,
  layoutKey,
}: {
  enabled: boolean;
  scrollerRef: RefObject<HTMLElement | null>;
  columnRef: RefObject<HTMLElement | null>;
  /** Changes whenever the column's controls are replaced (sub-tab, AI state). */
  layoutKey: string;
}) {
  const [size, setSize] = useState<{
    height: number | null;
    keyboardInset: number;
  }>({ height: null, keyboardInset: 0 });
  // biome-ignore lint/correctness/useExhaustiveDependencies: layoutKey re-observes controls replaced by a sub-tab or AI state change.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const column = columnRef.current;
    if (!enabled || !scroller || !column) {
      setSize((previous) =>
        previous.height === null && previous.keyboardInset === 0
          ? previous
          : { height: null, keyboardInset: 0 },
      );
      return;
    }
    let visible = readVisibleViewport();
    const measure = () => {
      visible = readVisibleViewport(visible);
      const area = scroller.getBoundingClientRect();
      const visibleBottom = visible.top + visible.height;
      const usable =
        Math.min(area.bottom, visibleBottom) - Math.max(area.top, visible.top);
      // A hidden or not yet laid out panel reports no area; keep the last size.
      if (area.height <= 0 || usable <= 0) return;
      let controlsBottom = 0;
      const columnTop = column.getBoundingClientRect().top;
      for (const controls of column.querySelectorAll(
        "[data-writing-controls]",
      )) {
        controlsBottom = Math.max(
          controlsBottom,
          controls.getBoundingClientRect().bottom - columnTop,
        );
      }
      const height = Math.round(
        Math.max(usable, controlsBottom + MIN_WRITING_HEIGHT),
      );
      const keyboardInset = Math.round(
        Math.max(0, area.bottom - visibleBottom),
      );
      setSize((previous) =>
        previous.height === height && previous.keyboardInset === keyboardInset
          ? previous
          : { height, keyboardInset },
      );
    };
    measure();
    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", measure);
    viewport?.addEventListener("scroll", measure);
    window.addEventListener("resize", measure);
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    observer?.observe(scroller);
    for (const controls of column.querySelectorAll("[data-writing-controls]"))
      observer?.observe(controls);
    return () => {
      viewport?.removeEventListener("resize", measure);
      viewport?.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      observer?.disconnect();
    };
  }, [enabled, scrollerRef, columnRef, layoutKey]);
  return size;
}
