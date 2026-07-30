import type { Action, Partner, Person } from "~/types";
import type {
  CATEGORY_TYPE,
  DATE_TIME_DISPLAY,
  PHASE_TYPE,
  STATION_TYPE,
  VARIANT,
} from "~/lib/CONSTANTS";

export interface ActionVariantRendererProps {
  variant: (typeof VARIANT)[keyof typeof VARIANT];
  action: Action;
  currentPhase: PHASE_TYPE;
  currentStation: STATION_TYPE | null;
  currentCategory: CATEGORY_TYPE;
  currentPartners: Partner[];
  currentResponsibles: Person[];
  showCategory?: boolean;
  showResponsibles?: boolean;
  showPartner?: boolean;
  showPriority?: boolean;
  showStation?: boolean;
  isEditing: boolean;
  handleSetIsEditing: (val: boolean) => void;
  lines: 1 | 2 | undefined;
  dateTimeDisplay:
    | (typeof DATE_TIME_DISPLAY)[keyof typeof DATE_TIME_DISPLAY]
    | undefined;
  handleAction: (
    action: Action & {
      intent: string;
    },
  ) => void;
}
