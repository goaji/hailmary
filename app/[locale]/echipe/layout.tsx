import { PageLayout } from "@/components/layout/PageLayout/PageLayout";
import { TeamsRail } from "@/components/teams/TeamsRail/TeamsRail";
import { requireLocale } from "@/utils/locale";
import styles from "./layout.module.scss";

// The rail lives here, not in the pages, so it stays mounted while only the team on the right changes.
export default async function TeamsLayout({ children, params }: LayoutProps<"/[locale]/echipe">) {
  const locale = requireLocale((await params).locale);

  return (
    <div className={styles.page}>
      <PageLayout aside={<TeamsRail locale={locale} />} asideOnMobile="above">
        {children}
      </PageLayout>
    </div>
  );
}
