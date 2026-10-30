import { useLayoutEffect, type RefObject } from "react";
import { usePreventScroll } from "react-aria/usePreventScroll";

/** Keep the app's independent scroll area still for the entire editing session. */
export function useActionDrawerScrollLock(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
) {
  // React Aria shares this lock with nested modal/popover overlays and handles
  // Safari touch boundaries, text selection and pinch zoom.
  usePreventScroll({ isDisabled: !active });
  useLayoutEffect(() => {
    const scroller = ref.current;
    if (!active || !scroller) return;
    const { scrollTop, scrollLeft } = scroller;
    const properties = ["overflow-x", "overflow-y"] as const;
    const styles = properties.map((property) => ({
      property,
      value: scroller.style.getPropertyValue(property),
      priority: scroller.style.getPropertyPriority(property),
    }));
    for (const property of properties)
      scroller.style.setProperty(property, "hidden");
    return () => {
      for (const { property, value, priority } of styles)
        scroller.style.setProperty(property, value, priority);
      scroller.scrollTop = scrollTop;
      scroller.scrollLeft = scrollLeft;
    };
  }, [active, ref]);
}
