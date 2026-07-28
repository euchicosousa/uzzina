import {
  addMinutes,
  format,
  isToday,
  setHours,
  setMilliseconds,
  setMinutes,
  setSeconds,
} from "date-fns";
import { PHASES, PRIORITIES } from "~/lib/CONSTANTS";
import { DEFAULT_ACTION_COLOR } from "~/lib/uzzina-utils";

export const getCleanAction = ({
  user_id,
  date,
  partners,
}: {
  user_id: string;
  date?: Date;
  partners?: string[];
}) => {
  const now = new Date();
  const targetDate = date ? new Date(date) : now;

  let finalDate: Date;

  if (isToday(targetDate)) {
    if (now.getHours() < 11) {
      finalDate = setMilliseconds(
        setSeconds(setMinutes(setHours(targetDate, 11), 0), 0),
        0,
      );
    } else {
      finalDate = addMinutes(now, 10);
    }
  } else {
    finalDate = setMilliseconds(
      setSeconds(setMinutes(setHours(targetDate, 11), 0), 0),
      0,
    );
  }

  const _date = format(finalDate, "yyyy-MM-dd HH:mm:ss");

  return {
    title: "",
    description: "",
    phase: PHASES.idea.slug,
    priority: PRIORITIES.medium.slug,
    category: "post",
    responsibles: [user_id],
    color: DEFAULT_ACTION_COLOR,
    date: _date,
    partners: partners || [],
    time: 10,
    archived: false,
  };
};

