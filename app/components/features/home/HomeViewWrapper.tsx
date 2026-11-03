import type { ReactNode } from "react";
import { cn } from "cnfast";
export function HomeViewWrapper({
  children,
  title,
  OptionsComponent,
  borderAfter = true,
  compactMobile = false,
}: {
  children: ReactNode;
  OptionsComponent?: ReactNode;
  title: string | ReactNode;
  borderAfter?: boolean;
  compactMobile?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative border-x",
        "mx-2 py-8 lg:mx-8",
        borderAfter && "border_after",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-2 px-3 pb-4 lg:gap-8 lg:px-8 lg:pb-8",
        )}
      >
        <h1 className={cn("font-medium", "min-w-0 text-3xl lg:text-5xl")}>
          {title}
        </h1>
        {OptionsComponent && (
          <div
            className={cn(
              "self-end lg:self-auto",
              compactMobile && "max-w-full",
            )}
          >
            {OptionsComponent}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
