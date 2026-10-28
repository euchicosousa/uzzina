import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type KeyboardEventHandler,
} from "react";
import { FocusScope, useFocusManager } from "react-aria/FocusScope";

const PRIMARY_TARGETS = [
  '[data-drawer-focus="title"] textarea',
  '[data-drawer-focus="description"] .tiptap[contenteditable="true"]',
  '[data-drawer-focus="control"] button',
].join(",");

interface ActionDrawerFocusScopeProps {
  children: ReactNode;
  className: string;
  enabled: boolean;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
}

export function ActionDrawerFocusScope(props: ActionDrawerFocusScopeProps) {
  return (
    <FocusScope>
      <DrawerFocusContent {...props} />
    </FocusScope>
  );
}

function DrawerFocusContent({
  children,
  className,
  enabled,
  onKeyDown,
}: ActionDrawerFocusScopeProps) {
  const focusManager = useFocusManager();
  const rootRef = useRef<HTMLDivElement>(null);
  const [opener] = useState(() =>
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null,
  );
  useLayoutEffect(() => {
    const root = rootRef.current;
    return () => {
      // Restore only on close; FocusScope restoreFocus also redirects the last Tab.
      const active = document.activeElement;
      if (!root?.contains(active) && active !== document.body) return;
      queueMicrotask(() => {
        if (opener?.isConnected && document.activeElement === document.body) {
          opener.focus({ preventScroll: true });
        }
      });
    };
  }, [opener]);
  const [allControls, setAllControls] = useState(false);
  const hintId = useId();
  return (
    <div
      aria-describedby={enabled ? hintId : undefined}
      aria-label="Edição da ação"
      className={className}
      data-drawer-focus-scope
      ref={rootRef}
      onKeyDown={onKeyDown}
      onKeyDownCapture={(event) => {
        const target = event.target;
        // React portals bubble through this component even outside its DOM scope.
        if (
          !enabled ||
          !(target instanceof Element) ||
          !event.currentTarget.contains(target) ||
          target.closest('[role="dialog"], [data-slot="popover-content"]')
        ) {
          return;
        }
        if (
          event.key === "F10" &&
          event.altKey &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.shiftKey
        ) {
          event.preventDefault();
          event.stopPropagation();
          setAllControls((previous) => !previous);
          return;
        }
        // Toolbars manage their own arrow keys and single Tab exit, in either mode.
        if (target.closest('[role="toolbar"]')) return;
        if (
          event.key !== "Tab" ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.nativeEvent.isComposing
        ) {
          return;
        }
        const root = event.currentTarget;
        const inNavigation = !!target.closest("[data-drawer-navigation]");
        const isNavigation = (node: Element) =>
          root.contains(node) && !!node.closest("[data-drawer-navigation]");
        const options = {
          tabbable: true,
          accept: (node: Element) =>
            root.contains(node) &&
            !node.closest("[data-editor-context-toolbar]") &&
            (allControls ||
              node.matches(PRIMARY_TARGETS) ||
              (inNavigation && isNavigation(node))),
        };
        let next = event.shiftKey
          ? focusManager?.focusPrevious(options)
          : focusManager?.focusNext(options);
        if (!next && !event.shiftKey && target.matches(PRIMARY_TARGETS)) {
          next = focusManager?.focusFirst({
            tabbable: true,
            accept: isNavigation,
          });
        } else if (!next && event.shiftKey && inNavigation) {
          next = focusManager?.focusLast({
            tabbable: true,
            accept: (node) =>
              root.contains(node) && node.matches(PRIMARY_TARGETS),
          });
        }
        if (next) {
          // Run before the editor can indent a list or move/create table cells.
          event.preventDefault();
          event.stopPropagation();
        }
      }}
      role="region"
    >
      {children}
      {enabled && (
        <p aria-live="polite" hidden id={hintId}>
          {allControls ? "Tab: todos os controles" : "Tab: campos principais"}
          {" · Alt+F10 para alternar"}
        </p>
      )}
    </div>
  );
}
