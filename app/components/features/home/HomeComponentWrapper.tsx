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
    <div className="border_after relative mx-8 border-x pb-12">
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
