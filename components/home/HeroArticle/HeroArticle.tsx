import type { Article } from "@/types";
import { Link } from "@/i18n";
import { ArticleImage } from "@/components/ui/ArticleImage/ArticleImage";
import { Byline } from "@/components/ui/Byline/Byline";
import styles from "./HeroArticle.module.scss";

type HeroArticleProps = {
  article: Article;
};

export function HeroArticle({ article }: HeroArticleProps) {
  return (
    <div className={styles.hero} lang={article.servedLocale}>
      <div className={styles.content}>
        {article.kicker ? <span className={styles.kicker}>{article.kicker}</span> : null}
        <h1 className={styles.title}>
          <Link href={`/stiri/${article.slug}`} className={styles.titleLink}>
            {article.title}
          </Link>
        </h1>
        <p className={styles.excerpt}>{article.excerpt}</p>
        <Byline author={article.author} publishedAt={article.publishedAt} />
      </div>

      <div className={styles.imageWrap}>
        <ArticleImage image={article.image} fill preload sizes="(min-width: 768px) 66vw, 100vw" />
      </div>
    </div>
  );
}
