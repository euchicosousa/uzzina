import {
  BookOpenIcon,
  CalendarIcon,
  CheckSquareIcon,
  CompassIcon,
  CopyCheckIcon,
  CopyIcon,
  Edit3Icon,
  EyeIcon,
  GitCommitIcon,
  HelpCircleIcon,
  KeyboardIcon,
  LayoutGridIcon,
  LaptopIcon,
  MousePointerClickIcon,
  PlusIcon,
  SearchIcon,
  SlidersIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { type MetaFunction } from "react-router";
import { cn } from "~/lib/utils";

export const meta: MetaFunction = () => {
  return [{ title: "Ajuda & Documentação | Uzzina" }];
};

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState("filosofia");

  const sections = [
    { id: "filosofia", title: "Filosofia do Uzzina", icon: CompassIcon },
    { id: "visualizacoes", title: "Visualizações & Painéis", icon: CalendarIcon },
    { id: "fluxo", title: "Fases do Fluxo", icon: GitCommitIcon },
    { id: "atalhos", title: "Atalhos de Teclado", icon: KeyboardIcon },
    { id: "selecao-multipla", title: "Seleção & Lote", icon: CheckSquareIcon },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-25% 0px -55% 0px",
        threshold: 0.1,
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => {
      sections.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element) observer.unobserve(element);
      });
    };
  }, []);

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", `#${id}`);
      setActiveSection(id);
    }
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-6xl flex-col p-6 sm:p-8">
      {/* Header da Página */}
      <div className="flex items-center justify-between border-b pb-6 mb-8">
        <h1 className="p-0 text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <HelpCircleIcon className="size-6 text-primary" />
          Ajuda & Documentação
        </h1>
        <div className="text-sm text-muted-foreground hidden sm:block">
          Guia de uso e comandos rápidos do Uzzina.
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar de Navegação (Desktop) */}
        <aside className="hidden lg:block">
          <nav className="sticky top-8 flex flex-col gap-1.5 rounded-3xl border border-border/80 bg-card/25 p-4">
            <span className="px-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-2 block">
              Tópicos
            </span>
            {sections.map((section) => {
              const Icon = section.icon;
              const isSelected = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => handleScrollTo(section.id)}
                  className={cn(
                    "squircle flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-semibold transition-all duration-200",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-transparent bg-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{section.title}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Bar de Navegação Sticky (Mobile) */}
        <div className="sticky top-0 z-10 -mx-6 bg-background/95 backdrop-blur-xs px-6 py-3 border-b lg:hidden overflow-x-auto flex gap-2 scrollbar-none">
          {sections.map((section) => {
            const isSelected = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => handleScrollTo(section.id)}
                className={cn(
                  "squircle px-4 py-2 text-xs font-semibold whitespace-nowrap rounded-xl border transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-card/40 text-muted-foreground hover:bg-card",
                )}
              >
                {section.title}
              </button>
            );
          })}
        </div>

        {/* Conteúdo Principal */}
        <div className="flex flex-col gap-12 pb-16">
          {/* 1. Filosofia do Uzzina */}
          <section id="filosofia" className="scroll-mt-24 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <CompassIcon className="size-5 text-primary" />
              <h2 className="text-lg font-bold">Filosofia do Uzzina</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              O Uzzina foi desenhado sob a premissa de que{" "}
              <strong className="text-foreground">Estratégia e Execução devem ocupar o mesmo tempo físico</strong>. 
              No fluxo de trabalho tradicional, o planejamento estratégico e a execução são separados por camadas de atrito 
              e ferramentas isoladas, causando atrasos e desvios de rota.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Ao unificar calendários de postagem, briefings de ações e acompanhamentos dinâmicos em um único lugar, 
              o Uzzina permite que sua agência, gestores e clientes alinhem a estratégia macro com as tarefas de criação 
              e publicação diárias de forma instantânea. Cada ação planejada é uma ação executada em tempo real.
            </p>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border p-4 bg-card/30 flex flex-col gap-1.5">
                <span className="text-xs font-bold text-foreground">Domine</span>
                <span className="text-xs text-muted-foreground">
                  Gerencie todo o calendário de conteúdo e de tarefas da equipe sob um único padrão visual unificado.
                </span>
              </div>
              <div className="rounded-2xl border p-4 bg-card/30 flex flex-col gap-1.5">
                <span className="text-xs font-bold text-foreground">Crie e Conquiste</span>
                <span className="text-xs text-muted-foreground">
                  Transforme briefings e ideias brutas em layouts finais e aprovações dinâmicas sem sair do sistema.
                </span>
              </div>
            </div>
          </section>

          {/* 2. Visualizações & Painéis */}
          <section id="visualizacoes" className="scroll-mt-24 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <CalendarIcon className="size-5 text-primary" />
              <h2 className="text-lg font-bold">Visualizações & Painéis</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A visualização padrão de calendário dos clientes e parceiros pode ser customizada no Uzzina 
              em três formatos para diferentes momentos de planejamento e análise:
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border p-4 bg-card/30 flex flex-col gap-2">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-blue-500" />
                  Visualização em Linha (Line)
                </span>
                <span className="text-xs text-muted-foreground leading-relaxed">
                  Ideal para listagem sequencial e rápida. Organiza as ações por linha de dia, com foco 
                  em títulos, prioridades e andamento direto da equipe.
                </span>
              </div>
              <div className="rounded-2xl border p-4 bg-card/30 flex flex-col gap-2">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-purple-500" />
                  Visualização em Bloco (Block)
                </span>
                <span className="text-xs text-muted-foreground leading-relaxed">
                  Estrutura as ações em formato de cartões curtos dentro de cada dia do calendário. Excelente 
                  para uma visão compacta e focada na distribuição de Sprints semanais.
                </span>
              </div>
              <div className="rounded-2xl border p-4 bg-card/30 flex flex-col gap-2">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  Visualização de Conteúdo (Content)
                </span>
                <span className="text-xs text-muted-foreground leading-relaxed">
                  Focada no visual final. Renderiza com destaque as capas e imagens dos criativos vinculados às ações, 
                  gerando um preview fiel do feed planejado.
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground mt-2">
              <strong className="text-foreground">Dica de Configuração:</strong> Você pode definir qual dessas visualizações 
              será a sua padrão ao entrar no sistema acessando o menu <strong className="text-foreground">Minha Conta</strong>.
            </p>
          </section>

          {/* 3. Fases do Fluxo de Trabalho */}
          <section id="fluxo" className="scroll-mt-24 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <GitCommitIcon className="size-5 text-primary" />
              <h2 className="text-lg font-bold">Fases do Fluxo de Trabalho</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Cada publicação ou atividade no Uzzina é representada por uma "Ação", que progride sequencialmente por 
              fases de andamento bem definidas:
            </p>
            <div className="relative border-l border-muted pl-6 ml-3 flex flex-col gap-6 my-2">
              <div className="relative">
                <div className="absolute -left-9 top-1 size-6 rounded-full border bg-background flex items-center justify-center text-[10px] font-bold text-yellow-500 border-yellow-500">
                  I
                </div>
                <h4 className="text-sm font-bold text-foreground">Ideia</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Insights, rascunhos de briefings ou ações temporárias ainda não confirmadas na estratégia de conteúdo.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-9 top-1 size-6 rounded-full border bg-background flex items-center justify-center text-[10px] font-bold text-orange-500 border-orange-500">
                  E
                </div>
                <h4 className="text-sm font-bold text-foreground">Estratégia</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Ação validada e estruturada, detalhando objetivos, temas e abordagens estratégicas antes da criação da mídia.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-9 top-1 size-6 rounded-full border bg-background flex items-center justify-center text-[10px] font-bold text-pink-500 border-pink-500">
                  A
                </div>
                <h4 className="text-sm font-bold text-foreground">Alinhamento</h4>
                <p className="text-xs text-muted-foreground mt-1">
                   briefing para a equipe produtiva e alinhamento de detalhes específicos de produção.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-9 top-1 size-6 rounded-full border bg-background flex items-center justify-center text-[10px] font-bold text-purple-500 border-purple-500">
                  P
                </div>
                <h4 className="text-sm font-bold text-foreground">Produção</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Redação de roteiros/copys e criação de mídias, vídeos ou layouts pelo time de design/criação.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-9 top-1 size-6 rounded-full border bg-background flex items-center justify-center text-[10px] font-bold text-blue-500 border-blue-500">
                  V
                </div>
                <h4 className="text-sm font-bold text-foreground">Validação</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Layouts finalizados enviados para revisão interna da agência ou aprovação direta do cliente.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-9 top-1 size-6 rounded-full border bg-background flex items-center justify-center text-[10px] font-bold text-green-500 border-green-500">
                  C
                </div>
                <h4 className="text-sm font-bold text-foreground">Concluído</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Ação de conteúdo validada, postada nas redes ou completamente finalizada.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Atalhos de Teclado & Ações Rápidas */}
          <section id="atalhos" className="scroll-mt-24 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <KeyboardIcon className="size-5 text-primary" />
              <h2 className="text-lg font-bold">Atalhos de Teclado & Ações Rápidas</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              O Uzzina possui um motor avançado de atalhos globais e de atalhos contextuais. Para usar os 
              <strong className="text-foreground"> atalhos de passagem de mouse (Hover Shortcuts)</strong>, basta posicionar 
              o cursor sobre um cartão de Ação no calendário e pressionar as teclas indicadas:
            </p>

            <div className="rounded-2xl border bg-card/20 overflow-hidden mt-2">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="p-3 font-semibold text-muted-foreground">Atalho</th>
                      <th className="p-3 font-semibold text-muted-foreground">Contexto</th>
                      <th className="p-3 font-semibold text-muted-foreground">Ação Executada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="p-3 font-mono text-primary font-semibold">Cmd + K / Ctrl + K</td>
                      <td className="p-3 text-muted-foreground">Global</td>
                      <td className="p-3 text-foreground font-medium">Abre a barra de pesquisa inteligente.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-primary font-semibold">Alt + Cmd + A</td>
                      <td className="p-3 text-muted-foreground">Global</td>
                      <td className="p-3 text-foreground font-medium">Cria uma nova ação de qualquer lugar.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-primary font-semibold">i / e / a / p / v / c</td>
                      <td className="p-3 text-muted-foreground">Hover (Mouse sobre Ação)</td>
                      <td className="p-3 text-foreground font-medium">
                        Muda a fase da ação instantaneamente para <strong className="text-foreground">I</strong>deia, 
                        <strong className="text-foreground">E</strong>stratégia, <strong className="text-foreground">A</strong>linhamento, 
                        <strong className="text-foreground">P</strong>rodução, <strong className="text-foreground">V</strong>alidação ou 
                        <strong className="text-foreground">C</strong>oncluído.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-primary font-semibold">Shift + D</td>
                      <td className="p-3 text-muted-foreground">Hover (Mouse sobre Ação)</td>
                      <td className="p-3 text-foreground font-medium">Duplica a ação atual em lote na mesma data.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-primary font-semibold">Shift + U</td>
                      <td className="p-3 text-muted-foreground">Hover (Mouse sobre Ação)</td>
                      <td className="p-3 text-foreground font-medium">Adiciona ou retira a ação da Sprint semanal.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-primary font-semibold">Shift + X</td>
                      <td className="p-3 text-muted-foreground">Hover (Mouse sobre Ação)</td>
                      <td className="p-3 text-foreground font-medium">Arquiva a ação no banco de dados.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-primary font-semibold">Shift + H</td>
                      <td className="p-3 text-muted-foreground">Hover (Mouse sobre Ação)</td>
                      <td className="p-3 text-foreground font-medium">Muda o agendamento para hoje (+30 minutos).</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-primary font-semibold">Shift + 1 / 2 / 3</td>
                      <td className="p-3 text-muted-foreground">Hover (Mouse sobre Ação)</td>
                      <td className="p-3 text-foreground font-medium">Altera o horário para hoje (+1h, +2h ou +3h adiante).</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-primary font-semibold">Shift + A</td>
                      <td className="p-3 text-muted-foreground">Hover (Mouse sobre Ação)</td>
                      <td className="p-3 text-foreground font-medium">Move a data da ação para amanhã.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-primary font-semibold">Shift + S</td>
                      <td className="p-3 text-muted-foreground">Hover (Mouse sobre Ação)</td>
                      <td className="p-3 text-foreground font-medium">Muda para a próxima semana (+7 dias).</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono text-primary font-semibold">Shift + M</td>
                      <td className="p-3 text-muted-foreground">Hover (Mouse sobre Ação)</td>
                      <td className="p-3 text-foreground font-medium">Muda para o próximo mês (+30 dias).</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* 5. Seleção Múltipla & Ações em Lote */}
          <section id="selecao-multipla" className="scroll-mt-24 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <CheckSquareIcon className="size-5 text-primary" />
              <h2 className="text-lg font-bold">Seleção Múltipla & Ações em Lote</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Precisa mover, atualizar ou remover muitas ações de uma vez? O Uzzina oferece uma ferramenta completa 
              de gerenciamento em lote:
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border p-4 bg-card/30 flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CopyCheckIcon className="size-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-foreground">Como Ativar</span>
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    Clique no botão de seleção de marcação localizado na barra do cabeçalho da página para habilitar 
                    caixas de seleção em todos os cartões de ações do calendário.
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border p-4 bg-card/30 flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <SlidersIcon className="size-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-foreground">Menu de Ações</span>
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    Ao selecionar um ou mais cartões, a barra flutuante de ações em lote surgirá no rodapé da página, 
                    permitindo executar alterações em massa nos itens selecionados.
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border p-4 bg-card/10 mt-2">
              <span className="text-xs font-bold text-foreground block mb-2">Comandos em Lote Disponíveis:</span>
              <div className="grid gap-3 text-xs sm:grid-cols-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <UserIcon className="size-4 text-primary shrink-0" />
                  <span>Alterar o responsável designado em lote</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GitCommitIcon className="size-4 text-primary shrink-0" />
                  <span>Mudar a fase do fluxo (ex: Produção) de uma só vez</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CopyIcon className="size-4 text-primary shrink-0" />
                  <span>Duplicar todas as ações selecionadas</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Trash2Icon className="size-4 text-red-500 shrink-0" />
                  <span className="text-red-500/90 font-medium">Remover as ações permanentemente em lote</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
