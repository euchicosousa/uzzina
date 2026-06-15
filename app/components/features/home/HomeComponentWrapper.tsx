import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

export function HomeComponentWrapper({
  children,
  title,
  OptionsComponent,
  borderAfter = true,
}: {
  children: ReactNode;
  OptionsComponent?: ReactNode;
  title: string | ReactNode;
  borderAfter?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative mx-4 border-x pb-12 lg:mx-8",
        borderAfter && "border_after",
      )}
    >
      <div className="flex flex-col justify-between gap-8 px-8 lg:flex-row lg:items-center xl:px-16">
        <h1 className="py-12 text-5xl font-semibold">{title}</h1>
        {OptionsComponent && (
          <div className="self-end lg:self-auto">{OptionsComponent}</div>
        )}
      </div>
      {children}
    </div>
  );
}
