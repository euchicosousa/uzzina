import { cva } from "class-variance-authority";
import {
  createContext,
  useContext,
  type ComponentProps,
  type Ref,
} from "react";
import {
  Tabs,
  TabsContext,
  TabList,
  Tab,
  TabListStateContext,
  type TabsProps,
  type TabListProps,
  type TabProps,
  type Key,
  type TabListRenderProps,
} from "react-aria-components";
import { useTabPanel } from "react-aria/useTabList";
import { useObjectRef } from "react-aria/useObjectRef";
import { cn } from "~/lib/utils";

export type TabsVariant = "underline" | "drawer";

const TabsVariantContext = createContext<TabsVariant>("underline");

export const tabVariants = cva(
  "relative flex min-w-0 flex-auto cursor-pointer items-center justify-center gap-1.5 px-4 text-center font-medium outline-none transition-colors data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 truncate h-full data-[focus-visible]:bg-input hover:bg-input",
  {
    variants: {
      variant: {
        underline:
          "-mb-px border-b text-muted-foreground transition-colors data-[hovered]:text-foreground data-[pressed]:text-foreground data-[selected]:border-b-primary data-[selected]:text-foreground",
        drawer:
          "border-t-2 border-t-transparent border-x border-x-transparent border-b border-b-border bg-transparent text-muted-foreground transition-colors data-[hovered]:text-foreground data-[selected]:border-t-primary data-[selected]:border-x-border data-[selected]:border-b-transparent data-[selected]:bg-popover data-[selected]:text-foreground data-[focus-visible]:border-t-primary data-[selected]:data-[focus-visible]:bg-input",
      },
    },
    defaultVariants: {
      variant: "underline",
    },
  },
);

export function PrismTabs({
  className,
  variant = "underline",
  ...props
}: Omit<TabsProps, "className"> & {
  className?: string;
  variant?: TabsVariant;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <TabsVariantContext.Provider value={variant}>
      <Tabs
        className={cn("flex min-h-0 flex-col", className)}
        data-slot="tabs"
        data-variant={variant}
        {...props}
      />
    </TabsVariantContext.Provider>
  );
}

export function PrismTabList<T extends object>({
  className,
  ...props
}: Omit<TabListProps<T>, "className"> & {
  className?: string;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <TabList
      className={cn("flex h-10 min-w-0 shrink-0", className)}
      data-slot="tab-list"
      {...props}
    />
  );
}

export function PrismTab({
  className,
  tabIndex,
  variant: propVariant,
  ...props
}: Omit<TabProps, "className" | "render"> & {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  tabIndex?: number;
  variant?: TabsVariant;
}) {
  const contextVariant = useContext(TabsVariantContext);
  const variant = propVariant || contextVariant || "underline";
  return (
    <Tab
      {...props}
      className={cn(tabVariants({ variant }), className)}
      data-slot="tab"
      render={(domProps) => {
        // The action drawer deliberately keeps every view tab in its local Tab
        // sequence. Other callers retain React Aria's single selected-tab stop.
        if ("href" in domProps)
          return <a {...domProps} tabIndex={tabIndex ?? domProps.tabIndex} />;
        return <div {...domProps} tabIndex={tabIndex ?? domProps.tabIndex} />;
      }}
    />
  );
}

interface PrismTabPanelProps extends Omit<ComponentProps<"div">, "id" | "ref"> {
  id: Key;
  ref?: Ref<HTMLDivElement>;
  shouldForceMount?: boolean;
  /** Responsive side-by-side layouts keep both mounted panels interactive. */
  isAlwaysVisible?: boolean;
}

export function PrismTabPanel(props: PrismTabPanelProps) {
  const state = useContext(TabListStateContext);
  // React Aria also visits children while building its tab collection.
  if (!state) return null;
  return <PanelContent {...props} state={state} />;
}

function PanelContent({
  id,
  className,
  children,
  ref: forwardedRef,
  shouldForceMount = false,
  isAlwaysVisible = false,
  state,
  ...props
}: PrismTabPanelProps & { state: TabListRenderProps["state"] }) {
  const ref = useObjectRef(forwardedRef ?? null);
  const { tabPanelProps } = useTabPanel({ id }, state, ref);
  const hidden = !isAlwaysVisible && state.selectedKey !== id;
  if (hidden && !shouldForceMount) return null;
  return (
    <div
      {...tabPanelProps}
      {...props}
      ref={ref}
      role={isAlwaysVisible ? "region" : "tabpanel"}
      aria-labelledby={
        isAlwaysVisible ? undefined : tabPanelProps["aria-labelledby"]
      }
      hidden={hidden}
      inert={hidden}
      data-slot="tab-panel"
      className={cn("min-h-0 outline-none", className, hidden && "hidden")}
    >
      <TabsContext.Provider value={null}>
        <TabListStateContext.Provider value={null}>
          {children}
        </TabListStateContext.Provider>
      </TabsContext.Provider>
    </div>
  );
}
