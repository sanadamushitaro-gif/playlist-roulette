"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { FormEvent, useState } from "react";

type SubmitState = "idle" | "sending" | "success" | "error";

export default function SubmitPage() {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState("sending");
    setMessage("");

    const response = await fetch("/api/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        title,
        description,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      setState("error");
      setMessage(data.error ?? "登録に失敗しました。");
      return;
    }

    setState("success");
    setMessage("登録しました。誰かのランダムに混ざりました。");
    setUrl("");
    setTitle("");
    setDescription("");
    setTags("");
  };

  return (
    <main className="min-h-screen bg-[#f7f5ee] px-4 py-5 text-zinc-950 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-3xl flex-col">
        <header className="flex items-center justify-between gap-3 border-b-2 border-zinc-950 pb-4">
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-2 font-mono text-sm font-black"
          >
            <ArrowLeft size={18} aria-hidden />
            戻る
          </Link>
          <p className="font-mono text-xs font-bold uppercase text-[#1864ab]">
            Submit a playlist
          </p>
        </header>

        <section className="grid flex-1 content-center gap-6 py-8">
          <div>
            <h1 className="text-3xl font-black leading-tight tracking-normal sm:text-5xl">
              誰かに届いてほしい再生リストを登録する。
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-700 sm:text-base">
              YouTubeの再生リストURLから
              <span className="font-mono font-bold"> list </span>
              パラメータだけを保存します。タイトル、説明、タグは任意です。
            </p>
          </div>

          <form
            onSubmit={submit}
            className="space-y-5 border-2 border-zinc-950 bg-[#fffcf0] p-5 shadow-[6px_6px_0_#18181b] sm:p-6"
          >
            <label className="block">
              <span className="text-sm font-black">YouTube再生リストURL</span>
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                required
                inputMode="url"
                placeholder="https://www.youtube.com/playlist?list=PLxxxx"
                className="mt-2 min-h-12 w-full border-2 border-zinc-950 bg-white px-3 py-2 text-base outline-none focus:bg-[#f1fcff]"
              />
            </label>

            <label className="block">
              <span className="text-sm font-black">タイトル 任意</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={80}
                placeholder="深夜に聴くやつ"
                className="mt-2 min-h-12 w-full border-2 border-zinc-950 bg-white px-3 py-2 text-base outline-none focus:bg-[#f1fcff]"
              />
            </label>

            <label className="block">
              <span className="text-sm font-black">説明 任意</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={300}
                rows={4}
                placeholder="知らない人に届いてほしい"
                className="mt-2 w-full resize-none border-2 border-zinc-950 bg-white px-3 py-2 text-base outline-none focus:bg-[#f1fcff]"
              />
            </label>

            <label className="block">
              <span className="text-sm font-black">タグ 任意</span>
              <input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="深夜, 平成, internet"
                className="mt-2 min-h-12 w-full border-2 border-zinc-950 bg-white px-3 py-2 text-base outline-none focus:bg-[#f1fcff]"
              />
              <span className="mt-2 block text-xs font-bold text-zinc-500">
                カンマ区切り、最大5個まで保存します。
              </span>
            </label>

            {message ? (
              <p
                className={`border-2 px-3 py-2 text-sm font-bold ${
                  state === "success"
                    ? "border-[#2b8a3e] bg-[#d3f9d8] text-[#1b5e20]"
                    : "border-[#c92a2a] bg-[#ffe3e3] text-[#8a1c1c]"
                }`}
              >
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={state === "sending"}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 border-2 border-zinc-950 bg-[#e8ff5a] px-5 py-3 text-sm font-black shadow-[4px_4px_0_#18181b] transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70 active:translate-x-1 active:translate-y-1 active:shadow-none sm:w-auto"
            >
              {state === "sending" ? (
                <Loader2 size={18} className="animate-spin" aria-hidden />
              ) : (
                <Send size={18} aria-hidden />
              )}
              登録する
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
