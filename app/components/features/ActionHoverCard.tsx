import * as HoverCard from "@radix-ui/react-hover-card";
import { parseISO } from "date-fns";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
} from "lucide-react";
import {
  lazy,
  Suspense,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useFetchers,
  useNavigation,
  useOutletContext,
  useRouteLoaderData,
} from "react-router";

import { DATE_TIME_DISPLAY, INTENT } from "~/lib/CONSTANTS";
import { getNewDateForAction } from "~/lib/helpers";
import { useActionMutations } from "~/hooks/useActionMutations";
import { cn } from "~/lib/utils";
import type { Action } from "~/models/actions.server";
import type { AppLoaderData } from "~/routes/app";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "../ui/button";
import { ActionDatePicker } from "./ActionForm/ActionDatePicker";
import { ActionTitleInput } from "./ActionForm/ActionTitleInput";
import { CategoriesCombobox } from "./CategoriesCombobox";
import { DragStateContext } from "./DragStateContext";
import { PhaseCombobox } from "./PhaseCombobox";
import { SprintCombobox } from "./SprintCombobox";

const Tiptap = lazy(() =>
  import("~/components/features/Tiptap").then((module) => ({
    default: module.Tiptap,
  })),
);

interface ActionHoverCardProps {
  action: Action;
  children: React.ReactNode;
  onClick?: (action: Action) => void;
}

export function ActionHoverCard({
  action,
  children,
  onClick,
}: ActionHoverCardProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  // Lê o contexto de drag. `useContext` nunca joga erro —
  // retorna `false` por padrão quando fora de um DragStateContext.Provider
  // (ex: HoursComponent, listas sem drag).
  const [preventOpen, setPreventOpen] = useState(false);
  const cooldownRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover)");
    setIsDesktop(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  useEffect(() => () => clearTimeout(cooldownRef.current), []);

  // Lê o estado de drag do contexto pai (CalendarWithDnd / KanbanComponent).
  // Se não houver provider, retorna false — sem erros.
  const isDragActive = useContext(DragStateContext);

  useEffect(() => {
    if (isDragActive) {
      clearTimeout(cooldownRef.current);
      setPreventOpen(true);
    } else if (preventOpen) {
      // Cooldown: aguarda 800ms após o fim do drag antes de reabrir.
      // Evita que o Radix detecte o hover residual e reabra imediatamente.
      cooldownRef.current = setTimeout(() => setPreventOpen(false), 800);
    }
  }, [isDragActive]);

  // Sem HoverCard em mobile ou durante drag/cooldown
  if (!isDesktop || preventOpen) {
    return <>{children}</>;
  }

  const hasFiles = action.content_files && action.content_files.length > 0;

  return (
    <HoverCard.Root openDelay={600} closeDelay={150}>
      <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          side="top"
          align="center"
          sideOffset={8}
          className={cn(
            "z-50 overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl focus:outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "pointer-events-auto flex h-[300px] flex-row transition-all duration-200",
            hasFiles ? "w-[680px]" : "w-[440px]",
          )}
        >
          <ActionHoverCardContent action={action} onClick={onClick} />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}

function ActionHoverCardContent({
  action,
  onClick,
}: {
  action: Action;
  onClick?: (action: Action) => void;
}) {
  const queryClient = useQueryClient();
  const { handleAction } = useActionMutations();
  const fetchers = useFetchers();
  const navigation = useNavigation();
  const outletContext = useOutletContext<any>();
  const appData = useRouteLoaderData("routes/app") as AppLoaderData | undefined;
  const partners = appData?.partners || [];

  const [title, setTitle] = useState(action.title);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setTitle(action.title);
  }, [action.title]);

  const isPending = fetchers.length > 0 || navigation.state !== "idle";

  const currentPartners = useMemo(
    () =>
      action.partners
        .map((partner) => partners.find((p) => p.slug === partner)!)
        .filter((p) => p !== undefined),
    [action.partners, partners],
  );

  const hasFiles = action.content_files && action.content_files.length > 0;

  const handleOpenFull = () => {
    if (onClick) {
      onClick(action);
    } else if (
      outletContext &&
      typeof outletContext.setBaseAction === "function"
    ) {
      outletContext.setBaseAction(action);
    }
  };

  return (
    <>
      {/* Coluna Esquerda: Preview de Mídia (Apenas se houver content_files) */}
      {hasFiles && (
        <div className="relative flex h-full w-[240px] shrink-0 flex-col justify-between overflow-hidden border-r border-border bg-muted">
          <div className="group relative h-full w-full">
            <img
              src={action.content_files![currentImageIndex]}
              alt={action.title}
              className="h-full w-full object-cover"
            />
            {action.content_files!.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentImageIndex((prev) =>
                      prev > 0 ? prev - 1 : action.content_files!.length - 1,
                    )
                  }
                  className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <ChevronLeftIcon className="size-4" />
                </button>
                <button
                  onClick={() =>
                    setCurrentImageIndex((prev) =>
                      prev < action.content_files!.length - 1 ? prev + 1 : 0,
                    )
                  }
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <ChevronRightIcon className="size-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                  {currentImageIndex + 1} / {action.content_files!.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Coluna Principal: Detalhes e Controles */}
      <div className="flex h-full flex-1 flex-col justify-between">
        {/* Título Editável */}
        <div className="border-b">
          <ActionTitleInput
            tabIndex={10}
            title={title}
            onChange={(newTitle) => setTitle(newTitle)}
            onBlur={(newTitle) => {
              if (newTitle !== action.title && newTitle.trim()) {
                handleAction(
                  { ...action, intent: INTENT.update_action, title: newTitle }
                );
              }
            }}
            className="p-2 px-6 pb-1 focus-within:bg-secondary/40 hover:bg-secondary/40"
            textareaClassName="w-full font-semibold text-lg text-foreground bg-transparent border-none resize-none outline-none leading-tight pt-1 pb-1 "
          />
        </div>

        {/* Mini Editor de Descrição */}
        <div className="flex min-h-[100px] flex-1 flex-col overflow-hidden border-b border-border/40 py-2 focus-within:bg-secondary/40 hover:bg-secondary/40">
          <div className="h-full flex-1 overflow-y-auto text-xs">
            <Suspense
              fallback={
                <div className="h-full w-full animate-pulse bg-muted" />
              }
            >
              <Tiptap
                content={action.description || ""}
                placeholder="Descrição da Ação"
                className="min-h-[60px] px-6 outline-none"
                handleBlur={async (content) => {
                  if (content !== (action.description || "")) {
                    handleAction(
                      {
                        ...action,
                        intent: INTENT.update_action,
                        description: content,
                      }
                    );
                  }
                }}
              />
            </Suspense>
          </div>
        </div>

        {/* Controles Compactos */}
        <div className="flex flex-wrap items-center gap-2 px-5 py-2">
          <PhaseCombobox
            size="sm"
            className="rounded-full"
            iconVariant="progress"
            selectedPhase={action.phase || "idea"}
            category={action.category as any}
            showText={false}
            onSelect={(selected) => {
              handleAction(
                { ...action, intent: INTENT.update_action, phase: selected }
              );
            }}
          />

          <CategoriesCombobox
            size="sm"
            className="rounded-full"
            selectedCategories={[action.category]}
            showText={false}
            onSelect={({ category }) => {
              handleAction(
                { ...action, intent: INTENT.update_action, category }
              );
            }}
          />

          <ActionDatePicker
            size="sm"
            dateTimeDisplay={DATE_TIME_DISPLAY.DateTime}
            date={parseISO(action.date)}
            className="rounded-full"
            onSelect={(newDate) => {
              const updatedDate = getNewDateForAction(action, newDate);
              handleAction(
                { ...action, intent: INTENT.update_action, ...updatedDate }
              );
            }}
          />

          <SprintCombobox
            size="sm"
            className="rounded-full"
            selectedSprints={action.sprints || []}
            responsibles={action.responsibles || []}
            currentPartners={currentPartners}
            onSelect={(newSprints, newResponsibles) => {
              const finalSprints = newSprints.length > 0 ? newSprints : null;
              handleAction(
                {
                  ...action,
                  intent: INTENT.update_action,
                  sprints: finalSprints,
                  responsibles: newResponsibles,
                }
              );
            }}
          />

          <Button
            size="icon"
            onClick={handleOpenFull}
            className="ml-auto h-8 w-8 rounded-full p-0"
          >
            <ExternalLinkIcon className="size-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
