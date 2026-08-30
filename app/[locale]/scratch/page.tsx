// Temporary review route - will be deleted later
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { Tag } from "@/components/ui/Tag/Tag";
import { Card } from "@/components/ui/Card/Card";
import { LinkList } from "@/components/ui/LinkList/LinkList";
import { Byline } from "@/components/ui/Byline/Byline";
import { ArticleImage } from "@/components/ui/ArticleImage/ArticleImage";
import { CATEGORY_IDS } from "@/types";

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

export default async function ScratchPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, padding: 40 }}>
      <section>
        <SectionHeading>ULTIMELE ȘTIRI (as h2, default)</SectionHeading>
      </section>

      <section style={{ display: "flex", gap: 24 }}>
        <SectionHeading as="h1">As h1</SectionHeading>
        <SectionHeading as="h3">As h3</SectionHeading>
      </section>

      <section style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {CATEGORY_IDS.map((category) => (
          <Tag key={category} category={category} />
        ))}
      </section>

      <section style={{ display: "flex", gap: 24, maxWidth: 700 }}>
        <Card>
          <SectionHeading as="h3">GHID PENTRU ÎNCEPĂTORI</SectionHeading>
          <LinkList
            variant="link"
            items={[
              { label: "Regulamentul de bază", href: "/regulament" },
              { label: "Glosar de termeni", href: "/glosar" },
              { label: "Istoria fotbalului american", href: "/istorie" },
            ]}
          />
        </Card>

        <Card>
          <SectionHeading as="h3">PROGRAMUL SĂPTĂMÂNII</SectionHeading>
          <LinkList
            variant="value"
            items={[
              { label: "49ers @ Ravens", value: "Dum, 21:25" },
              { label: "Lions @ Packers", value: "Dum, 01:20" },
              { label: "Bills @ Dolphins", value: "Lun, 02:15" },
            ]}
          />
        </Card>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Byline author="Andrei Mocanu" publishedAt={hoursAgo(2)} />
        <Byline author="Andrei Mocanu" publishedAt={hoursAgo(9)} />
      </section>

      <section style={{ display: "flex", gap: 24 }}>
        <div style={{ width: 200 }}>
          <p>With image (using /next.svg as a stand-in):</p>
          <ArticleImage
            image={{ src: "/next.svg", alt: "Test image" }}
            width={200}
            height={150}
          />
        </div>
        <div style={{ width: 200 }}>
          <p>No image — placeholder fallback (404s until step 5 adds the asset):</p>
          <ArticleImage width={200} height={150} />
        </div>
      </section>
    </div>
  );
}
