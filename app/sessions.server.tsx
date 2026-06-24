import { createCookieSessionStorage } from "react-router";
import { createThemeSessionResolver } from "remix-themes";

// You can default to 'development' if process.env.NODE_ENV is not set
// const isProduction = process.env.NODE_ENV === "production";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET variable de ambiente é necessária!");
}

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "theme",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: [sessionSecret],
  },
});
export const themeSessionResolver = createThemeSessionResolver(sessionStorage);
