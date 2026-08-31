// Temporary review route for task 4 — deleted before step 5's commit.
import { NewsGrid } from "@/components/home/NewsGrid/NewsGrid";
import { getAllArticles } from "@/utils/articles";

export default function ScratchPage() {
  const articles = getAllArticles("ro").slice(0, 4);

  return (
    <div style={{ padding: 40, maxWidth: 900 }}>
      <NewsGrid articles={articles} />
    </div>
  );
}
