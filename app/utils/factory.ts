import { addMinutes, format, isToday } from "date-fns";
import { PHASES, PRIORITIES } from "~/lib/CONSTANTS";

export const getCleanAction = ({
  user_id,
  date,
  partners,
}: {
  user_id: string;
  date?: Date;
  partners?: string[];
}) => {
  date = date || new Date();
  let _date = format(
    isToday(date)
      ? date.getHours() < 11
        ? date.setHours(11, 0, 0)
        : addMinutes(date, 10)
      : date.setHours(11, 0, 0),
    "yyyy-MM-dd HH:mm:ss",
  );

  return {
    title: "",
    description: "",
    phase: PHASES.idea.slug,
    priority: PRIORITIES.medium.slug,
    category: "post",
    responsibles: [user_id],
    color: "#999",
    date: _date,
    partners: partners || [],
    time: 10,
    archived: false,
  };
};
