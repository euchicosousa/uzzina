import {
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  CalendarIcon,
  CheckIcon,
  FilterIcon,
  SearchIcon,
  SparklesIcon,
  UserIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  data,
  useLoaderData,
  useMatches,
  useNavigate,
  useOutletContext,
  useSubmit,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";

import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { UAvatar, UAvatarGroup } from "~/components/uzzina/UAvatar";
import { CATEGORIES, INTENT, SIZE, type CATEGORY } from "~/lib/CONSTANTS";
import { handleAction, Icons } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import type { Action } from "~/models/actions.server";
import { getActionsForPlanning } from "~/models/actions.server";
import { getUserId } from "~/services/auth.server";
import type { AppLoaderData } from "./app";

export const runtime = "edge";

export const meta: MetaFunction = () => [
  { title: "Planejamento de Ações | Uzzina" },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user_id, supabase } = await getUserId(request);
  const { data: people } = await supabase
    .from("people")
    .select("admin")
    .eq("user_id", user_id)
    .single();
  const isAdmin = people?.admin || false;

  const { data: partnersData } = await supabase
    .from("partners")
    .select("slug")
    .eq("archived", false);
  const partnerSlugs = partnersData?.map((p) => p.slug) || [];

  const url = new URL(request.url);
  const start =
    url.searchParams.get("start") || format(new Date(), "yyyy-MM-dd");
  const end = url.searchParams.get("end") || format(new Date(), "yyyy-MM-dd");

  const actions = await getActionsForPlanning(
    supabase,
    user_id,
    isAdmin,
    partnerSlugs,
    `${start} 00:00:00`,
    `${end} 23:59:59`,
  );

  return data({ actions, start, end });
};

// Mapeamento das colunas da tabela de planejamento
const PLANNING_COLUMNS = [
  { slug: "idea", title: "Ideia", color: "#fb3" },
  { slug: "estrategia", title: "Estratégia", color: "#F75" },
  { slug: "alinhamento", title: "Alinhamento", color: "#f49" },
  { slug: "criacao", title: "Produção", color: "#93e" },
  { slug: "aprovacao", title: "Validação", color: "#06f" },
  { slug: "concluido", title: "Concluído", color: "#7c3" },
];

export default function PlanningPage() {
  const { actions, start, end } = useLoaderData<typeof loader>();
  const { partners, people } = useMatches()[1].loaderData as AppLoaderData;
  const { setBaseAction } = useOutletContext<{
    setBaseAction: (action: Action | null) => void;
  }>();
  const submit = useSubmit();
  const navigate = useNavigate();

  // Estados dos filtros no frontend
  const [selectedPartner, setSelectedPartner] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Estado otimista para mudanças instantâneas de fase
  const [optimisticPhases, setOptimisticPhases] = useState<
    Record<string, string>
  >({});

  // Limpa overrides quando novos dados chegam do loader
  useEffect(() => {
    setOptimisticPhases({});
  }, [actions]);

  // Handler para atualizar o intervalo de datas na URL
  const handleDateChange = (newStart: string, newEnd: string) => {
    navigate(`?start=${newStart}&end=${newEnd}`);
  };

  // Atalhos de datas
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const isToday = start === todayStr && end === todayStr;

  const startOfThisWeek = format(
    startOfWeek(new Date(), { weekStartsOn: 0 }),
    "yyyy-MM-dd",
  );
  const endOfThisWeek = format(
    endOfWeek(new Date(), { weekStartsOn: 0 }),
    "yyyy-MM-dd",
  );
  const isThisWeek = start === startOfThisWeek && end === endOfThisWeek;

  const startOfThisMonth = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const endOfThisMonth = format(endOfMonth(new Date()), "yyyy-MM-dd");
  const isThisMonth = start === startOfThisMonth && end === endOfThisMonth;

  // Filtragem das ações no frontend
  const filteredActions = useMemo(() => {
    return actions.filter((action) => {
      // Filtro de Parceiro
      if (
        selectedPartner !== "all" &&
        !action.partners?.includes(selectedPartner)
      ) {
        return false;
      }

      // Filtro de Categoria
      if (selectedCategory !== "all") {
        if (selectedCategory === "instagram") {
          // Apenas Instagram: Reels, Post, Carrossel, Stories
          const isInsta = ["reels", "post", "carousel", "stories"].includes(
            action.category,
          );
          if (!isInsta) return false;
        } else if (action.category !== selectedCategory) {
          return false;
        }
      }

      // Filtro de Busca (Título)
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesTitle = action.title?.toLowerCase().includes(query);
        const matchesCaption = action.instagram_caption
          ?.toLowerCase()
          .includes(query);
        if (!matchesTitle && !matchesCaption) return false;
      }

      return true;
    });
  }, [actions, selectedPartner, selectedCategory, searchQuery]);

  // Executa a transição de fase
  const handlePhaseChange = (action: Action, newPhase: string) => {
    // Atualiza otimistamente no cliente
    setOptimisticPhases((prev) => ({ ...prev, [action.id]: newPhase }));

    // Persiste no banco de dados
    handleAction(
      {
        ...action,
        intent: INTENT.update_action,
        phase: newPhase,
      },
      submit,
    );
  };

  // Helpers para calcular posições e larguras da linha do tempo
  const getPhaseIndex = (phaseSlug: string) => {
    return PLANNING_COLUMNS.findIndex((col) => col.slug === phaseSlug);
  };

  const currentRangeLabel = useMemo(() => {
    if (isToday) return "Hoje";
    if (isThisWeek) return "Esta Semana";
    if (isThisMonth) return "Este Mês";

    const parsedStart = parseISO(start);
    const parsedEnd = parseISO(end);
    if (isSameDay(parsedStart, parsedEnd)) {
      return format(parsedStart, "d 'de' MMMM", { locale: ptBR });
    }
    return `${format(parsedStart, "d 'de' MMM", { locale: ptBR })} - ${format(parsedEnd, "d 'de' MMM", { locale: ptBR })}`;
  }, [start, end, isToday, isThisWeek, isThisMonth]);

  return (
    <div className="page-height flex flex-col overflow-hidden bg-background">
      {/* Header com Título e Filtro de Período */}
      <div className="flex shrink-0 flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h1 className="p-0 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Planejamento de Ações
          </h1>
        </div>

        {/* Seleção de Datas */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Botões Rápidos */}
          <div className="flex rounded-lg bg-muted p-1">
            <button
              onClick={() => handleDateChange(todayStr, todayStr)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                isToday
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Hoje
            </button>
            <button
              onClick={() => handleDateChange(startOfThisWeek, endOfThisWeek)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                isThisWeek
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Semana
            </button>
            <button
              onClick={() => handleDateChange(startOfThisMonth, endOfThisMonth)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                isThisMonth
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Mês
            </button>
          </div>

          {/* Date Picker Customizado */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2 pl-3">
                <CalendarIcon className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium capitalize">
                  {currentRangeLabel}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{
                  from: parseISO(start),
                  to: parseISO(end),
                }}
                onSelect={(range) => {
                  if (range?.from) {
                    const startFormatted = format(range.from, "yyyy-MM-dd");
                    const endFormatted = range.to
                      ? format(range.to, "yyyy-MM-dd")
                      : startFormatted;
                    handleDateChange(startFormatted, endFormatted);
                  }
                }}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Barra de Filtros (Parceiro, Categoria, Busca) */}
      <div className="flex shrink-0 flex-col gap-3 border-b bg-card/40 p-4 sm:flex-row sm:items-center sm:gap-4">
        {/* Busca por Título */}
        <InputGroup className="h-9 max-w-xs">
          <InputGroupAddon>
            <SearchIcon className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Buscar ação..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs"
          />
        </InputGroup>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro de Parceiro */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                <UserIcon className="size-3.5 text-muted-foreground" />
                <span className="text-xs font-medium">
                  {selectedPartner === "all"
                    ? "Todos os Parceiros"
                    : partners.find((p) => p.slug === selectedPartner)?.title ||
                      selectedPartner}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuItem
                onClick={() => setSelectedPartner("all")}
                className="text-xs"
              >
                Todos os Parceiros
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {partners.map((partner) => (
                <DropdownMenuItem
                  key={partner.id}
                  onClick={() => setSelectedPartner(partner.slug)}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <UAvatar
                      size={SIZE.xs}
                      fallback={partner.short}
                      image={partner.image}
                      backgroundColor={partner.colors[0]}
                      color={partner.colors[1]}
                    />
                    <span>{partner.title}</span>
                  </div>
                  {selectedPartner === partner.slug && (
                    <CheckIcon className="size-3.5" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filtro de Categoria */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                <FilterIcon className="size-3.5 text-muted-foreground" />
                <span className="text-xs font-medium">
                  {selectedCategory === "all"
                    ? "Todas as Categorias"
                    : selectedCategory === "instagram"
                      ? "Apenas Instagram"
                      : CATEGORIES[selectedCategory as CATEGORY]?.title ||
                        selectedCategory}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="max-h-80 w-56 overflow-y-auto"
              align="start"
            >
              <DropdownMenuItem
                onClick={() => setSelectedCategory("all")}
                className="text-xs"
              >
                Todas as Categorias
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSelectedCategory("instagram")}
                className="flex items-center gap-2 text-xs"
              >
                <SparklesIcon className="size-3.5 text-pink-500" />
                Apenas Instagram
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {Object.values(CATEGORIES).map((category) => (
                <DropdownMenuItem
                  key={category.slug}
                  onClick={() => setSelectedCategory(category.slug)}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Icons
                      slug={category.slug}
                      color={category.color}
                      className="size-3.5"
                    />
                    <span>{category.title}</span>
                  </div>
                  {selectedCategory === category.slug && (
                    <CheckIcon className="size-3.5" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Badge com quantidade total de ações filtradas */}
        <div className="ml-auto hidden text-xs font-medium text-muted-foreground sm:block">
          Mostrando {filteredActions.length} de {actions.length} ações
        </div>
      </div>

      {/* Tabela de Planejamento */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[1000px]">
          <div className="overflow-hidden">
            {/* Cabeçalho da Tabela */}
            <div className="grid grid-cols-[280px_1fr] items-center border-b bg-muted/40 py-3.5 text-xs font-medium text-muted-foreground">
              <div className="pl-6 font-semibold">Ação</div>
              <div className="grid grid-cols-6 text-center font-semibold select-none">
                {PLANNING_COLUMNS.map((col) => (
                  <div
                    key={col.slug}
                    style={{ color: col.color }}
                    className="text-[10px] font-bold tracking-wide uppercase"
                  >
                    {col.title}
                  </div>
                ))}
              </div>
            </div>

            {/* Linhas da Tabela */}
            {filteredActions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                <p className="text-sm font-medium">
                  Nenhuma ação encontrada para os filtros selecionados.
                </p>
                <p className="mt-1 text-xs text-muted-foreground/80">
                  Experimente alterar o intervalo de datas ou limpar os filtros.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredActions.map((action) => {
                  const currentPhaseSlug =
                    optimisticPhases[action.id] || action.phase || "idea";
                  const activeIndex = getPhaseIndex(currentPhaseSlug);

                  // Busca o parceiro da ação
                  const actionPartners = partners.filter((p) =>
                    action.partners?.includes(p.slug),
                  );
                  const actionCategory =
                    CATEGORIES[action.category as CATEGORY];

                  // Calcula a largura da linha de progresso
                  const progressPercentage =
                    activeIndex >= 0
                      ? (activeIndex / (PLANNING_COLUMNS.length - 1)) * 100
                      : 0;
                  const activeColor =
                    PLANNING_COLUMNS[activeIndex]?.color || "#cbd5e1";

                  return (
                    <div
                      key={action.id}
                      className="grid grid-cols-[280px_1fr] items-center py-4 transition-colors hover:bg-muted/15"
                    >
                      {/* Coluna 1: Info da Ação */}
                      <div className="flex items-center gap-3 overflow-hidden px-6">
                        {/* Ícone de Categoria */}
                        <div
                          className="flex size-9 shrink-0 items-center justify-center rounded-lg border text-white transition-colors"
                          style={{
                            backgroundColor: actionCategory?.color + "15",
                            borderColor: actionCategory?.color + "30",
                          }}
                        >
                          {actionCategory ? (
                            <Icons
                              slug={actionCategory.slug}
                              color={actionCategory.color}
                              className="size-4.5"
                            />
                          ) : (
                            <div className="size-2.5 rounded-full bg-muted-foreground" />
                          )}
                        </div>

                        {/* Detalhes do Título e Parceiro */}
                        <div className="w-full min-w-0">
                          <button
                            onClick={() => setBaseAction(action)}
                            className="block w-full truncate text-left text-sm font-medium text-foreground hover:underline"
                          >
                            {action.title}
                          </button>

                          <div className="mt-1 flex items-center justify-between gap-2">
                            {actionPartners && (
                              <UAvatarGroup
                                size={SIZE.xs}
                                avatars={actionPartners.map((partner) => ({
                                  fallback: partner.short,
                                  image: partner.image,
                                  backgroundColor: partner.colors[0],
                                  color: partner.colors[1],
                                }))}
                              />
                              // <div className="flex items-center gap-1">
                              //   <span
                              //     className="h-2 w-2 rounded-full"
                              //     style={{
                              //       backgroundColor: actionPartner.colors[0],
                              //     }}
                              //   />
                              //   <span className="text-[11px] font-semibold text-muted-foreground">
                              //     {actionPartner.title}
                              //   </span>
                              // </div>
                            )}

                            <span className="text-[11px] text-muted-foreground">
                              {format(
                                parseISO(action.date),
                                "dd/MM 'às' HH:mm",
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Coluna 2: Progresso Horizontal com Dots */}
                      <div className="relative">
                        {/* Linha de Progresso Geral (Fundo) */}
                        <div
                          className="absolute top-1/2 z-0 h-[3px] -translate-y-1/2 rounded-full bg-muted/80"
                          style={{
                            left: `${(1 / 12) * 100}%`,
                            right: `${(1 / 12) * 100}%`,
                          }}
                        />

                        {/* Linha de Progresso Ativa (Preenchimento) */}
                        <div
                          className="absolute top-1/2 z-0 h-[3px] -translate-y-1/2 rounded-full transition-all duration-300 ease-out"
                          style={{
                            left: `${(1 / 12) * 100}%`,
                            width: `${(activeIndex / 6) * 100}%`,
                            backgroundColor: activeColor,
                          }}
                        />

                        {/* Grade com os Dots */}
                        <div className="relative z-10 grid grid-cols-6 items-center justify-items-center text-center">
                          {PLANNING_COLUMNS.map((col, idx) => {
                            const isCompleted = idx < activeIndex;
                            const isActive = idx === activeIndex;

                            return (
                              <div
                                key={col.slug}
                                className="flex items-center justify-center"
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    handlePhaseChange(action, col.slug)
                                  }
                                  className={cn(
                                    "group relative flex size-5.5 cursor-pointer items-center justify-center rounded-full border transition-all duration-200 outline-none",
                                    isActive
                                      ? "border-2 bg-background shadow-md"
                                      : isCompleted
                                        ? "border-transparent bg-foreground"
                                        : "border-muted-foreground/30 bg-muted hover:border-muted-foreground/60 hover:bg-muted-foreground/10",
                                  )}
                                  style={{
                                    borderColor: isActive
                                      ? col.color
                                      : "transparent",
                                  }}
                                  title={`Mover para ${col.title}`}
                                >
                                  {/* Dot pulsante se ativo */}
                                  {isActive && (
                                    <>
                                      {/* <span
                                        className="absolute inline-flex h-full w-full rounded-full opacity-35"
                                        style={{ backgroundColor: col.color }}
                                      /> */}
                                      <span
                                        className="relative inline-flex size-2 rounded-full"
                                        style={{ backgroundColor: col.color }}
                                      />
                                    </>
                                  )}

                                  {/* Ícone de check pequeno se concluído */}
                                  {isCompleted && (
                                    <CheckIcon className="size-3 stroke-3 text-background" />
                                  )}

                                  {/* Tooltip de hover */}
                                  <span className="absolute bottom-full z-30 mb-2 hidden rounded bg-foreground px-2 py-1 text-[10px] font-semibold whitespace-nowrap text-background shadow-sm transition-all group-hover:flex">
                                    {col.title}
                                  </span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
