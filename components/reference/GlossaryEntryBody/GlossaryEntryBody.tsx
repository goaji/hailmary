import type { ComponentPropsWithoutRef } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import styles from "./GlossaryEntryBody.module.scss";

type GlossaryEntryBodyProps = {
  content: string;
};

// A deliberately smaller component map than ArticleBody's — glossary
// entries are two to four short paragraphs (SKILLS.md), never images,
// tables or internal links, so there's nothing else to register.
const glossaryComponents = {
  p: (props: ComponentPropsWithoutRef<"p">) => <p className={styles.p} {...props} />,
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className={styles.strong} {...props} />
  ),
  em: (props: ComponentPropsWithoutRef<"em">) => <em {...props} />,
  ul: (props: ComponentPropsWithoutRef<"ul">) => <ul className={styles.list} {...props} />,
  ol: (props: ComponentPropsWithoutRef<"ol">) => <ol className={styles.list} {...props} />,
  li: (props: ComponentPropsWithoutRef<"li">) => <li {...props} />,
};

// Renders a glossary entry's `extended` MDX body. Shared by /glosar (the
// full list) and, from step 3 on, the explainer panel — the one place this
// content is compiled, per AGENTS.md's "never a second copy of a
// definition".
export async function GlossaryEntryBody({ content }: GlossaryEntryBodyProps) {
  return (
    <div className={styles.body}>
      <MDXRemote source={content} components={glossaryComponents} />
    </div>
  );
}
