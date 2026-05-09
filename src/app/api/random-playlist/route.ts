import { NextResponse } from "next/server";
import { getRandomPlaylist } from "@/lib/local-store";

function isUuid(value: string | null) {
  return Boolean(
    value?.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    ),
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const exclude = searchParams.get("exclude");
    const validExclude = isUuid(exclude) ? exclude : null;
    const playlist = await getRandomPlaylist(validExclude);

    if (!playlist) {
      return NextResponse.json({ playlist: null }, { status: 404 });
    }

    return NextResponse.json({ playlist });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    );
  }
}
