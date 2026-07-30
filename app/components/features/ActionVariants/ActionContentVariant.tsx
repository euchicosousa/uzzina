import type { ActionVariantRendererProps } from "./types";
import { Content } from "../Content";

export function ActionContentVariant({
  action,
  currentCategory,
  showCategory,
  showResponsibles,
}: ActionVariantRendererProps) {
  return (
    <>
      <Content
        action={action}
        category={showCategory ? currentCategory : undefined}
        isSquared
        showResponsibles={showResponsibles}
      />
      <div className="absolute bottom-0 h-12 w-full rounded-2xl squircle" />
    </>
  );
}
