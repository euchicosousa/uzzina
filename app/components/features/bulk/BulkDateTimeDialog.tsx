import { Time } from "@internationalized/date";
import type { TimeValue } from "react-aria-components";
import { format } from "date-fns";
import { useState } from "react";
import {
  PrismButton,
  PrismDialog,
  PrismDialogFooter,
  PrismDialogHeader,
  PrismDialogTitle,
  PrismTimeField,
} from "~/components/prism";
import { PrismCalendar } from "~/components/prism";
import { Checkbox } from "~/components/ui/checkbox";
import { cn } from "~/lib/utils";
export type BulkDateTimeResult =
  | {
      mode: "datetime";
      date: string;
    } // "yyyy-MM-dd HH:mm:ss"
  | {
      mode: "date_only";
      dateOnly: string;
    } // "yyyy-MM-dd"
  | {
      mode: "time_only";
      timeOnly: string;
    }; // "HH:mm"

interface BulkDateTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (result: BulkDateTimeResult) => void;
}
export function BulkDateTimeDialog({
  open,
  onOpenChange,
  onApply,
}: BulkDateTimeDialogProps) {
  const [changeDate, setChangeDate] = useState(true);
  const [changeTime, setChangeTime] = useState(false);
  const [pickedDate, setPickedDate] = useState<Date | undefined>(undefined);
  const [pickedTime, setPickedTime] = useState("12:00");
  const [timeValue, setTimeValue] = useState<TimeValue | null>(new Time(12, 0));
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setChangeDate(true);
      setChangeTime(false);
      setPickedDate(undefined);
      setPickedTime("12:00");
      setTimeValue(new Time(12, 0));
    }
    onOpenChange(isOpen);
  };
  const canApply = (changeDate || changeTime) && (!changeDate || !!pickedDate);
  const handleApply = () => {
    if (!canApply) return;
    if (changeDate && changeTime) {
      if (!pickedDate) return;
      onApply({
        mode: "datetime",
        date: `${format(pickedDate, "yyyy-MM-dd")} ${pickedTime}:00`,
      });
    } else if (changeDate) {
      if (!pickedDate) return;
      onApply({
        mode: "date_only",
        dateOnly: format(pickedDate, "yyyy-MM-dd"),
      });
    } else {
      onApply({
        mode: "time_only",
        timeOnly: pickedTime,
      });
    }
    onOpenChange(false);
  };
  if (!open) return null;
  return (
    <PrismDialog
      className="w-72 overflow-hidden"
      isDismissable
      isOpen={open}
      onOpenChange={handleOpenChange}
    >
      <PrismDialogHeader className="border-b">
        <PrismDialogTitle>Alterar Data e Hora</PrismDialogTitle>
      </PrismDialogHeader>

      <div className="flex flex-col">
        {/* ── Seção: Mudar Data ────────────────────────────────────────── */}

        <label
          className="flex cursor-pointer items-center gap-2 font-medium text-sm text-foreground select-none px-5 py-4 border-b"
          htmlFor="bulk-change-date"
        >
          <Checkbox
            checked={changeDate}
            id="bulk-change-date"
            onCheckedChange={(v) => setChangeDate(!!v)}
          />
          <span>Mudar Data</span>
        </label>

        <div
          className={cn(
            "overflow-hidden transition-all duration-200",
            changeDate
              ? "max-h-96 py-4 opacity-100 border-b"
              : "pointer-events-none max-h-0 opacity-0",
          )}
        >
          <PrismCalendar
            className="w-full p-0 flex justify-center"
            onSelect={setPickedDate}
            selected={pickedDate}
          />
        </div>

        {/* ── Seção: Mudar Hora ─────────────────────────────────────────── */}

        <label
          className="flex cursor-pointer items-center gap-2.5 font-medium text-sm text-foreground select-none px-5 py-4"
          htmlFor="bulk-change-time"
        >
          <Checkbox
            checked={changeTime}
            id="bulk-change-time"
            onCheckedChange={(v) => setChangeTime(!!v)}
          />
          <span>Mudar Hora</span>
        </label>

        <div
          className={cn(
            "overflow-hidden transition-all duration-200",
            changeTime
              ? "max-h-24 opacity-100 p-4 border-t"
              : "pointer-events-none max-h-0 opacity-0",
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="shrink-0 text-xs font-semibold text-muted-foreground uppercase">
              Nova hora
            </span>
            <PrismTimeField
              aria-label="Nova hora"
              onChange={(val) => {
                setTimeValue(val);
                if (val) {
                  const hh = String(val.hour).padStart(2, "0");
                  const mm = String(val.minute).padStart(2, "0");
                  setPickedTime(`${hh}:${mm}`);
                }
              }}
              value={timeValue}
            />
          </div>
        </div>
      </div>

      <PrismDialogFooter className="border-t">
        <PrismButton
          onPress={() => onOpenChange(false)}
          size="sm"
          variant="ghost"
        >
          Cancelar
        </PrismButton>
        <PrismButton isDisabled={!canApply} onPress={handleApply} size="sm">
          Aplicar
        </PrismButton>
      </PrismDialogFooter>
    </PrismDialog>
  );
}
