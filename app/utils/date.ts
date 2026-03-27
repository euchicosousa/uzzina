import {
  addMinutes,
  format,
  formatDistanceToNow,
  isAfter,
  isBefore,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { DATE_TIME_DISPLAY } from "~/lib/CONSTANTS";
import type { Action } from "~/models/actions.server";

export function getFormattedDateTime(
  date: Date | string,
  option?: (typeof DATE_TIME_DISPLAY)[keyof typeof DATE_TIME_DISPLAY],
  preffix?: string,
) {
  let formatString = "";
  if (option === undefined || option === DATE_TIME_DISPLAY.Null) {
    formatString = "dd/MM";
  } else if (option === DATE_TIME_DISPLAY.Relative) {
    return `${preffix || ""} ${formatDistanceToNow(date, { addSuffix: true, locale: ptBR })}`;
  }

  const showYear =
    new Date(date).getFullYear() !== new Date().getFullYear()
      ? option === 4
        ? " 'de' yyyy"
        : "/yy"
      : "";
  formatString = `dd/MM${showYear}`;
  const showMinutes = format(date, "mm") !== "00" ? "mm" : "";

  switch (option) {
    case DATE_TIME_DISPLAY.DateTime:
      formatString = `dd/MM${showYear} 'às' HH'h'${showMinutes}`;
      break;
    case 3:
      formatString = `dd 'de' MMM${showYear}, HH'h'${showMinutes}`;
      break;
    case 4:
      formatString = `E, dd 'de' MMMM${showYear} 'às' HH'h'${showMinutes}`;
      break;
    case 5:
      formatString = `eeeeee, d/MM${showYear}`;
      break;
    case 6:
      formatString = `HH'h'${showMinutes}`;
      break;
  }

  return format(date, formatString, { locale: ptBR });
}

export const getNewDateForAction = (
  action: Action,
  newDateInput: Date,
) => {
  return {
    date: format(newDateInput, "yyyy-MM-dd HH:mm:ss"),
  };
};
