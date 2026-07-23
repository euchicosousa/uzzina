import {
  ColorSlider as ColorSliderPrimitive,
  SliderTrack as SliderTrackPrimitive,
  ColorThumb as ColorThumbPrimitive,
  type ColorSliderProps as ColorSliderPrimitiveProps,
  type ColorChannel,
} from "react-aria-components";
import { cn } from "~/lib/utils";
export interface PrismColorSliderProps extends Omit<
  ColorSliderPrimitiveProps,
  "className" | "channel"
> {
  className?: string;
  trackClassName?: string;
  thumbClassName?: string;
  channel?: ColorChannel;
}
function PrismColorSlider({
  className,
  trackClassName,
  thumbClassName,
  channel = "hue",
  colorSpace = "hsb",
  defaultValue = "#3b82f6",
  ...props
}: PrismColorSliderProps) {
  return (
    <ColorSliderPrimitive
      channel={channel}
      className={cn("w-full flex items-center", className)}
      colorSpace={colorSpace}
      data-slot="color-slider"
      defaultValue={props.value ? undefined : defaultValue}
      {...props}
    >
      <SliderTrackPrimitive
        className={cn(
          "relative h-2 w-full rounded-full cursor-pointer",
          trackClassName,
        )}
        style={({ defaultStyle, isDisabled }) => ({
          ...defaultStyle,
          background: isDisabled
            ? undefined
            : `${defaultStyle.background}, repeating-conic-gradient(#CCC 0% 25%, white 0% 50%) 50% / 16px 16px`,
        })}
      >
        <ColorThumbPrimitive
          className={cn(
            "top-[50%] size-4 rounded-full border-2 border-white shadow-md shadow-black/40 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 data-dragging:scale-125 transition-transform box-border",
            thumbClassName,
          )}
        />
      </SliderTrackPrimitive>
    </ColorSliderPrimitive>
  );
}
export { PrismColorSlider };
