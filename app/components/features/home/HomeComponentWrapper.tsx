import type { ReactNode } from "react";

export function HomeComponentWrapper({
  children,
  title,
  OptionsComponent,
}: {
  children: ReactNode;
  OptionsComponent?: ReactNode;
  title: string | ReactNode;
}) {
  return (
    <div>
      <div className="flex flex-col justify-between gap-8 p-8 lg:flex-row lg:items-center xl:px-16">
        <h1 className="py-12 text-5xl font-semibold">{title}</h1>
        {/* <div className="bg-foreground hidden h-0.5 w-full lg:block"></div> */}
        {OptionsComponent && (
          <div className="self-end lg:self-auto">{OptionsComponent}</div>
        )}
      </div>
      {children}
    </div>
  );
}
