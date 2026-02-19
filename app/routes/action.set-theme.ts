import { createThemeAction } from "remix-themes";

import { themeSessionResolver } from "../sessions.server";
import type { Action } from "~/models/actions.server";

export const action = createThemeAction(themeSessionResolver);
