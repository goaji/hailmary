import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n";
import { ArticleImage } from "@/components/ui/ArticleImage/ArticleImage";
import { TermLink } from "@/components/explainer/TermLink/TermLink";
import styles from "./ArticleBody.module.scss";

function MdxLink({ href = "", children, ...rest }: ComponentPropsWithoutRef<"a">) {
  // Internal vs. external is detected from the href itself, not a choice
  // the article author makes — a relative path always goes through the
  // locale-aware Link, everything else (http(s), mailto:, #anchors) stays
  // a plain anchor.
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={styles.link}>
        {children}
      </Link>
    );
  }

  const isExternalHttp = /^https?:\/\//.test(href);

  return (
    <a
      href={href}
      className={styles.link}
      target={isExternalHttp ? "_blank" : undefined}
      rel={isExternalHttp ? "noopener noreferrer" : undefined}
      {...rest}
    >
      {children}
    </a>
  );
}

function MdxImage({ src, alt }: { src?: string; alt?: string }) {
  return (
    <div className={styles.imageWrap}>
      <ArticleImage
        image={{ src: src ?? "", alt: alt ?? "" }}
        fill
        sizes="(min-width: 960px) 896px, 100vw"
      />
    </div>
  );
}

async function MdxTable({ children }: { children?: ReactNode }) {
  const t = await getTranslations("articleBody");

  // A generic <div> has no accessible-name mechanism on its own — role
  // "region" is what lets aria-label apply, and there's no plain-HTML
  // element for "scrollable region with a name."
  return (
    <div
      role="region"
      aria-label={t("tableScrollLabel")}
      tabIndex={0}
      className={styles.tableWrapper}
    >
      <table className={styles.table}>{children}</table>
    </div>
  );
}

export const articleComponents = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => <h2 className={styles.h2} {...props} />,
  h3: (props: ComponentPropsWithoutRef<"h3">) => <h3 className={styles.h3} {...props} />,
  p: (props: ComponentPropsWithoutRef<"p">) => <p className={styles.p} {...props} />,
  ul: (props: ComponentPropsWithoutRef<"ul">) => <ul className={styles.list} {...props} />,
  ol: (props: ComponentPropsWithoutRef<"ol">) => <ol className={styles.list} {...props} />,
  li: (props: ComponentPropsWithoutRef<"li">) => <li className={styles.listItem} {...props} />,
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className={styles.blockquote} {...props} />
  ),
  a: MdxLink,
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className={styles.strong} {...props} />
  ),
  em: (props: ComponentPropsWithoutRef<"em">) => <em className={styles.em} {...props} />,
  hr: (props: ComponentPropsWithoutRef<"hr">) => <hr className={styles.hr} {...props} />,
  img: MdxImage,
  table: MdxTable,
  TermLink,
};
