import {
  Children,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AppBarSpacer } from "~/components/layout/AppBarSpacer";
import { useAppContext } from "~/contexts/AppContext";
import { useFillScrollViewport } from "~/hooks/useFillScrollViewport";
import { cn } from "~/lib/utils";

type Section = {
  id: string;
  title: string;
  adminOnly?: boolean;
  body: ReactNode;
};

function Keys({ keys }: { keys: string[] }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {keys.map((key, index) => (
        <span className="inline-flex items-center gap-1" key={key}>
          {index > 0 && <span className="text-muted-foreground">+</span>}
          <kbd className="rounded-md border bg-secondary/50 px-1.5 py-0.5 font-sans text-xs font-medium">
            {key}
          </kbd>
        </span>
      ))}
    </span>
  );
}

function ShortcutTable({
  caption,
  rows,
}: {
  caption: string;
  rows: { keys: string[]; label: string }[];
}) {
  return (
    <table className="w-full text-left text-sm">
      <caption className="sr-only">{caption}</caption>
      <thead className="text-xs text-muted-foreground">
        <tr>
          <th className="w-1/2 py-2 pr-4 font-medium" scope="col">
            Atalho
          </th>
          <th className="py-2 font-medium" scope="col">
            O que faz
          </th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {rows.map((row) => (
          <tr key={row.label}>
            <td className="py-2 pr-4">
              <Keys keys={row.keys} />
            </td>
            <td className="py-2">{row.label}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1.5 pl-5 marker:text-muted-foreground">
      {Children.map(items, (item) => (
        <li>{item}</li>
      ))}
    </ul>
  );
}

const SECTIONS: Section[] = [
  {
    id: "busca-global",
    title: "Busca global",
    body: (
      <>
        <p>
          Abra a busca com <Keys keys={["Ctrl ou ⌘", "K"]} />. Digite o título
          de uma ação para encontrá-la e pressione Enter para abri-la.
        </p>
        <Steps
          items={[
            "No rodapé da busca, o filtro de parceiros começa com o parceiro da página aberta; nas outras páginas, vale para todos os parceiros disponíveis. Você pode marcar vários.",
            <>
              Com <Keys keys={["Shift"]} /> ao escolher um parceiro, só ele fica
              selecionado.
            </>,
            "“Incluir arquivadas” traz também ações arquivadas dos parceiros selecionados. A opção volta a ficar desligada toda vez que a busca é aberta.",
            "Abaixo dos resultados ficam os comandos: Criar ação, Minha conta, tema claro, escuro ou do sistema, Início, Hoje, Notificações, Leads, Ajuda e Sair.",
          ]}
        />
      </>
    ),
  },
  {
    id: "criar-e-editar",
    title: "Criar e editar ações",
    body: (
      <>
        <Steps
          items={[
            <>
              Para criar, use <Keys keys={["Ctrl ou ⌘", "Alt", "A"]} /> ou o
              comando Criar ação da busca. Nada é gravado até você clicar em
              Criar.
            </>,
            "Na gaveta, a aba Essencial tem título, descrição, parceiros, fase, categoria e cor. As abas Instagram (quando disponível) e Observações ficam ao lado.",
            "Com Tab você percorre Título, Descrição, Parceiros, Fase, Categoria, Cor e o botão Criar ou Atualizar. Shift+Tab volta.",
            <>
              <Keys keys={["Alt", "F10"]} /> alterna para todos os controles da
              gaveta. No editor de texto,{" "}
              <Keys keys={["Alt", "Shift", "F10"]} /> acessa a barra de
              formatação.
            </>,
          ]}
        />
      </>
    ),
  },
  {
    id: "duas-acoes",
    title: "Duas ações ao mesmo tempo",
    body: (
      <>
        <p>
          Abrir uma ação normalmente usa a ação principal. Para manter uma
          segunda ação aberta, escolha o resultado da busca com{" "}
          <Keys keys={["Shift"]} /> (clique, Enter ou Espaço).
        </p>
        <Steps
          items={[
            "Em janelas com pelo menos 1600px de largura, as duas ficam lado a lado: a principal à esquerda e a secundária à direita.",
            "Em janelas menores, alternam por abas, sem perder o que foi editado.",
            "O X de cada ação fecha somente aquela ação.",
            "Escape ou um clique fora da gaveta fecham as duas, depois de conferir cada uma. Se o Escape for usado por um editor ou seletor aberto, ele fecha só esse elemento.",
          ]}
        />
      </>
    ),
  },
  {
    id: "atalhos-nas-acoes",
    title: "Atalhos nas ações",
    body: (
      <>
        <p>
          Passe o mouse sobre uma ação, ou foque nela, e use as teclas abaixo.
          Elas não funcionam enquanto você digita em um campo.
        </p>
        <ShortcutTable
          caption="Atalhos de fase"
          rows={[
            { keys: ["I"], label: "Fase Ideia" },
            { keys: ["F"], label: "Fase Fazer" },
            { keys: ["Z"], label: "Fase Fazendo" },
            { keys: ["A"], label: "Fase Análise" },
            { keys: ["T"], label: "Feito" },
            { keys: ["C"], label: "Concluído" },
          ]}
        />
        <ShortcutTable
          caption="Atalhos com Shift"
          rows={[
            { keys: ["Shift", "D"], label: "Duplicar a ação" },
            { keys: ["Shift", "H"], label: "Adiar em 30 minutos" },
            { keys: ["Shift", "1"], label: "Adiar em 1 hora" },
            { keys: ["Shift", "2"], label: "Adiar em 2 horas" },
            { keys: ["Shift", "3"], label: "Adiar em 3 horas" },
            { keys: ["Shift", "A"], label: "Mover para amanhã" },
            { keys: ["Shift", "S"], label: "Mover em 7 dias" },
            { keys: ["Shift", "M"], label: "Mover em 30 dias" },
            { keys: ["Shift", "U"], label: "Incluir ou retirar do sprint" },
            { keys: ["Shift", "X"], label: "Arquivar, com opção de desfazer" },
          ]}
        />
      </>
    ),
  },
  {
    id: "conta-e-temas",
    title: "Minha conta e temas",
    body: (
      <>
        <Steps
          items={[
            "Abra Minha Conta pelo menu do seu perfil ou pelo comando da busca.",
            "Em Preferências, escolha o tema: Claro, Escuro e Sistema. Sistema acompanha a aparência do seu dispositivo.",
            "Também é possível escolher a visualização inicial de Hoje: Kanban, Categorias, Feed ou Parceiros. Trocar a visualização no dia a dia não altera essa preferência.",
            "As mudanças de Minha Conta são gravadas com Salvar Alterações, no cabeçalho. O tema escolhido pelo menu do perfil ou pela busca é gravado automaticamente.",
          ]}
        />
      </>
    ),
  },
  {
    id: "administracao",
    title: "Administração",
    adminOnly: true,
    body: (
      <>
        <p>Estas orientações aparecem somente para administradores.</p>
        <Steps
          items={[
            "Parceiros, clientes, pessoas e datas comemorativas têm cadastros próprios no menu e nos comandos da busca.",
            "Criar data comemorativa pela busca abre um formulário com título e calendário. Gerenciar datas comemorativas abre a página com a lista completa.",
          ]}
        />
      </>
    ),
  },
];

// Scrolls only the content region: scrollIntoView would also move the clipped page container.
function scrollToSection(container: HTMLElement | null, id: string) {
  const heading = document.getElementById(id);
  if (!heading || !container) return;
  heading.focus({ preventScroll: true });
  const offset =
    heading.getBoundingClientRect().top -
    container.getBoundingClientRect().top +
    container.scrollTop;
  container.scrollTo?.({ top: Math.max(0, offset - 24) });
  window.history.replaceState(window.history.state, "", `#${id}`);
}

export function HelpPage() {
  const { person } = useAppContext();
  const pageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  useFillScrollViewport(pageRef);
  const sections = useMemo(
    () => SECTIONS.filter((s) => !s.adminOnly || person.admin),
    [person.admin],
  );
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    const lastId = sections[sections.length - 1]?.id;
    // A short last section never reaches the observer's line, so the end of the scroll selects it.
    const markEnd = () => {
      const atEnd =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 2;
      if (atEnd && container.scrollTop > 0 && lastId) setActive(lastId);
    };
    container.addEventListener("scroll", markEnd, { passive: true });
    if (typeof IntersectionObserver === "undefined") {
      return () => container.removeEventListener("scroll", markEnd);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActive(visible.target.id);
      },
      { root: container, rootMargin: "0px 0px -70% 0px" },
    );
    for (const section of sections) {
      const heading = document.getElementById(section.id);
      if (heading) observer.observe(heading);
    }
    return () => {
      observer.disconnect();
      container.removeEventListener("scroll", markEnd);
    };
  }, [sections]);

  return (
    <div
      ref={pageRef}
      className="relative mx-auto flex min-h-0 w-full max-w-5xl flex-col overflow-hidden"
    >
      <div className="shrink-0 border-b px-4 py-4 lg:px-8 lg:py-6">
        <h1 className="text-3xl font-semibold lg:text-5xl">
          Ajuda e documentação
        </h1>
        <div className="mt-4 lg:hidden">
          <label className="sr-only" htmlFor="help-section">
            Ir para a seção
          </label>
          <select
            id="help-section"
            className="w-full rounded-md border bg-input px-3 py-2 text-base outline-none focus-visible:bg-foreground/5"
            value={active}
            onChange={(event) => {
              setActive(event.target.value);
              scrollToSection(contentRef.current, event.target.value);
            }}
          >
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        <nav
          aria-label="Nesta página"
          className="hidden w-60 shrink-0 flex-col gap-1 overflow-y-auto border-r px-4 py-6 lg:flex"
        >
          <p className="px-2 pb-2 text-xs font-medium text-muted-foreground">
            Nesta página
          </p>
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              aria-current={active === section.id ? "location" : undefined}
              className={cn(
                "rounded-md px-2 py-1.5 text-sm outline-none hover:bg-secondary/50 focus-visible:bg-foreground/5",
                active === section.id
                  ? "bg-secondary/50 font-semibold"
                  : "text-muted-foreground",
              )}
              onClick={(event) => {
                event.preventDefault();
                setActive(section.id);
                scrollToSection(contentRef.current, section.id);
              }}
            >
              {section.title}
            </a>
          ))}
        </nav>
        <div
          ref={contentRef}
          className="relative min-h-0 flex-1 overflow-y-auto"
        >
          <div className="flex max-w-2xl flex-col gap-12 px-4 py-6 lg:px-8">
            {sections.map((section) => (
              <section
                key={section.id}
                aria-labelledby={section.id}
                className="flex flex-col gap-4 text-sm leading-relaxed"
              >
                <h2
                  id={section.id}
                  tabIndex={-1}
                  className="scroll-mt-6 text-2xl font-semibold outline-none"
                >
                  {section.title}
                </h2>
                {section.body}
              </section>
            ))}
          </div>
          <AppBarSpacer />
        </div>
      </div>
    </div>
  );
}
