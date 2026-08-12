const PALETTES: [string, string][] = [
  ["#7C3AED", "#06B6D4"],
  ["#2563EB", "#EC4899"],
  ["#EC4899", "#FB923C"],
  ["#FB923C", "#A3E635"],
  ["#06B6D4", "#2563EB"],
  ["#0F172A", "#7C3AED"],
  ["#EC4899", "#2563EB"],
  ["#A3E635", "#06B6D4"],
];

export function coverSvg(title: string, label: string, seed: number): string {
  const [a, b] = PALETTES[seed % PALETTES.length];
  const strokes = Array.from({ length: 3 }, (_, i) => {
    const x = ((seed * 37 + i * 27) % 100);
    const y = ((seed * 53 + i * 41) % 100);
    return `<circle cx="${x}%" cy="${y}%" r="${18 + i * 9}%" fill="rgba(255,255,255,0.08)"/>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/>${strokes}<text x="40" y="540" font-family="Space Grotesk,sans-serif" font-size="34" fill="rgba(255,255,255,0.9)" font-weight="700">${escapeXml(label).toUpperCase()}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!
  );
}
