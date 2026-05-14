/**
 * Últimos vídeos do canal via feed Atom público (sem API key).
 * Requer `channelId` no formato UC… (YouTube → Sobre → ID do canal).
 */

const ATOM_VIDEO_ID_RE = /videoId>([a-zA-Z0-9_-]{11})</g;

export async function fetchYoutubeVideoIdsFromChannelRss(
  channelId: string,
  limit = 8,
): Promise<string[]> {
  const id = channelId.trim();
  if (!id.startsWith("UC") || id.length < 10) return [];

  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(id)}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/atom+xml,application/xml,text/xml;q=0.9,*/*;q=0.8" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const ids: string[] = [];
    const seen = new Set<string>();
    let m: RegExpExecArray | null;
    const re = new RegExp(ATOM_VIDEO_ID_RE.source, "g");
    while ((m = re.exec(xml)) !== null) {
      const vid = m[1];
      if (!vid || seen.has(vid)) continue;
      seen.add(vid);
      ids.push(vid);
      if (ids.length >= limit) break;
    }
    return ids;
  } catch {
    return [];
  }
}

export function mergeYoutubeVideoIds(
  rssIds: readonly string[],
  fallback: readonly string[],
  limit: number,
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of [...rssIds, ...fallback]) {
    const t = raw.trim();
    if (t.length !== 11 || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length >= limit) break;
  }
  return out;
}
