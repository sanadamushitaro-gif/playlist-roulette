import { NextResponse } from "next/server";
import { LIMITS, normalizeOptionalText } from "@/lib/playlist-validation";
import { createReport, findPlaylistById } from "@/lib/local-store";

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "通報内容を読み取れませんでした。" },
      { status: 400 },
    );
  }

  try {
    const playlistUuid = body.playlist_uuid ?? body.playlist_id;

    if (!isUuid(playlistUuid)) {
      return NextResponse.json(
        { error: "通報対象のプレイリストが見つかりません。" },
        { status: 400 },
      );
    }

    const playlistId = playlistUuid;
    const playlist = await findPlaylistById(playlistId);

    if (!playlist) {
      return NextResponse.json(
        { error: "通報対象のプレイリストが見つかりません。" },
        { status: 404 },
      );
    }

    const report = await createReport({
      playlist_id: playlistId,
      reason: normalizeOptionalText(body.reason, LIMITS.reason),
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    );
  }
}
