import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";

// Placeholder bubbles laid out exactly like ChatThread (patterned surface + composer),
// so loading and switching a conversation shimmer in place instead of flashing empty
// or spinning.
const ROWS = [
  { mine: false, w: "w-40" },
  { mine: true, w: "w-28" },
  { mine: false, w: "w-52" },
  { mine: false, w: "w-24" },
  { mine: true, w: "w-44" },
  { mine: true, w: "w-32" },
  { mine: false, w: "w-36" },
] as const;

export function ChatThreadSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col" aria-busy="true" aria-label="Loading conversation">
      <div className="chat-surface flex-1 space-y-3 overflow-hidden p-4">
        {ROWS.map((r, i) => (
          <div key={i} className={cn("flex", r.mine ? "justify-end" : "justify-start")}>
            <Skeleton
              className={cn(
                "h-11 rounded-lg",
                r.w,
                r.mine ? "rounded-br-sm" : "rounded-bl-sm",
              )}
            />
          </div>
        ))}
      </div>
      <div className="border-border bg-background flex items-end gap-2 border-t p-3">
        <Skeleton className="h-11 flex-1 rounded-md" />
        <Skeleton className="size-11 shrink-0 rounded-md" />
      </div>
    </div>
  );
}

// The admin conversation inbox: a stack of name + preview rows.
export function ChatListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col" aria-busy="true" aria-label="Loading conversations">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-border/70 flex flex-col gap-2 border-b px-4 py-3.5">
          <Skeleton className="h-3.5 w-28 rounded" />
          <Skeleton className="h-3 w-40 rounded" />
        </div>
      ))}
    </div>
  );
}

// The at-a-glance bento strip above a thread.
export function ChatBentoSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-[4.75rem] rounded-lg" />
      ))}
    </div>
  );
}
