import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Check,
  FileText,
  Landmark,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import { projects } from "@/data/projects";
import { site } from "@/data/site";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { CtaBand } from "@/components/home/CtaBand";
import { projectStatusStyle } from "@/lib/project";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: project.blurb,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: `${project.title} | ${site.shortName}`,
      description: project.blurb,
    },
  };
}

// Icon tile + heading, reused across the content sections.
function SectionHead({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="bg-primary-soft text-primary-hover inline-flex size-10 shrink-0 items-center justify-center rounded-md">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h2 className="text-h3 font-semibold sm:text-2xl">{title}</h2>
    </div>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item} className="text-secondary flex items-start gap-3">
          <span className="bg-primary-soft text-primary-hover mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full">
            <Check className="size-3" aria-hidden="true" />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const status = projectStatusStyle(project.status);

  return (
    <>
      {/* Header */}
      <section className="border-border bg-surface border-b">
        <Container className="flex flex-col gap-6 py-14 sm:py-16">
          <Link
            href="/projects"
            className="text-secondary hover:text-primary inline-flex w-fit items-center gap-1.5 text-sm font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            All projects
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-pill inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold ${status.pill}`}
            >
              <span className={`size-1.5 rounded-full ${status.dot}`} />
              {project.status}
            </span>
            {project.period ? (
              <span className="text-muted inline-flex items-center gap-1.5 text-sm">
                <CalendarDays className="size-4" aria-hidden="true" />
                {project.period}
              </span>
            ) : null}
          </div>
          <h1 className="text-[clamp(2rem,6vw,3.5rem)] text-balance">{project.title}</h1>
          <p className="text-lead text-secondary max-w-2xl">{project.blurb}</p>
        </Container>
      </section>

      {/* Content */}
      <Section>
        <Container className="grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
          <Reveal className="flex flex-col gap-12">
            <section className="flex flex-col gap-4">
              <SectionHead icon={FileText} title="Overview" />
              <p className="text-lead text-secondary">{project.overview}</p>
            </section>

            <section className="flex flex-col gap-5">
              <SectionHead icon={Target} title="Objectives" />
              <CheckList items={project.objectives} />
            </section>

            <section className="flex flex-col gap-5">
              <SectionHead icon={BadgeCheck} title="Outcomes" />
              <CheckList items={project.outcomes} />
            </section>
          </Reveal>

          <Reveal delay={0.1}>
            <aside className="border-border bg-background shadow-card divide-border flex flex-col divide-y rounded-lg border lg:sticky lg:top-24">
              <div className="flex flex-col gap-2 p-6">
                <span className="text-muted text-xs font-semibold tracking-[0.18em] uppercase">
                  Status
                </span>
                <span
                  className={`rounded-pill inline-flex w-fit items-center gap-1.5 px-2.5 py-1 text-xs font-semibold ${status.pill}`}
                >
                  <span className={`size-1.5 rounded-full ${status.dot}`} />
                  {project.status}
                </span>
              </div>

              {project.period ? (
                <div className="flex flex-col gap-2 p-6">
                  <span className="text-muted inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
                    <CalendarDays className="size-4" aria-hidden="true" />
                    Period
                  </span>
                  <span className="text-secondary text-sm">{project.period}</span>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 p-6">
                <span className="text-muted inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
                  <Landmark className="size-4" aria-hidden="true" />
                  Funding
                </span>
                <ul className="flex flex-wrap gap-2">
                  {project.funding.map((fund) => (
                    <li key={fund}>
                      <Badge tone="outline">{fund}</Badge>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-3 p-6">
                <span className="text-muted inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
                  <Users className="size-4" aria-hidden="true" />
                  Team
                </span>
                <ul className="text-secondary flex flex-col gap-2 text-sm">
                  {project.team.map((member) => (
                    <li key={member}>{member}</li>
                  ))}
                </ul>
              </div>
            </aside>
          </Reveal>
        </Container>
      </Section>

      <CtaBand
        title="Interested in this project?"
        subtitle="Reach out to learn more or explore ways to collaborate."
      />
    </>
  );
}
