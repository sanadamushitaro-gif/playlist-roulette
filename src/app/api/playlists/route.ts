import { NextResponse } from "next/server";
import { normalizePlaylistPayload } from "@/lib/playlist-validation";
import { createServerSupabaseClient } from "@/lib/supabase";

const PLAYLIST_COLUMNS =
  "id, playlist_id, url, title, description, tags, created_at, is_hidden";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("playlists")
      .select(PLAYLIST_COLUMNS)
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ playlists: data ?? [] });
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

    const supabase = createServerSupabaseClient();
    const { data: existing, error: lookupError } = await supabase
      .from("playlists")
      .select("id")
      .eq("playlist_id", result.playlist.playlist_id)
      .maybeSingle();

    if (lookupError) {
      return NextResponse.json({ error: lookupError.message }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json(
        { error: "この再生リストはすでに登録されています。" },
        { status: 409 },
      );
    }

    const { data, error } = await supabase
      .from("playlists")
      .insert(result.playlist)
      .select(PLAYLIST_COLUMNS)
      .single();

    if (error) {
      const status = error.code === "23505" ? 409 : 500;

      return NextResponse.json(
        {
          error:
            error.code === "23505"
              ? "この再生リストはすでに登録されています。"
              : error.message,
        },
        { status },
      );
    }

    return NextResponse.json({ playlist: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    );
  }
}
