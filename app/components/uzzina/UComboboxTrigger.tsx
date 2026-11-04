import {
  Button as ButtonPrimitive,
  type ButtonProps,
} from "react-aria-components";
import { cn } from "cnfast";
import { buttonVariants } from "../prism/button";
import type { VariantProps } from "class-variance-authority";

type ButtonStyleProps = VariantProps<typeof buttonVariants>;

export interface UComboboxTriggerProps extends Omit<ButtonProps, "className"> {
  /** Prism button variant. Default: ghost. */
  variant?: ButtonStyleProps["variant"];
  /** Prism button size. Default: sm. Use icon-* sizes for icon-only triggers. */
  size?: ButtonStyleProps["size"];
  className?: string;
  tabIndex?: number;
  title?: string;
  disabled?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}
type TriggerSize = UComboboxTriggerProps["size"];

/** Avatar size for a trigger: sm buttons use xs, default uses sm, lg uses md. */
export function getTriggerAvatarSize(size: TriggerSize) {
  return size === "xs" ||
    size === "sm" ||
    size === "icon-sm" ||
    size === "icon-xs"
    ? ("xs" as const)
    : size === "lg" || size === "icon-lg"
      ? ("md" as const)
      : ("sm" as const);
}

/** Size class for swatches, dots and icons, matching the button icon size (xs 12px, sm 16px, default/lg 20px). */
export function getTriggerContentSizeClass(size: TriggerSize) {
  return size === "xs"
    ? "size-3"
    : size === "sm" || size === "icon-sm" || size === "icon-xs"
      ? "size-4"
      : "size-5";
}

/** PhaseIcon size matching the button icon size. */
export function getTriggerPhaseIconSize(size: TriggerSize) {
  return size === "xs"
    ? ("xs" as const)
    : size === "sm" || size === "icon-sm" || size === "icon-xs"
      ? ("sm" as const)
      : ("md" as const);
}

/** Left padding that balances an avatar at the start of a text trigger. */
export function getTriggerAvatarPadding(size: TriggerSize) {
  return size === "xs"
    ? "pl-2"
    : size === "sm"
      ? "pl-3"
      : size === "default" || size === "lg"
        ? "pl-4"
        : undefined;
}

/** Thin wrapper over the Prism button style: pointer cursor, type=button and `disabled` alias. */
export function UComboboxTrigger({
  variant = "ghost",
  size = "sm",
  className,
  children,
  type = "button",
  disabled,
  isDisabled,
  ...props
}: UComboboxTriggerProps) {
  return (
    <ButtonPrimitive
      className={cn(
        "cursor-pointer",
        buttonVariants({ variant, size }),
        className,
        size === "icon-xs" ? "w-auto min-w-6 px-1" : "",
        size === "icon-sm" ? "w-auto min-w-8 px-2" : "",
        size === "icon" ? "w-auto min-w-10 px-2" : "",
        size === "icon-lg" ? "w-auto min-w-12 px-2" : "",
      )}
      isDisabled={disabled || isDisabled}
      type={type}
      {...props}
    >
      {children}
    </ButtonPrimitive>
  );
}
