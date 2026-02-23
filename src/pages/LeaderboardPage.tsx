import { useState, useEffect } from "react";
import {
  Trophy,
  Award,
  Star,
  TrendingUp,
  Medal,
  Zap,
  Crown,
} from "lucide-react";

/* ─── Brand ───────────────────────────────────── */
const B = {
  bg: "#F3F3F3",
  card: "#FFFFFF",
  dark: "#28292C",
  muted: "#96979A",
  border: "rgba(40,41,44,0.07)",
  active: "rgba(40,41,44,0.05)",
  shadow: "0 2px 12px rgba(40,41,44,0.06)",
  shadowH: "0 16px 40px rgba(40,41,44,0.13)",
  shadowPodium: "0 20px 52px rgba(40,41,44,0.16)",
} as const;
const FONT = "'Inter',-apple-system,BlinkMacSystemFont,sans-serif";

/* ─── CSS ──────────────────────────────────────── */
const CSS = `
.lb-fade { animation: lbFade .4s cubic-bezier(.4,0,.2,1) both; }
@keyframes lbFade { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
.lb-podium { animation: lbPodium .55s cubic-bezier(.34,1.2,.64,1) both; }
@keyframes lbPodium { from { opacity:0; transform:translateY(18px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }
.lb-row { transition: background .14s, box-shadow .16s; }
.lb-row:hover { background: rgba(40,41,44,0.025) !important; }
.lb-badge { transition: transform .18s cubic-bezier(.34,1.56,.64,1); }
.lb-badge:hover { transform: scale(1.12); }
.lb-tab { transition: color .14s, border-color .14s, background .14s; cursor: pointer; }
.lb-counter { animation: lbCount .7s cubic-bezier(.4,0,.2,1) both; }
@keyframes lbCount { from { opacity:0; } to { opacity:1; } }
`;

function StyleInject() {
  useEffect(() => {
    const id = "lb-style";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => {
      el.remove();
    };
  }, []);
  return null;
}

/* ─── Types ────────────────────────────────────── */
interface BadgeInfo {
  icon: React.ReactNode;
  label: string;
}
interface Leader {
  id: number;
  rank: number;
  name: string;
  initials: string;
  branch: string;
  year: number;
  points: number;
  badges: BadgeInfo[];
  streak: number;
  submissions: number;
}

/* ─── Badge Definitions ────────────────────────── */
const BADGE_DEFS: Record<string, BadgeInfo> = {
  hackathon: { icon: <Trophy size={11} />, label: "Hackathon Winner" },
  streak: { icon: <Zap size={11} />, label: "7-Day Streak" },
  mentor: { icon: <Star size={11} />, label: "Mentor" },
  topper: { icon: <Medal size={11} />, label: "Top Contributor" },
  innovator: { icon: <TrendingUp size={11} />, label: "Innovator" },
  champion: { icon: <Award size={11} />, label: "Champion" },
  pioneer: { icon: <Crown size={11} />, label: "Pioneer" },
};

/* ─── Mock Data ────────────────────────────────── */
const DATA: Leader[] = [
  {
    id: 1,
    rank: 1,
    name: "Aryan Sharma",
    initials: "AS",
    branch: "CSE",
    year: 3,
    points: 4820,
    streak: 14,
    submissions: 11,
    badges: [
      BADGE_DEFS.champion,
      BADGE_DEFS.hackathon,
      BADGE_DEFS.pioneer,
      BADGE_DEFS.streak,
    ],
  },
  {
    id: 2,
    rank: 2,
    name: "Priya Nair",
    initials: "PN",
    branch: "IT",
    year: 4,
    points: 4350,
    streak: 9,
    submissions: 9,
    badges: [BADGE_DEFS.topper, BADGE_DEFS.mentor, BADGE_DEFS.streak],
  },
  {
    id: 3,
    rank: 3,
    name: "Ritu Singh",
    initials: "RS",
    branch: "ECE",
    year: 3,
    points: 3910,
    streak: 7,
    submissions: 8,
    badges: [BADGE_DEFS.hackathon, BADGE_DEFS.innovator, BADGE_DEFS.streak],
  },
  {
    id: 4,
    rank: 4,
    name: "Dev Patel",
    initials: "DP",
    branch: "CSE",
    year: 2,
    points: 3280,
    streak: 5,
    submissions: 7,
    badges: [BADGE_DEFS.innovator, BADGE_DEFS.streak],
  },
  {
    id: 5,
    rank: 5,
    name: "Sneha Gupta",
    initials: "SG",
    branch: "CSE",
    year: 3,
    points: 2960,
    streak: 4,
    submissions: 6,
    badges: [BADGE_DEFS.mentor, BADGE_DEFS.topper],
  },
  {
    id: 6,
    rank: 6,
    name: "Mihir Joshi",
    initials: "MJ",
    branch: "MECH",
    year: 4,
    points: 2740,
    streak: 3,
    submissions: 6,
    badges: [BADGE_DEFS.hackathon],
  },
  {
    id: 7,
    rank: 7,
    name: "Karan Mehta",
    initials: "KM",
    branch: "CSE",
    year: 2,
    points: 2510,
    streak: 6,
    submissions: 5,
    badges: [BADGE_DEFS.innovator, BADGE_DEFS.streak],
  },
  {
    id: 8,
    rank: 8,
    name: "Neha Verma",
    initials: "NV",
    branch: "IT",
    year: 3,
    points: 2280,
    streak: 2,
    submissions: 5,
    badges: [BADGE_DEFS.topper],
  },
  {
    id: 9,
    rank: 9,
    name: "Aditya Kumar",
    initials: "AK",
    branch: "CSE",
    year: 4,
    points: 2050,
    streak: 4,
    submissions: 4,
    badges: [BADGE_DEFS.mentor, BADGE_DEFS.hackathon],
  },
  {
    id: 10,
    rank: 10,
    name: "Tanvi Rao",
    initials: "TR",
    branch: "ECE",
    year: 2,
    points: 1830,
    streak: 1,
    submissions: 4,
    badges: [BADGE_DEFS.streak],
  },
  {
    id: 11,
    rank: 11,
    name: "Rohan Das",
    initials: "RD",
    branch: "CSE",
    year: 3,
    points: 1620,
    streak: 3,
    submissions: 3,
    badges: [BADGE_DEFS.innovator],
  },
  {
    id: 12,
    rank: 12,
    name: "Ananya Singh",
    initials: "AN",
    branch: "IT",
    year: 2,
    points: 1490,
    streak: 2,
    submissions: 3,
    badges: [],
  },
];

/* ─── Helpers ──────────────────────────────────── */
function namehue(s: string) {
  return (s.charCodeAt(0) * 19 + (s.charCodeAt(1) ?? 7) * 11) % 360;
}

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
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
        fontSize: size * 0.35,
        fontWeight: 800,
        letterSpacing: "-0.02em",
      }}
    >
      {initials}
    </div>
  );
}

/* ─── Rank Medal ───────────────────────────────── */
function RankMedal({ rank, size = 28 }: { rank: number; size?: number }) {
  const cfg =
    rank === 1
      ? { bg: B.dark, color: "#fff", label: "1" }
      : rank === 2
        ? { bg: "rgba(40,41,44,0.13)", color: B.dark, label: "2" }
        : { bg: "rgba(40,41,44,0.07)", color: B.dark, label: "3" };
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: cfg.bg,
        color: cfg.color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 900,
        fontFamily: FONT,
        flexShrink: 0,
      }}
    >
      {cfg.label}
    </div>
  );
}

/* ─── Badge Chip ───────────────────────────────── */
function BadgeChip({ badge }: { badge: BadgeInfo }) {
  return (
    <span
      title={badge.label}
      className="lb-badge"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        padding: "0.18rem 0.55rem",
        borderRadius: "999px",
        background: B.active,
        border: `1px solid ${B.border}`,
        color: B.dark,
        fontSize: "0.67rem",
        fontWeight: 700,
        fontFamily: FONT,
        cursor: "default",
      }}
    >
      {badge.icon} {badge.label}
    </span>
  );
}

/* ─── Podium Card (Top 3) ──────────────────────── */
function PodiumCard({ leader, delay }: { leader: Leader; delay: number }) {
  const isFirst = leader.rank === 1;
  return (
    <div
      className="lb-podium"
      style={{
        animationDelay: `${delay}ms`,
        background: isFirst ? B.dark : B.card,
        borderRadius: "1.5rem",
        padding: isFirst ? "1.8rem 1.5rem" : "1.5rem 1.4rem",
        border: `1px solid ${isFirst ? "transparent" : B.border}`,
        boxShadow: isFirst ? B.shadowPodium : B.shadowH,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.65rem",
        textAlign: "center",
        flex: 1,
        minWidth: 0,
        transform: isFirst ? "translateY(-10px)" : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle bg shimmer for #1 */}
      {isFirst && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 70%)",
          }}
        />
      )}

      {/* Rank badge */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: "0.9rem",
          background: isFirst ? "rgba(255,255,255,0.15)" : B.active,
          color: isFirst ? "#fff" : B.dark,
          border: `2px solid ${isFirst ? "rgba(255,255,255,0.2)" : B.border}`,
        }}
      >
        {leader.rank === 1 ? <Crown size={16} /> : `#${leader.rank}`}
      </div>

      {/* Avatar */}
      <div
        style={{
          borderRadius: "50%",
          padding: isFirst ? 3 : 2,
          background: isFirst ? "rgba(255,255,255,0.15)" : B.border,
        }}
      >
        <Avatar name={leader.name} size={isFirst ? 60 : 52} />
      </div>

      <div>
        <p
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            fontSize: isFirst ? "1rem" : "0.92rem",
            color: isFirst ? "#fff" : B.dark,
            margin: 0,
          }}
        >
          {leader.name}
        </p>
        <p
          style={{
            fontFamily: FONT,
            fontSize: "0.72rem",
            fontWeight: 500,
            color: isFirst ? "rgba(255,255,255,0.55)" : B.muted,
            margin: "0.2rem 0 0",
          }}
        >
          {leader.branch} · Year {leader.year}
        </p>
      </div>

      {/* Points */}
      <div
        style={{
          background: isFirst ? "rgba(255,255,255,0.1)" : B.active,
          border: `1px solid ${isFirst ? "rgba(255,255,255,0.12)" : B.border}`,
          borderRadius: "999px",
          padding: "0.35rem 1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.35rem",
        }}
      >
        <Zap size={12} color={isFirst ? "rgba(255,255,255,0.7)" : B.muted} />
        <span
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: "0.95rem",
            color: isFirst ? "#fff" : B.dark,
          }}
        >
          {leader.points.toLocaleString()}
        </span>
        <span
          style={{
            fontFamily: FONT,
            fontSize: "0.68rem",
            fontWeight: 500,
            color: isFirst ? "rgba(255,255,255,0.45)" : B.muted,
          }}
        >
          pts
        </span>
      </div>

      {/* Badges */}
      {leader.badges.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "0.3rem",
            flexWrap: "wrap",
            justifyContent: "center",
            filter: isFirst ? "invert(1) brightness(0.9)" : "none",
          }}
        >
          {leader.badges.slice(0, 3).map((b, i) => (
            <BadgeChip key={i} badge={b} />
          ))}
          {leader.badges.length > 3 && (
            <span
              style={{
                padding: "0.18rem 0.55rem",
                borderRadius: "999px",
                background: B.active,
                border: `1px solid ${B.border}`,
                fontSize: "0.67rem",
                fontWeight: 700,
                fontFamily: FONT,
                color: isFirst ? B.dark : B.muted,
              }}
            >
              +{leader.badges.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Table Row ────────────────────────────────── */
function TableRow({ leader, index }: { leader: Leader; index: number }) {
  return (
    <div
      className="lb-row lb-fade"
      style={{
        animationDelay: `${index * 35}ms`,
        display: "grid",
        gridTemplateColumns: "48px 1fr 100px 120px 80px",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.85rem 1.25rem",
        borderRadius: "0.875rem",
        border: `1px solid ${B.border}`,
        background: B.card,
        cursor: "default",
      }}
    >
      {/* Rank */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: "0.88rem",
            color: leader.rank <= 10 ? B.dark : B.muted,
          }}
        >
          #{leader.rank}
        </span>
      </div>

      {/* Name + branch */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.7rem",
          minWidth: 0,
        }}
      >
        <Avatar name={leader.name} size={34} />
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: "0.85rem",
              color: B.dark,
              margin: 0,
              letterSpacing: "-0.02em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {leader.name}
          </p>
          <p
            style={{
              fontFamily: FONT,
              fontSize: "0.7rem",
              fontWeight: 500,
              color: B.muted,
              margin: "0.1rem 0 0",
            }}
          >
            {leader.branch} · Year {leader.year}
          </p>
        </div>
      </div>

      {/* Points */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
          justifyContent: "flex-end",
        }}
      >
        <Zap size={11} color={B.muted} />
        <span
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: "0.88rem",
            color: B.dark,
          }}
        >
          {leader.points.toLocaleString()}
        </span>
      </div>

      {/* Badges */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
          justifyContent: "flex-end",
          flexWrap: "wrap",
        }}
      >
        {leader.badges.slice(0, 2).map((b, i) => (
          <span
            key={i}
            title={b.label}
            className="lb-badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0.2rem 0.4rem",
              borderRadius: "999px",
              background: B.active,
              border: `1px solid ${B.border}`,
              color: B.dark,
              fontSize: "0.65rem",
            }}
          >
            {b.icon}
          </span>
        ))}
        {leader.badges.length > 2 && (
          <span
            style={{
              fontSize: "0.65rem",
              fontWeight: 700,
              color: B.muted,
              fontFamily: FONT,
            }}
          >
            +{leader.badges.length - 2}
          </span>
        )}
        {leader.badges.length === 0 && (
          <span
            style={{ fontSize: "0.7rem", color: B.muted, fontFamily: FONT }}
          >
            —
          </span>
        )}
      </div>

      {/* Streak */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
          justifyContent: "flex-end",
        }}
      >
        <span
          style={{
            fontFamily: FONT,
            fontSize: "0.8rem",
            fontWeight: 700,
            color: B.muted,
          }}
        >
          🔥 {leader.streak}d
        </span>
      </div>
    </div>
  );
}

/* ─── Table Header ─────────────────────────────── */
function TableHeader() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "48px 1fr 100px 120px 80px",
        gap: "0.5rem",
        padding: "0.5rem 1.25rem",
      }}
    >
      {["Rank", "Student", "Points", "Badges", "Streak"].map((h, i) => (
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
  );
}

/* ─── Stat Pill ────────────────────────────────── */
function StatPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div
      style={{
        background: B.card,
        borderRadius: "1rem",
        border: `1px solid ${B.border}`,
        boxShadow: B.shadow,
        padding: "0.85rem 1.1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        flex: 1,
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "0.7rem",
          background: B.active,
          border: `1px solid ${B.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: B.dark,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            fontFamily: FONT,
            fontSize: "0.68rem",
            fontWeight: 600,
            color: B.muted,
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontFamily: FONT,
            fontSize: "1rem",
            fontWeight: 900,
            color: B.dark,
            margin: "0.1rem 0 0",
            letterSpacing: "-0.03em",
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* ─── Filter Tabs ──────────────────────────────── */
const FILTERS = ["All", "CSE", "IT", "ECE", "MECH"] as const;
type Filter = (typeof FILTERS)[number];

/* ─── Main Page ────────────────────────────────── */
export default function LeaderboardPage() {
  const [filter, setFilter] = useState<Filter>("All");

  const visible =
    filter === "All" ? DATA : DATA.filter((l) => l.branch === filter);

  const totalPoints = DATA.reduce((s, l) => s + l.points, 0);
  const totalBadges = DATA.reduce((s, l) => s + l.badges.length, 0);

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
        {/* ── Header ── */}
        <div
          className="lb-fade"
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
                fontSize: "1.3rem",
                fontWeight: 900,
                color: B.dark,
                letterSpacing: "-0.04em",
                margin: 0,
              }}
            >
              Leaderboard
            </h1>
            <p
              style={{
                fontSize: "0.8rem",
                color: B.muted,
                marginTop: "0.2rem",
              }}
            >
              Top contributors by points, badges & streaks
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              background: B.card,
              borderRadius: "999px",
              border: `1px solid ${B.border}`,
              padding: "0.2rem 0.3rem",
            }}
          >
            {FILTERS.map((f) => (
              <button
                key={f}
                className="lb-tab"
                onClick={() => setFilter(f)}
                style={{
                  padding: "0.38rem 0.9rem",
                  borderRadius: "999px",
                  border: "none",
                  background: filter === f ? B.dark : "none",
                  color: filter === f ? "#fff" : B.muted,
                  fontFamily: FONT,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ── Stats row ── */}
        <div
          className="lb-fade"
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            animationDelay: "40ms",
          }}
        >
          <StatPill
            icon={<Trophy size={16} />}
            label="Total Students"
            value={DATA.length}
          />
          <StatPill
            icon={<Zap size={16} />}
            label="Total Points"
            value={totalPoints.toLocaleString()}
          />
          <StatPill
            icon={<Award size={16} />}
            label="Badges Awarded"
            value={totalBadges}
          />
          <StatPill
            icon={<TrendingUp size={16} />}
            label="Top Score"
            value={DATA[0].points.toLocaleString()}
          />
        </div>

        {/* ── Podium (Top 3) ── */}
        {filter === "All" && (
          <div
            className="lb-fade"
            style={{
              display: "flex",
              gap: "0.85rem",
              alignItems: "flex-end",
              animationDelay: "70ms",
            }}
          >
            {/* Order: 2nd | 1st | 3rd */}
            {[DATA[1], DATA[0], DATA[2]].map((leader, i) => (
              <PodiumCard key={leader.id} leader={leader} delay={i * 60} />
            ))}
          </div>
        )}

        {/* ── Full Table ── */}
        <div
          className="lb-fade"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
            animationDelay: "110ms",
          }}
        >
          <div
            style={{
              background: B.card,
              borderRadius: "1.25rem",
              border: `1px solid ${B.border}`,
              boxShadow: B.shadow,
              overflow: "hidden",
            }}
          >
            {/* Table header bar */}
            <div
              style={{
                padding: "0.65rem 1.25rem",
                borderBottom: `1px solid ${B.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontFamily: FONT,
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  color: B.dark,
                }}
              >
                {filter === "All" ? "All Students" : `${filter} Branch`}
                <span
                  style={{
                    color: B.muted,
                    fontWeight: 500,
                    marginLeft: "0.4rem",
                  }}
                >
                  · {visible.length} students
                </span>
              </span>
              <Medal size={14} color={B.muted} />
            </div>

            {/* Column headers */}
            <TableHeader />

            {/* Rows */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
                padding: "0 0.75rem 0.75rem",
              }}
            >
              {visible.length === 0 && (
                <div style={{ padding: "2.5rem", textAlign: "center" }}>
                  <p
                    style={{
                      color: B.muted,
                      fontSize: "0.83rem",
                      fontFamily: FONT,
                    }}
                  >
                    No students found for this branch.
                  </p>
                </div>
              )}
              {visible.map((leader, idx) => (
                <TableRow key={leader.id} leader={leader} index={idx} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ height: "0.5rem" }} />
      </div>
    </>
  );
}
