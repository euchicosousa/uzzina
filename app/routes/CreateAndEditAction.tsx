import Color from "color";
import { addMinutes, format, parse, parseISO } from "date-fns";
import {
  HeartIcon,
  InstagramIcon,
  LoaderCircleIcon,
  MessageCircleIcon,
  PlusIcon,
  UploadCloudIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  useFetcher,
  useFetchers,
  useRouteLoaderData,
  useSubmit,
} from "react-router";
import { toast } from "sonner";
import { CategoriesCombobox } from "~/components/features/CategoriesCombobox";
import { PartnersCombobox } from "~/components/features/PartnersCombobox";
import { StatesCombobox } from "~/components/features/StatesCombobox";
import { Button } from "~/components/ui/button";
import { ActionColorDropdown } from "~/components/features/ActionForm/ActionColorDropdown";
import { EssentialsTab } from "~/components/features/ActionForm/EssentialsTab";
import { InstagramTab } from "~/components/features/ActionForm/InstagramTab";
import type { AppLoaderData } from "~/routes/app";
import { INTENT } from "~/lib/CONSTANTS";
import { handleAction, isInstagramFeed } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import type { Action } from "~/models/actions.server";

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

  const [RawAction, setRawAction] = useState<Action>(BaseAction);

  useEffect(() => {
    setRawAction((prev) => {
      if (prev.id && !BaseAction.id) return prev;
      return BaseAction;
    });
  }, [BaseAction]);

  const submit = useSubmit();
  const fetchers = useFetchers();

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
          ESSENCIAL <HeartIcon className="size-4" />
        </div>
        {isInstagramFeed(RawAction.category) && (
          <div
            className={`flex w-full cursor-pointer items-center justify-center gap-2 border-b p-4 text-sm font-medium ${view !== "instagram" ? "bg-muted border-border" : "bg-background border-b-transparent"}`}
            onClick={() => setView("instagram")}
          >
            INSTAGRAM <InstagramIcon className="size-4" />
          </div>
        )}
        <div
          className={`flex w-full cursor-pointer items-center justify-center gap-2 border-b p-4 text-sm font-medium ${view !== "chat" ? "bg-muted border-border" : "bg-background border-b-transparent"}`}
          onClick={() => setView("chat")}
        >
          CHAT <MessageCircleIcon className="size-4" />
        </div>
        <div>
          <button
            className="flex w-full cursor-pointer items-center justify-center gap-2 border-b p-5 text-sm font-medium"
            onClick={onClose}
          >
            <XIcon className="size-4" />
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
        <div className="w-fulld flex shrink-0 justify-between overflow-hidden border-t">
          {/* Coisas */}
          <div className="flex items-center divide-x overflow-hidden">
            {/* Parceiros Partners Combobox */}
            <div className="overflow-hidden">
              <PartnersCombobox
                selectedPartners={RawAction.partners}
                tabIndex={3}
                onSelect={async (selected) => {
                  setRawAction({
                    ...RawAction,
                    partners: selected,
                  });
                  await updateAction({ partners: selected });
                }}
              />
            </div>
            {/* Estados States Combobox */}
            <div className="">
              <StatesCombobox
                selectedState={RawAction.state}
                tabIndex={4}
                onSelect={async (selected) => {
                  setRawAction({
                    ...RawAction,
                    state: selected,
                  });
                  await updateAction({ state: selected });
                }}
              />
            </div>
            {/* Categorias Categories Combobox */}
            <div className="">
              <CategoriesCombobox
                selectedCategories={[RawAction.category]}
                tabIndex={5}
                onSelect={async ({ category }) => {
                  setRawAction({
                    ...RawAction,
                    category,
                  });
                  await updateAction({ category });
                }}
              />
            </div>
            {isInstagramFeed(RawAction.category) && (
              <div>
                <ActionColorDropdown
                  action={RawAction}
                  partners={currentPartners}
                  tabIndex={6}
                  onSelect={async (color) => {
                    setRawAction({ ...RawAction, color });
                    await updateAction({ color });
                  }}
                />
              </div>
            )}
          </div>
          {/* Botão de criar e atualizar */}
          <div className="p-4">
            <Button
              disabled={isPending}
              className="squircle rounded-2xl"
              tabIndex={7}
              onClick={async (event) => {
                event.preventDefault();
                event.stopPropagation();

                if (!RawAction.title) {
                  toast.error("Erro / O título é obrigatório", {
                    position: "top-center",
                  });
                  return;
                }

                if (RawAction.partners.length === 0) {
                  toast.error(
                    "Erro / Pelo menos um parceiro deve ser selecionado",
                    {
                      position: "top-center",
                    },
                  );
                  return;
                }

                await handleAction(
                  {
                    ...RawAction,
                    intent: RawAction.id
                      ? INTENT.update_action
                      : INTENT.create_action,
                  },
                  submit,
                );
              }}
            >
              {RawAction.id ? "Atualizar" : "Criar Ação"}

              {isPending ? (
                <LoaderCircleIcon className="animate-spin" />
              ) : RawAction.id ? (
                <UploadCloudIcon />
              ) : (
                <PlusIcon />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
