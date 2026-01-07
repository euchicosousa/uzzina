import Color from "color";
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
import { Content } from "~/components/features/Content";
import { GMGCombobox } from "~/components/features/GMGCombobox";
import { PartnersCombobox } from "~/components/features/PartnersCombobox";
import { ResponsiblesCombobox } from "~/components/features/ResponsiblesCombobox";
import { StatesCombobox } from "~/components/features/StatesCombobox";
import { Tiptap } from "~/components/features/Tiptap";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { UAvatarGroup } from "~/components/uzzina/UAvatar";
import { UBadge } from "~/components/uzzina/UBadge";
import { DATE_TIME_DISPLAY, INTENT } from "~/lib/CONSTANTS";
import {
  getFormattedDateTime,
  getFormattedPartnersName,
  getNewDateForAction,
  handleAction,
  isColorValid,
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
          <div className="flex h-full flex-col overflow-hidden p-6">
            {/* Título */}
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

            <div className="pb-6 text-sm">
              <div className="flex flex-wrap items-center gap-4 border-b py-2">
                <div className="opacity-50">
                  <ActionCreatedUpdatedTimeDisplay action={RawAction} />
                </div>
                <ResponsiblesCombobox
                  selectedResponsibles={RawAction.responsibles}
                  currentPartners={currentPartners}
                  onSelect={async (responsibles) => {
                    setRawAction({ ...RawAction, responsibles });
                    await updateAction({
                      ...RawAction,
                      responsibles,
                    });
                  }}
                />
              </div>
              <div className="flex gap-8 border-b py-2">
                <div className="flex items-center gap-1 opacity-50">
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
                {isInstagramFeed(
                  RawAction.category,
                  RawAction.category === "stories",
                ) && (
                  <div className="flex items-center gap-1 opacity-50">
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

              {isInstagramFeed(
                RawAction.category,
                RawAction.category === "stories",
              ) && (
                <div className="flex gap-4 border-b text-sm">
                  <div>
                    <GMGCombobox
                      gmg="genesis"
                      className="py-2 underline-offset-4 opacity-50 hover:underline"
                    />
                  </div>
                  <div>
                    <GMGCombobox
                      gmg="missions"
                      className="py-2 underline-offset-4 opacity-50 hover:underline"
                    />
                  </div>
                  <div>
                    <GMGCombobox
                      gmg="goals"
                      className="py-2 underline-offset-4 opacity-50 hover:underline"
                    />
                  </div>
                </div>
              )}
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

            <div className="flex w-2/3 flex-col overflow-hidden">
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
                  disabled={isAIProcessing}
                  className="disabled:opacity-50"
                  onClick={() => {
                    fetcher.submit(
                      {
                        intent: INTENT.caption_ai,
                        ...RawAction,
                        contexto: `${currentPartners[0].context} — ${RawAction.category}`,
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
                <AiProcessingMessage isAIProcessing={isAIProcessing} />
                <textarea
                  disabled={isAIProcessing}
                  autoFocus
                  value={
                    RawAction.instagram_caption ||
                    getCaptionTail(
                      currentPartners.length > 0
                        ? currentPartners[0].instagram_caption_tail
                        : "",
                    )
                  }
                  onChange={(e) =>
                    setRawAction({
                      ...RawAction,
                      instagram_caption: e.target.value,
                    })
                  }
                  placeholder="Legenda"
                  className="h-full w-full resize-none p-4 outline-none disabled:opacity-50"
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
            {/* Parceiros Partners Combobox */}
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
            {/* Estados States Combobox */}
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
            {/* Categorias Categories Combobox */}
            <div className="">
              <CategoriesCombobox
                selectedCategories={[RawAction.category]}
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

function ActionColorDropdown({
  action,
  partners,
  onSelect,
}: {
  action: Action;
  partners: Partner[];
  onSelect?: (color: string) => void;
}) {
  const [selected, setSelected] = useState(action.color);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="hover:bg-secondary flex items-center gap-2 p-6 text-sm outline-none">
          <div
            className="size-5 rounded-full border border-black/5"
            style={{ backgroundColor: action.color }}
          ></div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="grid w-40 grid-cols-3 gap-2 p-2">
        {[
          ...new Set(
            (partners.length > 0
              ? partners.map((partner) =>
                  partner.colors.map((color) => Color(color).hex()),
                )
              : [
                  Color(action.color).lighten(0.4).hex(),
                  action.color,
                  Color(action.color).darken(0.4).hex(),
                ]
            ).flat(),
          ),
        ].map((color, index) => (
          <DropdownMenuItem
            key={index}
            className="cursor-pointer p-0 hover:opacity-50"
            onSelect={() => {
              setSelected(color);
              onSelect?.(color);
            }}
          >
            <div
              className="aspect-[4/5] w-12 rounded border border-black/5"
              style={{ backgroundColor: color }}
            ></div>
          </DropdownMenuItem>
        ))}
        <div className="col-span-3 flex w-full items-center gap-2">
          <Input
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value);
              if (!isColorValid(e.target.value)) {
                return;
              }
              onSelect?.(e.target.value);
            }}
            className="w-auto"
          />
          <div
            className="size-6 shrink-0 rounded-full border"
            style={{
              backgroundColor: isColorValid(selected)
                ? Color(selected).hex()
                : action.color,
            }}
          ></div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const loadingStates = {
  initial: [
    "Ouvindo com atenção...",
    "Recebendo o briefing...",
    "Entendido. Vamos lá!",
    "Iniciando os motores...",
    "Ativando neurônios...",
    "Captando a ideia...",
    "Abrindo os arquivos...",
    "Analisando o pedido...",
    "Preparando o ambiente...",
    "Conectando os sinais...",
  ],
  loop: [
    "Refinando os detalhes...",
    "Polindo a resposta...",
    "Conectando os pontos...",
    "Mergulhando nos dados...",
    "Tecendo conexões...",
    "Ajustando o foco...",
    "Lapidando a ideia...",
    "Sincronizando...",
    "Organizando o caos...",
    "Calculando rotas...",
    "Destilando informações...",
    "Decifrando...",
    "Customizando...",
    "Alinhando conceitos...",
    "Criando a mágica...",
    "Buscando referências...",
    "Estruturando...",
    "Esculpindo...",
    "Calibrando...",
    "Finalizando o rascunho...",
  ],
};

const AiProcessingMessage = ({
  isAIProcessing,
}: {
  isAIProcessing: boolean;
}) => {
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    if (isAIProcessing) {
      // 1. Define uma mensagem inicial aleatória imediatamente
      const randomInitial =
        loadingStates.initial[
          Math.floor(Math.random() * loadingStates.initial.length)
        ];
      setCurrentMessage(randomInitial);

      // 2. Após 1 segundo (1000ms), inicia o loop das outras mensagens
      timeoutId = setTimeout(() => {
        // Função para pegar uma mensagem aleatória do loop
        const setRandomLoopMessage = () => {
          const randomLoop =
            loadingStates.loop[
              Math.floor(Math.random() * loadingStates.loop.length)
            ];
          setCurrentMessage(randomLoop);
        };

        setRandomLoopMessage(); // Dispara a primeira do loop logo após 1s

        // Define o intervalo para trocar a mensagem a cada 3 segundos (tempo bom para leitura)
        intervalId = setInterval(setRandomLoopMessage, 3000);
      }, 1000);
    } else {
      // Se parou de processar, limpa a mensagem
      setCurrentMessage("");
    }

    // Limpeza (Cleanup): Essencial para não vazar memória ou rodar processos em background
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [isAIProcessing]);

  if (!isAIProcessing) return null;

  return (
    <div className="text-muted-foreground animate-pulse p-4 pb-0 font-mono text-xs">
      {currentMessage}
    </div>
  );
};
