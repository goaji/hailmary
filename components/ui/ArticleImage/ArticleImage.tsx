import Image from "next/image";
import type { ArticleImage as ArticleImageData } from "@/types";
import styles from "./ArticleImage.module.scss";

type ArticleImageBaseProps = {
  image?: ArticleImageData;
  /** The page's one unambiguous LCP candidate (a hero image) — inserts a <link rel="preload">. Next 16's replacement for the old `priority` prop. */
  preload?: boolean;
  /** One of several possible LCP candidates depending on viewport (e.g. a grid's first row) — eager-loads at high fetch priority without the ambiguous preload link next/image warns against for this case. */
  eager?: boolean;
};

// Explicit dimensions (the common case) or fill (an absolutely-positioned
// parent supplies the box, e.g. a responsive full-bleed hero) — never both.
// `sizes` is required with fill: next/image defaults it to 100vw, which
// over-fetches for anything narrower than the full viewport (a grid card, a
// capped reading column) — see AGENTS.md's image sizing rule.
type ArticleImageProps =
  | (ArticleImageBaseProps & { fill: true; sizes: string; width?: never; height?: never })
  | (ArticleImageBaseProps & { fill?: false; sizes?: never; width: number; height: number });

// Last-resort fallback for the rare caller that renders `image` as fully
// absent (e.g. an MDX inline image with no src). Frontmatter itself never
// reaches this: `readArticleFile` (utils/articles.ts) already assigns one of
// the site's default cover images whenever an article omits `image`.
const PLACEHOLDER_SRC = "/placeholder/hatch.svg";

export function ArticleImage(props: ArticleImageProps) {
  const src = props.image?.src ?? PLACEHOLDER_SRC;
  const alt = props.image?.alt ?? "";

  if (props.fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={props.sizes}
        preload={props.preload}
        loading={props.eager ? "eager" : undefined}
        fetchPriority={props.eager ? "high" : undefined}
        className={styles.image}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={props.width}
      height={props.height}
      preload={props.preload}
      loading={props.eager ? "eager" : undefined}
      fetchPriority={props.eager ? "high" : undefined}
      className={styles.image}
    />
  );
}
