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
        "relative h-36 w-full shrink-0 rounded-2xl squircle overflow-hidden  cursor-crosshair",
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
          "size-4 rounded-full border-2 border-white shadow-md shadow-black/40 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 data-ddragging:scale-125 transition-transform box-border",
          thumbClassName,
        )}
      />
    </ColorAreaPrimitive>
  );
}
export { PrismColorArea };
