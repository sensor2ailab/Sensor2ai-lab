-- Custom curator tags on publications: a JSONB string array, GIN-indexed for
-- containment queries, and folded into the full-text search vector so tag terms
-- also match the search box.

ALTER TABLE "publications" ADD COLUMN "tags" JSONB NOT NULL DEFAULT '[]';

CREATE INDEX IF NOT EXISTS publications_tags_gin ON publications USING GIN (tags jsonb_path_ops);

CREATE OR REPLACE FUNCTION publications_search_tsv_update() RETURNS trigger AS $$
BEGIN
  NEW.search_tsv :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(
      (SELECT string_agg(value, ' ') FROM jsonb_array_elements_text(NEW.authors)), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.venue, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(
      (SELECT string_agg(value, ' ') FROM jsonb_array_elements_text(NEW.tags)), '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS publications_search_tsv_trg ON publications;
CREATE TRIGGER publications_search_tsv_trg
  BEFORE INSERT OR UPDATE OF title, authors, venue, tags ON publications
  FOR EACH ROW EXECUTE FUNCTION publications_search_tsv_update();

-- Rebuild the search vector for existing rows (fires the BEFORE UPDATE trigger).
UPDATE publications SET title = title;
