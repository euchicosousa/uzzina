import { addMinutes, format, isToday } from "date-fns";
import { PRIORITIES, STATES } from "~/lib/CONSTANTS";

export const getCleanAction = (user_id: string, date?: Date) => {
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
    state: STATES.idea.slug,
    priority: PRIORITIES.medium.slug,
    category: "post",
    responsibles: [user_id],
    topics: null,
    color: "#999",
    date: _date,
    instagram_date: format(addMinutes(_date, 10), "yyyy-MM-dd HH:mm:ss"),
    partners: [],
    time: 10,
  };
};
