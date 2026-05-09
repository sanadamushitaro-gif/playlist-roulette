import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Playlist, Report } from "@/types/database";

type LocalDatabase = {
  playlists: Playlist[];
  reports: Report[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const WRITABLE_DATA_DIR =
  process.env.VERCEL === "1"
    ? path.join("/tmp", "playlist-roulette")
    : DATA_DIR;
const DATA_FILE = path.join(WRITABLE_DATA_DIR, "local-db.json");

async function readDatabase(): Promise<LocalDatabase> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalDatabase>;

    return {
      playlists: Array.isArray(parsed.playlists) ? parsed.playlists : [],
      reports: Array.isArray(parsed.reports) ? parsed.reports : [],
    };
  } catch {
    return { playlists: [], reports: [] };
  }
}

async function writeDatabase(database: LocalDatabase) {
  await mkdir(WRITABLE_DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, `${JSON.stringify(database, null, 2)}\n`, "utf8");
}

export async function listVisiblePlaylists() {
  const database = await readDatabase();

  return database.playlists
    .filter((playlist) => !playlist.is_hidden)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 50);
}

export async function findPlaylistByPlaylistId(playlistId: string) {
  const database = await readDatabase();

  return (
    database.playlists.find((playlist) => playlist.playlist_id === playlistId) ??
    null
  );
}

export async function findPlaylistById(id: string) {
  const database = await readDatabase();

  return database.playlists.find((playlist) => playlist.id === id) ?? null;
}

export async function createPlaylist(input: {
  playlist_id: string;
  url: string;
  title: string | null;
  description: string | null;
  tags: string[];
}) {
  const database = await readDatabase();
  const existing = database.playlists.find(
    (playlist) => playlist.playlist_id === input.playlist_id,
  );

  if (existing) {
    return { playlist: null, duplicate: true };
  }

  const playlist: Playlist = {
    id: crypto.randomUUID(),
    playlist_id: input.playlist_id,
    url: input.url,
    title: input.title,
    description: input.description,
    tags: input.tags,
    created_at: new Date().toISOString(),
    is_hidden: false,
  };

  database.playlists.push(playlist);
  await writeDatabase(database);

  return { playlist, duplicate: false };
}

export async function getRandomPlaylist(excludeId?: string | null) {
  const database = await readDatabase();
  let candidates = database.playlists.filter((playlist) => !playlist.is_hidden);

  if (excludeId && candidates.length > 1) {
    candidates = candidates.filter((playlist) => playlist.id !== excludeId);
  }

  if (!candidates.length) {
    return null;
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
}

export async function createReport(input: {
  playlist_id: string;
  reason: string | null;
}) {
  const database = await readDatabase();
  const playlist = database.playlists.find(
    (item) => item.id === input.playlist_id,
  );

  if (!playlist) {
    return null;
  }

  const report: Report = {
    id: crypto.randomUUID(),
    playlist_id: input.playlist_id,
    reason: input.reason,
    created_at: new Date().toISOString(),
  };

  database.reports.push(report);
  await writeDatabase(database);

  return report;
}
