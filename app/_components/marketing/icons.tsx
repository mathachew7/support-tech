// Inline SVG icons for the marketing page. Stroke-based, inherit currentColor.
type P = { className?: string };
const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconMatch({ className }: P) {
  return (
    <svg {...base} className={className}>
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="18" r="3" />
      <path d="M9 6h4a4 4 0 0 1 4 4v5" />
    </svg>
  );
}
export function IconShield({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
export function IconCalendar({ className }: P) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
      <path d="M3 9h18M8 3v3M16 3v3" />
      <path d="M8 13h3v3H8z" />
    </svg>
  );
}
export function IconClock({ className }: P) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}
export function IconSpark({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M12 8.5a3.5 3.5 0 0 0 3.5 3.5A3.5 3.5 0 0 0 12 15.5 3.5 3.5 0 0 0 8.5 12 3.5 3.5 0 0 0 12 8.5z" />
    </svg>
  );
}
export function IconChat({ className }: P) {
  return (
    <svg {...base} className={className}>
      <path d="M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 20 16.5H9l-4 3v-3H4A1.5 1.5 0 0 1 2.5 15V7A1.5 1.5 0 0 1 4 5.5z" />
      <path d="M7 10h10M7 13h6" />
    </svg>
  );
}
export function IconArrow({ className }: P) {
  return (
    <svg {...base} className={className} strokeWidth={2}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
export function IconCheck({ className }: P) {
  return (
    <svg {...base} className={className} strokeWidth={2.2}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
export function IconMenu({ className }: P) {
  return (
    <svg {...base} className={className} strokeWidth={2}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
export function IconClose({ className }: P) {
  return (
    <svg {...base} className={className} strokeWidth={2}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
export function IconPlus({ className }: P) {
  return (
    <svg {...base} className={className} strokeWidth={2}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
