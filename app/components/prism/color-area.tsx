import {
  ColorArea as ColorAreaPrimitive,
  ColorThumb as ColorThumbPrimitive,
  type ColorAreaProps as ColorAreaPrimitiveProps,
} from "react-aria-components";
import { cn } from "cnfast";
export interface PrismColorAreaProps extends Omit<
  ColorAreaPrimitiveProps,
  "className"
> {
  className?: string;
  thumbClassName?: string;
}
function PrismColorArea({
  className,
  thumbClassName,
  colorSpace = "hsb",
  xChannel = "saturation",
  yChannel = "brightness",
  defaultValue = "#3b82f6",
  ...props
}: PrismColorAreaProps) {
  return (
    <ColorAreaPrimitive
      className={cn(
        "relative h-36 w-full shrink-0 cursor-crosshair overflow-hidden rounded-2xl squircle",
        className,
      )}
      colorSpace={colorSpace}
      data-slot="color-area"
      defaultValue={props.value ? undefined : defaultValue}
      xChannel={xChannel}
      yChannel={yChannel}
      {...props}
    >
      <ColorThumbPrimitive
        className={cn(
          "box-border size-4 rounded-full border-2 border-white shadow-md transition-transform outline-none data-dragging:scale-125 data-[focus-visible]:ring-3 data-[focus-visible]:ring-ring/30",
          thumbClassName,
        )}
      />
    </ColorAreaPrimitive>
  );
}
export { PrismColorArea };
