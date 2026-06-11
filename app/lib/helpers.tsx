/**
 * Barrel export file to centralize utility exports (date, format, validation, factory, sort, filter)
 * and UI Icons for cleaner developer experience imports across the project.
 */
export * from "~/utils/date";
export * from "~/utils/format";
export * from "~/utils/validation";
export * from "~/utils/factory";
export * from "~/utils/sort";
export * from "~/utils/filter";
export * from "~/components/uzzina/UIIcons";

export { createSupabaseClient } from "./supabase";


