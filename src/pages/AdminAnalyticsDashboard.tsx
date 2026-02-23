import { useState, useEffect, useRef } from "react";
import {
  Users,
  UsersRound,
  Trophy,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  GitBranch,
  Layers,
  CalendarDays,
  Zap,
  Award,
  BarChart2,
  PieChart,
} from "lucide-react";

/* ─── Brand ─────────────────────────────────────────── */
const B = {
  bg: "#F3F3F3",
  card: "#FFFFFF",
  dark: "#28292C",
  muted: "#96979A",
  border: "rgba(40,41,44,0.07)",
  borderMed: "rgba(40,41,44,0.11)",
  active: "rgba(40,41,44,0.05)",
  shadow: "0 2px 12px rgba(40,41,44,0.06)",
  shadowH: "0 14px 40px rgba(40,41,44,0.12)",
  shadowCard: "0 4px 20px rgba(40,41,44,0.07)",
  /* Tonal palette derived from #28292C only */
  t1: "#28292C", // 100 %
  t2: "#4a4b4f", // 70 %
  t3: "#6b6c70", // 50 %
  t4: "#a5a6a9", // 30 %
  t5: "#d4d5d6", // 12 %
  t6: "#ebebec", //  5 %
} as const;

const FONT = "'Inter',-apple-system,BlinkMacSystemFont,sans-serif";

/* ─── Keyframes / global CSS ─────────────────────────── */
const CSS = `
.aa-fade { animation: aaFade .4s cubic-bezier(.4,0,.2,1) both; }
@keyframes aaFade { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }

.aa-card {
  transition: box-shadow .22s ease, border-color .22s ease, transform .22s cubic-bezier(.34,1.2,.64,1);
}
.aa-card:hover {
  box-shadow: 0 18px 44px rgba(40,41,44,0.11) !important;
  border-color: rgba(40,41,44,0.13) !important;
  transform: translateY(-3px);
}

.aa-bar {
  transform-origin: bottom;
  transition: transform .5s cubic-bezier(.34,1.1,.64,1), opacity .3s;
}
.aa-bar-wrap:hover .aa-bar-inner { opacity: 1 !important; }
.aa-bar-inner { transition: opacity .18s; }

.aa-ring-seg { transition: stroke-dashoffset .8s cubic-bezier(.4,0,.2,1); }

.aa-spark-path { stroke-dashoffset: 800; animation: aaStroke 1.4s cubic-bezier(.4,0,.2,1) .2s forwards; }
@keyframes aaStroke { to { stroke-dashoffset: 0; } }

.aa-hbar-fill { transition: width .8s cubic-bezier(.34,1.1,.64,1); }

.aa-tab { transition: background .14s, color .14s; cursor: pointer; }
.aa-row { transition: background .13s; }
.aa-row:hover { background: rgba(40,41,44,0.025) !important; }
.aa-pulse { animation: aaPulse 2s ease-in-out infinite; }
@keyframes aaPulse { 0%,100% { opacity:1; } 50% { opacity:.45; } }
`;

function StyleInject() {
  useEffect(() => {
    const id = "aa-style";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
  return null;
}

/* ─── Mock Data ────────────────────────────────────── */
const STATS = {
  totalStudents: {
    value: 2847,
    delta: +12,
    label: "Total Students",
    icon: Users,
    sub: "Registered on platform",
  },
  femaleRatio: {
    value: 38.4,
    delta: +2.1,
    label: "Female Participation",
    icon: UsersRound,
    sub: "Out of all students",
    unit: "%",
  },
  totalTeams: {
    value: 312,
    delta: +24,
    label: "Total Teams",
    icon: GitBranch,
    sub: "Active & formed",
  },
  activeHack: {
    value: 6,
    delta: +2,
    label: "Active Hackathons",
    icon: Trophy,
    sub: "Currently ongoing",
  },
};

const BRANCH_DATA = [
  { branch: "CSE", count: 912, pct: 100 },
  { branch: "IT", count: 648, pct: 71 },
  { branch: "ECE", count: 531, pct: 58 },
  { branch: "MECH", count: 405, pct: 44 },
  { branch: "CIVIL", count: 351, pct: 38 },
];
const MAX_BRANCH = BRANCH_DATA[0].count;

/* Weekly registrations — last 8 weeks */
const WEEKLY_REG = [48, 62, 55, 80, 74, 91, 88, 110];

/* Donut segments: gender split */
const GENDER = [
  { label: "Male", pct: 61.6, color: B.t1 },
  { label: "Female", pct: 38.4, color: B.t4 },
];

/* Hackathon participation */
const HACKATHONS = [
  { name: "Smart India Hackathon", teams: 78, color: B.t1 },
  { name: "Internal Tech Fest", teams: 54, color: B.t2 },
  { name: "AI Innovation Sprint", teams: 42, color: B.t3 },
  { name: "Blockchain Challenge", teams: 31, color: B.t4 },
  { name: "Open Source Week", teams: 24, color: B.t5 },
];
const MAX_HACK = HACKATHONS[0].teams;

/* Category breakdown */
const CATEGORIES = [
  { label: "AI / ML", count: 94 },
  { label: "Web Dev", count: 78 },
  { label: "IoT & Hardware", count: 52 },
  { label: "Blockchain", count: 41 },
  { label: "Open Ended", count: 47 },
];

/* Recent activity */
const ACTIVITY = [
  {
    text: "Team 'NeuralEdge' registered for SIH 2025",
    time: "2m ago",
    type: "team",
  },
  {
    text: "Priya Nair earned the Hackathon Winner badge",
    time: "18m ago",
    type: "badge",
  },
  {
    text: "Blockchain Challenge — 5 new teams joined",
    time: "1h ago",
    type: "hack",
  },
  {
    text: "AI Innovation Sprint deadline extended by 3 days",
    time: "3h ago",
    type: "event",
  },
  {
    text: "143 new students registered this week",
    time: "5h ago",
    type: "students",
  },
  { text: "Open Source Week submissions open", time: "1d ago", type: "event" },
];

/* Top performers */
const TOP_PERF = [
  {
    name: "Aryan Sharma",
    branch: "CSE",
    pts: 4820,
    badge: "Champion",
    initials: "AS",
  },
  {
    name: "Priya Nair",
    branch: "IT",
    pts: 4350,
    badge: "Mentor",
    initials: "PN",
  },
  {
    name: "Ritu Singh",
    branch: "ECE",
    pts: 3910,
    badge: "Innovator",
    initials: "RS",
  },
  {
    name: "Dev Patel",
    branch: "CSE",
    pts: 3280,
    badge: "Streak",
    initials: "DP",
  },
  {
    name: "Sneha Gupta",
    branch: "CSE",
    pts: 2960,
    badge: "Top Contrib",
    initials: "SG",
  },
];

/* ─── Chart: Period filter tabs ─────────────────────── */
const PERIODS = ["7D", "30D", "90D"] as const;
type Period = (typeof PERIODS)[number];

/* ─── Helpers ───────────────────────────────────────── */
function namehue(s: string) {
  return (s.charCodeAt(0) * 19 + (s.charCodeAt(1) ?? 7) * 11) % 360;
}
function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: `hsl(${namehue(name)},14%,22%)`,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT,
        fontSize: size * 0.34,
        fontWeight: 800,
      }}
    >
      {initials}
    </div>
  );
}

/* ─── Stat Card ─────────────────────────────────────── */
interface StatCardProps {
  label: string;
  sub: string;
  value: number;
  delta: number;
  unit?: string;
  icon: React.ComponentType<{ size?: number }>;
  delay?: number;
}
function StatCard({
  label,
  sub,
  value,
  delta,
  unit = "",
  icon: Icon,
  delay = 0,
}: StatCardProps) {
  const up = delta >= 0;
  return (
    <div
      className="aa-card aa-fade"
      style={{
        animationDelay: `${delay}ms`,
        background: B.card,
        borderRadius: "1.25rem",
        border: `1px solid ${B.border}`,
        boxShadow: B.shadowCard,
        padding: "1.4rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        flex: 1,
        minWidth: 0,
      }}
    >
      {/* Icon + delta */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "0.875rem",
            background: B.active,
            border: `1px solid ${B.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: B.dark,
          }}
        >
          <Icon size={18} />
        </div>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.2rem",
            fontSize: "0.7rem",
            fontWeight: 700,
            fontFamily: FONT,
            color: up ? "#059669" : "#DC2626",
            background: up ? "rgba(5,150,105,0.08)" : "rgba(220,38,38,0.07)",
            padding: "0.22rem 0.6rem",
            borderRadius: "999px",
          }}
        >
          {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
          {up ? "+" : ""}
          {delta}
          {unit === "%" ? "pp" : ""}
        </span>
      </div>

      {/* Value */}
      <div>
        <p
          style={{
            fontFamily: FONT,
            fontSize: "1.95rem",
            fontWeight: 900,
            color: B.dark,
            letterSpacing: "-0.05em",
            lineHeight: 1,
            margin: 0,
          }}
        >
          {typeof value === "number" && unit !== "%"
            ? value.toLocaleString()
            : value}
          <span
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: B.muted,
              marginLeft: "0.2rem",
            }}
          >
            {unit}
          </span>
        </p>
        <p
          style={{
            fontFamily: FONT,
            fontSize: "0.82rem",
            fontWeight: 700,
            color: B.dark,
            margin: "0.35rem 0 0",
            letterSpacing: "-0.01em",
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontFamily: FONT,
            fontSize: "0.71rem",
            color: B.muted,
            margin: "0.1rem 0 0",
          }}
        >
          {sub}
        </p>
      </div>
    </div>
  );
}

/* ─── Chart: Section header ─────────────────────────── */
function SectionHead({
  icon: Icon,
  title,
  sub,
  right,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  sub?: string;
  right?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: "1.25rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "0.625rem",
            background: B.dark,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={14} color="#fff" />
        </div>
        <div>
          <p
            style={{
              fontFamily: FONT,
              fontSize: "0.88rem",
              fontWeight: 900,
              color: B.dark,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </p>
          {sub && (
            <p
              style={{
                fontFamily: FONT,
                fontSize: "0.71rem",
                color: B.muted,
                margin: "0.05rem 0 0",
              }}
            >
              {sub}
            </p>
          )}
        </div>
      </div>
      {right}
    </div>
  );
}

/* ─── Chart Card ─────────────────────────────────────── */
function ChartCard({
  children,
  delay = 0,
  style = {},
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="aa-card aa-fade"
      style={{
        animationDelay: `${delay}ms`,
        background: B.card,
        borderRadius: "1.25rem",
        border: `1px solid ${B.border}`,
        boxShadow: B.shadowCard,
        padding: "1.4rem 1.5rem",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── SVG: Bar Chart ─────────────────────────────────── */
function BranchBarChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const W = 320,
    H = 160,
    PAD = { l: 0, r: 0, t: 8, b: 32 };
  const barW = 36,
    gap = (W - BRANCH_DATA.length * barW) / (BRANCH_DATA.length + 1);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: "auto", overflow: "visible" }}
    >
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
        const y = PAD.t + (H - PAD.t - PAD.b) * (1 - frac);
        return (
          <line
            key={frac}
            x1={0}
            y1={y}
            x2={W}
            y2={y}
            stroke={B.border}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        );
      })}

      {BRANCH_DATA.map((d, i) => {
        const x = gap + i * (barW + gap);
        const maxH = H - PAD.t - PAD.b;
        const bh = mounted ? (d.count / MAX_BRANCH) * maxH : 0;
        const y = H - PAD.b - bh;

        /* Tonal shades: dark → lighter */
        const shades = [B.t1, B.t2, B.t3, B.t4, "#c0c1c4"];
        return (
          <g key={d.branch} className="aa-bar-wrap">
            {/* Bar */}
            <rect
              x={x}
              y={y}
              width={barW}
              height={bh}
              rx={6}
              fill={shades[i]}
              className="aa-bar-inner"
              style={{
                transition:
                  "y .7s cubic-bezier(.34,1.1,.64,1), height .7s cubic-bezier(.34,1.1,.64,1)",
                opacity: 0.9,
              }}
            />
            {/* Value label above */}
            <text
              x={x + barW / 2}
              y={y - 5}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize={10}
              fontWeight={800}
              fill={B.dark}
              opacity={mounted ? 1 : 0}
              style={{ transition: "opacity .4s .6s" }}
            >
              {d.count}
            </text>
            {/* Branch label below */}
            <text
              x={x + barW / 2}
              y={H - PAD.b + 14}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize={10}
              fontWeight={700}
              fill={B.muted}
            >
              {d.branch}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── SVG: Donut Chart ───────────────────────────────── */
function DonutChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(t);
  }, []);

  const R = 52,
    CX = 80,
    CY = 80,
    stroke = 24;
  const circ = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
      <svg viewBox="0 0 160 160" style={{ width: 130, flexShrink: 0 }}>
        {/* Track */}
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke={B.t6}
          strokeWidth={stroke}
        />
        {/* Segments */}
        {GENDER.map((seg) => {
          const dash = (seg.pct / 100) * circ;
          const gap2 = circ - dash;
          const thisOffset = -circ * 0.25 + (offset * circ) / 100;
          offset += seg.pct;
          return (
            <circle
              key={seg.label}
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${mounted ? dash : 0} ${circ}`}
              strokeDashoffset={-thisOffset + circ * 0.25}
              style={{
                transition: "stroke-dasharray .8s cubic-bezier(.4,0,.2,1)",
              }}
              strokeLinecap="butt"
            />
          );
        })}
        {/* Center text */}
        <text
          x={CX}
          y={CY - 6}
          textAnchor="middle"
          fontFamily={FONT}
          fontSize={22}
          fontWeight={900}
          fill={B.dark}
        >
          {STATS.femaleRatio.value}
        </text>
        <text
          x={CX}
          y={CY + 10}
          textAnchor="middle"
          fontFamily={FONT}
          fontSize={10}
          fontWeight={600}
          fill={B.muted}
        >
          % Female
        </text>
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
        {GENDER.map((seg) => (
          <div
            key={seg.label}
            style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: seg.color,
                flexShrink: 0,
              }}
            />
            <div>
              <p
                style={{
                  fontFamily: FONT,
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  color: B.dark,
                  margin: 0,
                }}
              >
                {seg.label}
              </p>
              <p
                style={{
                  fontFamily: FONT,
                  fontSize: "0.7rem",
                  color: B.muted,
                  margin: 0,
                }}
              >
                {seg.pct}%
              </p>
            </div>
          </div>
        ))}
        <div
          style={{ paddingTop: "0.3rem", borderTop: `1px solid ${B.border}` }}
        >
          <p
            style={{
              fontFamily: FONT,
              fontSize: "0.7rem",
              color: B.muted,
              margin: 0,
            }}
          >
            Total: {STATS.totalStudents.value.toLocaleString()} students
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── SVG: Sparkline / Area Chart ───────────────────── */
function SparkArea({ period }: { period: Period }) {
  const data =
    period === "7D"
      ? WEEKLY_REG.slice(-7)
      : period === "30D"
        ? [...WEEKLY_REG, 102, 97, 115, 98].slice(-8)
        : WEEKLY_REG;

  const [mounted, setMounted] = useState(false);
  const prev = useRef<Period>(period);
  useEffect(() => {
    setMounted(false);
    const t = setTimeout(() => setMounted(true), 60);
    prev.current = period;
    return () => clearTimeout(t);
  }, [period]);

  const W = 320,
    H = 100;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - 8 - ((v - min) / range) * (H - 24),
  }));

  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${H} L 0 ${H} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: "auto", overflow: "visible" }}
    >
      {/* Horizontal guides */}
      {[0, 0.5, 1].map((frac) => {
        const y = 8 + (H - 24) * (1 - frac);
        const val = Math.round(min + frac * range);
        return (
          <g key={frac}>
            <line
              x1={0}
              y1={y}
              x2={W}
              y2={y}
              stroke={B.border}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <text
              x={-4}
              y={y + 4}
              textAnchor="end"
              fontFamily={FONT}
              fontSize={9}
              fill={B.muted}
            >
              {val}
            </text>
          </g>
        );
      })}

      {/* Area fill */}
      {mounted && <path d={areaPath} fill={B.dark} fillOpacity={0.05} />}

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={B.dark}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray={800}
        style={{
          strokeDashoffset: mounted ? 0 : 800,
          transition: "stroke-dashoffset .9s cubic-bezier(.4,0,.2,1)",
        }}
      />

      {/* Dots */}
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3}
          fill={B.dark}
          style={{
            opacity: mounted ? 1 : 0,
            transition: `opacity .2s ${i * 80}ms`,
          }}
        />
      ))}

      {/* X labels */}
      {data.map((_, i) => {
        const label =
          period === "7D"
            ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i % 7]
            : `W${i + 1}`;
        return (
          <text
            key={i}
            x={pts[i].x}
            y={H + 2}
            textAnchor="middle"
            fontFamily={FONT}
            fontSize={9}
            fontWeight={600}
            fill={B.muted}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

/* ─── Horizontal Bar: Hackathons ─────────────────────── */
function HackathonBars() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      {HACKATHONS.map((h, i) => (
        <div key={h.name}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.35rem",
            }}
          >
            <span
              style={{
                fontFamily: FONT,
                fontSize: "0.78rem",
                fontWeight: 700,
                color: B.dark,
              }}
            >
              {h.name}
            </span>
            <span
              style={{
                fontFamily: FONT,
                fontSize: "0.75rem",
                fontWeight: 800,
                color: B.dark,
              }}
            >
              {h.teams} teams
            </span>
          </div>
          <div
            style={{
              height: 7,
              borderRadius: 999,
              background: B.t6,
              overflow: "hidden",
            }}
          >
            <div
              className="aa-hbar-fill"
              style={{
                height: "100%",
                width: mounted ? `${(h.teams / MAX_HACK) * 100}%` : "0%",
                background: h.color,
                borderRadius: 999,
                transitionDelay: `${i * 80}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Category Ring Breakdown ───────────────────────── */
function CategoryBreakdown() {
  const total = CATEGORIES.reduce((s, c) => s + c.count, 0);
  const shades = [B.t1, B.t2, B.t3, B.t4, "#c0c1c4"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
      {CATEGORIES.map((c, i) => {
        const pct = Math.round((c.count / total) * 100);
        return (
          <div
            key={c.label}
            style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: shades[i],
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: FONT,
                fontSize: "0.78rem",
                fontWeight: 700,
                color: B.dark,
                flex: 1,
              }}
            >
              {c.label}
            </span>
            <span
              style={{
                fontFamily: FONT,
                fontSize: "0.72rem",
                fontWeight: 700,
                color: B.muted,
              }}
            >
              {c.count}
            </span>
            <div
              style={{
                width: 56,
                height: 5,
                borderRadius: 999,
                background: B.t6,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: shades[i],
                  borderRadius: 999,
                }}
              />
            </div>
            <span
              style={{
                fontFamily: FONT,
                fontSize: "0.68rem",
                color: B.muted,
                minWidth: 28,
                textAlign: "right",
              }}
            >
              {pct}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Activity Feed ─────────────────────────────────── */
const ACT_ICONS: Record<string, React.ReactNode> = {
  team: <UsersRound size={13} />,
  badge: <Award size={13} />,
  hack: <Trophy size={13} />,
  event: <CalendarDays size={13} />,
  students: <Users size={13} />,
};
function ActivityFeed() {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {ACTIVITY.map((a, i) => (
        <div
          key={i}
          className="aa-row"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0.65rem",
            padding: "0.7rem 0.5rem",
            borderBottom:
              i < ACTIVITY.length - 1 ? `1px solid ${B.border}` : "none",
            borderRadius: "0.5rem",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "0.55rem",
              flexShrink: 0,
              background: B.active,
              border: `1px solid ${B.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: B.dark,
            }}
          >
            {ACT_ICONS[a.type] ?? <Activity size={13} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontFamily: FONT,
                fontSize: "0.78rem",
                color: B.dark,
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {a.text}
            </p>
            <p
              style={{
                fontFamily: FONT,
                fontSize: "0.68rem",
                color: B.muted,
                margin: "0.1rem 0 0",
              }}
            >
              {a.time}
            </p>
          </div>
          {/* Live dot for recent */}
          {i === 0 && (
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#059669",
                flexShrink: 0,
                marginTop: "0.35rem",
              }}
              className="aa-pulse"
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Top Performers Table ──────────────────────────── */
function TopTable() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "36px 1fr 80px 80px",
          gap: "0.5rem",
          padding: "0 0.5rem 0.5rem",
          borderBottom: `1px solid ${B.border}`,
        }}
      >
        {["#", "Student", "Points", "Badge"].map((h, i) => (
          <span
            key={h}
            style={{
              fontFamily: FONT,
              fontSize: "0.68rem",
              fontWeight: 700,
              color: B.muted,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              textAlign: i === 0 ? "center" : i >= 2 ? "right" : "left",
            }}
          >
            {h}
          </span>
        ))}
      </div>
      {/* Rows */}
      {TOP_PERF.map((p, i) => (
        <div
          key={p.name}
          className="aa-row"
          style={{
            display: "grid",
            gridTemplateColumns: "36px 1fr 80px 80px",
            gap: "0.5rem",
            padding: "0.5rem",
            borderRadius: "0.75rem",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: i === 0 ? B.dark : B.active,
                color: i === 0 ? "#fff" : B.dark,
                fontFamily: FONT,
                fontSize: "0.68rem",
                fontWeight: 900,
              }}
            >
              {i + 1}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.55rem",
              minWidth: 0,
            }}
          >
            <Avatar name={p.name} size={28} />
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontFamily: FONT,
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  color: B.dark,
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {p.name}
              </p>
              <p
                style={{
                  fontFamily: FONT,
                  fontSize: "0.67rem",
                  color: B.muted,
                  margin: 0,
                }}
              >
                {p.branch}
              </p>
            </div>
          </div>
          <div
            style={{
              textAlign: "right",
              fontFamily: FONT,
              fontSize: "0.78rem",
              fontWeight: 800,
              color: B.dark,
            }}
          >
            {p.pts.toLocaleString()}
          </div>
          <div style={{ textAlign: "right" }}>
            <span
              style={{
                fontFamily: FONT,
                fontSize: "0.65rem",
                fontWeight: 700,
                background: B.active,
                border: `1px solid ${B.border}`,
                padding: "0.18rem 0.5rem",
                borderRadius: "999px",
                color: B.dark,
                whiteSpace: "nowrap",
              }}
            >
              {p.badge}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Info Pill Row ─────────────────────────────────── */
function InfoPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        padding: "0.6rem 0.9rem",
        borderRadius: "0.875rem",
        border: `1px solid ${B.border}`,
        background: B.bg,
      }}
    >
      <div style={{ color: B.muted }}>
        <Icon size={14} />
      </div>
      <div>
        <p
          style={{
            fontFamily: FONT,
            fontSize: "0.67rem",
            fontWeight: 600,
            color: B.muted,
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontFamily: FONT,
            fontSize: "0.82rem",
            fontWeight: 800,
            color: B.dark,
            margin: 0,
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────── */
export default function AdminAnalyticsDashboard() {
  const [period, setPeriod] = useState<Period>("7D");

  return (
    <>
      <StyleInject />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          fontFamily: FONT,
        }}
      >
        {/* ── Header ─────────────────────────────────── */}
        <div
          className="aa-fade"
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: FONT,
                fontSize: "1.3rem",
                fontWeight: 900,
                color: B.dark,
                letterSpacing: "-0.04em",
                margin: 0,
              }}
            >
              Analytics
            </h1>
            <p
              style={{
                fontFamily: FONT,
                fontSize: "0.8rem",
                color: B.muted,
                marginTop: "0.2rem",
              }}
            >
              Platform-wide overview · Last updated just now
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {/* Live badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                background: B.card,
                border: `1px solid ${B.border}`,
                borderRadius: "999px",
                padding: "0.3rem 0.8rem",
              }}
            >
              <div
                className="aa-pulse"
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#059669",
                }}
              />
              <span
                style={{
                  fontFamily: FONT,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: B.dark,
                }}
              >
                Live
              </span>
            </div>
            <div
              style={{
                background: B.card,
                border: `1px solid ${B.border}`,
                borderRadius: "0.75rem",
                padding: "0.3rem 0.9rem",
              }}
            >
              <span
                style={{
                  fontFamily: FONT,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: B.muted,
                }}
              >
                Feb 2026
              </span>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ─────────────────────────────── */}
        <div
          className="aa-fade"
          style={{
            display: "flex",
            gap: "0.875rem",
            flexWrap: "wrap",
            animationDelay: "40ms",
          }}
        >
          <StatCard {...STATS.totalStudents} icon={Users} delay={0} />
          <StatCard
            {...STATS.femaleRatio}
            icon={UsersRound}
            delay={60}
            unit="%"
          />
          <StatCard {...STATS.totalTeams} icon={GitBranch} delay={120} />
          <StatCard {...STATS.activeHack} icon={Trophy} delay={180} />
        </div>

        {/* ── Row 2: Registration Trend + Donut ──────── */}
        <div
          className="aa-fade"
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "0.875rem",
            animationDelay: "80ms",
          }}
        >
          {/* Registration trend */}
          <ChartCard delay={80}>
            <SectionHead
              icon={TrendingUp}
              title="New Registrations"
              sub="Weekly student sign-ups"
              right={
                <div
                  style={{
                    display: "flex",
                    gap: "0.25rem",
                    background: B.bg,
                    borderRadius: "999px",
                    padding: "0.2rem 0.3rem",
                    border: `1px solid ${B.border}`,
                  }}
                >
                  {PERIODS.map((p) => (
                    <button
                      key={p}
                      className="aa-tab"
                      onClick={() => setPeriod(p)}
                      style={{
                        padding: "0.28rem 0.7rem",
                        borderRadius: "999px",
                        border: "none",
                        background: period === p ? B.dark : "none",
                        color: period === p ? "#fff" : B.muted,
                        fontFamily: FONT,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              }
            />
            <SparkArea period={period} />
            {/* Summary pills */}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginTop: "1rem",
                flexWrap: "wrap",
              }}
            >
              <InfoPill icon={Zap} label="Peak week" value="110 signups" />
              <InfoPill icon={TrendingUp} label="Growth" value="+22.8%" />
              <InfoPill icon={Users} label="Avg / week" value="76 students" />
            </div>
          </ChartCard>

          {/* Donut: Gender */}
          <ChartCard delay={110}>
            <SectionHead
              icon={PieChart}
              title="Gender Split"
              sub="Participation by gender"
            />
            <DonutChart />
            <div
              style={{
                marginTop: "1rem",
                padding: "0.7rem 0.85rem",
                background: B.bg,
                borderRadius: "0.875rem",
                border: `1px solid ${B.border}`,
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
              >
                <ArrowUpRight size={13} color="#059669" />
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#059669",
                  }}
                >
                  +2.1pp vs last semester
                </span>
              </div>
              <p
                style={{
                  fontFamily: FONT,
                  fontSize: "0.68rem",
                  color: B.muted,
                  margin: "0.2rem 0 0",
                }}
              >
                Female participation growing steadily
              </p>
            </div>
          </ChartCard>
        </div>

        {/* ── Row 3: Branch bars + Hackathon bars ─────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.875rem",
          }}
        >
          {/* Branch enrollment */}
          <ChartCard delay={140}>
            <SectionHead
              icon={BarChart2}
              title="Branch Enrollment"
              sub="Students per department"
            />
            <BranchBarChart />
            <div
              style={{
                display: "flex",
                gap: "0.4rem",
                marginTop: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              {BRANCH_DATA.map((d) => (
                <span
                  key={d.branch}
                  style={{
                    fontFamily: FONT,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    background: B.active,
                    border: `1px solid ${B.border}`,
                    padding: "0.18rem 0.55rem",
                    borderRadius: "999px",
                    color: B.muted,
                  }}
                >
                  {d.branch}: {d.count}
                </span>
              ))}
            </div>
          </ChartCard>

          {/* Hackathon participation */}
          <ChartCard delay={170}>
            <SectionHead
              icon={Trophy}
              title="Hackathon Participation"
              sub="Teams registered per event"
            />
            <HackathonBars />
            <div
              style={{
                marginTop: "0.85rem",
                display: "flex",
                gap: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              <InfoPill icon={UsersRound} label="Total teams" value="229" />
              <InfoPill icon={Activity} label="Avg per event" value="45.8" />
            </div>
          </ChartCard>
        </div>

        {/* ── Row 4: Category breakdown + Top performers + Feed ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.3fr 1fr",
            gap: "0.875rem",
          }}
        >
          {/* Category breakdown */}
          <ChartCard delay={200}>
            <SectionHead
              icon={Layers}
              title="Project Categories"
              sub="Submissions by domain"
            />
            <CategoryBreakdown />
            <div
              style={{
                marginTop: "1rem",
                padding: "0.7rem 0.85rem",
                background: B.bg,
                borderRadius: "0.875rem",
                border: `1px solid ${B.border}`,
              }}
            >
              <p
                style={{
                  fontFamily: FONT,
                  fontSize: "0.7rem",
                  color: B.muted,
                  margin: 0,
                }}
              >
                Total:{" "}
                <span style={{ fontWeight: 800, color: B.dark }}>312</span>{" "}
                project submissions
              </p>
            </div>
          </ChartCard>

          {/* Top performers */}
          <ChartCard delay={230}>
            <SectionHead
              icon={Award}
              title="Top Performers"
              sub="By cumulative points"
            />
            <TopTable />
          </ChartCard>

          {/* Activity feed */}
          <ChartCard delay={260}>
            <SectionHead
              icon={Activity}
              title="Recent Activity"
              sub="Live platform events"
            />
            <ActivityFeed />
          </ChartCard>
        </div>

        {/* ── Footer spacer ───────────────────────────── */}
        <div style={{ height: "0.5rem" }} />
      </div>
    </>
  );
}
