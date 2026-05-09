const MAX_PLAYLIST_ID_LENGTH = 128;

export function extractPlaylistIdFromUrl(value: string): string | null {
  const rawUrl = value.trim();

  if (!rawUrl) {
    return null;
  }

  try {
    const url = new URL(rawUrl);
    const hostname = url.hostname.replace(/^www\./, "");
    const isYoutubeHost =
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "music.youtube.com" ||
      hostname === "youtu.be";

    if (!isYoutubeHost) {
      return null;
    }

    const playlistId = url.searchParams.get("list")?.trim();

    if (!playlistId || playlistId.length > MAX_PLAYLIST_ID_LENGTH) {
      return null;
    }

    return playlistId;
  } catch {
    return null;
  }
}
