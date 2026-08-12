const PATHS: Record<string, string> = {
  home: "M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5",
  library: "M4 5h16v14H4z M4 9h16 M7 9v10",
  highlight: "M12 3l2.7 5.7 6.3.8-4.6 4.4 1.2 6.1L12 17l-5.6 3 1.2-6.1L3 9.5l6.3-.8L12 3z",
  places: "M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z M12 12.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  inspiration: "M9 3h6v4a3 3 0 0 1-3 3 3 3 0 0 1-3-3z M12 10v3 M10 13h4 M12 16v3 M9 19h6",
  projects: "M4 4h16v16H4z M8 4v16",
  about: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 11v5 M12 8h.01",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-5l-.3 3a7 7 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5A7 7 0 0 0 5 12a7 7 0 0 0 .1 1l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 1.7 1l.3 3h5l.3-3a7 7 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5a7 7 0 0 0 .1-1z",
  upload: "M12 16V4 M8 8l4-4 4 4 M4 20h16",
  plus: "M12 5v14 M5 12h14",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M20 20l-4-4",
  close: "M6 6l12 12 M18 6L6 18",
  star: "M12 3l2.7 5.7 6.3.8-4.6 4.4 1.2 6.1L12 17l-5.6 3 1.2-6.1L3 9.5l6.3-.8L12 3z",
  starFill: "M12 3l2.7 5.7 6.3.8-4.6 4.4 1.2 6.1L12 17l-5.6 3 1.2-6.1L3 9.5l6.3-.8L12 3z",
  play: "M8 5v14l11-7z",
  trash: "M4 7h16 M9 7V5h6v2 M6 7l1 14h10l1-14 M10 11v6 M14 11v6",
  edit: "M4 20h4L20 8a2 2 0 0 0-3-3L5 17z M13 6l3 3",
  download: "M12 3v12 M8 11l4 4 4-4 M4 21h16",
  map: "M9 3 4 5v16l5-2 6 2 5-2V3l-5 2-6-2z M9 3v16 M15 5v16",
  logout: "M15 12H4 M10 7l-5 5 5 5 M14 4h6v16h-6",
  chevronL: "M15 6l-6 6 6 6",
  chevronR: "M9 6l6 6-6 6",
  menu: "M4 7h16 M4 12h16 M4 17h16",
  check: "M5 13l4 4L19 7",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7v5l3 3",
  dice: "M5 5h14v14H5z M8.5 8.5h.01 M15.5 8.5h.01 M12 12h.01 M9 15.5h.01 M15 15.5h.01",
  camera: "M4 8h3l2-3h6l2 3h3v12H4z M12 11a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  video: "M4 6h12v12H4z M16 9l5-3v12l-5-3",
  image: "M4 5h16v14H4z M4 15l4-4 4 4 3-3 5 5",
  grid: "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z",
  layers: "M12 3 3 8l9 5 9-5-9-5z M3 13l9 5 9-5",
  flag: "M6 21V4 M6 5h11l-1.5 3L17 11H6",
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = "w-5 h-5" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
