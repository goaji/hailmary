import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n";

export default createMiddleware(routing);

export const config = {
  // icon/apple-icon are excluded alongside api/trpc/_next/_vercel: they're
  // root-level generated routes with no file extension in their URL (unlike
  // favicon.ico/sitemap.xml/robots.txt, which the ".*\..*" exclusion already
  // catches), so without this they'd get locale-redirected into a 404.
  matcher: ["/((?!api|trpc|_next|_vercel|icon|apple-icon|.*\\..*).*)"],
};
