import type { ComponentPropsWithoutRef } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeUnwrapImages from "rehype-unwrap-images";
import { articleComponents } from "@/components/articles/ArticleBody/articleComponents";
import type { ReferenceSection as ReferenceSectionType } from "@/types";
import styles from "./RuleSection.module.scss";

type RuleSectionProps = {
  section: ReferenceSectionType;
  body: string;
};

// The heading's id is both what aria-labelledby points at and what a TOC/seeAlso "#id" link scrolls to.
export function RuleSection({ section, body }: RuleSectionProps) {
  const Heading = articleComponents.h2;

  const components = {
    ...articleComponents,
    h2: (props: ComponentPropsWithoutRef<"h2">) => <Heading {...props} id={section.id} />,
  };

  return (
    <section className={styles.section} aria-labelledby={section.id}>
      <MDXRemote
        source={body}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeUnwrapImages],
          },
        }}
      />
    </section>
  );
}
