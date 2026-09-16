import { getTranslations } from "next-intl/server";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Link } from "@/i18n";
import remarkGfm from "remark-gfm";
import rehypeUnwrapImages from "rehype-unwrap-images";
import { articleComponents } from "./articleComponents";
import styles from "./ArticleBody.module.scss";

type ArticleBodyProps = {
  content: string;
  tags?: string[];
};

export async function ArticleBody({ content, tags }: ArticleBodyProps) {
  const t = await getTranslations("articleBody");

  return (
    <div className={styles.body}>
      <MDXRemote
        source={content}
        components={articleComponents}
        options={{
          mdxOptions: {
            // GFM tables are the only extension this content actually uses —
            // CommonMark alone has no pipe-table syntax.
            remarkPlugins: [remarkGfm],
            // A standalone `![alt](src)` line is markdown for an image
            // paragraph, so remark wraps it in <p>. Our img component
            // renders a block-level <div> (for the aspect-ratio box),
            // which is invalid inside a <p> and breaks hydration — this
            // strips that wrapping paragraph.
            rehypePlugins: [rehypeUnwrapImages],
          },
        }}
      />

      {tags && tags.length > 0 ? (
        <ul className={styles.tags} aria-label={t("tagsLabel")}>
          {tags.map((tag) => (
            <li key={tag} className={styles.tag}>
              <Link href={`/etichete/${tag}`} className={styles.tagLink}>
                {tag}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
