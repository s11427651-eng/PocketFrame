export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div
      className={`${className} rounded-xl bg-gradient-to-br from-brand-purple via-brand-blue to-brand-cyan grid place-items-center text-white shadow-lg shadow-brand-purple/30`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-3/5 h-3/5" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="6" width="16" height="12" rx="3" />
        <circle cx="9" cy="11" r="1.4" fill="currentColor" stroke="none" />
        <path d="M4 16l4-3 4 2 4-3 4 3" />
      </svg>
    </div>
  );
}
