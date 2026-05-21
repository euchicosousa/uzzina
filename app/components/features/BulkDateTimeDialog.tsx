import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

export type BulkDateTimeResult =
  | { mode: "datetime"; date: string } // "yyyy-MM-dd HH:mm:ss"
  | { mode: "date_only"; dateOnly: string } // "yyyy-MM-dd"
  | { mode: "time_only"; timeOnly: string }; // "HH:mm"

interface BulkDateTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onApply: (result: BulkDateTimeResult) => void;
}

export function BulkDateTimeDialog({
  open,
  onOpenChange,
  selectedCount,
  onApply,
}: BulkDateTimeDialogProps) {
  // Checkboxes — padrão: só Data marcado
  const [changeDate, setChangeDate] = useState(true);
  const [changeTime, setChangeTime] = useState(false);

  // Valores selecionados
  const [pickedDate, setPickedDate] = useState<Date | undefined>(undefined);
  const [pickedTime, setPickedTime] = useState("12:00");

  // Reset ao abrir
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setChangeDate(true);
      setChangeTime(false);
      setPickedDate(undefined);
      setPickedTime("12:00");
    }
    onOpenChange(isOpen);
  };

  // Botão habilitado quando os campos obrigatórios estão preenchidos
  const canApply =
    (changeDate || changeTime) &&
    (!changeDate || !!pickedDate); // se "Mudar Data" está marcado, precisa ter data

  const handleApply = () => {
    if (!canApply) return;

    if (changeDate && changeTime) {
      // Situação 1: data + hora completos
      onApply({
        mode: "datetime",
        date: `${format(pickedDate!, "yyyy-MM-dd")} ${pickedTime}:00`,
      });
    } else if (changeDate) {
      // Situação 2: só a data — servidor preserva a hora de cada ação
      onApply({
        mode: "date_only",
        dateOnly: format(pickedDate!, "yyyy-MM-dd"),
      });
    } else {
      // Situação 3: só a hora — servidor preserva a data de cada ação
      onApply({
        mode: "time_only",
        timeOnly: pickedTime,
      });
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-auto overflow-hidden p-0 gap-0">
        <DialogHeader>
          <DialogTitle className="px-5 py-4  border-b">Alterar Data e Hora</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col">
          {/* ── Seção: Mudar Data ────────────────────────────────────────── */}
          <div className="flex flex-col px-4 border-b py-2">
            <label
              className="flex cursor-pointer items-center gap-2.5"
              htmlFor="bulk-change-date"
            >
              <Checkbox
                id="bulk-change-date"
                checked={changeDate}
                onCheckedChange={(v) => setChangeDate(!!v)}
              />
              <span className="text-sm font-medium">Mudar Data</span>
            </label>

            <div
              className={cn(
                "overflow-hidden transition-all duration-200",
                changeDate ? "max-h-96 opacity-100 pt-3" : "max-h-0 opacity-0 pointer-events-none",
              )}
            >
              <Calendar
                mode="single"
                selected={pickedDate}
                onSelect={setPickedDate}
                locale={ptBR}
                autoFocus={changeDate && !changeTime}
                className="w-full p-0"
              />
            </div>
          </div>



          {/* ── Seção: Mudar Hora ─────────────────────────────────────────── */}
          <div className="flex flex-col px-4 py-2 border-b">
            <label
              className="flex cursor-pointer items-center gap-2.5"
              htmlFor="bulk-change-time"
            >
              <Checkbox
                id="bulk-change-time"
                checked={changeTime}
                onCheckedChange={(v) => setChangeTime(!!v)}
              />
              <span className="text-sm font-medium">Mudar Hora</span>
            </label>



            <div
              className={cn(
                "overflow-hidden transition-all duration-200",
                changeTime
                  ? "max-h-24 opacity-100 pt-3"
                  : "max-h-0 opacity-0 pointer-events-none",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <Label className="text-muted-foreground shrink-0 text-sm">
                  Nova hora
                </Label>
                <Input
                  type="time"
                  value={pickedTime}
                  onChange={(e) => setPickedTime(e.target.value)}
                  className="w-auto appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-4 py-2 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleApply} disabled={!canApply}>
            Aplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
