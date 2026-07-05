export default function Loading() {
  return (
    <div className="bg-surface flex min-h-[60vh] items-center justify-center">
      <span className="sr-only">Loading</span>
      <span
        aria-hidden="true"
        className="border-border border-t-primary size-8 animate-spin rounded-full border-2"
      />
    </div>
  );
}
