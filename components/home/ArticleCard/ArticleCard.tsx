import { getLocale } from "next-intl/server";
import type { Article } from "@/types";
import { Link } from "@/i18n";
import { ArticleImage } from "@/components/ui/ArticleImage/ArticleImage";
import { Tag } from "@/components/ui/Tag/Tag";
import { formatPublishedAt } from "@/utils/formatPublishedAt";
import styles from "./ArticleCard.module.scss";

type ArticleCardProps = {
  article: Article;
};

export async function ArticleCard({ article }: ArticleCardProps) {
  const locale = await getLocale();

  return (
    <div className={styles.card}>
      <div className={styles.imageWrap}>
        <ArticleImage image={article.image} fill />
      </div>

      <Tag category={article.category} />

      <h3 className={styles.title}>
        <Link href={`/stiri/${article.slug}`} className={styles.titleLink}>
          {article.title}
        </Link>
      </h3>

      <p className={styles.time}>{formatPublishedAt(article.publishedAt, locale)}</p>
    </div>
  );
}
