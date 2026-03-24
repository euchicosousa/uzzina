import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getGridCols = (count: number) => {
  // Se for muito item, não tentamos ser espertos, usamos um padrão
  if (count > 20) return "grid-cols-4 sm:grid-cols-5";

  if (count % 5 === 0) return "grid-cols-5";
  if (count % 4 === 0) return "grid-cols-4";
  if (count % 3 === 0) return "grid-cols-3";
  return "grid-cols-4"; // Fallback
};

export const getGridClasses = (columns: number) => {
  if (columns === 1) return "flex flex-col";

  // Se for um valor fixo entre 2 e 6
  if (columns >= 2 && columns <= 6) {
    const classes = ["grid", "grid-cols-2"]; // Começa sempre com 2 no mobile

    if (columns >= 3) classes.push("sm:grid-cols-3");
    if (columns >= 4) classes.push("md:grid-cols-4");
    if (columns >= 5) classes.push("lg:grid-cols-5");
    if (columns === 6) classes.push("xl:grid-cols-6"); // 6 colunas costuma pedir telas bem largas

    return classes.join(" ");
  }

  // Fallback para auto-fill (o mais seguro para listas gigantes)
  return "grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))]";
};
