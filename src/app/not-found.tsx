import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export default function NotFound() {
  return (
    <section className="bg-surface flex min-h-[90vh] w-full items-center justify-center">
      <Container className="flex justify-center py-24">
        <Stagger className="flex flex-col items-center gap-6 text-center">
          <StaggerItem>
            <p className="text-display text-primary font-bold">404</p>
          </StaggerItem>
          <StaggerItem>
            <h1 className="text-h2 font-semibold">Page not found</h1>
          </StaggerItem>
          <StaggerItem>
            <p className="text-secondary max-w-md">
              The page you are looking for does not exist or may have moved.
            </p>
          </StaggerItem>
          <StaggerItem>
            <Button href="/">Back to home</Button>
          </StaggerItem>
        </Stagger>
      </Container>
    </section>
  );
}
