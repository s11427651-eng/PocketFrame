"use client";

import Link from "next/link";
import type { Memory } from "@/lib/types";
import { Icon } from "./icons";
import { fmtDuration } from "@/lib/format";

export function MemoryCard({ memory, aspect = "aspect-[4/3]" }: { memory: Memory; aspect?: string }) {
  const isVideo = memory.media_type === "video";
  return (
    <Link
      href={`/library?m=${memory.id}`}
      className={`group relative rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl hover:-translate-y-px transition-all ${aspect}`}
    >
      {isVideo ? (
        <video
          src={memory.media_url}
          poster={memory.thumbnail}
          className="w-full h-full object-cover"
          muted
          playsInline
          onMouseEnter={(e) => {
            try {
              (e.currentTarget as HTMLVideoElement).play();
            } catch {
              /* ignore */
            }
          }}
          onMouseLeave={(e) => (e.currentTarget as HTMLVideoElement).pause()}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={memory.thumbnail} alt={memory.title} className="w-full h-full object-cover" loading="lazy" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />

      {isVideo && memory.duration_seconds != null && (
        <span className="absolute top-2 right-2 flex items-center gap-1 text-[11px] font-semibold bg-black/60 text-white rounded-full px-2 py-0.5">
          <Icon name="video" className="w-3 h-3" />
          {fmtDuration(memory.duration_seconds)}
        </span>
      )}

      {memory.is_highlight && (
        <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-brand-pink text-white grid place-items-center shadow">
          <Icon name="star" className="w-3.5 h-3.5 fill-current" />
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-3 text-white">
        <div className="text-sm font-semibold leading-tight line-clamp-1">{memory.title}</div>
        <div className="flex items-center gap-1 text-xs text-white/70">
          <Icon name="places" className="w-3 h-3" />
          <span className="line-clamp-1">
            {memory.city || memory.location_name || "Unplaced"}
          </span>
        </div>
      </div>
    </Link>
  );
}
