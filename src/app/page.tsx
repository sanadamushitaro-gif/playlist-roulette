"use client";

import Link from "next/link";
import { AlertTriangle, Dice5, ExternalLink, Loader2, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { BannerAd } from "@/components/banner-ad";
import type { Playlist } from "@/types/database";

type ApiState = "idle" | "loading" | "ready" | "empty" | "error";

async function fetchRandomPlaylist(excludeId?: string) {
  const query = excludeId ? `?exclude=${encodeURIComponent(excludeId)}` : "";
  const response = await fetch(`/api/random-playlist${query}`, {
    cache: "no-store",
  });
  const data = response.status === 404 ? {} : await response.json();

  if (response.status === 404) {
    return { playlist: null, error: null };
  }

  if (!response.ok) {
    return {
      playlist: null,
      error: data.error ?? "プレイリストの取得に失敗しました。",
    };
  }

  return { playlist: data.playlist as Playlist, error: null };
}

export default function Home() {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [state, setState] = useState<ApiState>("idle");
  const [message, setMessage] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reportState, setReportState] = useState<"idle" | "sending" | "sent">(
    "idle",
  );

  const applyPlaylistResult = (nextPlaylist: Playlist | null, error: string | null) => {
    if (error) {
      setMessage(error);
      setState("error");
      return;
    }

    if (!nextPlaylist) {
      setPlaylist(null);
      setState("empty");
      return;
    }

    setPlaylist(nextPlaylist);
    setState("ready");
  };

  const loadPlaylist = async () => {
    setState("loading");
    setMessage("");
    setReportState("idle");
    setReportReason("");

    const result = await fetchRandomPlaylist(playlist?.id);
    applyPlaylistResult(result.playlist, result.error);
  };

  useEffect(() => {
    let ignore = false;

    void fetchRandomPlaylist().then((result) => {
      if (!ignore) {
        applyPlaylistResult(result.playlist, result.error);
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

  const reportPlaylist = async () => {
    if (!playlist || reportState !== "idle") {
      return;
    }

    setReportState("sending");
    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playlist_uuid: playlist.id,
        reason: reportReason,
      }),
    });

    setReportState(response.ok ? "sent" : "idle");
  };

  return (
    <main className="min-h-screen bg-[#f7f5ee] text-zinc-950">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-3 border-b-2 border-zinc-950 pb-4">
          <Link href="/" className="font-mono text-lg font-black tracking-normal">
            Playlist Roulette
          </Link>
          <Link
            href="/submit"
            className="inline-flex min-h-11 items-center gap-2 border-2 border-zinc-950 bg-[#fffcf0] px-4 py-2 text-sm font-bold shadow-[4px_4px_0_#18181b] transition-transform hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <Send size={16} aria-hidden />
            登録する
          </Link>
        </header>

        <BannerAd className="mt-5" />

        <div className="grid flex-1 items-center gap-6 py-8 lg:grid-cols-[1fr_360px]">
          <section className="min-w-0">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-xs font-bold uppercase text-[#1864ab]">
                  Unknown playlist transmission
                </p>
                <h1 className="mt-2 max-w-3xl text-3xl font-black leading-tight tracking-normal sm:text-5xl">
                  誰かの再生リストに、偶然つながる。
                </h1>
              </div>
              <button
                type="button"
                onClick={loadPlaylist}
                disabled={state === "loading"}
                className="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-zinc-950 bg-[#e8ff5a] px-5 py-3 text-sm font-black shadow-[4px_4px_0_#18181b] transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70 active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                {state === "loading" ? (
                  <Loader2 size={18} className="animate-spin" aria-hidden />
                ) : (
                  <Dice5 size={18} aria-hidden />
                )}
                次のプレイリスト
              </button>
            </div>

            <div className="overflow-hidden border-2 border-zinc-950 bg-black shadow-[6px_6px_0_#18181b]">
              <div className="flex items-center gap-2 border-b-2 border-zinc-950 bg-[#ff5b4f] px-3 py-2">
                <span className="h-3 w-3 rounded-full border-2 border-zinc-950 bg-[#f7f5ee]" />
                <span className="h-3 w-3 rounded-full border-2 border-zinc-950 bg-[#e8ff5a]" />
                <span className="h-3 w-3 rounded-full border-2 border-zinc-950 bg-[#67e8f9]" />
              </div>

              <div className="aspect-video w-full bg-zinc-950">
                {playlist && state === "ready" ? (
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(
                      playlist.playlist_id,
                    )}`}
                    title={playlist.title ?? "YouTube playlist"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-5 text-center font-mono text-sm text-zinc-300">
                    {state === "loading" && "ランダムな扉を開いています..."}
                    {state === "empty" &&
                      "まだ登録されたプレイリストがありません。"}
                    {state === "error" && message}
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="border-2 border-zinc-950 bg-[#fffcf0] p-5 shadow-[6px_6px_0_#18181b]">
            {playlist && state === "ready" ? (
              <div className="space-y-5">
                <div>
                  <p className="font-mono text-xs font-bold uppercase text-[#c2255c]">
                    Now playing
                  </p>
                  <h2 className="mt-2 text-2xl font-black leading-tight tracking-normal">
                    {playlist.title || "無題のプレイリスト"}
                  </h2>
                  {playlist.description ? (
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-700">
                      {playlist.description}
                    </p>
                  ) : (
                    <p className="mt-3 text-sm leading-7 text-zinc-500">
                      説明はありません。音だけで自己紹介するタイプです。
                    </p>
                  )}
                </div>

                {playlist.tags?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {playlist.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-zinc-950 bg-[#67e8f9] px-2 py-1 font-mono text-xs font-bold"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                <a
                  href={playlist.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center gap-2 border-b-2 border-zinc-950 text-sm font-bold"
                >
                  YouTubeで開く
                  <ExternalLink size={15} aria-hidden />
                </a>

                <div className="border-t-2 border-dashed border-zinc-300 pt-4">
                  <label
                    htmlFor="reason"
                    className="text-xs font-bold text-zinc-600"
                  >
                    通報理由 任意
                  </label>
                  <textarea
                    id="reason"
                    value={reportReason}
                    onChange={(event) => setReportReason(event.target.value)}
                    maxLength={200}
                    rows={3}
                    className="mt-2 w-full resize-none border-2 border-zinc-950 bg-white px-3 py-2 text-sm outline-none focus:bg-[#f1fcff]"
                    placeholder="不適切、リンク切れなど"
                  />
                  <button
                    type="button"
                    onClick={reportPlaylist}
                    disabled={reportState !== "idle"}
                    className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 border-2 border-zinc-950 bg-white px-4 py-2 text-sm font-black transition-colors hover:bg-[#ffe3e3] disabled:opacity-70"
                  >
                    <AlertTriangle size={16} aria-hidden />
                    {reportState === "sent" ? "通報しました" : "通報する"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="font-mono text-xs font-bold uppercase text-[#1864ab]">
                  Waiting for signal
                </p>
                <h2 className="text-2xl font-black tracking-normal">
                  まだ何も流れていません。
                </h2>
                <p className="text-sm leading-7 text-zinc-700">
                  登録された再生リストからランダムに1件表示します。まずは誰かのURLを登録してみてください。
                </p>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
