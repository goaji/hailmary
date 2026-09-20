"use client"; // not-found.tsx gets no params, so locale can't be read server-side without forcing the route dynamic — this reads it from client context instead

import { useTranslations } from "next-intl";
import { StatusPanel } from "@/components/layout/StatusPanel/StatusPanel";

export default function ArticleNotFound() {
  const t = useTranslations("articleNotFound");

  return (
    <StatusPanel
      title={t("title")}
      description={t("description")}
      backHref="/"
      backLabel={t("backHome")}
    />
  );
}
