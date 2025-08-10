CREATE TABLE IF NOT EXISTS nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label varchar(256) NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "from" uuid NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  "to" uuid NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  type varchar(128) NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS node_chunks (
  node_id uuid NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  chunk_id uuid NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_edges_from ON edges("from");
CREATE INDEX IF NOT EXISTS idx_edges_to ON edges("to");
