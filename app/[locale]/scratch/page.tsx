// Temporary review route for task 4 — deleted before step 5's commit.
import { HeroArticle } from "@/components/home/HeroArticle/HeroArticle";
import { getFeaturedArticle } from "@/utils/articles";

export default function ScratchPage() {
  const featured = getFeaturedArticle("ro");

  if (!featured) {
    return <p>No featured article.</p>;
  }

  return <HeroArticle article={featured} />;
}
