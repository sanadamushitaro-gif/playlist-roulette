import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

const PLAYLIST_COLUMNS =
  "id, playlist_id, url, title, description, tags, created_at, is_hidden";

function isUuid(value: string | null) {
  return Boolean(
    value?.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    ),
  );
}

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const exclude = searchParams.get("exclude");
    const validExclude = isUuid(exclude) ? exclude : null;

    const pickRandom = async (excludeId: string | null) => {
      let countQuery = supabase
        .from("playlists")
        .select("id", { count: "exact", head: true })
        .eq("is_hidden", false);

      if (excludeId) {
        countQuery = countQuery.neq("id", excludeId);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        return { playlist: null, error: countError };
      }

      if (!count) {
        return { playlist: null, error: null };
      }

      const offset = Math.floor(Math.random() * count);
      let playlistQuery = supabase
        .from("playlists")
        .select(PLAYLIST_COLUMNS)
        .eq("is_hidden", false)
        .range(offset, offset)
        .limit(1);

      if (excludeId) {
        playlistQuery = playlistQuery.neq("id", excludeId);
      }

      const { data, error } = await playlistQuery;

      if (error) {
        return { playlist: null, error };
      }

      return { playlist: data?.[0] ?? null, error: null };
    };

    let result = await pickRandom(validExclude);

    if (!result.playlist && validExclude && !result.error) {
      result = await pickRandom(null);
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    if (!result.playlist) {
      return NextResponse.json({ playlist: null }, { status: 404 });
    }

    return NextResponse.json({ playlist: result.playlist });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    );
  }
}
