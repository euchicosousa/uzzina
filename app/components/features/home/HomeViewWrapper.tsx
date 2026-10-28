import { useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "cnfast";
export function HomeViewWrapper({
  children,
  title,
  OptionsComponent,
  borderAfter = true,
  fillViewport = false,
}: {
  children: ReactNode;
  OptionsComponent?: ReactNode;
  title: string | ReactNode;
  borderAfter?: boolean;
  fillViewport?: boolean;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!fillViewport || !section) return;

    let viewport = section.parentElement;
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
      section.style.height = `${Math.max(0, bottom - section.getBoundingClientRect().top)}px`;
    };
    resize();
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(resize);
    if (viewport) observer?.observe(viewport);
    if (section.firstElementChild) observer?.observe(section.firstElementChild);
    window.addEventListener("resize", resize);
    window.visualViewport?.addEventListener("resize", resize);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      window.visualViewport?.removeEventListener("resize", resize);
      section.style.height = "";
    };
  }, [fillViewport]);
  return (
    <div
      ref={sectionRef}
      className={cn(
        "relative mx-4 border-x lg:mx-8",
        fillViewport
          ? "flex min-h-0 flex-col overflow-hidden pb-(--app-bar-space)"
          : "pb-12",
        borderAfter && "border_after",
      )}
    >
      <div
        className={cn(
          "flex flex-col justify-between px-8 lg:flex-row lg:items-center xl:px-16",
          fillViewport ? "shrink-0 gap-2" : "gap-8",
        )}
      >
        <h1
          className={cn(
            "font-semibold",
            fillViewport
              ? "py-4 text-3xl lg:py-12 lg:text-5xl"
              : "py-12 text-5xl",
          )}
        >
          {title}
        </h1>
        {OptionsComponent && (
          <div className="self-end lg:self-auto">{OptionsComponent}</div>
        )}
      </div>
      {children}
    </div>
  );
}
