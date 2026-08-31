import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
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
        // GFM tables are the only extension this content actually uses —
        // CommonMark alone has no pipe-table syntax.
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    </div>
  );
}
