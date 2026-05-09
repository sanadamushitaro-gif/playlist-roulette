import { NextResponse } from "next/server";
import {
  createPlaylist,
  findPlaylistByPlaylistId,
  listVisiblePlaylists,
} from "@/lib/local-store";
import { normalizePlaylistPayload } from "@/lib/playlist-validation";

export async function GET() {
  try {
    const playlists = await listVisiblePlaylists();

    return NextResponse.json({ playlists });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "登録内容を読み取れませんでした。" },
      { status: 400 },
    );
  }

  try {
    const result = normalizePlaylistPayload(body);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const existing = await findPlaylistByPlaylistId(result.playlist.playlist_id);

    if (existing) {
      return NextResponse.json(
        { error: "この再生リストはすでに登録されています。" },
        { status: 409 },
      );
    }

    const { playlist, duplicate } = await createPlaylist(result.playlist);

    if (duplicate || !playlist) {
      return NextResponse.json(
        { error: "この再生リストはすでに登録されています。" },
        { status: 409 },
      );
    }

    return NextResponse.json({ playlist }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    );
  }
}
