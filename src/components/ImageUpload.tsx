"use client";

import { useState } from "react";

/** 어드민 이미지 업로드 → media 버킷 URL 을 숨은 input(name)에 채운다. URL 직접 입력도 가능. */
export function ImageUpload({ name, defaultValue, folder, label }: { name: string; defaultValue?: string | null; folder: string; label: string }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const r = await fetch("/api/admin/upload", { method: "POST", body: fd }).then((x) => x.json()).catch(() => null);
    if (r?.ok) setUrl(r.url);
    else setErr(r?.message ?? "업로드 실패");
    setBusy(false);
    e.target.value = "";
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`${name}-url`} className="text-[12px] font-bold text-muted">{label}</label>
      <div className="flex gap-3 items-start">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="w-20 h-20 object-contain rounded-md bg-[#0B0907] border border-line" />
        ) : (
          <div className="w-20 h-20 rounded-md bg-[#0B0907] border border-line" />
        )}
        <div className="flex-1 flex flex-col gap-2">
          <input
            id={`${name}-url`}
            name={name}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="/img/... 또는 https://..."
            className="w-full h-11 px-3 rounded-md bg-[#0B0907] border border-line text-fg text-[14px]"
          />
          <label className="inline-flex items-center min-h-10 px-3 rounded-md border border-line text-[13px] font-bold cursor-pointer self-start hover:border-accent2">
            {busy ? "올리는 중…" : "파일 올리기"}
            <input type="file" accept="image/*" onChange={onFile} className="hidden" />
          </label>
          {err && <span role="alert" className="text-[13px] text-accent">{err}</span>}
        </div>
      </div>
    </div>
  );
}
