import { getTranslations } from "next-intl/server";
import { LiveScoreBadgeView } from "./LiveScoreBadgeView";

type LiveScoreBadgeProps = {
  quarter?: number;
  clock?: string;
};

export async function LiveScoreBadge(props: LiveScoreBadgeProps) {
  const t = await getTranslations("liveScoreBadge");
  return <LiveScoreBadgeView {...props} t={t} />;
}
