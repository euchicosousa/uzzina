import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CheckCircle2Icon,
  ClockIcon,
  HelpCircleIcon,
  PhoneIcon,
  UserIcon,
} from "lucide-react";
import { useMemo } from "react";
import { PrismBadge, PrismButton } from "~/components/prism";
interface LeadDetailProps {
  lead: Lead;
}
export function LeadDetail({ lead }: LeadDetailProps) {
  // Parse `answers` JSON (matriz de { question, answer })
  const parsedAnswers = useMemo<LeadAnswer[]>(() => {
    if (!lead.answers) return [];
    try {
      if (typeof lead.answers === "string") {
        return JSON.parse(lead.answers);
      }
      if (Array.isArray(lead.answers)) {
        return lead.answers as unknown as LeadAnswer[];
      }
    } catch (e) {
      console.error("Erro ao fazer parse dos answers do lead:", e);
    }
    return [];
  }, [lead.answers]);

  // Limpa o número para gerar o link do WhatsApp (somente dígitos)
  const whatsappCleanNumber = useMemo(() => {
    const raw = lead.whatsapp.replace(/\D/g, "");
    if (raw.startsWith("55")) return raw;
    return `55${raw}`;
  }, [lead.whatsapp]);
  const whatsappUrl = `https://wa.me/${whatsappCleanNumber}`;
  const formattedDate = lead.created_at
    ? format(parseISO(lead.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
        locale: ptBR,
      })
    : null;
  return (
    <div className="flex h-full flex-col overflow-y-auto p-6 xl:p-8 gap-6">
      {/* Header do Lead */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4  pb-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col ">
            <h2 className="text-5xl font-medium tracking-tight">{lead.name}</h2>
            {formattedDate && (
              <p className="text-sm opacity-50">{formattedDate}</p>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            {lead.main_need && (
              <PrismBadge className="capitalize" variant="secondary">
                Necessidade: {lead.main_need}
              </PrismBadge>
            )}

            {lead.completed ? (
              <PrismBadge
                className="bg-success/15 text-success border-success/20 gap-1"
                variant="default"
              >
                <CheckCircle2Icon className="size-3.5" /> Concluído
              </PrismBadge>
            ) : (
              <PrismBadge
                className="bg-warning/15 text-warning border-warning/20 gap-1"
                variant="default"
              >
                <ClockIcon className="size-3.5" /> Em andamento
              </PrismBadge>
            )}
          </div>
        </div>

        {/* Botão para WhatsApp */}
        <a
          className="inline-flex items-center gap-2"
          href={whatsappUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <PrismButton className="bg-[#25D366] hover:bg-[#20bd5a] text-white border-0 font-medium gap-2">
            <PhoneIcon className="size-4" />
            {lead.whatsapp}
          </PrismButton>
        </a>
      </div>

      {/* Lista de Perguntas e Respostas */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">
            Perguntas e Respostas ({parsedAnswers.length})
          </h3>
        </div>

        {parsedAnswers.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Nenhuma resposta gravada para este lead.
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {parsedAnswers.map((item, idx) => (
              <div key={item.question} className="flex flex-col gap-2 text-2xl">
                <div className="flex items-center gap-2">
                  <span className="size-5">{idx + 1}</span>
                  <span>{item.question}</span>
                </div>
                <div className="pl-7 font-semibold text-foreground">
                  {item.answer || (
                    <span className="italic text-muted-foreground font-normal">
                      Sem resposta
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
