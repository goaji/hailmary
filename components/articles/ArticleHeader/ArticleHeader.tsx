import type { Article } from "@/types";
import { Byline } from "@/components/ui/Byline/Byline";
import { Tag } from "@/components/ui/Tag/Tag";
import styles from "./ArticleHeader.module.scss";

type ArticleHeaderProps = {
  article: Article;
};

export function ArticleHeader({ article }: ArticleHeaderProps) {
  return (
    <header className={styles.articleHeader}>
      <Tag category={article.category} />
      <h1 className={styles.title}>{article.title}</h1>
      <p className={styles.excerpt}>{article.excerpt}</p>
      <div className={styles.byline}>
        <Byline
          author={article.author}
          publishedAt={article.publishedAt}
          readingTimeMinutes={article.readingTimeMinutes}
        />
      </div>
    </header>
  );
}
