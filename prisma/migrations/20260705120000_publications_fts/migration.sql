-- Full-text search for publications: a weighted tsvector maintained by a trigger,
-- plus GIN indexes on the tsvector and the authors JSONB.

CREATE OR REPLACE FUNCTION publications_search_tsv_update() RETURNS trigger AS $$
BEGIN
  NEW.search_tsv :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(
      (SELECT string_agg(value, ' ') FROM jsonb_array_elements_text(NEW.authors)), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.venue, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS publications_search_tsv_trg ON publications;
CREATE TRIGGER publications_search_tsv_trg
  BEFORE INSERT OR UPDATE OF title, authors, venue ON publications
  FOR EACH ROW EXECUTE FUNCTION publications_search_tsv_update();

CREATE INDEX IF NOT EXISTS publications_search_tsv_idx ON publications USING GIN (search_tsv);
CREATE INDEX IF NOT EXISTS publications_authors_gin ON publications USING GIN (authors jsonb_path_ops);

-- Backfill any existing rows (fires the BEFORE UPDATE trigger).
UPDATE publications SET title = title;
