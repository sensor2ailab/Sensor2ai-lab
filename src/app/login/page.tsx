import type { Metadata } from "next";
import { Suspense } from "react";
import { site } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: `Members and administrators sign in to the ${site.name} portal.`,
  alternates: { canonical: "/login" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-static";

export default function LoginPage() {
  return (
    <Section tone="surface" className="flex min-h-[70vh] items-center">
      <Container className="flex justify-center">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </Container>
    </Section>
  );
}
