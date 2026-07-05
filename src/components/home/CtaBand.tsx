import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";

interface CtaBandProps {
  title?: string;
  subtitle?: string;
  href?: string;
  cta?: string;
}

// Reusable light call-to-action card. Defaults suit the home page.
export function CtaBand({
  title = "Interested in our Research?",
  subtitle = "We are always looking for curious, driven people to join the lab.",
  href = "/join",
  cta = "Join Us",
}: CtaBandProps) {
  return (
    <Section tone="surface">
      <Container>
        <Reveal className="border-border bg-background shadow-card flex flex-col items-start gap-6 rounded-lg border p-8 sm:p-12 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3">
            <h2 className="text-h2 max-w-2xl font-bold">{title}</h2>
            <p className="text-lead text-secondary max-w-xl">{subtitle}</p>
          </div>
          <Button href={href} className="shrink-0">
            {cta}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </Reveal>
      </Container>
    </Section>
  );
}
