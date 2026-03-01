import { addMinutes, format, parse } from "date-fns";
import { IconBrandInstagram } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, X } from "lucide-react";
import {
  useFetcher,
  useFetchers,
  useRouteLoaderData,
  useSubmit,
} from "react-router";
import { ActionFormFooter } from "~/components/features/ActionForm/ActionFormFooter";
import { EssentialsTab } from "~/components/features/ActionForm/EssentialsTab";
import { InstagramTab } from "~/components/features/ActionForm/InstagramTab";
import type { AppLoaderData } from "~/routes/app";
import { INTENT } from "~/lib/CONSTANTS";
import { handleAction, isInstagramFeed } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import type { Action } from "~/models/actions.server";
import { toast } from "sonner";

function getCaptionTail(instagram_caption_tail: string | null) {
  return "".concat("\n\n").concat(instagram_caption_tail || "");
}

export function CreateAndEditAction({
  BaseAction,
  onClose,
}: {
  BaseAction: Action;
  onClose: () => void;
}) {
  const [view, setView] = useState<"essential" | "instagram" | "chat">(
    "essential",
  );
  const { partners, cloudName, uploadPreset } = useRouteLoaderData(
    "routes/app",
  ) as AppLoaderData & { partners: Partner[] };

  const fetcher = useFetcher();
  const submit = useSubmit();
  const fetchers = useFetchers();

  const [RawAction, setRawAction] = useState<Action>(BaseAction);

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

    await handleAction(
      {
        ...RawAction,
        intent: RawAction.id ? INTENT.update_action : INTENT.create_action,
      },
      submit,
    );
  }, [RawAction, submit]);

  // Ref always points to the latest handleSave to avoid stale closures in event listeners
  const handleSaveRef = useRef(handleSave);
  useEffect(() => {
    handleSaveRef.current = handleSave;
  }, [handleSave]);

  useEffect(() => {
    if (RawAction.id && !BaseAction.id) {
      // Salva a ação atual antes de limpá-la para iniciar uma nova
      handleAction(
        {
          ...RawAction,
          intent: INTENT.update_action,
        },
        submit,
      );
    }
    setRawAction(BaseAction);
  }, [BaseAction]);

  const [isPending, setIsPending] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  useEffect(() => {
    setIsPending(fetchers.filter((f) => f.formData).length > 0);

    setIsAIProcessing(
      fetchers.filter((f) => f.formData?.get("intent") === INTENT.caption_ai)
        .length > 0,
    );

    fetchers.forEach((f) => {
      if (f.formData && f.data) {
        const intent = f.formData.get("intent");

        if (intent === INTENT.create_action) {
          const newId = f.data?.id;
          if (newId) {
            setRawAction((prev) => {
              if (prev.id === newId) return prev;
              return { ...prev, id: newId };
            });
          }
        }
      }
    });
  }, [fetchers]);

  if (!RawAction.created_at) {
    setRawAction({
      ...RawAction,
      created_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      instagram_date: format(
        addMinutes(
          parse(RawAction.date, "yyyy-MM-dd HH:mm:ss", new Date()),
          10,
        ),
        "yyyy-MM-dd HH:mm:ss",
      ),
    });
  }

  const [currentPartners, setCurrentPartners] = useState<Partner[]>([]);

  const [workFiles, setWorkFiles] = useState<string[]>(
    RawAction.work_files ?? [],
  );
  const [contentFiles, setContentFiles] = useState<string[]>(
    RawAction.content_files ?? [],
  );

  function updateContentFiles(next: string[]) {
    setContentFiles(next);
    setRawAction((prev) => ({ ...prev, content_files: next }));
    updateAction({ content_files: next });
  }

  async function updateAction(data?: { [key: string]: any }) {
    if (RawAction.id) {
      await handleAction(
        {
          ...RawAction,
          ...data,
          intent: INTENT.update_action,
        },
        submit,
      );
    }
  }

  useEffect(() => {
    if (RawAction.partners.length === 0) return;
    setCurrentPartners(
      RawAction.partners.map((p) =>
        partners.find((partner) => partner.slug === p),
      ) as Partner[],
    );
  }, [RawAction.partners]);

  useEffect(() => {
    if (currentPartners.length > 0) {
      setRawAction({ ...RawAction, color: currentPartners[0].colors[0] });
    }
  }, [currentPartners]);

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.intent === INTENT.caption_ai) {
        setRawAction((prev) => ({
          ...prev,
          instagram_caption: fetcher.data.output.concat(
            getCaptionTail(currentPartners[0].instagram_caption_tail),
          ),
        }));
      }
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (isAIProcessing) {
      setTimeout(() => {}, 2000);
    } else {
    }
  }, [isAIProcessing]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLocaleLowerCase() === "escape") {
        event.preventDefault();
        onClose();
      } else if (event.key.toLocaleLowerCase() === "enter" && event.metaKey) {
        event.preventDefault();
        handleSaveRef.current();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className={cn(
        "bg-background fixed top-17 right-0 bottom-0 z-10 flex w-full shrink-0 flex-col overflow-hidden border-l",

        view === "instagram" ? "md:w-3xl" : "md:w-2xl",
      )}
    >
      {/* Tabs */}
      <div className="flex shrink-0 divide-x">
        <div
          className={`flex w-full cursor-pointer items-center justify-center gap-2 border-b p-4 text-sm font-medium ${view !== "essential" ? "bg-muted border-border" : "bg-background border-b-transparent"}`}
          onClick={() => setView("essential")}
        >
          ESSENCIAL <Heart className="size-4" />
        </div>
        {isInstagramFeed(RawAction.category) && (
          <div
            className={`flex w-full cursor-pointer items-center justify-center gap-2 border-b p-4 text-sm font-medium ${view !== "instagram" ? "bg-muted border-border" : "bg-background border-b-transparent"}`}
            onClick={() => setView("instagram")}
          >
            INSTAGRAM <IconBrandInstagram className="size-4" />
          </div>
        )}
        <div
          className={`flex w-full cursor-pointer items-center justify-center gap-2 border-b p-4 text-sm font-medium ${view !== "chat" ? "bg-muted border-border" : "bg-background border-b-transparent"}`}
          onClick={() => setView("chat")}
        >
          CHAT <MessageCircle className="size-4" />
        </div>
        <div>
          <button
            className="flex w-full cursor-pointer items-center justify-center gap-2 border-b p-5 text-sm font-medium"
            onClick={onClose}
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div className="relative flex h-full grow flex-col overflow-hidden">
        {/* Essencial */}

        {view === "essential" && (
          <EssentialsTab
            RawAction={RawAction}
            setRawAction={setRawAction}
            updateAction={updateAction}
            workFiles={workFiles}
            setWorkFiles={setWorkFiles}
            currentPartners={currentPartners}
            cloudName={cloudName}
            uploadPreset={uploadPreset}
          />
        )}
        {view === "instagram" && (
          <InstagramTab
            RawAction={RawAction}
            setRawAction={setRawAction}
            contentFiles={contentFiles}
            updateContentFiles={updateContentFiles}
            currentPartners={currentPartners}
            cloudName={cloudName}
            uploadPreset={uploadPreset}
            isAIProcessing={isAIProcessing}
            fetcher={fetcher}
          />
        )}
        {view === "chat" && <div className="h-full"></div>}
        {/* Criar e Atualizar */}
        <ActionFormFooter
          RawAction={RawAction}
          setRawAction={setRawAction}
          updateAction={updateAction}
          currentPartners={currentPartners}
          isPending={isPending}
          handleSave={handleSave}
        />
      </div>
    </div>
  );
}
