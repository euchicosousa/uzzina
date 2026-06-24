import { IconBrandInstagram } from "@tabler/icons-react";
import { format } from "date-fns";
import { ArchiveIcon, HeartIcon, MessageSquareIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFetcher, useFetchers, useRouteLoaderData } from "react-router";
import { toast } from "sonner";
import { ActionFormFooter } from "~/components/features/ActionForm/ActionFormFooter";
import { EssentialsTab } from "~/components/features/ActionForm/EssentialsTab";
import { InstagramTab } from "~/components/features/ActionForm/InstagramTab";
import { ObservationsTab } from "~/components/features/ActionForm/ObservationsTab";
import { INTENT } from "~/lib/CONSTANTS";
import { isInstagramFeed } from "~/lib/helpers";
import { useActionMutations } from "~/hooks/useActionMutations";
import { cn } from "~/lib/utils";
import type { Action } from "~/models/actions.server";
import type { Partner } from "~/models/partners.server";
import type { AppLoaderData } from "~/routes/app";

function getCaptionTail(instagram_caption_tail: string | null) {
  return "".concat("\n\n").concat(instagram_caption_tail || "");
}

const DEFAULT_PARTNER_FILTERS: string[] = [];

export function CreateAndEditAction({
  BaseAction,
  onClose,
  partnerFilters = DEFAULT_PARTNER_FILTERS,
}: {
  BaseAction: Action;
  onClose: () => void;
  partnerFilters?: string[];
}) {
  const [view, setView] = useState<"essential" | "instagram" | "observations">(
    "essential",
  );
  const {
    partners: routePartners,
    cloudName,
    uploadPreset,
  } = useRouteLoaderData("routes/app") as AppLoaderData & {
    partners: Partner[];
  };

  const partners = routePartners || [];

  const fetcher = useFetcher();
  const fetchers = useFetchers();
  const { handleAction, isLoading: isMutationLoading } = useActionMutations();

  const [RawAction, setRawAction] = useState<Action>(() => {
    if (BaseAction.created_at) return BaseAction;
    const now = format(new Date(), "yyyy-MM-dd HH:mm:ss");

    let initialPartners = BaseAction.partners || [];
    let initialResponsibles = BaseAction.responsibles || [];

    if (initialPartners.length === 0 && partnerFilters.length > 0) {
      initialPartners = partnerFilters;
      // Busca o primeiro parceiro filtrado para pré-selecionar os responsáveis
      const matchedPartner = partners.find((p) => p.slug === partnerFilters[0]);
      if (matchedPartner && initialResponsibles.length === 0) {
        initialResponsibles = matchedPartner.users_ids;
      }
    }

    return {
      ...BaseAction,
      partners: initialPartners,
      responsibles: initialResponsibles,
      created_at: now,
      updated_at: now,
    };
  });

  // Ref always points to the latest RawAction to avoid stale closures
  const rawActionRef = useRef(RawAction);
  useEffect(() => {
    rawActionRef.current = RawAction;
  }, [RawAction]);

  // Lock to prevent race condition: onBlur + button click both firing create_action
  // simultaneously before the server responds with the new id.
  // useRef is synchronous — both callbacks share the same lock in the same call stack.
  const isCreatingRef = useRef(false);

  // Ref for the latest description typed in Tiptap — updated on every keystroke
  // without triggering re-renders. handleSave reads from here so Cmd+Enter
  // always saves the latest typed content even without blur.
  const descriptionRef = useRef(BaseAction.description || "");

  const handleSave = useCallback(async () => {
    if (!RawAction.title) {
      toast.error("Erro / O título é obrigatório", {
        position: "top-center",
      });
      return;
    }

    if (RawAction.partners.length === 0) {
      toast.error("Erro / Pelo menos um parceiro deve ser selecionado", {
        position: "top-center",
      });
      return;
    }

    // Prevent double-create: if onBlur already fired a create, bail out
    if (!RawAction.id && isCreatingRef.current) return;
    if (!RawAction.id) isCreatingRef.current = true;

    const result = await handleAction({
      ...RawAction,
      description: descriptionRef.current, // always latest typed content
      intent: RawAction.id ? INTENT.update_action : INTENT.create_action,
    });
    if (result) {
      isCreatingRef.current = false;
      setRawAction(result);
    }
  }, [RawAction, handleAction]);

  // Ref always points to the latest handleSave to avoid stale closures in event listeners
  const handleSaveRef = useRef(handleSave);
  useEffect(() => {
    handleSaveRef.current = handleSave;
  }, [handleSave]);

  const prevBaseIdRef = useRef(BaseAction.id);
  useEffect(() => {
    const current = rawActionRef.current;
    if (current.id && !BaseAction.id) {
      handleAction({ ...current, intent: INTENT.update_action });
    }

    // Only reset state if the action we are viewing actually changed
    if (BaseAction.id !== prevBaseIdRef.current) {
      prevBaseIdRef.current = BaseAction.id;
      descriptionRef.current = BaseAction.description || "";
      setRawAction(BaseAction);
    }
  }, [BaseAction, handleAction]);

  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [descriptionVersion, setDescriptionVersion] = useState(0);

  const isPending =
    isMutationLoading || fetchers.some((f) => f.state === "submitting");

  // Effect for AI Processing indicator
  useEffect(() => {
    setIsAIProcessing(
      fetchers.filter(
        (f) =>
          f.formData?.get("intent") === INTENT.ai_caption ||
          f.formData?.get("intent") === INTENT.ai_hooks ||
          f.formData?.get("intent") === INTENT.ai_post ||
          f.formData?.get("intent") === INTENT.ai_carousel ||
          f.formData?.get("intent") === INTENT.ai_stories ||
          f.formData?.get("intent") === INTENT.ai_reels,
      ).length > 0,
    );
  }, [fetchers]);

  // Effect for capturing new action ID from create_action fetcher
  useEffect(() => {
    fetchers.forEach((f) => {
      const payload = (f as { json?: { intent?: string } }).json;
      if (payload && f.data) {
        const intent = payload.intent;

        if (intent === INTENT.create_action) {
          const newId = f.data?.id;
          if (newId) {
            isCreatingRef.current = false; // release lock after server responds
            setRawAction((prev) => {
              if (prev.id === newId) return prev;
              return { ...prev, id: newId };
            });
          }
        }
      }
    });
  }, [fetchers]);

  const currentPartners = useMemo(() => {
    return RawAction.partners
      .map((slug) => partners.find((partner) => partner.slug === slug))
      .filter((partner): partner is Partner => partner !== undefined);
  }, [RawAction.partners, partners]);

  const [workFiles, setWorkFiles] = useState<string[]>(
    RawAction.work_files ?? [],
  );
  const [contentFiles, setContentFiles] = useState<string[]>(
    RawAction.content_files ?? [],
  );

  const handleDescriptionChange = useCallback((desc: string) => {
    descriptionRef.current = desc;
  }, []);

  const updateAction = useCallback(
    async (data?: { [key: string]: unknown }, forceCreate = false) => {
      const current = rawActionRef.current;

      if (
        current.id ||
        (forceCreate &&
          !current.id &&
          current.title &&
          current.partners.length > 0)
      ) {
        // Prevent double-create: if a creation is already in flight, bail out
        if (!current.id && isCreatingRef.current) return;
        if (!current.id) isCreatingRef.current = true;

        const result = await handleAction({
          ...current,
          ...data,
          intent: current.id ? INTENT.update_action : INTENT.create_action,
        });
        if (result) {
          isCreatingRef.current = false;
          setRawAction(result);
        }
      }
    },
    [handleAction],
  );

  const updateContentFiles = useCallback(
    (next: string[]) => {
      setContentFiles(next);
      setRawAction((prev) => ({ ...prev, content_files: next }));
      updateAction({ content_files: next });
    },
    [updateAction],
  );

  // Guard: only update color if it actually changed to avoid
  // triggering another render cycle via the partners effect above.
  useEffect(() => {
    if (!BaseAction.id && currentPartners.length > 0) {
      const newColor = currentPartners[0].colors[0];

      const newResponsibles = currentPartners.flatMap((p) =>
        p.users_ids.map((user) => user),
      );

      setRawAction((prev) =>
        prev.color === newColor
          ? prev
          : { ...prev, color: newColor, responsibles: newResponsibles },
      );
    }
  }, [currentPartners, BaseAction.id]);

  const captionTailRef = useRef(currentPartners[0]?.instagram_caption_tail);
  useEffect(() => {
    captionTailRef.current = currentPartners[0]?.instagram_caption_tail;
  }, [currentPartners]);

  const [prevFetcherData, setPrevFetcherData] = useState<unknown>(null);
  if (fetcher.data !== prevFetcherData) {
    setPrevFetcherData(fetcher.data);
    if (fetcher.data) {
      const intent = fetcher.data.intent;
      const captionTail = captionTailRef.current;

      if (intent === INTENT.ai_caption) {
        const captionText =
          typeof fetcher.data.output === "string"
            ? fetcher.data.output
            : fetcher.data.output.caption;

        const newCaption = (captionText || "").concat(
          getCaptionTail(captionTail),
        );
        setRawAction((prev) => ({
          ...prev,
          instagram_caption: newCaption,
        }));
      }

      if (
        [
          INTENT.ai_post,
          INTENT.ai_carousel,
          INTENT.ai_stories,
          INTENT.ai_reels,
        ].includes(intent)
      ) {
        const { content, caption } = fetcher.data.output;
        const newCaption = (caption || "").concat(getCaptionTail(captionTail));

        const currentDescription = rawActionRef.current.description || "";
        const newDescription = `${content}<hr />${currentDescription}`;

        setRawAction((prev) => ({
          ...prev,
          description: newDescription,
          instagram_caption: newCaption,
        }));

        // Atualiza a ref da descrição para o Tiptap não sobrescrever
        descriptionRef.current = newDescription;

        // Incrementa a versão para forçar o Tiptap a remontar com o novo conteúdo
        setDescriptionVersion((v) => v + 1);
      }
    }
  }

  useEffect(() => {
    if (fetcher.data) {
      const intent = fetcher.data.intent;
      const captionTail = captionTailRef.current;

      if (intent === INTENT.ai_caption) {
        const captionText =
          typeof fetcher.data.output === "string"
            ? fetcher.data.output
            : fetcher.data.output.caption;

        const newCaption = (captionText || "").concat(
          getCaptionTail(captionTail),
        );
        updateAction({ instagram_caption: newCaption });
      }

      if (
        [
          INTENT.ai_post,
          INTENT.ai_carousel,
          INTENT.ai_stories,
          INTENT.ai_reels,
        ].includes(intent)
      ) {
        const { content, caption } = fetcher.data.output;
        const newCaption = (caption || "").concat(getCaptionTail(captionTail));

        const currentDescription = rawActionRef.current.description || "";
        const newDescription = `${content}<hr />${currentDescription}`;

        updateAction({
          description: newDescription,
          instagram_caption: newCaption,
        });
      }
    }
  }, [fetcher.data, updateAction]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLocaleLowerCase() === "escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      } else if (event.key.toLocaleLowerCase() === "enter" && event.metaKey) {
        event.preventDefault();
        event.stopPropagation();
        handleSaveRef.current();
        if (!event.shiftKey) {
          onClose();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const tabClass = (active: boolean) =>
    cn(
      "flex w-full cursor-pointer items-center justify-center gap-2 border-b p-4 text-sm font-medium",
      active ? "bg-background border-b-transparent" : "bg-muted border-border",
    );

  return (
    <div
      className={cn(
        "fixed top-16 right-0 bottom-0 z-10 flex shrink-0 flex-col overflow-hidden border-l bg-background",

        view === "instagram" ? "lg:w-4xl" : "lg:w-2xl",
      )}
    >
      {RawAction.archived && (
        <div className="flex shrink-0 items-center justify-center gap-2 bg-amber-500 p-2 text-sm font-medium text-amber-50 dark:text-amber-950">
          <ArchiveIcon className="size-4" />
          Esta ação está arquivada.
          <button
            type="button"
            onClick={() => {
              setRawAction((prev) => ({ ...prev, archived: false }));
              updateAction({ archived: false });
            }}
            className="ml-2 underline hover:no-underline"
          >
            Desarquivar
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex shrink-0 divide-x" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={view === "essential"}
          className={tabClass(view === "essential")}
          onClick={() => setView("essential")}
        >
          ESSENCIAL <HeartIcon className="size-4" />
        </button>
        {isInstagramFeed(RawAction.category) && (
          <button
            type="button"
            role="tab"
            aria-selected={view === "instagram"}
            className={tabClass(view === "instagram")}
            onClick={() => setView("instagram")}
          >
            INSTAGRAM <IconBrandInstagram className="size-4" />
          </button>
        )}
        <button
          type="button"
          role="tab"
          aria-selected={view === "observations"}
          className={tabClass(view === "observations")}
          onClick={() => setView("observations")}
        >
          OBSERVAÇÕES <MessageSquareIcon className="size-4" />
        </button>
        <div>
          <button
            type="button"
            className="flex w-full cursor-pointer items-center justify-center gap-2 border-b p-5 text-sm font-medium"
            onClick={onClose}
            aria-label="Fechar"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      </div>

      <div className="relative flex h-full grow flex-col overflow-hidden">
        {/* Essencial */}
        <div className="flex h-full w-full divide-x overflow-hidden">
          {view === "essential" && (
            <div
              className={cn(
                view !== "essential" && "hidden",
                "w-full",
                "h-full",
              )}
            >
              <EssentialsTab
                isAIProcessing={isAIProcessing}
                fetcher={fetcher}
                RawAction={RawAction}
                setRawAction={setRawAction}
                updateAction={updateAction}
                workFiles={workFiles}
                setWorkFiles={setWorkFiles}
                currentPartners={currentPartners}
                cloudName={cloudName}
                uploadPreset={uploadPreset}
                onDescriptionChange={handleDescriptionChange}
                descriptionVersion={descriptionVersion}
              />
            </div>
          )}
          {/* Instagram */}
          {view === "instagram" && (
            <div className={cn("w-full", "h-full")}>
              <InstagramTab
                RawAction={RawAction}
                setRawAction={setRawAction}
                updateAction={updateAction}
                contentFiles={contentFiles}
                updateContentFiles={updateContentFiles}
                currentPartners={currentPartners}
                cloudName={cloudName}
                uploadPreset={uploadPreset}
                isAIProcessing={isAIProcessing}
                fetcher={fetcher}
              />
            </div>
          )}
          {view === "observations" && (
            <div className={cn("w-full", "h-full")}>
              <ObservationsTab
                actionId={RawAction.id}
                partnerUsersIds={currentPartners[0]?.users_ids || []}
              />
            </div>
          )}
        </div>
        {/* Criar e Atualizar */}
        <ActionFormFooter
          RawAction={RawAction}
          setRawAction={setRawAction}
          updateAction={updateAction}
          currentPartners={currentPartners}
          isPending={isPending}
          handleSave={handleSave}
          handleClose={onClose}
        />
      </div>
    </div>
  );
}
