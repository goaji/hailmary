// Temporary review route - will be deleted later
import { SectionHeading } from "@/components/ui/SectionHeading/SectionHeading";
import { Tag } from "@/components/ui/Tag/Tag";
import { Card } from "@/components/ui/Card/Card";
import { CATEGORY_IDS } from "@/types";

export default function ScratchPage() {
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

      <section style={{ display: "flex", gap: 24, maxWidth: 400 }}>
        <Card>
          <SectionHeading as="h3">GHID PENTRU ÎNCEPĂTORI</SectionHeading>
          <p>Card shell placeholder content.</p>
        </Card>
      </section>
    </div>
  );
}
