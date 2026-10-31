import { cva } from "class-variance-authority";
import { useContext, type ComponentProps, type Ref } from "react";
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

const tabVariants = cva(
  "relative flex min-h-11 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 border-t-2 border-t-transparent px-3 py-2 text-center text-sm font-medium text-muted-foreground outline-none transition-colors after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:bg-transparent data-[hovered]:bg-input/50 data-[hovered]:text-foreground data-[pressed]:bg-input data-[selected]:text-foreground data-[selected]:after:bg-primary data-[focus-visible]:border-t-primary data-[focus-visible]:bg-input data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
);

export function PrismTabs({
  className,
  ...props
}: Omit<TabsProps, "className"> & {
  className?: string;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <Tabs
      className={cn("flex min-h-0 flex-col", className)}
      data-slot="tabs"
      {...props}
    />
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
      className={cn("flex min-w-0 shrink-0 border-b border-border", className)}
      data-slot="tab-list"
      {...props}
    />
  );
}

export function PrismTab({
  className,
  tabIndex,
  ...props
}: Omit<TabProps, "className" | "render"> & {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  tabIndex?: number;
}) {
  return (
    <Tab
      {...props}
      className={cn(tabVariants(), className)}
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
