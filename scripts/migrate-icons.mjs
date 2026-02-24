/**
 * Migrates @tabler/icons-react imports → lucide-react
 * Keeps only IconBrand* in Tabler.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

// Tabler → Lucide name mapping
const MAP = {
  IconAdjustments: "SlidersHorizontal",
  IconAlertCircle: "CircleAlert",
  IconAlertOctagon: "OctagonAlert",
  IconAlertTriangle: "TriangleAlert",
  IconAntennaBars1: "SignalZero",
  IconAntennaBars3: "SignalMedium",
  IconAntennaBars5: "Signal",
  IconArchive: "Archive",
  IconArrowDown: "ArrowDown",
  IconBaselineDensityMedium: "AlignJustify",
  IconBaselineDensitySmall: "AlignJustify",
  IconBolt: "Zap",
  IconBrain: "Brain",
  IconCalendarEvent: "CalendarDays",
  IconCamera: "Camera",
  IconCarouselHorizontal: "GalleryHorizontal",
  IconCategory: "LayoutGrid",
  IconCheck: "Check",
  IconChevronDown: "ChevronDown",
  IconChevronLeft: "ChevronLeft",
  IconChevronRight: "ChevronRight",
  IconChevronUp: "ChevronUp",
  IconCircle: "Circle",
  IconCircleCheck: "CircleCheck",
  IconCirclePlus: "CirclePlus",
  IconClipboardCheck: "ClipboardCheck",
  IconClock: "Clock",
  IconCloudUpload: "CloudUpload",
  IconCode: "Code",
  IconCoin: "Coins",
  IconComponents: "Blocks",
  IconDeviceDesktop: "Monitor",
  IconDeviceFloppy: "Save",
  IconEye: "Eye",
  IconEyeOff: "EyeOff",
  IconFilter: "Filter",
  IconFolderPlus: "FolderPlus",
  IconGridDots: "Grid3x3",
  IconGripVertical: "GripVertical",
  IconHeart: "Heart",
  IconHeartHandshake: "HeartHandshake",
  IconInfoCircle: "Info",
  IconLayoutKanban: "Kanban",
  IconList: "List",
  IconLoader: "Loader",
  IconLogin: "LogIn",
  IconLogin2: "LogIn",
  IconMailCheck: "MailCheck",
  IconMessageCircle: "MessageCircle",
  IconMoon: "Moon",
  IconPencil: "Pencil",
  IconPhoto: "Image",
  IconPlayerPlay: "Play",
  IconPlus: "Plus",
  IconPresentation: "Presentation",
  IconPrinter: "Printer",
  IconRosetteDiscountCheck: "BadgeCheck",
  IconSearch: "Search",
  IconSortAscendingLetters: "ArrowUpAZ",
  IconSortDescendingLetters: "ArrowDownAZ",
  IconSpeakerphone: "Megaphone",
  IconSquare: "Square",
  IconSquareCheck: "SquareCheck",
  IconSun: "Sun",
  IconTag: "Tag",
  IconTrash: "Trash2",
  IconUpload: "Upload",
  IconUser: "User",
  IconUserPlus: "UserPlus",
  IconUsers: "Users",
  IconWand: "Wand2",
  IconX: "X",
};

const BRAND_ICONS = new Set([
  "IconBrandInstagram",
  "IconBrandTiktok",
  "IconBrandYoutube",
  "IconBrandWhatsapp",
  "IconBrandFacebook",
  "IconBrandX",
  "IconBrandLinkedin",
  "IconBrandTwitter",
]);

function walk(dir) {
  const entries = readdirSync(dir);
  const files = [];
  for (const entry of entries) {
    if (entry === "node_modules" || entry === ".git") continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) files.push(...walk(full));
    else if ([".tsx", ".ts"].includes(extname(full))) files.push(full);
  }
  return files;
}

let changedFiles = 0;

for (const filePath of walk("./app")) {
  let src = readFileSync(filePath, "utf8");
  const original = src;

  // Find all tabler imports
  const tablerImportRe =
    /import\s*\{([^}]+)\}\s*from\s*["']@tabler\/icons-react["']\s*;?/g;
  let match;
  const lucideToAdd = new Set();
  const keepTabler = [];

  // Collect what we need in each set
  src = src.replace(tablerImportRe, (full, names) => {
    const parsed = names
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);

    const tablerNeeded = parsed.filter((n) => BRAND_ICONS.has(n));
    const toMigrate = parsed.filter((n) => !BRAND_ICONS.has(n) && MAP[n]);
    const unknown = parsed.filter((n) => !BRAND_ICONS.has(n) && !MAP[n]);

    if (unknown.length) {
      console.warn(`[WARN] ${filePath}: unmapped icons: ${unknown.join(", ")}`);
    }

    toMigrate.forEach((n) => lucideToAdd.add(MAP[n]));
    keepTabler.push(...tablerNeeded);

    if (tablerNeeded.length) {
      return `import { ${tablerNeeded.join(", ")} } from "@tabler/icons-react";`;
    }
    return "// (tabler import removed)";
  });

  // Replace usage of tabler icon names with lucide names
  for (const [tabler, lucide] of Object.entries(MAP)) {
    if (lucide !== tabler) {
      // Replace JSX component usage and type references
      const re = new RegExp(`\\b${tabler}\\b`, "g");
      src = src.replace(re, lucide);
    }
  }

  // Remove placeholder comments for removed imports
  src = src.replace(/\/\/ \(tabler import removed\)\n?/g, "");

  // Inject lucide import if needed
  if (lucideToAdd.size > 0) {
    const lucideImport = `import { ${[...lucideToAdd].sort().join(", ")} } from "lucide-react";`;
    const existingLucideRe =
      /import\s*\{([^}]+)\}\s*from\s*["']lucide-react["']\s*;?/;
    if (existingLucideRe.test(src)) {
      // Merge into existing import
      src = src.replace(existingLucideRe, (full, names) => {
        const existing = names
          .split(",")
          .map((n) => n.trim())
          .filter(Boolean);
        const merged = [...new Set([...existing, ...lucideToAdd])].sort();
        return `import { ${merged.join(", ")} } from "lucide-react";`;
      });
    } else {
      // Add after the last import or at the top
      const firstImportMatch = src.match(/^(import .+\n)+/m);
      if (firstImportMatch) {
        const idx =
          src.indexOf(firstImportMatch[0]) + firstImportMatch[0].length;
        src = src.slice(0, idx) + lucideImport + "\n" + src.slice(idx);
      } else {
        src = lucideImport + "\n" + src;
      }
    }
  }

  if (src !== original) {
    writeFileSync(filePath, src, "utf8");
    console.log(`✅ Updated: ${filePath}`);
    changedFiles++;
  }
}

console.log(`\nDone! Modified ${changedFiles} files.`);
