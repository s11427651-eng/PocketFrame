"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import exifr from "exifr";
import { store, useDB } from "@/lib/store";
import { newId, type Memory } from "@/lib/types";
import { coverSvg } from "@/lib/cover";
import { Icon } from "@/components/icons";

type QItem = {
  key: string;
  file: File;
  url: string;
  thumb: string;
  meta: {
    title: string;
    location_name: string;
    city: string;
    country: string;
    lat: number | null;
    lng: number | null;
    captured_at: string;
    tags: string;
    notes: string;
    is_highlight: boolean;
    project_id: string | null;
  };
  state: "new" | "ready" | "saving" | "done" | "error";
  error?: string;
  width: number;
  height: number;
  duration: number | null;
  device: string;
  gpsFound: boolean;
};

const LOCATIONS = [
  { place: "Jiufen Street", city: "Taipei", country: "Taiwan", lat: 25.1095, lng: 121.845 },
  { place: "Shibuya Crossing", city: "Tokyo", country: "Japan", lat: 35.6595, lng: 139.7005 },
  { place: "Gamla Stan", city: "Stockholm", country: "Sweden", lat: 59.3259, lng: 18.0711 },
  { place: "San Marco", city: "Venice", country: "Italy", lat: 45.4341, lng: 12.3387 },
  { place: "Jemaa el-Fnaa", city: "Marrakech", country: "Morocco", lat: 31.6258, lng: -7.9891 },
  { place: "Amalfi Coast", city: "Positano", country: "Italy", lat: 40.6283, lng: 14.4845 },
  { place: "Home Studio", city: "Taipei", country: "Taiwan", lat: 25.05, lng: 121.549 },
];

function downscale(img: HTMLImageElement | HTMLVideoElement, max = 360): Promise<string> {
  return new Promise((resolve) => {
    const media = img instanceof HTMLVideoElement ? { videoWidth: img.videoWidth, videoHeight: img.videoHeight } : { videoWidth: img.width, videoHeight: img.height };
    const scale = Math.min(1, max / Math.max(media.videoWidth, media.videoHeight));
    const w = Math.max(1, Math.round(media.videoWidth * scale));
    const h = Math.max(1, Math.round(media.videoHeight * scale));
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d")!;
    if (img instanceof HTMLVideoElement) ctx.drawImage(img, 0, 0, w, h);
    else ctx.drawImage(img, 0, 0, w, h);
    resolve(c.toDataURL("image/jpeg", 0.7));
  });
}

function imageThumb(img: HTMLImageElement): Promise<string> {
  return downscale(img);
}

function videoThumb(v: HTMLVideoElement): Promise<string> {
  return new Promise((resolve) => {
    v.currentTime = Math.min(1, (v.duration || 2) * 0.3);
    const on = () => downscale(v).then(resolve);
    v.addEventListener("seeked", on, { once: true });
  });
}

export default function UploadPage() {
  const db = useDB();
  const router = useRouter();
  const [items, setItems] = useState<QItem[]>([]);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function toLocal(d: Date): string {
    const off = d.getTimezoneOffset();
    return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
  }

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    const media = arr.filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/"));
    media.forEach(async (file) => {
      const url = URL.createObjectURL(file);
      const key = newId();
      const item: QItem = {
        key,
        file,
        url,
        thumb: coverSvg(file.name, "PREVIEW", 1),
        meta: {
          title: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
          location_name: "",
          city: "",
          country: "",
          lat: null,
          lng: null,
          captured_at: "",
          tags: "",
          notes: "",
          is_highlight: false,
          project_id: null,
        },
        state: "new",
        width: 0,
        height: 0,
        duration: null,
        device: "",
        gpsFound: false,
      };
      setItems((prev) => [...prev, item]);

      try {
        if (file.type.startsWith("image/")) {
          const img = new Image();
          img.onload = async () => {
            item.width = img.width;
            item.height = img.height;
            item.thumb = await imageThumb(img);
            setItems((prev) => prev.map((i) => (i.key === key ? item : i)));
          };
          img.src = url;
          const meta = await exifr.parse(file, { gps: true, tiff: true, exif: true });
          if (meta) {
            if (meta.latitude != null && meta.longitude != null) {
              item.meta.lat = meta.latitude;
              item.meta.lng = meta.longitude;
              item.gpsFound = true;
            }
            if (meta.CreateDate) item.meta.captured_at = toLocal(meta.CreateDate);
            if (meta.Make && meta.Model) item.device = `${meta.Make} ${meta.Model}`;
            setItems((prev) => prev.map((i) => (i.key === key ? item : i)));
          }
        } else {
          const v = document.createElement("video");
          v.preload = "metadata";
          v.src = url;
          v.onloadedmetadata = async () => {
            item.width = v.videoWidth;
            item.height = v.videoHeight;
            item.duration = v.duration;
            item.thumb = await videoThumb(v);
            if (v.seekable.length) {
              await new Promise((r) => (v.onseeked = r));
            }
            item.thumb = await downscale(v);
            setItems((prev) => prev.map((i) => (i.key === key ? item : i)));
          };
        }
      } catch {
        setItems((prev) =>
          prev.map((i) => (i.key === key ? { ...i, gpsFound: false } : i))
        );
      }
    });
  }, []);

  function applyExifLocation(key: string) {
    setItems((prev) =>
      prev.map((i) => {
        if (i.key !== key) return i;
        const loc = i.meta.lat != null && i.meta.lng != null ? reverseLookup(i.meta.lat, i.meta.lng) : null;
        return {
          ...i,
          meta: {
            ...i.meta,
            location_name: loc?.place || "Near this point",
            city: loc?.city || "",
            country: loc?.country || "",
          },
        };
      })
    );
  }

  function reverseLookup(lat: number, lng: number) {
    let best: (typeof LOCATIONS)[0] | null = null;
    let bestD = Infinity;
    for (const L of LOCATIONS) {
      const d = Math.hypot(lat - L.lat, lng - L.lng);
      if (d < bestD) {
        bestD = d;
        best = L;
      }
    }
    return bestD < 1.2 ? best : null;
  }

  function patch(key: string, m: Partial<QItem["meta"]>) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, meta: { ...i.meta, ...m } } : i)));
  }

  function remove(key: string) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function saveOne(item: QItem): Memory {
    const isVideo = item.file.type.startsWith("video/");
    const binary = item.url;
    const storeBinary = fileSizeOk(item.file.size);
    const memory: Memory = {
      id: newId(),
      title: item.meta.title || item.file.name,
      media_type: isVideo ? "video" : "image",
      original_filename: item.file.name,
      storage_key: `users/u1/originals/${new Date().toISOString().slice(0, 7)}/${item.key}`,
      media_url: storeBinary ? binary : item.thumb,
      thumbnail_key: "",
      thumbnail: item.thumb,
      mime_type: item.file.type || (isVideo ? "video/mp4" : "image/jpeg"),
      file_size: item.file.size,
      width: item.width,
      height: item.height,
      duration_seconds: item.duration && isFinite(item.duration) ? Math.round(item.duration) : null,
      captured_at: item.meta.captured_at
        ? new Date(item.meta.captured_at + "T12:00:00").toISOString()
        : new Date().toISOString(),
      uploaded_at: "",
      location_name: item.meta.location_name,
      city: item.meta.city,
      country: item.meta.country,
      latitude: item.meta.lat,
      longitude: item.meta.lng,
      notes: item.meta.notes,
      device_name: item.device || "",
      is_highlight: item.meta.is_highlight,
      highlight_caption: item.meta.is_highlight ? "A memory worth keeping." : "",
      tags: item.meta.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
      project_id: item.meta.project_id || null,
    };
    return store.addMemory(memory);
  }

  async function saveAll() {
    for (const item of items) {
      if (item.state !== "new") continue;
      setItems((prev) => prev.map((i) => (i.key === item.key ? { ...i, state: "saving" } : i)));
      try {
        await new Promise((r) => setTimeout(r, 300 + Math.random() * 400));
        saveOne(item);
        setItems((prev) => prev.map((i) => (i.key === item.key ? { ...i, state: "done" } : i)));
      } catch {
        setItems((prev) =>
          prev.map((i) =>
            i.key === item.key ? { ...i, state: "error", error: "Could not save. Free up storage." } : i
          )
        );
      }
    }
    setTimeout(() => router.push("/library"), 700);
  }

  const remaining = items.filter((i) => i.state === "new").length;
  const hasLocation = (i: QItem) => i.meta.location_name !== "" || i.meta.lat != null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 rise">
      <div>
        <h1 className="font-display text-2xl font-bold">Add memories</h1>
        <p className="text-slate-600 text-sm">
          Drop in photos and video. We&apos;ll ask where you took them.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-colors ${
          drag ? "border-brand-purple bg-brand-purple/5 scale-[1.01]" : "border-black/15 hover:border-brand-purple/60 bg-white/60"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-brand-purple to-brand-cyan text-white grid place-items-center shadow-lg">
          <Icon name="upload" className="w-6 h-6" />
        </div>
        <div className="mt-3 font-semibold">Drop photos & video here</div>
        <div className="text-sm text-slate-600 mt-1">or click to browse — any photos or video welcome</div>
      </div>

      {items.length > 0 && (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.key} className="card p-4">{renderItem(item)}</div>
            ))}
          </div>

          <div className={`flex items-center gap-3 rounded-2xl p-4 text-sm ${
            remaining > 0 ? "bg-amber-500/10 text-amber-900" : "bg-emerald-500/10 text-emerald-900"
          }`}>
            {remaining > 0 ? (
              <>
                <Icon name="places" className="w-5 h-5 shrink-0" />
                <span>
                  <strong>Where did you take {remaining === 1 ? "it" : "them"}?</strong> Fill a
                  location for each file below before saving.
                </span>
              </>
            ) : (
              <><Icon name="check" className="w-5 h-5 shrink-0" />All set — ready to save.</>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setItems([])}
              className="rounded-full px-5 py-3 text-sm font-medium text-slate-600 hover:bg-black/5"
            >
              Clear all
            </button>
            <button
              onClick={saveAll}
              disabled={items.some((i) => i.state === "saving")}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold bg-gradient-to-r from-brand-purple to-brand-blue text-white shadow-lg hover:-translate-y-px transition-all disabled:opacity-60"
            >
              <Icon name="upload" className="w-4 h-4" />
              {items.some((i) => i.state === "saving") ? "Saving…" : `Save ${items.length} memory${items.length > 1 ? "ies" : "y"}`}
            </button>
          </div>
        </>
      )}

      {items.length === 0 && (
        <div className="text-center text-sm text-slate-600 py-6">
          No files added yet. Select something to begin your next memory.
        </div>
      )}

      <datalist id="pf-locations">
        {LOCATIONS.map((l) => (
          <option key={l.place} value={`${l.place}, ${l.city}`} />
        ))}
      </datalist>
    </div>
  );

  function renderItem(item: QItem) {
    const isVideo = item.file.type.startsWith("video/");

    return (
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-44 shrink-0 aspect-video rounded-xl overflow-hidden bg-black relative">
          {isVideo ? (
            <video src={item.url} className="w-full h-full object-cover" muted playsInline />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.thumb} alt={item.file.name} className="w-full h-full object-cover" />
          )}
          {item.state === "done" && (
            <div className="absolute inset-0 bg-black/50 grid place-items-center text-white">
              <Icon name="check" className="w-8 h-8" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-start gap-2">
            <input
              value={item.meta.title}
              onChange={(e) => patch(item.key, { title: e.target.value })}
              className="flex-1 text-lg font-semibold rounded-xl border border-black/10 px-3 py-2 outline-none focus:ring-2 ring-brand-purple/40"
              placeholder="Title"
            />
            <button onClick={() => remove(item.key)} className="p-2 rounded-lg text-slate-600 hover:text-brand-pink hover:bg-black/5">
              <Icon name="trash" className="w-4 h-4" />
            </button>
          </div>

          {/* Where did you take it? */}
          <div className="rounded-xl bg-gradient-to-r from-brand-purple/10 to-brand-cyan/10 border border-brand-purple/15 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-brand-purple">
              <Icon name="places" className="w-4 h-4" />
              Where did you take it?
            </div>

            {item.gpsFound && !item.meta.location_name && (
              <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                <Icon name="check" className="w-4 h-4 text-emerald-500" />
                GPS found in this file.
                <button onClick={() => applyExifLocation(item.key)} className="text-brand-purple font-medium hover:underline">
                  Looks like this was taken near a known place — use it?
                </button>
              </div>
            )}

            <div className="mt-2 flex flex-wrap gap-2">
              <input
                list="pf-locations"
                value={item.meta.location_name}
                onChange={(e) => patch(item.key, { location_name: e.target.value })}
                className="flex-1 min-w-40 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 ring-brand-purple/40"
                placeholder="Place name, e.g. Shibuya Crossing"
              />
              {item.meta.lat != null && (
                <span className="text-xs text-slate-600 self-center">
                  ({item.meta.lat.toFixed(4)}, {item.meta.lng?.toFixed(4)})
                </span>
              )}
            </div>
            <input
              value={item.meta.city}
              onChange={(e) => patch(item.key, { city: e.target.value })}
              className="mt-2 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 ring-brand-purple/40"
              placeholder="City − optional"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-2">
            <input
              type="date"
              value={item.meta.captured_at}
              onChange={(e) => patch(item.key, { captured_at: e.target.value })}
              className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 ring-brand-purple/40"
            />
            <input
              value={item.meta.tags}
              onChange={(e) => patch(item.key, { tags: e.target.value })}
              className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 ring-brand-purple/40"
              placeholder="Tags, comma separated"
            />
          </div>
          <textarea
            value={item.meta.notes}
            onChange={(e) => patch(item.key, { notes: e.target.value })}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 ring-brand-purple/40 resize-none"
            rows={2}
            placeholder="Notes — what made this moment worth keeping?"
          />

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={item.meta.is_highlight}
                onChange={(e) => patch(item.key, { is_highlight: e.target.checked })}
                className="accent-brand-pink w-4 h-4"
              />
              <span className="flex items-center gap-1 text-brand-pink">
                <Icon name="star" className="w-4 h-4" /> Highlight
              </span>
            </label>

            <select
              value={item.meta.project_id || ""}
              onChange={(e) => patch(item.key, { project_id: e.target.value || null })}
              className="rounded-lg border border-black/10 px-2 py-2 text-sm outline-none bg-white"
            >
              <option value="">No project</option>
              {db.projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>

            {item.state === "new" && !hasLocation(item) && (
              <span className="text-xs text-amber-600 flex items-center gap-1">
                <Icon name="places" className="w-3.5 h-3.5" /> Location needed
              </span>
            )}
            {item.state === "error" && <span className="text-xs text-brand-pink">{item.error}</span>}
          </div>
        </div>
      </div>
    );
  }
}

function fileSizeOk(bytes: number) {
  return bytes <= 1.5 * 1024 * 1024;
}
