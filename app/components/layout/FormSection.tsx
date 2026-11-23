import { type ReactNode, useId } from "react";

type FormSectionProps = {
  title: string;
  description: string;
  trailing?: ReactNode;
  children: ReactNode;
};

export function FormSection({
  title,
  description,
  trailing,
  children,
}: FormSectionProps) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className="grid gap-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h4 className="mb-2" id={titleId}>
            {title}
          </h4>
          <p className="text-sm text-secondary-foreground">{description}</p>
        </div>
        {trailing}
      </header>
      {children}
    </section>
  );
}
