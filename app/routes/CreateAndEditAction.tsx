import { addMinutes, format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon,
  CloudUploadIcon,
  HeartIcon,
  ImageUpIcon,
  InstagramIcon,
  LoaderCircleIcon,
  MessageCircleIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useMatches, useSubmit, useFetchers } from "react-router";
import { Button } from "~/components/ui/button";
import { UAvatarGroup } from "~/components/uzzina/UAvatar";
import { UBadge } from "~/components/uzzina/UBadge";
import { DATE_TIME_DISPLAY, INTENT, SIZE } from "~/lib/CONSTANTS";
import {
  getFormattedDateTime,
  handleAction,
  isInstagramFeed,
} from "~/lib/helpers";
import { cn } from "~/lib/utils";
import { Tiptap } from "~/components/features/Tiptap";
import { Content } from "~/components/features/Content";
import { toast } from "sonner";

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
  const { partners } = useMatches()[1].loaderData as { partners: Partner[] };

  const [RawAction, setRawAction] = useState<Action>(BaseAction);

  console.log({ RawAction });


  useEffect(() => {
    setRawAction(BaseAction);
  }, [BaseAction]);

  const submit = useSubmit();
  const fetchers = useFetchers();

  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setIsPending(fetchers.filter((f) => f.formData).length > 0);
  }, [fetchers]);

  if (!RawAction.created_at) {
    setRawAction({
      ...RawAction,
      created_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      instagram_date: format(
        addMinutes(RawAction.date, 10),
        "yyyy-MM-dd HH:mm:ss",
      ),
    });
  }

  const [currentPartners, setCurrentPartners] = useState<Partner[]>([]);

  useEffect(() => {
    setCurrentPartners(
      RawAction.partners.map((p) =>
        partners.find((partner) => partner.slug === p),
      ) as Partner[],
    );
    // console.log({ currentPartners });
  }, [RawAction]);

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.4, ease: "circInOut" }}
      className={cn(
        "bg-background fixed top-17 right-0 bottom-0 z-10 flex w-full shrink-0 flex-col overflow-hidden border-l",
        view === "instagram" ? "md:w-md" : "md:w-2xl",
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
        <div
          className={`flex w-full cursor-pointer items-center justify-center gap-2 border-b p-4 text-sm font-medium ${view !== "instagram" ? "bg-muted border-border" : "bg-background border-b-transparent"}`}
          onClick={() => setView("instagram")}
        >
          INSTAGRAM <InstagramIcon className="size-4" />
        </div>
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

      <div className="relative flex h-full grow flex-col overflow-hidden p-4">
        {view === "essential" && (
          <>
            <div className="relative">
              <textarea
                value={RawAction.title}
                onChange={(e) =>
                  setRawAction({ ...RawAction, title: e.target.value })
                }
                placeholder="Título"
                className={cn(
                  "w-full shrink-0 resize-none overflow-hidden pt-2 pb-1 leading-none font-semibold tracking-tighter outline-none",
                  RawAction.title.length > 70
                    ? "text-error text-4xl"
                    : "text-5xl",
                )}
                //   @ts-ignore
                style={{ fieldSizing: "content" }}
                autoFocus
                maxLength={100}
              />
              {RawAction.title.length > 70 && (
                <div className="absolute right-0 bottom-0">
                  <UBadge isDynamic value={RawAction.title.length} />
                </div>
              )}
            </div>
            {/* <pre>{JSON.stringify(RawAction, null, 2)}</pre> */}
            <div className="pb-6 text-sm">
              <div className="flex flex-wrap items-center gap-4 border-b py-2">
                <div className="opacity-50">
                  <ActionCreatedUpdatedTimeDysplay action={RawAction} />
                </div>
                <ActionResponsiblesDisplay action={RawAction} size={SIZE.sm} />
              </div>
              <div className="flex gap-8 border-b py-2 opacity-50">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="size-3" />
                  {getFormattedDateTime(
                    RawAction.date,
                    DATE_TIME_DISPLAY.DayDateMonthTime,
                  )}
                </div>
                {isInstagramFeed(RawAction.category) && (
                  <div className="flex items-center gap-1">
                    <InstagramIcon className="size-3" />
                    {getFormattedDateTime(
                      RawAction.instagram_date,
                      DATE_TIME_DISPLAY.DayDateMonthTime,
                    )}
                  </div>
                )}
              </div>

              {/* <div>Cor</div>
          <div>Categoria</div>
          <div>Prioridade</div>
          <div>Tópicos</div>
          <div>Arquivos</div>
          <div>Sprint</div>
          <div>parceiros</div>
          <div>tempo</div>
          <div>State</div> */}
            </div>
            {/* Descrição */}
            <div className="grow overflow-hidden">
              <Tiptap
                content={RawAction.description || ""}
                handleBlur={async (content) => {
                  if (content === RawAction.description) {
                    return;
                  }

                  setRawAction({ ...RawAction, description: content });
                  await handleAction(
                    {
                      ...RawAction,
                      description: content,
                      intent: INTENT.update_action,
                    },
                    submit,
                  );
                }}
                className="h-full w-full"
              />
            </div>
          </>
        )}
        {view === "instagram" && (
          <>
            <div className="flex gap-2">
              <Content action={RawAction} />
              <div className="flex flex-col gap-4">
                <div className="text-sm font-bold">Conteúdo</div>
                <div className="flex gap-1">
                  <Button variant={"secondary"}>
                    <ImageUpIcon />
                  </Button>
                  <Button variant={"secondary"}>
                    <Trash2Icon />
                  </Button>
                </div>
                <div className="text-sm font-bold">Trabalho</div>
                <div className="flex gap-1">
                  <Button variant={"secondary"}>
                    <ImageUpIcon />
                  </Button>
                  <Button variant={"secondary"}>
                    <Trash2Icon />
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-4 grow overflow-hidden">
              <textarea
                autoFocus
                value={
                  RawAction.instagram_caption ||
                  ""
                    .concat("\n\n")
                    .concat(currentPartners[0].instagram_caption_tail || "")
                }
                onChange={(e) =>
                  setRawAction({
                    ...RawAction,
                    instagram_caption: e.target.value,
                  })
                }
                placeholder="Legenda"
                className="h-full w-full resize-none outline-none"
              />
            </div>
          </>
        )}
        {view === "chat" && <></>}
        <div className="flex shrink-0 justify-end pt-2">
          <Button
            disabled={isPending}
            onClick={async (event) => {
              event.preventDefault();
              event.stopPropagation();

              if (!RawAction.title) {
                toast.error("Erro", {
                  description: "O título é obrigatório",
                  position: "top-center",
                });
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
            {RawAction.id ? "Atualizar" : "Salvar"}

            {isPending ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : (
              <CloudUploadIcon />
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

const ActionCreatedUpdatedTimeDysplay = ({ action }: { action: Action }) => (
  <div>
    {action.created_at === action.updated_at
      ? `Criada ${formatDistanceToNow(action.created_at, { addSuffix: true, locale: ptBR })}`
      : `Atualizada ${formatDistanceToNow(action.updated_at, { addSuffix: true, locale: ptBR })}`}
  </div>
);

const ActionResponsiblesDisplay = ({
  action,
  size = SIZE.md,
}: {
  action: Action;
  size?: (typeof SIZE)[keyof typeof SIZE];
}) => {
  const { people } = useMatches()[1].loaderData as { people: Person[] };
  const responsibles = action.responsibles
    .map((r) => people.find((p) => p.user_id === r))
    .filter((p) => p !== undefined);

  return (
    <div className="flex items-center gap-2">
      <UAvatarGroup
        avatars={responsibles.map((p) => ({
          image: p!.image,
          id: p!.id,
          fallback: p!.short,
        }))}
        size={size}
      />
      <div className="opacity-50">
        {responsibles.length > 1
          ? responsibles.map((p) => p.name).join(", ")
          : `${responsibles[0].name} ${responsibles[0].surname}`}
      </div>
    </div>
  );
};
