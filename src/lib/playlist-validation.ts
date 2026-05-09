import { extractPlaylistIdFromUrl } from "@/lib/youtube";

export const LIMITS = {
  title: 80,
  description: 300,
  tag: 20,
  tags: 5,
  reason: 200,
};

export function normalizeOptionalText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, maxLength);
}

export function normalizeTags(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();

  return value
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim().replace(/^#/, ""))
    .filter(Boolean)
    .map((tag) => tag.slice(0, LIMITS.tag))
    .filter((tag) => {
      const key = tag.toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .slice(0, LIMITS.tags);
}

export function normalizePlaylistPayload(body: unknown) {
  if (!body || typeof body !== "object") {
    return { error: "入力内容を確認してください。" };
  }

  const payload = body as Record<string, unknown>;

  if (typeof payload.url !== "string") {
    return { error: "YouTube再生リストURLを入力してください。" };
  }

  const playlistId = extractPlaylistIdFromUrl(payload.url);

  if (!playlistId) {
    return { error: "URLからlistパラメータを取得できませんでした。" };
  }

  return {
    playlist: {
      playlist_id: playlistId,
      url: payload.url.trim(),
      title: normalizeOptionalText(payload.title, LIMITS.title),
      description: normalizeOptionalText(
        payload.description,
        LIMITS.description,
      ),
      tags: normalizeTags(payload.tags),
    },
  };
}
