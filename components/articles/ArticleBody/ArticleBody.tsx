import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeUnwrapImages from "rehype-unwrap-images";
import { articleComponents } from "./articleComponents";
import styles from "./ArticleBody.module.scss";

type ArticleBodyProps = {
  content: string;
};

export function ArticleBody({ content }: ArticleBodyProps) {
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
    </div>
  );
}
