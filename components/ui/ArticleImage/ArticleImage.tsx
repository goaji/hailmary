import Image from "next/image";
import type { ArticleImage as ArticleImageData } from "@/types";
import styles from "./ArticleImage.module.scss";

type ArticleImageProps = {
  image?: ArticleImageData;
  width: number;
  height: number;
  priority?: boolean;
};

// Added in task 3 step 5 (seed content). Until then this path 404s, which
// only surfaces once something actually renders the no-image fallback.
const PLACEHOLDER_SRC = "/placeholder/hatch.svg";

export function ArticleImage({ image, width, height, priority }: ArticleImageProps) {
  return (
    <Image
      src={image?.src ?? PLACEHOLDER_SRC}
      alt={image?.alt ?? ""}
      width={width}
      height={height}
      priority={priority}
      className={styles.image}
    />
  );
}
