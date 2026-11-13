import { type ReactNode, useId } from "react";
import {
  PrismCheckbox,
  PrismInput,
  PrismSelect,
  PrismSelectContent,
  PrismSelectItem,
  PrismSelectTrigger,
  PrismSelectValue,
  PrismSlider,
  PrismSliderFill,
  PrismSliderOutput,
  PrismSliderThumb,
  PrismSliderTrack,
  PrismToggleGroup,
  PrismToggleGroupItem,
} from "~/components/prism";
import { cn } from "~/lib/utils";

export interface PropsPlaygroundProps {
  /** Component name; also names the controls group for assistive tech. */
  title: string;
  /** The single live instance, rendered with the current control values. */
  preview: ReactNode;
  /** Optional monospace caption under the preview (current values, measured sizes). */
  caption?: ReactNode;
  /** Playground* controls, one per prop, in display order. */
  children: ReactNode;
  /** Extra classes for the preview area (e.g. a taller min-height). */
  previewClassName?: string;
}

export function PropsPlayground({
  title,
  preview,
  caption,
  children,
  previewClassName,
}: PropsPlaygroundProps) {
  return (
    <div className="grid w-full min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex min-w-0 flex-col gap-3">
        <div
          className={cn(
            "flex min-h-40 min-w-0 items-center justify-center overflow-x-auto py-6",
            previewClassName,
          )}
        >
          {preview}
        </div>
        {caption && (
          <p className="text-center font-mono text-xs text-secondary-foreground">
            {caption}
          </p>
        )}
      </div>
      <div
        aria-label={`Propriedades de ${title}`}
        className="flex min-w-0 flex-col gap-5 border-t pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8"
        role="group"
      >
        {children}
      </div>
    </div>
  );
}

function ControlLabel({
  id,
  label,
  prop,
}: {
  id?: string;
  label: string;
  prop: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2" id={id}>
      <span className="text-sm font-medium">{label}</span>
      <span className="font-mono text-xs text-secondary-foreground">
        {prop}
      </span>
    </div>
  );
}

interface PlaygroundOptionsProps<O extends string> {
  label: string;
  prop: string;
  value: O;
  options: readonly O[];
  onChange: (value: O) => void;
  optionLabels?: Partial<Record<O, string>>;
  isDisabled?: boolean;
}

export function PlaygroundSelect<O extends string>({
  label,
  prop,
  value,
  options,
  onChange,
  optionLabels,
  isDisabled,
}: PlaygroundOptionsProps<O>) {
  const labelId = useId();
  return (
    <div className="flex flex-col gap-2">
      <ControlLabel id={labelId} label={label} prop={prop} />
      <PrismSelect
        aria-labelledby={labelId}
        className="w-full"
        isDisabled={isDisabled}
        onSelectionChange={(key) => {
          const match = options.find((option) => option === key);
          if (match !== undefined) onChange(match);
        }}
        selectedKey={value}
      >
        <PrismSelectTrigger size="sm">
          <PrismSelectValue />
        </PrismSelectTrigger>
        <PrismSelectContent>
          {options.map((option) => (
            <PrismSelectItem
              id={option}
              key={option}
              textValue={optionLabels?.[option] ?? option}
            >
              {optionLabels?.[option] ?? (
                <span className="font-mono">{option}</span>
              )}
            </PrismSelectItem>
          ))}
        </PrismSelectContent>
      </PrismSelect>
    </div>
  );
}

export function PlaygroundRadio<O extends string>({
  label,
  prop,
  value,
  options,
  onChange,
  optionLabels,
  isDisabled,
}: PlaygroundOptionsProps<O>) {
  const labelId = useId();
  return (
    <div className="flex flex-col gap-2">
      <ControlLabel id={labelId} label={label} prop={prop} />
      <PrismToggleGroup
        aria-labelledby={labelId}
        disallowEmptySelection
        isDisabled={isDisabled}
        onSelectionChange={(keys) => {
          for (const key of keys) {
            const match = options.find((option) => option === key);
            if (match !== undefined) onChange(match);
          }
        }}
        selectedKeys={[value]}
        selectionMode="single"
        size="sm"
        variant="outline"
      >
        {options.map((option) => {
          const displayLabel = optionLabels?.[option] ?? option;
          return (
            <PrismToggleGroupItem
              className="min-w-0 shrink"
              id={option}
              key={option}
            >
              <span className="truncate font-mono" title={displayLabel}>
                {displayLabel}
              </span>
            </PrismToggleGroupItem>
          );
        })}
      </PrismToggleGroup>
    </div>
  );
}

export function PlaygroundBoolean({
  label,
  prop,
  value,
  onChange,
  isDisabled,
}: {
  label: string;
  prop: string;
  value: boolean;
  onChange: (value: boolean) => void;
  isDisabled?: boolean;
}) {
  return (
    <PrismCheckbox
      className="w-full"
      isDisabled={isDisabled}
      isSelected={value}
      onChange={onChange}
    >
      <span className="flex flex-1 items-baseline justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="font-mono text-xs font-normal text-secondary-foreground">
          {prop}
        </span>
      </span>
    </PrismCheckbox>
  );
}

export function PlaygroundNumber({
  label,
  prop,
  value,
  onChange,
  min,
  max,
  step = 1,
  isDisabled,
}: {
  label: string;
  prop: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  isDisabled?: boolean;
}) {
  const labelId = useId();
  return (
    <PrismSlider
      aria-labelledby={labelId}
      isDisabled={isDisabled}
      maxValue={max}
      minValue={min}
      onChange={onChange}
      step={step}
      value={value}
    >
      <ControlLabel id={labelId} label={label} prop={prop} />
      <div className="flex items-center gap-3">
        <PrismSliderTrack className="flex-1">
          <PrismSliderFill />
          <PrismSliderThumb />
        </PrismSliderTrack>
        <PrismSliderOutput className="w-8 text-right font-mono text-xs" />
      </div>
    </PrismSlider>
  );
}

export function PlaygroundText({
  label,
  prop,
  value,
  onChange,
  placeholder,
  isDisabled,
}: {
  label: string;
  prop: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
}) {
  const labelId = useId();
  return (
    <div className="flex flex-col gap-2">
      <ControlLabel id={labelId} label={label} prop={prop} />
      <PrismInput
        aria-labelledby={labelId}
        disabled={isDisabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        size="sm"
        value={value}
      />
    </div>
  );
}
