import { useId, useState, type ReactNode } from "react";
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
}

export function ActionDrawerFocusScope(props: ActionDrawerFocusScopeProps) {
  return (
    <FocusScope restoreFocus>
      <DrawerFocusContent {...props} />
    </FocusScope>
  );
}

function DrawerFocusContent({
  children,
  className,
  enabled,
}: ActionDrawerFocusScopeProps) {
  const focusManager = useFocusManager();
  const [allControls, setAllControls] = useState(false);
  const hintId = useId();
  return (
    <div
      aria-describedby={enabled ? hintId : undefined}
      aria-label="Edição da ação"
      className={className}
      data-drawer-focus-scope
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
        const options = {
          tabbable: true,
          accept: (node: Element) =>
            root.contains(node) &&
            (allControls || node.matches(PRIMARY_TARGETS)),
        };
        const next = event.shiftKey
          ? focusManager?.focusPrevious(options)
          : focusManager?.focusNext(options);
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
        <p
          aria-live="polite"
          className="shrink-0 border-t px-4 py-1 text-xs text-muted-foreground"
          id={hintId}
        >
          {allControls ? "Tab: todos os controles" : "Tab: campos principais"}
          {" · Alt+F10 para alternar"}
        </p>
      )}
    </div>
  );
}
