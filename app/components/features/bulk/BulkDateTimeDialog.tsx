import { CalendarDate, Time } from "@internationalized/date";
import type { TimeValue } from "react-aria-components";
import { format } from "date-fns";
import { useState } from "react";
import {
  PrismButton,
  PrismCheckbox,
  PrismDialog,
  PrismDialogFooter,
  PrismDialogHeader,
  PrismDialogTitle,
  PrismTimeField,
  PrismCalendar,
} from "~/components/prism";
import { cn } from "cnfast";
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
      size="xs"
      isDismissable
      isOpen={open}
      onOpenChange={handleOpenChange}
    >
      <PrismDialogHeader>
        <PrismDialogTitle>Alterar Data e Hora</PrismDialogTitle>
      </PrismDialogHeader>

      <div className="flex flex-col">
        {/* ── Seção: Mudar Data ────────────────────────────────────────── */}

        <PrismCheckbox
          className="flex cursor-pointer items-center gap-2.5 px-5 py-4 text-sm font-medium text-foreground select-none"
          isSelected={changeDate}
          onChange={(v) => setChangeDate(v)}
        >
          Mudar Data
        </PrismCheckbox>

        <div
          inert={!changeDate}
          className={cn(
            "grid transition-[grid-template-rows,opacity] motion-reduce:transition-none",
            changeDate
              ? "grid-rows-[1fr] opacity-100 duration-motion-base ease-motion-standard"
              : "pointer-events-none grid-rows-[0fr] opacity-0 duration-motion-fast ease-motion-exit",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="px-4 py-4">
              <PrismCalendar
                cellSize="sm"
                className="w-full"
                onChange={(day) => {
                  if (day) {
                    setPickedDate(new Date(day.year, day.month - 1, day.day));
                  }
                }}
                value={
                  pickedDate
                    ? new CalendarDate(
                        pickedDate.getFullYear(),
                        pickedDate.getMonth() + 1,
                        pickedDate.getDate(),
                      )
                    : undefined
                }
              />
            </div>
          </div>
        </div>

        {/* ── Seção: Mudar Hora ─────────────────────────────────────────── */}

        <PrismCheckbox
          className="flex cursor-pointer items-center gap-2.5 px-5 py-4 text-sm font-medium text-foreground select-none"
          isSelected={changeTime}
          onChange={(v) => setChangeTime(v)}
        >
          Mudar Hora
        </PrismCheckbox>

        <div
          inert={!changeTime}
          className={cn(
            "grid transition-[grid-template-rows,opacity] motion-reduce:transition-none",
            changeTime
              ? "grid-rows-[1fr] opacity-100 duration-motion-base ease-motion-standard"
              : "pointer-events-none grid-rows-[0fr] opacity-0 duration-motion-fast ease-motion-exit",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="flex items-center justify-between gap-3 p-4">
              <span className="shrink-0 text-xs font-semibold text-secondary-foreground uppercase">
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
      </div>

      <PrismDialogFooter>
        <PrismButton onPress={() => onOpenChange(false)} variant="ghost">
          Cancelar
        </PrismButton>
        <PrismButton isDisabled={!canApply} onPress={handleApply}>
          Aplicar
        </PrismButton>
      </PrismDialogFooter>
    </PrismDialog>
  );
}
