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
import { useQueryClient } from "@tanstack/react-query";
import { useActionMutations } from "~/hooks/useActionMutations";
import { DATE_TIME_DISPLAY, INTENT } from "~/lib/CONSTANTS";
import { getNewDateForAction } from "~/lib/helpers";
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
    return () => {
      clearTimeout(cooldownRef.current);
    };
  }, [isDragActive, preventOpen]);

  // Sem HoverCard em mobile ou durante drag/cooldown
  if (!isDesktop || preventOpen) {
    return <>{children}</>;
  }
  const hasFiles = action.content_files && action.content_files.length > 0;
  return (
    <HoverCard.Root closeDelay={150} openDelay={600}>
      <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          align="center"
          className={cn(
            "z-50 overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl focus:outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "pointer-events-auto flex h-[300px] flex-row transition-all duration-200",
            hasFiles ? "w-[680px]" : "w-[440px]",
          )}
          side="top"
          sideOffset={8}
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
  const _queryClient = useQueryClient();
  const { handleAction } = useActionMutations();
  const fetchers = useFetchers();
  const navigation = useNavigation();
  const outletContext = useOutletContext<{
    setBaseAction?: (action: Action | null) => void;
  }>();
  const appData = useRouteLoaderData("routes/app") as AppLoaderData | undefined;
  const partners = appData?.partners || [];
  const [overrideTitle, setOverrideTitle] = useState<string | null>(null);
  const title = overrideTitle !== null ? overrideTitle : action.title;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const _isPending = fetchers.length > 0 || navigation.state !== "idle";
  const currentPartners = useMemo(
    () =>
      action.partners
        .map((partner) => partners.find((p) => p.slug === partner))
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
              alt={action.title}
              className="h-full w-full object-cover"
              src={action.content_files?.[currentImageIndex]}
            />
            {action.content_files && action.content_files.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white opacity-0 transition group-hover:opacity-100"
                  onClick={() =>
                    setCurrentImageIndex((prev) =>
                      prev > 0
                        ? prev - 1
                        : (action.content_files?.length ?? 1) - 1,
                    )
                  }
                >
                  <ChevronLeftIcon className="size-4" />
                </button>
                <button
                  type="button"
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white opacity-0 transition group-hover:opacity-100"
                  onClick={() =>
                    setCurrentImageIndex((prev) =>
                      prev < (action.content_files?.length ?? 1) - 1
                        ? prev + 1
                        : 0,
                    )
                  }
                >
                  <ChevronRightIcon className="size-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                  {currentImageIndex + 1} / {action.content_files.length}
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
            className="p-2 px-6 pb-1 focus-within:bg-secondary/40 hover:bg-secondary/40"
            onBlur={(newTitle) => {
              if (newTitle !== action.title && newTitle.trim()) {
                handleAction({
                  ...action,
                  intent: INTENT.update_action,
                  title: newTitle,
                });
              }
              setOverrideTitle(null);
            }}
            onChange={(newTitle) => setOverrideTitle(newTitle)}
            tabIndex={10}
            textareaClassName="w-full font-semibold text-lg text-foreground bg-transparent border-none resize-none outline-none leading-tight pt-1 pb-1 "
            title={title}
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
                className="min-h-[60px] px-6 outline-none"
                content={action.description || ""}
                handleBlur={async (content) => {
                  if (content !== (action.description || "")) {
                    handleAction({
                      ...action,
                      intent: INTENT.update_action,
                      description: content,
                    });
                  }
                }}
                placeholder="Descrição da Ação"
              />
            </Suspense>
          </div>
        </div>

        {/* Controles Compactos */}
        <div className="flex flex-wrap items-center gap-2 px-5 py-2">
          <PhaseCombobox
            className="rounded-full"
            iconVariant="progress"
            onSelect={(selected) => {
              handleAction({
                ...action,
                intent: INTENT.update_action,
                phase: selected,
              });
            }}
            selectedPhase={action.phase || "idea"}
            showText={false}
            size="sm"
          />

          <CategoriesCombobox
            className="rounded-full"
            onSelect={({ category }) => {
              handleAction({
                ...action,
                intent: INTENT.update_action,
                category,
              });
            }}
            selectedCategories={[action.category]}
            showText={false}
            size="sm"
          />

          <ActionDatePicker
            className="rounded-full"
            date={parseISO(action.date)}
            dateTimeDisplay={DATE_TIME_DISPLAY.DateTime}
            onSelect={(newDate) => {
              const updatedDate = getNewDateForAction(action, newDate);
              handleAction({
                ...action,
                intent: INTENT.update_action,
                ...updatedDate,
              });
            }}
            size="sm"
          />

          <SprintCombobox
            className="rounded-full"
            currentPartners={currentPartners}
            onSelect={(newSprints, newResponsibles) => {
              const finalSprints = newSprints.length > 0 ? newSprints : null;
              handleAction({
                ...action,
                intent: INTENT.update_action,
                sprints: finalSprints,
                responsibles: newResponsibles,
              });
            }}
            responsibles={action.responsibles || []}
            selectedSprints={action.sprints || []}
            size="sm"
          />

          <Button
            className="ml-auto h-8 w-8 rounded-full p-0"
            onClick={handleOpenFull}
            size="icon"
          >
            <ExternalLinkIcon className="size-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
