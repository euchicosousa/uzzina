import {
  addMinutes,
  format,
  formatDistanceToNow,
  parse,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon,
  HeartIcon,
  InstagramIcon,
  LoaderCircleIcon,
  MessageCircleIcon,
  PlusIcon,
  UploadCloudIcon,
  Wand2Icon,
  WandIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  useActionData,
  useFetcher,
  useFetchers,
  useMatches,
  useRouteLoaderData,
  useSubmit,
} from "react-router";
import { toast } from "sonner";
import { CategoriesCombobox } from "~/components/features/CategoriesCombobox";
import { Content } from "~/components/features/Content";
import { PartnersCombobox } from "~/components/features/PartnersCombobox";
import { ResponsiblesCombobox } from "~/components/features/ResponsiblesCombobox";
import { StatesCombobox } from "~/components/features/StatesCombobox";
import { Tiptap } from "~/components/features/Tiptap";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { UAvatarGroup } from "~/components/uzzina/UAvatar";
import { UBadge } from "~/components/uzzina/UBadge";
import { DATE_TIME_DISPLAY, INTENT, SIZE } from "~/lib/CONSTANTS";
import {
  getFormattedDateTime,
  getFormattedPartnersName,
  getNewDateForAction,
  handleAction,
  isInstagramFeed,
} from "~/lib/helpers";
import { cn } from "~/lib/utils";

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
  const { partners } = useRouteLoaderData("routes/app") as {
    partners: Partner[];
  };

  const fetcher = useFetcher();

  const [RawAction, setRawAction] = useState<Action>(BaseAction);

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
        addMinutes(
          parse(RawAction.date, "yyyy-MM-dd HH:mm:ss", new Date()),
          10,
        ),
        "yyyy-MM-dd HH:mm:ss",
      ),
    });
  }

  const [currentPartners, setCurrentPartners] = useState<Partner[]>([]);

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
    setCurrentPartners(
      RawAction.partners.map((p) =>
        partners.find((partner) => partner.slug === p),
      ) as Partner[],
    );
  }, [RawAction]);

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
      // setRawAction((prev) => ({
      //   ...prev,
      //   description: fetcher.data as string,
      // }));
    }
  }, [fetcher.data]);

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
          <div className="flex h-full flex-col overflow-hidden p-6">
            <div className="relative">
              <textarea
                value={RawAction.title}
                onChange={(e) =>
                  setRawAction({ ...RawAction, title: e.target.value })
                }
                onBlur={async () => {
                  await updateAction();
                }}
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
                  <ActionCreatedUpdatedTimeDisplay action={RawAction} />
                </div>
                <ResponsiblesCombobox
                  selectedResponsibles={RawAction.responsibles}
                  currentPartners={currentPartners}
                  onSelect={(responsibles) =>
                    setRawAction({ ...RawAction, responsibles })
                  }
                />
              </div>
              <div className="flex gap-8 border-b py-2 opacity-50">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="size-3" />
                  <ActionDatePicker
                    onSelect={async (date) => {
                      setRawAction({
                        ...RawAction,
                        ...getNewDateForAction(RawAction, date),
                      });
                      await updateAction({
                        ...RawAction,
                        ...getNewDateForAction(RawAction, date),
                      });
                    }}
                    date={parseISO(RawAction.date)}
                  />
                </div>
                {isInstagramFeed(RawAction.category) && (
                  <div className="flex items-center gap-1">
                    <InstagramIcon className="size-3" />
                    <ActionDatePicker
                      onSelect={async (date) => {
                        setRawAction({
                          ...RawAction,
                          ...getNewDateForAction(RawAction, date, true),
                        });
                        await updateAction({
                          ...RawAction,
                          ...getNewDateForAction(RawAction, date, true),
                        });
                      }}
                      date={parseISO(RawAction.instagram_date)}
                    />
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
            <div className="h-full overflow-hidden">
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
          </div>
        )}
        {view === "instagram" && (
          <div className="flex h-full p-6 pr-0">
            <div className="h-full max-w-[320px] shrink-0 grow">
              <Content action={RawAction} />
            </div>
            {/* <div className="flex flex-col gap-4">
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
              </div> */}
            <div className="w-2/3 overflow-hidden">
              <div className="flex items-center justify-between border-b px-4 py-4">
                <div className="flex items-center gap-2">
                  <UAvatarGroup
                    avatars={currentPartners.map((partner) => ({
                      fallback: partner.short,
                      backgroundColor: partner.colors[0],
                      color: partner.colors[1],
                    }))}
                  />
                  <div className="text-sm font-medium">
                    {getFormattedPartnersName(currentPartners)}
                  </div>
                </div>
                <Button
                  variant={"ghost"}
                  onClick={() => {
                    fetcher.submit(
                      {
                        intent: INTENT.caption_ai,
                        ...RawAction,
                        context: `${currentPartners[0].context} — ${RawAction.category}`,
                      },
                      {
                        method: "post",
                        action: "/action/handle-ai",
                      },
                    );
                  }}
                >
                  <Wand2Icon />
                </Button>
              </div>
              <div className="flex h-full flex-col">
                <textarea
                  autoFocus
                  value={
                    RawAction.instagram_caption ||
                    getCaptionTail(currentPartners[0].instagram_caption_tail)
                  }
                  onChange={(e) =>
                    setRawAction({
                      ...RawAction,
                      instagram_caption: e.target.value,
                    })
                  }
                  placeholder="Legenda"
                  className="h-full w-full resize-none p-4 outline-none"
                />
              </div>
            </div>
          </div>
        )}
        {view === "chat" && <div className="h-full"></div>}
        {/* Criar e Atualizar */}
        <div className="w-fulld flex shrink-0 justify-between overflow-hidden border-t">
          {/* Coisas */}
          <div className="flex items-center divide-x overflow-hidden">
            <div className="overflow-hidden">
              <PartnersCombobox
                selectedPartners={RawAction.partners}
                onSelect={async (selected) => {
                  setRawAction({
                    ...RawAction,
                    partners: selected,
                  });
                  await updateAction({ partners: selected });
                }}
              />
            </div>

            <div className="">
              <StatesCombobox
                selectedState={RawAction.state}
                onSelect={async (selected) => {
                  setRawAction({
                    ...RawAction,
                    state: selected,
                  });
                  await updateAction({ state: selected });
                }}
              />
            </div>
            <div className="">
              <CategoriesCombobox
                selectedCategory={RawAction.category}
                onSelect={async (selected) => {
                  setRawAction({
                    ...RawAction,
                    category: selected,
                  });
                  await updateAction({ category: selected });
                }}
              />
            </div>
          </div>
          {/* Botão de criar e atualizar */}
          <div className="p-4">
            <Button
              disabled={isPending}
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

const ActionCreatedUpdatedTimeDisplay = ({ action }: { action: Action }) => (
  <div>
    {action.created_at === action.updated_at
      ? `Criada ${formatDistanceToNow(action.created_at, { addSuffix: true, locale: ptBR })}`
      : `Atualizada ${formatDistanceToNow(action.updated_at, { addSuffix: true, locale: ptBR })}`}
  </div>
);

export const ActionDatePicker = ({
  onSelect,
  date,
}: {
  onSelect?: (date: Date) => void;
  date?: Date;
}) => {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(date);

  useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen && onSelect && selectedDate) {
          onSelect(selectedDate);
        }
      }}
    >
      <PopoverTrigger asChild>
        <button className="cursor-pointer underline-offset-4 hover:underline">
          {date
            ? getFormattedDateTime(date, DATE_TIME_DISPLAY.DayDateMonthTime)
            : "Escolha a data"}
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Calendar
          className="w-full"
          mode="single"
          selected={selectedDate}
          locale={ptBR}
          onSelect={(date) => {
            if (date) {
              const newDate = selectedDate
                ? new Date(selectedDate)
                : new Date();
              newDate.setFullYear(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
              );
              setSelectedDate(newDate);
            }
          }}
        />
        <div className="flex items-center justify-between gap-4 border-t p-4">
          <div className="text-sm">Defina a hora</div>
          <Input
            type="time"
            // step={1}

            value={selectedDate ? format(selectedDate, "HH:mm") : ""}
            // value={"13:00"}
            className="w-auto appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            onChange={(e) => {
              if (selectedDate) {
                const [hours, minutes] = e.target.value.split(":").map(Number);
                const newDate = new Date(selectedDate);
                newDate.setHours(hours || 0, minutes || 0);
                setSelectedDate(newDate);
              }
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

function getCaptionTail(instagram_caption_tail: string | null) {
  return "".concat("\n\n").concat(instagram_caption_tail || "");
}
