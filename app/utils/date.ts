import {
  addMinutes,
  format,
  formatDistanceToNow,
  isAfter,
  isBefore,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { DATE_TIME_DISPLAY } from "~/lib/CONSTANTS";

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
  isInstagramDate = false,
) => {
  const duration = action.time || 5; // Duration in minutes

  // Rule: date <= instagram_date - duration

  if (isInstagramDate) {
    // Priority: Update instagram_date
    // New instagram_date = newDateInput

    // Calculate max allowed start date: new_instagram_date - duration
    const maxStartDate = addMinutes(newDateInput, -duration);
    const currentStartDate = parseISO(action.date);

    // If current start date is after max start date, we must move it back
    const newStartDate = isAfter(currentStartDate, maxStartDate)
      ? maxStartDate
      : currentStartDate;

    return {
      date: format(newStartDate, "yyyy-MM-dd HH:mm:ss"),
      instagram_date: format(newDateInput, "yyyy-MM-dd HH:mm:ss"),
    };
  } else {
    // Priority: Update date (start date)
    // New date = newDateInput

    // Calculate min allowed instagram date: new_date + duration
    const minInstagramDate = addMinutes(newDateInput, duration);
    const currentInstagramDate = parseISO(action.instagram_date);

    // If current instagram date is before min instagram date, we must move it forward
    const newInstagramDate = isBefore(currentInstagramDate, minInstagramDate)
      ? minInstagramDate
      : currentInstagramDate;

    return {
      date: format(newDateInput, "yyyy-MM-dd HH:mm:ss"),
      instagram_date: format(newInstagramDate, "yyyy-MM-dd HH:mm:ss"),
    };
  }
};
