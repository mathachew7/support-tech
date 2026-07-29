// A single KPI tile for the dashboard stat rows.

type Tone = "accent" | "amber" | "teal";

const TONE_CLASS: Record<Tone, string> = {
  accent: "",
  amber: "stat--amber",
  teal: "stat--teal",
};

export function StatCard({
  value,
  label,
  tone = "accent",
}: {
  value: number | string;
  label: string;
  tone?: Tone;
}) {
  return (
    <div className={`stat ${TONE_CLASS[tone]}`}>
      <div className="stat__num">{value}</div>
      <div className="stat__label">{label}</div>
    </div>
  );
}
