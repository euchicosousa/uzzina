import * as HoverCard from "@radix-ui/react-hover-card";
import { parseISO } from "date-fns";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { lazy, Suspense, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useFetchers, useNavigation, useOutletContext, useRouteLoaderData, useSubmit } from "react-router";

import { DATE_TIME_DISPLAY, INTENT } from "~/lib/CONSTANTS";
import { getNewDateForAction, handleAction } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import type { Action } from "~/models/actions.server";
import type { AppLoaderData } from "~/routes/app";

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

export function ActionHoverCard({ action, children, onClick }: ActionHoverCardProps) {
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
            "z-50 bg-popover text-popover-foreground rounded-2xl border border-border shadow-2xl overflow-hidden focus:outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "flex flex-row pointer-events-auto transition-all duration-200 h-[300px]",
            hasFiles ? "w-[680px]" : "w-[440px]"
          )}
        >
          <ActionHoverCardContent action={action} onClick={onClick} />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}

function ActionHoverCardContent({ action, onClick }: { action: Action; onClick?: (action: Action) => void }) {
  const submit = useSubmit();
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
    } else if (outletContext && typeof outletContext.setBaseAction === "function") {
      outletContext.setBaseAction(action);
    }
  };



  return (
    <>
      {/* Coluna Esquerda: Preview de Mídia (Apenas se houver content_files) */}
      {hasFiles && (
        <div className="w-[240px] h-full shrink-0 relative bg-muted flex flex-col justify-between overflow-hidden border-r border-border">
          <div className="w-full h-full relative group">
            <img
              src={action.content_files![currentImageIndex]}
              alt={action.title}
              className="w-full h-full object-cover"
            />
            {action.content_files!.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : action.content_files!.length - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <ChevronLeftIcon className="size-4" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev < action.content_files!.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <ChevronRightIcon className="size-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 px-2 py-0.5 rounded-full text-[10px] text-white font-medium">
                  {currentImageIndex + 1} / {action.content_files!.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Coluna Principal: Detalhes e Controles */}
      <div className="flex-1 flex flex-col justify-between h-full">
        {/* Título Editável */}
        <div className="border-b">
          <ActionTitleInput
            tabIndex={10}
            title={title}
            onChange={(newTitle) => setTitle(newTitle)}
            onBlur={(newTitle) => {
              if (newTitle !== action.title && newTitle.trim()) {
                handleAction({ ...action, intent: INTENT.update_action, title: newTitle }, submit);
              }
            }}
            className="p-2 px-6 focus-within:bg-secondary/40 pb-1 hover:bg-secondary/40"
            textareaClassName="w-full font-semibold text-lg text-foreground bg-transparent border-none resize-none outline-none leading-tight pt-1 pb-1 font-inter"
          />
        </div>

        {/* Mini Editor de Descrição */}
        <div className="flex-1 flex flex-col min-h-[100px] hover:bg-secondary/40 py-2 border-border/40 overflow-hidden border-b focus-within:bg-secondary/40">
          <div className="flex-1 text-xs overflow-y-auto h-full">
            <Suspense fallback={<div className="h-full w-full animate-pulse bg-muted" />}>
              <Tiptap
                content={action.description || ""}
                placeholder="Descrição da Ação"
                className="font-inter min-h-[60px] outline-none px-6"
                handleBlur={async (content) => {
                  if (content !== (action.description || "")) {
                    handleAction({ ...action, intent: INTENT.update_action, description: content }, submit);
                  }
                }}
              />
            </Suspense>
          </div>
        </div>

        {/* Controles Compactos */}
        <div className="flex flex-wrap items-center gap-2 py-2 px-5">
          <PhaseCombobox
            size="sm"
            className="rounded-full"
            iconVariant="progress"
            selectedPhase={action.phase || "idea"}
            category={action.category as any}
            showText={false}
            onSelect={(selected) => {
              handleAction({ ...action, intent: INTENT.update_action, phase: selected }, submit);
            }}
          />

          <CategoriesCombobox
            size="sm"
            className="rounded-full"
            selectedCategories={[action.category]}
            showText={false}
            onSelect={({ category }) => {
              handleAction({ ...action, intent: INTENT.update_action, category }, submit);
            }}
          />

          <ActionDatePicker
            size="sm"
            dateTimeDisplay={DATE_TIME_DISPLAY.DateTime}
            date={parseISO(action.date)}
            className="rounded-full"
            onSelect={(newDate) => {
              const updatedDate = getNewDateForAction(action, newDate);
              handleAction({ ...action, intent: INTENT.update_action, ...updatedDate }, submit);
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
              handleAction({
                ...action,
                intent: INTENT.update_action,
                sprints: finalSprints,
                responsibles: newResponsibles,
              }, submit);
            }}
          />

          <Button
            size="icon"
            onClick={handleOpenFull}
            className="h-8 p-0 w-8 rounded-full ml-auto"
          >
            <ExternalLinkIcon className="size-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
