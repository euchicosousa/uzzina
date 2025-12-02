import { addMinutes, format, isAfter, isBefore, parseISO } from "date-fns";

// Mock Action type
type Action = {
  date: string;
  instagram_date: string;
  time?: number;
  category: string;
};

// Mock helper function (copy-pasted from helpers.tsx)
const getNewDateForAction = (
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

// Test Case: User reports "date moved to 7 days previous"
// Scenario: Action is scheduled for next week (7 days from now).
// User moves instagram_date to NOW (Shift+H).

const now = new Date();
const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

const action: Action = {
  date: format(nextWeek, "yyyy-MM-dd HH:mm:ss"), // Start date is next week
  instagram_date: format(nextWeek, "yyyy-MM-dd HH:mm:ss"), // Post date is next week
  time: 5,
  category: "post",
};

console.log("Original Action:");
console.log("Date:", action.date);
console.log("Instagram Date:", action.instagram_date);

// Simulate Shift+H (Move to Now + 30 mins)
const newDateInput = addMinutes(now, 30);
const isInstagramDate = true;

const result = getNewDateForAction(action, newDateInput, isInstagramDate);

console.log("\nResult (Shift+H):");
console.log("Date:", result.date);
console.log("Instagram Date:", result.instagram_date);

// Check if date moved back significantly
const originalDate = parseISO(action.date);
const newDate = parseISO(result.date);
const diffTime = originalDate.getTime() - newDate.getTime();
const diffDays = diffTime / (1000 * 60 * 60 * 24);

console.log("\nDate moved back by (days):", diffDays.toFixed(2));
