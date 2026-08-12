"use client";

import { useMemo, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useDB } from "@/lib/store";
import { Icon } from "@/components/icons";
import { fmtDate } from "@/lib/format";
import type { Memory } from "@/lib/types";

function pinIcon(count: number) {
  return L.divIcon({
    className: "",
    html: `<div class="pf-pin">${count}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function Bounder({ memories }: { memories: Memory[] }) {
  const map = useMap();
  useEffect(() => {
    const pts = memories.map((m) => [m.latitude, m.longitude]).filter((p): p is number[] => p[0] != null && p[1] != null) as [number, number][];
    if (pts.length === 0) {
      map.setView([25.03, 121.56], 4);
      return;
    }
    const b = L.latLngBounds(pts);
    map.fitBounds(b, { padding: [40, 40] });
  }, [memories, map]);
  return null;
}

export default function PlacesPage() {
  const db = useDB();
  const [selectedLoc, setSelectedLoc] = useState<string | null>(null);

  const groups = useMemo(() => {
    const map = new Map<string, Memory[]>();
    db.memories.forEach((m) => {
      if (m.latitude == null || m.longitude == null) return;
      const key = m.city || m.location_name || "Unplaced";
      const arr = map.get(key) || [];
      arr.push(m);
      map.set(key, arr);
    });
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [db.memories]);

  const positioned = groups.flatMap(([, mems]) => mems);
  const total = db.memories.length;
  const placedCount = positioned.length;

  return (
    <div className="space-y-5 rise">
      <div>
        <h1 className="font-display text-2xl font-bold">Places</h1>
        <p className="text-slate-600 text-sm">
          {placedCount} of {total} memories pinned to {groups.length} location{groups.length === 1 ? "" : "s"}. Where did you film?
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
        <div className="card overflow-hidden h-[420px] lg:h-[560px]">
          <MapContainer center={[25.03, 121.56]} zoom={4} className="w-full h-full z-0">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Bounder memories={positioned} />
            {groups.map(([loc, mems]) => {
              const first = mems[0];
              return (
                <Marker key={loc} position={[first.latitude!, first.longitude!]} icon={pinIcon(mems.length)}>
                  <Popup>
                    <strong>{loc}</strong> — {mems.length} {mems.length === 1 ? "memory" : "memories"}
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4">
              <div className="text-2xl font-display font-bold">{groups.length}</div>
              <div className="text-xs text-slate-600">Places filmed</div>
            </div>
            <div className="card p-4">
              <div className="text-2xl font-display font-bold">{placedCount}</div>
              <div className="text-xs text-slate-600">Pinned memories</div>
            </div>
          </div>

          <h2 className="font-display font-bold text-lg pt-2">Places I filmed most</h2>
          <div className="space-y-2">
            {groups.slice(0, 10).map(([loc, mems], idx) => {
              const cover = mems[0];
              return (
                <button
                  key={loc}
                  onClick={() => setSelectedLoc(selectedLoc === loc ? null : loc)}
                  className={`w-full card p-3 flex items-center gap-3 text-left hover:shadow-md transition-shadow ${selectedLoc === loc ? "ring-2 ring-brand-purple/50" : ""}`}
                >
                  <span className="font-display font-bold text-slate-300 text-xl w-6">{idx + 1}</span>
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cover.thumbnail} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{loc}</div>
                    <div className="text-xs text-slate-600">{mems.length} {mems.length === 1 ? "memory" : "memories"}</div>
                  </div>
                  <Icon name="chevronR" className="w-4 h-4 text-slate-300" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selectedLoc && (
        <Drawer
          title={selectedLoc}
          memories={(groups.find(([l]) => l === selectedLoc)?.[1] || []).sort((a, b) => b.captured_at.localeCompare(a.captured_at))}
          onClose={() => setSelectedLoc(null)}
        />
      )}
    </div>
  );
}

function Drawer({ title, memories, onClose }: { title: string; memories: Memory[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 fadein" onClick={onClose}>
      <div className="absolute right-0 inset-y-0 w-full max-w-md bg-paper shadow-2xl p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-600 hover:bg-black/5"><Icon name="close" /></button>
        </div>
        <p className="text-xs text-slate-600 mb-4">{memories.length} memories</p>
        <div className="space-y-3">
          {memories.map((m) => (
            <div key={m.id} className="card p-3 flex gap-3">
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.thumbnail} alt={m.title} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold line-clamp-1">{m.title}</div>
                <div className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                  <Icon name="clock" className="w-3 h-3" />{fmtDate(m.captured_at)}
                </div>
                {m.is_highlight && (
                  <span className="text-xs text-brand-pink flex items-center gap-1 mt-1"><Icon name="star" className="w-3 h-3 fill-current" />Highlight</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
