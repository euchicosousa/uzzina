import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";
import { getUserId } from "~/services/auth.server";
import { getPersonByUserId } from "~/models/people.server";
import { themeSessionResolver } from "~/sessions.server";
import type { Theme } from "remix-themes";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { user_id, supabase } = await getUserId(request);
  const formData = await request.formData();

  const theme = formData.get("theme") as string;
  const themeColorIndex = formData.get("themeColorIndex") !== null ? Number(formData.get("themeColorIndex")) : null;
  const followPartnerColor = formData.get("followPartnerColor") !== null ? formData.get("followPartnerColor") === "true" : null;

  // Parse do customTheme se enviado
  const customThemeRaw = formData.get("customTheme") as string;
  let customTheme = null;
  if (customThemeRaw) {
    try {
      customTheme = JSON.parse(customThemeRaw);
    } catch (e) {
      console.error("Error parsing customTheme:", e);
    }
  }

  // Busca preferências atuais para mesclar
  const person = await getPersonByUserId(supabase, user_id);
  const currentPrefs = person.preferences && typeof person.preferences === "object" ? person.preferences : {};

  const preferences = {
    ...currentPrefs,
    ...(theme ? { theme } : {}),
    ...(themeColorIndex !== null ? { themeColorIndex } : {}),
    ...(followPartnerColor !== null ? { followPartnerColor } : {}),
    ...(customTheme ? { customTheme } : {}),
  };

  const { error } = await supabase
    .from("people")
    .update({
      preferences,
    })
    .eq("user_id", user_id);

  if (error) {
    console.error("Error updating quick preferences:", error);
    return data({ success: false, error: error.message }, { status: 400 });
  }

  // Sincroniza o cookie do remix-themes caso o tema tenha mudado
  if (theme) {
    const resolver = await themeSessionResolver(request);
    resolver.setTheme(theme as Theme);
    return data(
      { success: true },
      {
        headers: {
          "Set-Cookie": await resolver.commit(),
        },
      },
    );
  }

  return data({ success: true });
};
