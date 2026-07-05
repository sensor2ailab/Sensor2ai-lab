import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { site } from "@/data/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { ApplyBoard } from "@/components/apply/ApplyBoard";

export const metadata: Metadata = {
  title: "Join Us",
  description: `Open positions and how to apply to the ${site.name}.`,
  alternates: { canonical: "/join" },
};

// Openings are driven entirely by what the lab posts from the admin console; this
// page just lists them and lets applicants apply.
export default function JoinPage() {
  return (
    <>
      <PageHeader
        eyebrow="Careers"
        title="Join us"
        subtitle="Current openings at the lab. Apply directly to any role that fits."
      />

      <Section tone="surface">
        <Container>
          <ApplyBoard />
        </Container>
      </Section>

      <Section className="bg-surface border-border border-t">
        <Container className="flex items-center justify-center">
          <Reveal>
            <div className="border-border bg-ink flex w-fit flex-col items-center gap-6 rounded-lg border p-8 text-center sm:p-10">
              <div className="flex flex-col items-center gap-2">
                <h2 className="text-background text-h3 font-semibold sm:text-2xl">
                  Not sure which role fits?
                </h2>
                <p className="text-background/80 max-w-xl">
                  Send a short note about your background and interests, and we will get back to
                  you.
                </p>
              </div>
              <Button href={`mailto:${site.email}`}>
                <Mail className="size-4" aria-hidden="true" />
                {site.email}
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
