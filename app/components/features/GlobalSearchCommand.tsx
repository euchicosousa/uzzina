import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { Action, Partner } from "~/types";
import {
  PrismCheckbox,
  PrismCommand,
  PrismCommandDialog,
  PrismCommandEmpty,
  PrismCommandGroup,
  PrismCommandInput,
  PrismCommandItem,
  PrismCommandList,
} from "~/components/prism";
import { DATE_TIME_DISPLAY, PHASES, type PHASE } from "~/lib/CONSTANTS";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import { searchActionsByTitle } from "~/models/actions";
import { getFormattedDateTime } from "~/utils/date";
import { UAvatar } from "../uzzina/UAvatar";
import { PartnersCombobox } from "./PartnersCombobox";
import { PhaseIcon } from "./PhaseIcon";
import {
  ArchiveIcon,
  PlusIcon,
  UserIcon,
  SunIcon,
  MoonIcon,
  LaptopIcon,
  HomeIcon,
  CalendarIcon,
  BellIcon,
  UsersIcon,
  HelpCircleIcon,
  LogOutIcon,
  BriefcaseIcon,
  UserPlusIcon,
  SettingsIcon,
  RotateCcwIcon,
} from "lucide-react";
import { useAppThemeContext, type ThemePreference } from "~/hooks/useAppTheme";
import { usePreferencePersistence } from "~/hooks/usePreferencePersistence";
import { useAppContext } from "~/contexts/AppContext";
import { createActionDraft, resolveDraftPartners } from "~/utils/factory";
type GlobalSearchCommandProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partners: Partner[];
  setPrimaryAction: (action: Action) => Promise<boolean>;
  setSecondaryAction: (action: Action) => Promise<boolean>;
  onBeforeLeave: () => Promise<boolean>;
};
export function GlobalSearchCommand({
  open,
  ...props
}: GlobalSearchCommandProps) {
  const location = useLocation();
  const { person } = useAppContext();
  const { setTheme, themePreference } = useAppThemeContext();
  // Keep the persistence owner mounted when a command closes the search.
  const { queuePreference, hasError, retry } = usePreferencePersistence(person);
  const initialPartnerSlug =
    location.pathname.match(/^\/app\/partner\/([^/]+)\/?$/)?.[1] ?? null;
  return (
    <PrismCommandDialog onOpenChange={props.onOpenChange} open={open}>
      {open && (
        <GlobalSearchContent
          {...props}
          initialPartnerSlug={initialPartnerSlug}
          themePreference={themePreference}
          onThemeChange={(theme) => {
            setTheme(theme);
            queuePreference({ theme });
          }}
          preferenceError={hasError}
          retryPreferences={retry}
        />
      )}
    </PrismCommandDialog>
  );
}

function GlobalSearchContent({
  initialPartnerSlug,
  onOpenChange,
  partners,
  setPrimaryAction,
  setSecondaryAction,
  onBeforeLeave,
  themePreference,
  onThemeChange,
  preferenceError,
  retryPreferences,
}: Omit<GlobalSearchCommandProps, "open"> & {
  initialPartnerSlug: string | null;
  themePreference: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
  preferenceError: boolean;
  retryPreferences: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { person, partnerFilters } = useAppContext();
  const navigatingResultsRef = useRef(false);
  const [searchResults, setSearchResults] = useState<{
    actions: Action[];
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [query, setQuery] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [selectedPartners, setSelectedPartners] = useState<string[]>(() =>
    initialPartnerSlug &&
    partners.some((partner) => partner.slug === initialPartnerSlug)
      ? [initialPartnerSlug]
      : [],
  );

  // Debounce the search query to avoid spamming the database on every keystroke
  useEffect(() => {
    let isCurrent = true;
    const shouldSearch = query.length >= 3;
    const slugs = partners.map((p) => p.slug);
    setSearchError(false);
    if (shouldSearch) {
      setSearchResults(null);
      setIsSearching(true);
      const delayDebounceFn = setTimeout(async () => {
        setIsSearching(true);
        try {
          const supabase = createSupabaseBrowserClient();
          const actions = await searchActionsByTitle(supabase, {
            query,
            partnerSlugs: slugs,
            selectedPartnerSlugs: selectedPartners,
            includeArchived,
          });
          if (!isCurrent) return;
          setSearchResults({ actions });
        } catch (err) {
          if (!isCurrent) return;
          console.error("Erro na busca global:", err);
          setSearchResults(null);
          setSearchError(true);
        } finally {
          if (isCurrent) {
            setIsSearching(false);
          }
        }
      }, 300);
      return () => {
        isCurrent = false;
        clearTimeout(delayDebounceFn);
      };
    } else {
      setSearchResults(null);
      setIsSearching(false);
    }
  }, [query, selectedPartners, partners, includeArchived]);
  const filteredPartners =
    query.trim() === ""
      ? partners
      : partners.filter(
          (p) =>
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.slug.toLowerCase().includes(query.toLowerCase()),
        );
  const searchedActions = searchResults?.actions || [];
  const openResult = async (action: Action, secondary: boolean) => {
    const opened = await (secondary
      ? setSecondaryAction(action)
      : setPrimaryAction(action));
    if (opened === false) return;
    onOpenChange(false);
    setQuery("");
    navigatingResultsRef.current = false;
  };
  const openDraft = (secondary: boolean) =>
    openResult(
      createActionDraft({
        userId: person.user_id,
        partners: resolveDraftPartners({
          pathname: location.pathname,
          partnerFilters,
        }),
      }),
      secondary,
    );
  const [commandError, setCommandError] = useState(false);
  const [commandPending, setCommandPending] = useState(false);
  const commandRunning = useRef(false);
  const contentMounted = useRef(true);
  useEffect(() => {
    contentMounted.current = true;
    return () => {
      contentMounted.current = false;
    };
  }, []);
  const navigateCommand = async (to: string) => {
    if (!(await onBeforeLeave()) || !contentMounted.current) return false;
    await navigate({ to });
    return true;
  };
  const commands = [
    {
      id: "account",
      label: "Minha conta",
      Icon: UserIcon,
      run: () => navigateCommand("/app/profile"),
    },
    ...(
      [
        { id: "light", label: "Tema claro", Icon: SunIcon },
        { id: "dark", label: "Tema escuro", Icon: MoonIcon },
        { id: "system", label: "Tema do sistema", Icon: LaptopIcon },
      ] as const
    ).map(({ id, label, Icon }) => ({
      id,
      label,
      Icon,
      selected: themePreference === id,
      run: () => {
        onThemeChange(id);
        return true;
      },
    })),
    {
      id: "home",
      label: "Ir para início",
      Icon: HomeIcon,
      run: () => navigateCommand("/app"),
    },
    {
      id: "today",
      label: "Ir para Hoje",
      Icon: CalendarIcon,
      run: () => navigateCommand("/app/today"),
    },
    {
      id: "notifications",
      label: "Notificações",
      Icon: BellIcon,
      run: () => navigateCommand("/app/notifications"),
    },
    {
      id: "leads",
      label: "Leads",
      Icon: UsersIcon,
      run: () => navigateCommand("/app/leads"),
    },
    {
      id: "help",
      label: "Ajuda e documentação",
      Icon: HelpCircleIcon,
      run: () => navigateCommand("/app/help"),
    },
    ...(preferenceError
      ? [
          {
            id: "retry-preferences",
            label: "Tentar salvar preferências",
            Icon: RotateCcwIcon,
            run: () => {
              retryPreferences();
              return true;
            },
          },
        ]
      : []),
    {
      id: "logout",
      label: "Sair",
      Icon: LogOutIcon,
      run: async () => {
        if (!(await onBeforeLeave()) || !contentMounted.current) return false;
        const { error } = await createSupabaseBrowserClient().auth.signOut();
        if (error) throw error;
        return true;
      },
    },
  ];
  const adminCommands = person.admin
    ? [
        {
          id: "create-partner",
          label: "Criar parceiro",
          Icon: BriefcaseIcon,
          to: "/app/admin/partner/new",
        },
        {
          id: "create-client",
          label: "Criar cliente",
          Icon: UserPlusIcon,
          to: "/app/admin/client/new",
        },
        {
          id: "create-user",
          label: "Criar usuário",
          Icon: UserPlusIcon,
          to: "/app/admin/user/new",
        },
        {
          id: "create-celebration",
          label: "Criar data comemorativa",
          Icon: CalendarIcon,
          to: "/app/admin/celebrations",
        },
        {
          id: "manage-partners",
          label: "Gerenciar parceiros",
          Icon: SettingsIcon,
          to: "/app/admin/partners",
        },
        {
          id: "manage-clients",
          label: "Gerenciar clientes",
          Icon: SettingsIcon,
          to: "/app/admin/clients",
        },
        {
          id: "manage-users",
          label: "Gerenciar usuários",
          Icon: SettingsIcon,
          to: "/app/admin/users",
        },
        {
          id: "manage-celebrations",
          label: "Gerenciar datas comemorativas",
          Icon: CalendarIcon,
          to: "/app/admin/celebrations",
        },
      ].map(({ to, ...command }) => ({
        ...command,
        run: () => navigateCommand(to),
      }))
    : [];
  const runCommand = async (id: string) => {
    const command = [...commands, ...adminCommands].find(
      (entry) => entry.id === id,
    );
    if (!command || commandRunning.current) return;
    commandRunning.current = true;
    setCommandPending(true);
    setCommandError(false);
    try {
      if ((await command.run()) && contentMounted.current) onOpenChange(false);
    } catch (error) {
      if (contentMounted.current) {
        console.error("Global search command failed:", error);
        setCommandError(true);
      }
    } finally {
      commandRunning.current = false;
      if (contentMounted.current) setCommandPending(false);
    }
  };
  return (
    <div
      onKeyDownCapture={(event) => {
        if (
          !(event.target instanceof Node) ||
          !event.currentTarget.contains(event.target)
        )
          return;
        if (
          event.nativeEvent.isComposing ||
          event.metaKey ||
          event.ctrlKey ||
          event.altKey
        )
          return;
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          navigatingResultsRef.current = true;
          return;
        }
        const target = event.target;
        if (event.key === " " && target instanceof Element) {
          const focusedItem = target.closest(
            "[data-action-search-result], [data-action-create-command], [data-search-command]",
          );
          const activeId = target.getAttribute("aria-activedescendant");
          const activeItem = activeId
            ? document.getElementById(activeId)
            : null;
          const result =
            focusedItem || (navigatingResultsRef.current ? activeItem : null);
          if (result?.hasAttribute("data-action-create-command")) {
            event.preventDefault();
            event.stopPropagation();
            void openDraft(event.shiftKey);
            return;
          }
          const commandId = result?.getAttribute("data-search-command");
          if (commandId) {
            event.preventDefault();
            event.stopPropagation();
            void runCommand(commandId);
            return;
          }
          const actionId = result?.getAttribute("data-action-search-result");
          const action = actionId
            ? searchedActions.find((entry) => entry.id === actionId)
            : undefined;
          if (action) {
            event.preventDefault();
            event.stopPropagation();
            void openResult(action, event.shiftKey);
          }
        } else if (
          event.key.length === 1 &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.altKey
        ) {
          navigatingResultsRef.current = false;
        }
      }}
    >
      <PrismCommand
        inputValue={query}
        onInputChange={(value) => {
          navigatingResultsRef.current = false;
          setQuery(value);
        }}
      >
        <PrismCommandInput placeholder="Faça sua busca..." />
        {commandError && (
          <div className="px-4 py-3 text-sm text-error" role="alert">
            Não foi possível executar o comando. Tente novamente.
          </div>
        )}
        {searchError && (
          <div className="px-4 py-3 text-sm text-error" role="alert">
            Não foi possível buscar ações. Tente novamente.
          </div>
        )}
        <PrismCommandList
          renderEmptyState={() => (
            <PrismCommandEmpty>
              {isSearching
                ? "Buscando..."
                : searchError
                  ? "Altere a busca para tentar novamente."
                  : "Nenhum item foi encontrado."}
            </PrismCommandEmpty>
          )}
        >
          {/* Parceiros */}
          <PrismCommandGroup aria-label="Parceiros" heading="Parceiros">
            {filteredPartners.map((partner) => (
              <PrismCommandItem
                key={partner.slug}
                className={"h-10"}
                onPress={() => {
                  navigate({
                    to: `/app/partner/${partner.slug}`,
                  });
                  setQuery("");
                  onOpenChange(false);
                }}
                textValue={partner.title}
              >
                <UAvatar
                  fallback={partner.short}
                  image={partner.image}
                  size="sm"
                />
                <span>{partner.title}</span>
                <span className="absolute right-4 text-xs tracking-wide opacity-40">
                  @{partner.slug}
                </span>
              </PrismCommandItem>
            ))}
          </PrismCommandGroup>
          {/* Ações */}
          <PrismCommandGroup aria-label="Ações" heading="Ações">
            {searchedActions.map((action) => {
              const phase = PHASES[action.phase as PHASE];
              const partner =
                partners.find(
                  (p) =>
                    Array.isArray(action.partners) &&
                    action.partners.includes(p.slug),
                ) ||
                partners.find((p) => p.slug === action.partners?.[0]) ||
                null;
              return (
                <PrismCommandItem
                  key={action.id}
                  className={"flex h-10 w-full justify-between"}
                  data-action-search-result={action.id}
                  onAction={({ shiftKey }) => {
                    void openResult(action, shiftKey);
                  }}
                  textValue={action.title}
                >
                  <UAvatar
                    backgroundColor={partner?.colors?.[0]}
                    color={partner?.colors?.[1]}
                    fallback={
                      partner?.short ??
                      action.partners?.[0]?.substring(0, 2).toUpperCase() ??
                      "??"
                    }
                    image={partner?.image}
                    size="sm"
                  />
                  <div className="w-full truncate">{action.title}</div>
                  {action.archived && (
                    <ArchiveIcon className="size-3 opacity-50" />
                  )}
                  <div className="text-xs opacity-40">
                    {getFormattedDateTime(
                      action.date,
                      DATE_TIME_DISPLAY.DateOnly,
                    )}
                  </div>
                  <div className="absolute right-4">
                    <PhaseIcon phase={phase} />
                  </div>
                </PrismCommandItem>
              );
            })}
          </PrismCommandGroup>
          <PrismCommandGroup aria-label="Comandos" heading="Comandos">
            <PrismCommandItem
              textValue="Criar ação"
              className="h-10"
              data-action-create-command=""
              isDisabled={commandPending}
              onAction={({ shiftKey }) => {
                void openDraft(shiftKey);
              }}
            >
              <PlusIcon className="size-4" />
              <span>Criar ação</span>
            </PrismCommandItem>
            {commands.map((command) => (
              <PrismCommandItem
                key={command.id}
                id={command.id}
                textValue={command.label}
                className="h-10"
                data-search-command={command.id}
                isDisabled={commandPending}
                isSelected={"selected" in command && command.selected}
                onAction={() => {
                  void runCommand(command.id);
                }}
              >
                <command.Icon className="size-4" />
                <span>{command.label}</span>
              </PrismCommandItem>
            ))}
          </PrismCommandGroup>
          {adminCommands.length > 0 && (
            <PrismCommandGroup
              aria-label="Administração"
              heading="Administração"
            >
              {adminCommands.map((command) => (
                <PrismCommandItem
                  key={command.id}
                  id={command.id}
                  textValue={command.label}
                  className="h-10"
                  data-search-command={command.id}
                  isDisabled={commandPending}
                  onAction={() => {
                    void runCommand(command.id);
                  }}
                >
                  <command.Icon className="size-4" />
                  <span>{command.label}</span>
                </PrismCommandItem>
              ))}
            </PrismCommandGroup>
          )}
        </PrismCommandList>
        <div
          role="group"
          aria-label="Filtros da busca"
          className="flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2"
        >
          <div
            role="group"
            aria-label="Filtrar ações por parceiros"
            className="max-w-full min-w-0"
          >
            <PartnersCombobox
              allowAll
              showText
              variant="filter"
              selectedPartners={selectedPartners}
              onSelect={(value) => {
                navigatingResultsRef.current = false;
                setSelectedPartners(value);
              }}
            />
          </div>
          <PrismCheckbox
            size="sm"
            className="shrink-0 rounded-lg px-2 py-2 font-normal text-muted-foreground data-[selected]:text-foreground"
            isSelected={includeArchived}
            onChange={(value) => {
              navigatingResultsRef.current = false;
              setIncludeArchived(value);
            }}
          >
            Incluir arquivadas
          </PrismCheckbox>
        </div>
      </PrismCommand>
    </div>
  );
}
