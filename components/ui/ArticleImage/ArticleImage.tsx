import Image from "next/image";
import type { ArticleImage as ArticleImageData } from "@/types";
import styles from "./ArticleImage.module.scss";

type ArticleImageBaseProps = {
  image?: ArticleImageData;
  priority?: boolean;
};

// Explicit dimensions (the common case) or fill (an absolutely-positioned
// parent supplies the box, e.g. a responsive full-bleed hero) — never both.
type ArticleImageProps =
  | (ArticleImageBaseProps & { fill: true; width?: never; height?: never })
  | (ArticleImageBaseProps & { fill?: false; width: number; height: number });

// Added in task 3 step 5 (seed content). Until then this path 404s, which
// only surfaces once something actually renders the no-image fallback.
const PLACEHOLDER_SRC = "/placeholder/hatch.svg";

export function ArticleImage(props: ArticleImageProps) {
  const src = props.image?.src ?? PLACEHOLDER_SRC;
  const alt = props.image?.alt ?? "";

  if (props.fill) {
    return (
      <Image src={src} alt={alt} fill priority={props.priority} className={styles.image} />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={props.width}
      height={props.height}
      priority={props.priority}
      className={styles.image}
    />
  );
}
