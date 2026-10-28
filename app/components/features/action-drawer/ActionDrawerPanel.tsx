import { lazy, useCallback, useContext, useEffect, useRef } from "react";
import {
  Tab,
  TabList,
  TabListStateContext,
  Tabs,
  type TabListRenderProps,
} from "react-aria-components";
import { useTabPanel } from "react-aria/useTabList";
import { useIsDesktop } from "~/hooks/useIsDesktop";
import { useAppContext } from "~/contexts/AppContext";
import type {
  ActionPanels,
  ActionLeaveGuard,
  PanelAction,
} from "~/hooks/useActionPanels";
import { cn } from "~/lib/utils";
import type { Action } from "~/types";
import type { ActionDrawerView } from "./ActionFormDrawer";

const ActionFormDrawer = lazy(() =>
  import("./ActionFormDrawer").then((module) => ({
    default: module.ActionFormDrawer,
  })),
);

export function ActionDrawerPanel({
  panels,
  partnerFilters,
  isSearchOpen = false,
}: {
  panels: ActionPanels;
  partnerFilters?: string[];
  isSearchOpen?: boolean;
}) {
  const { partners } = useAppContext();
  const {
    primaryAction,
    secondaryAction,
    activeKey,
    closeAllActions,
    activateAction,
  } = panels;
  const entries = [primaryAction, secondaryAction].filter(
    (entry): entry is PanelAction => entry !== null,
  );
  const activeAction = entries.find((entry) => entry.key === activeKey);
  const hasActions = entries.length > 0;
  // Two maximum-width drawers (768px each), plus 64px of usable overlay.
  const hasRoomForTwo = useIsDesktop(1600);
  const sideBySide = hasRoomForTwo && entries.length === 2;
  const requestCloseAll = useCallback(async () => {
    await closeAllActions();
  }, [closeAllActions]);

  useEffect(() => {
    if (!hasActions) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        isSearchOpen ||
        event.key.toLowerCase() !== "escape"
      )
        return;
      if (
        event.target instanceof Element &&
        event.target.closest('[role="dialog"], [data-slot="popover-content"]')
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      void requestCloseAll();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [hasActions, isSearchOpen, requestCloseAll]);

  if (!hasActions) return null;
  return (
    <>
      <button
        aria-label="Fechar painel de edição"
        className="fixed inset-0 top-16 z-10 flex w-full shrink-0 cursor-default flex-col bg-black/20 dark:bg-black/80"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void requestCloseAll();
        }}
        tabIndex={-1}
        type="button"
      />
      <div
        className={cn(
          "fixed top-16 right-0 bottom-0 z-10 overflow-hidden border-l bg-background",
          sideBySide ? "w-auto max-w-none" : "w-full max-w-full sm:max-w-2xl",
          sideBySide
            ? undefined
            : activeAction?.view === "instagram"
              ? "lg:w-3xl lg:max-w-3xl"
              : "lg:w-2xl lg:max-w-2xl",
        )}
        data-action-panel
        data-action-layout={sideBySide ? "side-by-side" : "tabs"}
      >
        <Tabs
          className="flex h-full min-h-0 flex-col"
          selectedKey={activeKey ?? undefined}
          onSelectionChange={(key) => activateAction(String(key))}
        >
          <div
            className={cn(
              "shrink-0 border-b",
              entries.length < 2 || sideBySide ? "hidden" : "flex",
            )}
            hidden={entries.length < 2 || sideBySide}
          >
            <TabList aria-label="Ações abertas" className="flex min-w-0 flex-1">
              {entries.map((entry) => {
                const title = entry.currentAction.title || "Nova ação";
                const partner = partners.find((candidate) =>
                  entry.currentAction.partners.includes(candidate.slug),
                );
                return (
                  <Tab
                    id={entry.key}
                    key={entry.key}
                    className="min-w-0 flex-1 cursor-pointer border-t-2 border-r border-t-transparent px-4 py-2 text-left outline-none last:border-r-0 data-[focus-visible]:bg-input data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-inset data-[selected]:border-t-primary data-[selected]:bg-primary/5"
                  >
                    <span
                      className="block truncate text-sm font-medium"
                      title={title}
                    >
                      {title}
                    </span>
                    {partner && (
                      <span className="block truncate text-xs text-muted-foreground">
                        {partner.title}
                      </span>
                    )}
                  </Tab>
                );
              })}
            </TabList>
          </div>
          <div className="flex min-h-0 flex-1 overflow-hidden">
            {entries.map((entry) => (
              <ActionPanelSurface
                key={entry.key}
                entry={entry}
                panels={panels}
                partnerFilters={partnerFilters}
                isActive={entry.key === activeKey}
                isSearchOpen={isSearchOpen}
                sideBySide={sideBySide}
              />
            ))}
          </div>
        </Tabs>
      </div>
    </>
  );
}

interface ActionPanelSurfaceProps {
  entry: PanelAction;
  panels: ActionPanels;
  partnerFilters?: string[];
  isActive: boolean;
  isSearchOpen: boolean;
  sideBySide: boolean;
}

function ActionPanelSurface(props: ActionPanelSurfaceProps) {
  const tabState = useContext(TabListStateContext);
  // React Aria also traverses children while building its tab collection.
  if (!tabState) return null;
  return <ActionPanelSurfaceContent {...props} tabState={tabState} />;
}

function ActionPanelSurfaceContent({
  entry,
  panels,
  partnerFilters,
  isActive,
  isSearchOpen,
  sideBySide,
  tabState,
}: ActionPanelSurfaceProps & { tabState: TabListRenderProps["state"] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { tabPanelProps } = useTabPanel({ id: entry.key }, tabState, ref);
  const hidden = !sideBySide && !isActive;
  const activate = (target: EventTarget) => {
    if (!isActive && target instanceof Node && ref.current?.contains(target)) {
      panels.activateAction(entry.key);
    }
  };
  return (
    <div
      {...(sideBySide
        ? {
            role: "region",
            "aria-label": entry.currentAction.title || "Nova ação",
          }
        : tabPanelProps)}
      ref={ref}
      hidden={hidden}
      inert={hidden}
      data-action-surface={entry.key}
      className={cn(
        "@container/action min-h-0 overflow-hidden outline-none",
        hidden ? "hidden" : "block",
        sideBySide
          ? entry.view === "instagram"
            ? "w-3xl shrink-0 border-r last:border-r-0"
            : "w-2xl shrink-0 border-r last:border-r-0"
          : "min-w-0 flex-1",
      )}
      onFocusCapture={(event) => activate(event.target)}
      onPointerDownCapture={(event) => activate(event.target)}
    >
      <ActionPanelEntry
        entry={entry}
        panels={panels}
        partnerFilters={partnerFilters}
        isActive={isActive}
        isSearchOpen={isSearchOpen}
      />
    </div>
  );
}

function ActionPanelEntry({
  entry,
  panels,
  partnerFilters,
  isActive,
  isSearchOpen,
}: {
  entry: PanelAction;
  panels: ActionPanels;
  partnerFilters?: string[];
  isActive: boolean;
  isSearchOpen: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const {
    registerLeaveGuard,
    updateAction,
    setView,
    closeAction,
    focusRequest,
    focusTargetKey,
  } = panels;
  const handledFocusRequest = useRef<number | null>(null);
  const focusStateRef = useRef({
    isActive,
    isSearchOpen,
    focusTargetKey,
    focusRequest,
  });
  focusStateRef.current = {
    isActive,
    isSearchOpen,
    focusTargetKey,
    focusRequest,
  };
  const focusContent = useCallback(() => {
    const root = rootRef.current;
    const current = focusStateRef.current;
    if (
      !root ||
      !current.isActive ||
      current.isSearchOpen ||
      current.focusTargetKey !== entry.key ||
      handledFocusRequest.current === current.focusRequest
    )
      return;
    if (root.contains(document.activeElement)) {
      handledFocusRequest.current = current.focusRequest;
      return;
    }
    const target = root.querySelector<HTMLElement>(
      '[data-drawer-focus="title"] textarea, [data-drawer-navigation] button[aria-selected="true"]',
    );
    if (target) {
      target.focus({ preventScroll: true });
      handledFocusRequest.current = current.focusRequest;
    }
  }, [entry.key]);
  useEffect(() => {
    if (
      isActive &&
      !isSearchOpen &&
      focusTargetKey === entry.key &&
      handledFocusRequest.current !== focusRequest
    )
      focusContent();
  }, [
    entry.key,
    focusContent,
    focusRequest,
    focusTargetKey,
    isActive,
    isSearchOpen,
  ]);
  const registerGuard = useCallback(
    (guard: ActionLeaveGuard | null) => {
      registerLeaveGuard(entry.key, guard);
      if (guard) queueMicrotask(focusContent);
    },
    [entry.key, focusContent, registerLeaveGuard],
  );
  const updateCurrentAction = useCallback(
    (action: Action) => updateAction(entry.key, action),
    [entry.key, updateAction],
  );
  const updateView = useCallback(
    (view: ActionDrawerView) => setView(entry.key, view),
    [entry.key, setView],
  );
  const requestClose = useCallback(async () => {
    await closeAction(entry.key);
  }, [closeAction, entry.key]);
  return (
    <div className="h-full min-h-0" data-action-entry={entry.key} ref={rootRef}>
      <ActionFormDrawer
        initialAction={entry.initialAction}
        onClose={requestClose}
        partnerFilters={partnerFilters}
        registerLeaveGuard={registerGuard}
        view={entry.view}
        onViewChange={updateView}
        isActive={isActive && !isSearchOpen}
        onActionChange={updateCurrentAction}
      />
    </div>
  );
}
