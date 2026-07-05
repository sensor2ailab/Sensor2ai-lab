import Link from "next/link";
import { ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { IconButton } from "@/components/ui/IconButton";
import { BibtexButton } from "@/components/publications/BibtexButton";
import { pubTypeLabel, pubUrl } from "@/lib/publication";
import type { Publication } from "@/lib/api-types";

interface Props {
  pub: Publication;
  isAdmin?: boolean;
  onEdit?: (pub: Publication) => void;
  onDelete?: (pub: Publication) => void;
}

export function PubItem({ pub, isAdmin, onEdit, onDelete }: Props) {
  const link = pubUrl(pub);
  return (
    <article className="flex flex-col gap-3 py-6">
      {pub.authors.length ? (
        <p className="text-foreground text-sm font-semibold">{pub.authors.join(", ")}</p>
      ) : null}

      <h3 className="text-h3 font-semibold">
        {link ? (
          <Link
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary inline-flex items-start gap-1 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]"
          >
            {pub.title}
            <ArrowUpRight className="mt-1 size-4 shrink-0" aria-hidden="true" />
          </Link>
        ) : (
          pub.title
        )}
      </h3>

      {pub.venue ? <p className="text-secondary text-sm">{pub.venue}</p> : null}

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="neutral">{pubTypeLabel(pub.entryType)}</Badge>
        {pub.doi ? <Badge tone="outline">DOI</Badge> : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <BibtexButton bibtex={pub.rawBibtex} />
        {isAdmin ? (
          <>
            <IconButton
              label="Edit publication"
              icon={Pencil}
              className="size-8"
              onClick={() => onEdit?.(pub)}
            />
            <IconButton
              label="Delete publication"
              icon={Trash2}
              variant="danger"
              className="size-8"
              onClick={() => onDelete?.(pub)}
            />
          </>
        ) : null}
      </div>
    </article>
  );
}
