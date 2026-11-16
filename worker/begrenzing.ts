// Begrenzing per bezoeker in D1, gedeeld door de hoofd-Worker (stemmen, ideeën) en de aanvragen van de Bijbelreis
// (worker/aanvraag.ts). De tabel rate_limits staat in migrations/0001_init.sql.

/** Vast-venster rate limit in D1. Geeft true terug als het verzoek mag. */
export async function rateLimit(db: D1Database, bucket: string, visitor: string, limit: number, windowSeconds: number, now: number): Promise<boolean> {
  const windowStart = Math.floor(now / windowSeconds) * windowSeconds;
  const key = `${bucket}:${visitor}:${windowStart}`;
  const row = await db
    .prepare(
      "INSERT INTO rate_limits (key, count, window_start) VALUES (?1, 1, ?2) ON CONFLICT(key) DO UPDATE SET count = count + 1 RETURNING count",
    )
    .bind(key, windowStart)
    .first<{ count: number }>();
  return (row?.count ?? 1) <= limit;
}

/** Ruimt verlopen tellers op (ouder dan twee dagen). */
export async function ruimBegrenzingOp(db: D1Database, now: number): Promise<void> {
  await db.prepare("DELETE FROM rate_limits WHERE window_start < ?1").bind(now - 2 * 86400).run();
}
