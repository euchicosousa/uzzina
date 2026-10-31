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
        compactMobile ? "mx-2 pb-6 lg:mx-8 lg:pb-12" : "mx-4 pb-12 lg:mx-8",
        borderAfter && "border_after",
      )}
    >
      <div
        className={
          compactMobile
            ? "flex min-w-0 flex-col justify-between gap-2 px-3 lg:flex-row lg:items-center lg:gap-8 lg:px-8 xl:px-16"
            : "flex flex-col justify-between gap-8 px-8 lg:flex-row lg:items-center xl:px-16"
        }
      >
        <h1
          className={cn(
            "font-semibold",
            compactMobile
              ? "min-w-0 py-4 text-3xl lg:py-12 lg:text-5xl"
              : "py-12 text-5xl",
          )}
        >
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
