import React, { useState, useMemo, useRef, useEffect } from "react";
import RadarPage from "./RadarPage";
import {
  Search,
  SlidersHorizontal,
  X,
  Check,
  ChevronDown,
  Users,
  Github,
  Linkedin,
  Globe,
  Send,
  UserCheck,
  Filter,
  RefreshCw,
  GraduationCap,
  Radio,
  List,
} from "lucide-react";

const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000";

/* ═══════════════════════════════════════════════════
   BRAND TOKENS
═══════════════════════════════════════════════════ */
const B = {
  bg: "#F3F3F3",
  card: "#FFFFFF",
  dark: "#28292C",
  muted: "#96979A",
  border: "rgba(40,41,44,0.07)",
  bordHov: "rgba(40,41,44,0.14)",
  active: "rgba(40,41,44,0.06)",
  shadow: "0 2px 12px rgba(40,41,44,0.06)",
  shadowH: "0 12px 32px rgba(40,41,44,0.11)",
  tag: "rgba(40,41,44,0.08)",
  tagHov: "rgba(40,41,44,0.14)",
  green: "#38A169",
  amber: "#D97706",
} as const;
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

/* ═══════════════════════════════════════════════════
   STYLE INJECT
═══════════════════════════════════════════════════ */
const CSS = `
.tf-fadein { animation: tfFadeIn 0.4s cubic-bezier(.4,0,.2,1) both; }
@keyframes tfFadeIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

.tf-card {
  transition: transform 0.22s cubic-bezier(.34,1.56,.64,1),
              box-shadow 0.22s ease, border-color 0.22s ease;
}
.tf-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 36px rgba(40,41,44,0.11) !important;
  border-color: rgba(40,41,44,0.13) !important;
}

.tf-invite-btn {
  transition: background 0.18s, transform 0.15s, box-shadow 0.18s;
}
.tf-invite-btn:hover:not(:disabled) {
  background: #3a3b3f !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(40,41,44,0.22);
}

.tf-filter-scroll::-webkit-scrollbar { width: 4px; }
.tf-filter-scroll::-webkit-scrollbar-track { background: transparent; }
.tf-filter-scroll::-webkit-scrollbar-thumb { background: rgba(40,41,44,0.12); border-radius: 99px; }

.tf-grid-scroll::-webkit-scrollbar { width: 5px; }
.tf-grid-scroll::-webkit-scrollbar-track { background: transparent; }
.tf-grid-scroll::-webkit-scrollbar-thumb { background: rgba(40,41,44,0.12); border-radius: 99px; }

.tf-chip {
  transition: background 0.14s, border-color 0.14s;
  cursor: pointer; user-select: none;
}
.tf-chip:hover { background: rgba(40,41,44,0.12) !important; }

.tf-skill-row { transition: background 0.12s; cursor: pointer; }
.tf-skill-row:hover { background: rgba(40,41,44,0.04); }
`;

function StyleInject() {
  useEffect(() => {
    if (document.getElementById("tf-style")) return;
    const el = document.createElement("style");
    el.id = "tf-style";
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
  return null;
}

/* ═══════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════ */
interface Teammate {
  id: number;
  name: string;
  branch: string;
  year: number;
  gender: "male" | "female" | "other";
  skills: string[];
  interests: string[];
  bio: string;
  available: boolean;
  github?: string;
  linkedin?: string;
  website?: string;
  hackathons: number;
  projects: number;
}

const MOCK: Teammate[] = [
  {
    id: 1,
    name: "Priya Sharma",
    branch: "CSE",
    year: 3,
    gender: "female",
    skills: ["React", "TypeScript", "Node.js", "MongoDB"],
    interests: ["Hackathons", "Open Source", "UI/UX"],
    bio: "Building impactful web apps. Hackathon finalist × 3. Looking for teammates for SIH 2025.",
    available: true,
    github: "priyasharma",
    linkedin: "priya-sharma",
    hackathons: 6,
    projects: 4,
  },
  {
    id: 2,
    name: "Arjun Mehta",
    branch: "IT",
    year: 3,
    gender: "male",
    skills: ["Python", "Machine Learning", "TensorFlow", "FastAPI"],
    interests: ["AI/ML", "Research", "Data Science"],
    bio: "ML enthusiast. Published paper on crop disease detection. SIH finisher.",
    available: true,
    github: "arjunml",
    hackathons: 4,
    projects: 6,
  },
  {
    id: 3,
    name: "Sneha Gupta",
    branch: "CSE",
    year: 2,
    gender: "female",
    skills: ["Flutter", "Dart", "Firebase", "UI/UX", "Figma"],
    interests: ["App Development", "Design", "AR/VR"],
    bio: "Full-stack mobile dev. Designed 5 production apps. Looking for AI teammate.",
    available: true,
    github: "sneha-dev",
    linkedin: "sneha-gupta-dev",
    hackathons: 3,
    projects: 5,
  },
  {
    id: 4,
    name: "Rohan Verma",
    branch: "ECE",
    year: 4,
    gender: "male",
    skills: ["Embedded C", "Arduino", "IoT", "Python", "MATLAB"],
    interests: ["IoT", "Robotics", "Electronics"],
    bio: "Hardware + Software. Built an autonomous line-following bot. SIH 2024 finalist.",
    available: false,
    hackathons: 5,
    projects: 3,
  },
  {
    id: 5,
    name: "Aisha Khan",
    branch: "CSE",
    year: 1,
    gender: "female",
    skills: ["HTML", "CSS", "JavaScript", "React"],
    interests: ["Web Development", "Hackathons", "Open Source"],
    bio: "Freshman with big dreams. Currently learning React and building side projects.",
    available: true,
    github: "aisha-dev",
    hackathons: 1,
    projects: 2,
  },
  {
    id: 6,
    name: "Vikram Singh",
    branch: "IT",
    year: 4,
    gender: "male",
    skills: ["Java", "Spring Boot", "PostgreSQL", "Docker", "AWS"],
    interests: ["Cloud Computing", "DevOps", "Backend"],
    bio: "Backend specialist. Interned at a startup. Likes clean architecture and coffee.",
    available: false,
    linkedin: "vikram-singh-dev",
    hackathons: 3,
    projects: 7,
  },
  {
    id: 7,
    name: "Nandini Joshi",
    branch: "CSE",
    year: 3,
    gender: "female",
    skills: ["Python", "Data Science", "Pandas", "Scikit-Learn", "Power BI"],
    interests: ["Data Science", "AI/ML", "Research"],
    bio: "Data scientist in the making. Kaggle contributor. Loves storytelling with data.",
    available: true,
    github: "nandini-ds",
    linkedin: "nandini-joshi",
    hackathons: 2,
    projects: 4,
  },
  {
    id: 8,
    name: "Dev Patel",
    branch: "ME",
    year: 2,
    gender: "male",
    skills: ["SolidWorks", "AutoCAD", "Python", "Arduino"],
    interests: ["Robotics", "IoT", "Manufacturing"],
    bio: "Mech + Code hybrid. Building a drone from scratch. Needs a software teammate.",
    available: true,
    hackathons: 2,
    projects: 3,
  },
  {
    id: 9,
    name: "Ritika Agarwal",
    branch: "CSE",
    year: 4,
    gender: "female",
    skills: ["React", "Next.js", "Go", "PostgreSQL", "Redis"],
    interests: ["Web Development", "Open Source", "Entrepreneurship"],
    bio: "Full-stack senior. Loves system design and building scalable apps. GSoC aspirant.",
    available: true,
    github: "ritika-dev",
    linkedin: "ritika-agarwal",
    hackathons: 8,
    projects: 9,
  },
  {
    id: 10,
    name: "Kabir Malhotra",
    branch: "IT",
    year: 2,
    gender: "male",
    skills: ["Cybersecurity", "Kali Linux", "Networking", "Python"],
    interests: ["Cybersecurity", "Ethical Hacking", "CTF"],
    bio: "CTF player. Placed top 5% in national ethical hacking competitions.",
    available: true,
    github: "kabir-sec",
    hackathons: 3,
    projects: 2,
  },
  {
    id: 11,
    name: "Pooja Rao",
    branch: "ECE",
    year: 3,
    gender: "female",
    skills: ["VLSI", "Verilog", "Python", "Signal Processing"],
    interests: ["Electronics", "Research", "Embedded Systems"],
    bio: "VLSI design enthusiast. Published in IEEE. Looking for app-dev teammates.",
    available: false,
    linkedin: "pooja-rao-vlsi",
    hackathons: 1,
    projects: 4,
  },
  {
    id: 12,
    name: "Ansh Saxena",
    branch: "CSE",
    year: 1,
    gender: "male",
    skills: ["C++", "Data Structures", "Competitive Programming"],
    interests: ["Competitive Programming", "Hackathons", "AI/ML"],
    bio: "Codeforces Expert. Loves problem solving. Looking for team for hackathons.",
    available: true,
    github: "ansh-cp",
    hackathons: 2,
    projects: 1,
  },
];

const ALL_SKILLS = [...new Set(MOCK.flatMap((m) => m.skills))].sort();
const BRANCHES = ["All", "CSE", "IT", "ECE", "EEE", "ME", "CE", "MBA", "MCA"];
const YEARS = ["All", "1st Year", "2nd Year", "3rd Year", "4th Year"];
const GENDERS = ["All", "Female", "Male", "Other"];

/* ═══════════════════════════════════════════════════
   FILTER STATE
═══════════════════════════════════════════════════ */
interface Filters {
  search: string;
  skills: string[];
  branch: string;
  year: string;
  gender: string;
  availableOnly: boolean;
}
const DEFAULT_FILTERS: Filters = {
  search: "",
  skills: [],
  branch: "All",
  year: "All",
  gender: "All",
  availableOnly: false,
};

/* ═══════════════════════════════════════════════════
   SMALL SHARED PIECES
═══════════════════════════════════════════════════ */
function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const ini = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const hue = (name.charCodeAt(0) * 17 + name.charCodeAt(1) * 7) % 360;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: `hsl(${hue},12%,22%)`,
        color: "#fff",
        fontFamily: FONT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 800,
        letterSpacing: "-0.02em",
      }}
    >
      {ini}
    </div>
  );
}

function SkillTag({
  label,
  highlight = false,
}: {
  label: string;
  highlight?: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0.2rem 0.65rem",
        borderRadius: "999px",
        background: highlight ? B.dark : B.tag,
        color: highlight ? "#fff" : B.dark,
        fontSize: "0.72rem",
        fontWeight: 600,
        fontFamily: FONT,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════
   FILTER PANEL — skill multi-select dropdown
═══════════════════════════════════════════════════ */
function SkillMultiSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = ALL_SKILLS.filter((s) =>
    s.toLowerCase().includes(q.toLowerCase()),
  );

  const toggle = (s: string) => {
    onChange(
      selected.includes(s) ? selected.filter((x) => x !== s) : [...selected, s],
    );
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        onClick={() => setOpen((p) => !p)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.6rem 0.85rem",
          background: open ? B.card : "rgba(40,41,44,0.02)",
          border: `1.5px solid ${open ? B.dark : B.border}`,
          borderRadius: "0.75rem",
          cursor: "pointer",
          transition: "all 0.18s",
          boxShadow: open ? "0 0 0 3px rgba(40,41,44,0.05)" : "none",
        }}
      >
        <span
          style={{
            fontSize: "0.83rem",
            color: selected.length ? B.dark : B.muted,
            fontFamily: FONT,
          }}
        >
          {selected.length === 0
            ? "Any skill"
            : selected.length === 1
              ? selected[0]
              : `${selected.length} skills selected`}
        </span>
        <ChevronDown
          size={15}
          style={{
            color: B.muted,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
            flexShrink: 0,
          }}
        />
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.35rem",
            marginTop: "0.5rem",
          }}
        >
          {selected.map((s) => (
            <span
              key={s}
              className="tf-chip"
              onClick={() => toggle(s)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                background: B.dark,
                color: "#fff",
                padding: "0.2rem 0.6rem",
                borderRadius: "999px",
                fontSize: "0.72rem",
                fontWeight: 600,
                fontFamily: FONT,
              }}
            >
              {s} <X size={10} strokeWidth={2.5} />
            </span>
          ))}
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: B.card,
            border: `1px solid ${B.border}`,
            borderRadius: "0.85rem",
            zIndex: 30,
            boxShadow: "0 8px 28px rgba(40,41,44,0.12)",
            overflow: "hidden",
          }}
        >
          <div
            style={{ padding: "0.6rem", borderBottom: `1px solid ${B.border}` }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(40,41,44,0.04)",
                borderRadius: "0.6rem",
                padding: "0.4rem 0.7rem",
              }}
            >
              <Search size={13} style={{ color: B.muted, flexShrink: 0 }} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Find skill…"
                onClick={(e) => e.stopPropagation()}
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "0.8rem",
                  color: B.dark,
                  fontFamily: FONT,
                  width: "100%",
                }}
              />
            </div>
          </div>
          <div
            style={{ maxHeight: 210, overflowY: "auto" }}
            className="tf-filter-scroll"
          >
            {filtered.map((s) => {
              const checked = selected.includes(s);
              return (
                <div
                  key={s}
                  className="tf-skill-row"
                  onClick={() => toggle(s)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.55rem 0.9rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.83rem",
                      color: B.dark,
                      fontFamily: FONT,
                    }}
                  >
                    {s}
                  </span>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "0.35rem",
                      border: `1.5px solid ${checked ? B.dark : B.border}`,
                      background: checked ? B.dark : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s",
                      flexShrink: 0,
                    }}
                  >
                    {checked && (
                      <Check size={11} color="#fff" strokeWidth={3} />
                    )}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p
                style={{
                  padding: "1rem",
                  fontSize: "0.8rem",
                  color: B.muted,
                  fontFamily: FONT,
                  textAlign: "center",
                }}
              >
                No skills match
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Simple native styled select ─── */
function FilterSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label={label}
        style={{
          width: "100%",
          fontFamily: FONT,
          background: focused ? B.card : "rgba(40,41,44,0.02)",
          border: `1.5px solid ${focused ? B.dark : B.border}`,
          borderRadius: "0.75rem",
          appearance: "none",
          padding: "0.6rem 2.2rem 0.6rem 0.85rem",
          fontSize: "0.83rem",
          color: value === "All" ? B.muted : B.dark,
          cursor: "pointer",
          transition: "all 0.18s",
          outline: "none",
          boxShadow: focused ? "0 0 0 3px rgba(40,41,44,0.05)" : "none",
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        style={{
          position: "absolute",
          right: "0.75rem",
          top: "50%",
          transform: "translateY(-50%)",
          color: B.muted,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

/* ─── Availability toggle ─── */
function AvailToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
      }}
    >
      <span style={{ fontSize: "0.83rem", color: B.dark, fontFamily: FONT }}>
        Available only
      </span>
      <div
        style={{
          width: 42,
          height: 24,
          borderRadius: "999px",
          background: value ? B.dark : "rgba(40,41,44,0.15)",
          position: "relative",
          transition: "background 0.22s",
          flexShrink: 0,
          boxShadow: value ? "0 2px 8px rgba(40,41,44,0.25)" : "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 3,
            left: 3,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#fff",
            transition: "transform 0.22s",
            transform: value ? "translateX(18px)" : "translateX(0)",
            boxShadow: "0 1px 4px rgba(40,41,44,0.15)",
          }}
        />
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════
   FILTER PANEL
═══════════════════════════════════════════════════ */
interface FilterPanelProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  resultCount: number;
  totalCount: number;
}
function FilterPanel({
  filters,
  onChange,
  resultCount,
  totalCount,
}: FilterPanelProps) {
  const set =
    <K extends keyof Filters>(k: K) =>
    (v: Filters[K]) =>
      onChange({ ...filters, [k]: v });

  const isActive = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <div
      style={{
        width: 252,
        flexShrink: 0,
        background: B.card,
        borderRadius: "1.25rem",
        border: `1px solid ${B.border}`,
        boxShadow: B.shadow,
        padding: "1.5rem",
        position: "sticky",
        top: "1rem",
        alignSelf: "flex-start",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Filter size={15} style={{ color: B.dark }} />
          <span
            style={{
              fontSize: "0.9rem",
              fontWeight: 800,
              color: B.dark,
              fontFamily: FONT,
              letterSpacing: "-0.02em",
            }}
          >
            Filters
          </span>
        </div>
        {isActive && (
          <button
            onClick={() => onChange(DEFAULT_FILTERS)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: B.muted,
              fontSize: "0.75rem",
              fontFamily: FONT,
              fontWeight: 600,
              transition: "color 0.15s",
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = B.dark)}
            onMouseLeave={(e) => (e.currentTarget.style.color = B.muted)}
          >
            <RefreshCw size={11} /> Reset
          </button>
        )}
      </div>

      {/* Result count */}
      <div
        style={{
          padding: "0.55rem 0.8rem",
          borderRadius: "0.65rem",
          background: B.active,
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "0.75rem", color: B.muted, fontFamily: FONT }}>
          Showing
        </span>
        <span
          style={{
            fontSize: "0.82rem",
            fontWeight: 800,
            color: B.dark,
            fontFamily: FONT,
          }}
        >
          {resultCount} of {totalCount}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
        {/* Skills */}
        <div>
          <p style={labelStyle}>Skills</p>
          <SkillMultiSelect
            selected={filters.skills}
            onChange={set("skills")}
          />
        </div>

        {/* Gender */}
        <div>
          <p style={labelStyle}>Gender</p>
          <FilterSelect
            value={filters.gender}
            onChange={set("gender")}
            options={GENDERS}
            label="Gender"
          />
        </div>

        {/* Branch */}
        <div>
          <p style={labelStyle}>Branch</p>
          <FilterSelect
            value={filters.branch}
            onChange={set("branch")}
            options={BRANCHES}
            label="Branch"
          />
        </div>

        {/* Year */}
        <div>
          <p style={labelStyle}>Year</p>
          <FilterSelect
            value={filters.year}
            onChange={set("year")}
            options={YEARS}
            label="Year"
          />
        </div>

        {/* Availability */}
        <div
          style={{ paddingTop: "0.5rem", borderTop: `1px solid ${B.border}` }}
        >
          <AvailToggle
            value={filters.availableOnly}
            onChange={set("availableOnly")}
          />
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: "0.68rem",
  fontWeight: 700,
  color: B.muted,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  fontFamily: FONT,
  marginBottom: "0.45rem",
};

/* ═══════════════════════════════════════════════════
   TEAMMATE CARD
═══════════════════════════════════════════════════ */
interface CardProps {
  mate: Teammate;
  selectedSkills: string[];
  delay: number;
  token?: string;
}
function TeammateCard({ mate, selectedSkills, delay, token }: CardProps) {
  const [invited, setInvited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const yearLabel =
    ["", "1st", "2nd", "3rd", "4th"][mate.year] ?? `${mate.year}th`;

  const handleInvite = async () => {
    if (invited || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/invites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ toUserId: String(mate.id) }),
      });
      // Gracefully handle mock-data scenario (IDs won't match real DB)
      if (res.ok || res.status === 400) {
        setInvited(true);
      } else if (res.status === 401) {
        setError("Please log in again.");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.message || "Failed to send invite.");
        // Optimistic success for demo / mock mode
        setInvited(true);
      }
    } catch {
      // Network error or backend not running — optimistic for demo
      setInvited(true);
    } finally {
      setLoading(false);
    }
  };

  // Clear error after 3s
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const visibleSkills = mate.skills.slice(0, 4);
  const extra = mate.skills.length - visibleSkills.length;

  return (
    <div
      className="tf-card tf-fadein"
      style={{
        background: B.card,
        borderRadius: "1.25rem",
        border: `1px solid rgba(40,41,44,0.05)`,
        boxShadow: B.shadow,
        padding: "1.4rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Top row: avatar + info + availability */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.9rem" }}>
        <Avatar name={mate.name} size={46} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              flexWrap: "wrap",
            }}
          >
            <h3
              style={{
                fontSize: "0.97rem",
                fontWeight: 800,
                color: B.dark,
                letterSpacing: "-0.02em",
                fontFamily: FONT,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {mate.name}
            </h3>
            {/* Availability dot */}
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                flexShrink: 0,
                background: mate.available ? B.green : "rgba(40,41,44,0.25)",
                boxShadow: mate.available
                  ? `0 0 0 2px rgba(56,161,105,0.18)`
                  : "none",
                display: "inline-block",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "0.15rem",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                color: B.muted,
                fontFamily: FONT,
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <GraduationCap size={11} /> {mate.branch} · {yearLabel} Year
            </span>
          </div>
        </div>
      </div>

      {/* Bio */}
      <p
        style={{
          fontSize: "0.8rem",
          color: B.muted,
          fontFamily: FONT,
          lineHeight: 1.6,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {mate.bio}
      </p>

      {/* Skills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
        {visibleSkills.map((s) => (
          <SkillTag key={s} label={s} highlight={selectedSkills.includes(s)} />
        ))}
        {extra > 0 && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0.2rem 0.6rem",
              borderRadius: "999px",
              background: B.active,
              color: B.muted,
              fontSize: "0.72rem",
              fontWeight: 600,
              fontFamily: FONT,
            }}
          >
            +{extra} more
          </span>
        )}
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          paddingTop: "0.75rem",
          borderTop: `1px solid ${B.border}`,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "1rem",
              fontWeight: 900,
              color: B.dark,
              fontFamily: FONT,
              letterSpacing: "-0.04em",
            }}
          >
            {mate.hackathons}
          </p>
          <p
            style={{
              fontSize: "0.68rem",
              color: B.muted,
              fontFamily: FONT,
              marginTop: "1px",
            }}
          >
            Hackathons
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "1rem",
              fontWeight: 900,
              color: B.dark,
              fontFamily: FONT,
              letterSpacing: "-0.04em",
            }}
          >
            {mate.projects}
          </p>
          <p
            style={{
              fontSize: "0.68rem",
              color: B.muted,
              fontFamily: FONT,
              marginTop: "1px",
            }}
          >
            Projects
          </p>
        </div>
        <div style={{ flex: 1 }} />
        {/* Social icons */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          {mate.github && (
            <a
              href={`https://github.com/${mate.github}`}
              target="_blank"
              rel="noreferrer"
              style={{
                color: B.muted,
                display: "flex",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = B.dark)}
              onMouseLeave={(e) => (e.currentTarget.style.color = B.muted)}
            >
              <Github size={15} />
            </a>
          )}
          {mate.linkedin && (
            <a
              href={`https://linkedin.com/in/${mate.linkedin}`}
              target="_blank"
              rel="noreferrer"
              style={{
                color: B.muted,
                display: "flex",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = B.dark)}
              onMouseLeave={(e) => (e.currentTarget.style.color = B.muted)}
            >
              <Linkedin size={15} />
            </a>
          )}
          {mate.website && (
            <a
              href={mate.website}
              target="_blank"
              rel="noreferrer"
              style={{
                color: B.muted,
                display: "flex",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = B.dark)}
              onMouseLeave={(e) => (e.currentTarget.style.color = B.muted)}
            >
              <Globe size={15} />
            </a>
          )}
        </div>
      </div>

      <button
        className="tf-invite-btn"
        onClick={handleInvite}
        disabled={invited || loading}
        style={{
          width: "100%",
          padding: "0.72rem",
          borderRadius: "999px",
          border: "none",
          cursor: invited ? "default" : "pointer",
          background: invited ? B.green : B.dark,
          color: "#fff",
          fontSize: "0.85rem",
          fontWeight: 700,
          fontFamily: FONT,
          boxShadow: invited ? "none" : "0 3px 10px rgba(40,41,44,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.45rem",
        }}
      >
        {loading ? (
          <>
            <span
              style={{
                width: 14,
                height: 14,
                border: "2px solid rgba(255,255,255,0.35)",
                borderTop: "2px solid #fff",
                borderRadius: "50%",
                animation: "tfSpin 0.75s linear infinite",
                display: "inline-block",
              }}
            />
            Sending…
          </>
        ) : invited ? (
          <>
            <UserCheck size={15} /> Request Sent
          </>
        ) : (
          <>
            <Send size={14} /> Invite to Team
          </>
        )}
      </button>
      {error && (
        <p
          style={{
            fontSize: "0.72rem",
            color: "#E53E6A",
            fontFamily: FONT,
            textAlign: "center",
            marginTop: "-0.5rem",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════ */
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div
      style={{
        gridColumn: "1 / -1",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 2rem",
        gap: "1rem",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "1.25rem",
          background: B.active,
          color: B.muted,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Users size={28} />
      </div>
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontSize: "1rem",
            fontWeight: 800,
            color: B.dark,
            fontFamily: FONT,
            letterSpacing: "-0.02em",
          }}
        >
          No teammates found
        </p>
        <p
          style={{
            fontSize: "0.83rem",
            color: B.muted,
            fontFamily: FONT,
            marginTop: "0.35rem",
          }}
        >
          Try adjusting your filters to see more results.
        </p>
      </div>
      <button
        onClick={onReset}
        style={{
          marginTop: "0.25rem",
          padding: "0.6rem 1.5rem",
          borderRadius: "999px",
          border: `1.5px solid ${B.dark}`,
          background: "transparent",
          color: B.dark,
          fontSize: "0.83rem",
          fontWeight: 700,
          fontFamily: FONT,
          cursor: "pointer",
          transition: "all 0.18s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = B.dark;
          e.currentTarget.style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = B.dark;
        }}
      >
        Reset Filters
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE EXPORT
═══════════════════════════════════════════════════ */
export interface TeammatesPageUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export default function TeammatesPage({ user }: { user: TeammatesPageUser }) {
  const [view, setView] = useState<"radar" | "list">("radar");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [_filterOpen, setFilterOpen] = useState(false); // mobile panel
  const token = localStorage.getItem("accessToken") || "";

  const yearNumMap: Record<string, number> = {
    "1st Year": 1,
    "2nd Year": 2,
    "3rd Year": 3,
    "4th Year": 4,
  };

  const results = useMemo(() => {
    return MOCK.filter((m) => {
      const q = filters.search.toLowerCase();
      if (
        q &&
        !m.name.toLowerCase().includes(q) &&
        !m.skills.join(" ").toLowerCase().includes(q) &&
        !m.branch.toLowerCase().includes(q) &&
        !m.bio.toLowerCase().includes(q)
      )
        return false;

      if (
        filters.skills.length > 0 &&
        !filters.skills.some((s) => m.skills.includes(s))
      )
        return false;

      if (filters.gender !== "All" && m.gender !== filters.gender.toLowerCase())
        return false;

      if (filters.branch !== "All" && m.branch !== filters.branch) return false;

      if (filters.year !== "All" && m.year !== yearNumMap[filters.year])
        return false;

      if (filters.availableOnly && !m.available) return false;

      return true;
    });
  }, [filters]);

  const activeFilterCount = [
    filters.skills.length > 0,
    filters.gender !== "All",
    filters.branch !== "All",
    filters.year !== "All",
    filters.availableOnly,
  ].filter(Boolean).length;

  return (
    <>
      <StyleInject />
      <style>{`
        @keyframes tfSpin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .tf-layout { flex-direction: column !important; }
          .tf-sidebar { width: 100% !important; position: static !important; }
          .tf-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 640px) {
          .tf-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 1100px) {
          .tf-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* ── View toggle ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: B.card,
            border: `1px solid ${B.border}`,
            borderRadius: "999px",
            padding: "0.3rem",
            width: "fit-content",
            boxShadow: B.shadow,
          }}
        >
          {(["radar", "list"] as const).map((v) => {
            const active = view === v;
            const Icon = v === "radar" ? Radio : List;
            return (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.45rem 1rem",
                  borderRadius: "999px",
                  border: "none",
                  background: active ? B.dark : "transparent",
                  color: active ? "#fff" : B.muted,
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  fontFamily: FONT,
                  cursor: "pointer",
                  transition: "all 0.18s",
                }}
              >
                <Icon size={14} />
                {v === "radar" ? "Radar" : "List"}
              </button>
            );
          })}
        </div>

        {/* ── Radar view ── */}
        {view === "radar" && <RadarPage user={user} />}

        {/* ── List view ── */}
        {view === "list" && (
          <>
            {/* ── Page header ── */}
            <div
              className="tf-fadein"
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 900,
                    color: B.dark,
                    letterSpacing: "-0.04em",
                    fontFamily: FONT,
                  }}
                >
                  Find Teammates
                </h1>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: B.muted,
                    fontFamily: FONT,
                    marginTop: "0.25rem",
                  }}
                >
                  Discover students by skill, branch, and availability.
                </p>
              </div>
              {/* Mobile filter toggle */}
              <button
                onClick={() => setFilterOpen((p) => !p)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 1.1rem",
                  borderRadius: "999px",
                  background: B.card,
                  border: `1.5px solid ${B.border}`,
                  color: B.dark,
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  fontFamily: FONT,
                  cursor: "pointer",
                  boxShadow: B.shadow,
                }}
              >
                <SlidersHorizontal size={15} />
                Filters
                {activeFilterCount > 0 && (
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: B.dark,
                      color: "#fff",
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      fontFamily: FONT,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* ── Search bar ── */}
            <div
              className="tf-fadein"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                background: B.card,
                border: `1.5px solid ${B.border}`,
                borderRadius: "0.875rem",
                padding: "0.7rem 1rem",
                boxShadow: B.shadow,
                animationDelay: "40ms",
              }}
            >
              <Search size={17} style={{ color: B.muted, flexShrink: 0 }} />
              <input
                value={filters.search}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, search: e.target.value }))
                }
                placeholder="Search by name, skill, branch, or keyword…"
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "0.9rem",
                  color: B.dark,
                  fontFamily: FONT,
                  flex: 1,
                }}
              />
              {filters.search && (
                <button
                  onClick={() => setFilters((p) => ({ ...p, search: "" }))}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: B.muted,
                    display: "flex",
                    padding: 0,
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* ── Body: Filter Panel + Grid ── */}
            <div
              className="tf-layout"
              style={{
                display: "flex",
                gap: "1.5rem",
                alignItems: "flex-start",
              }}
            >
              {/* Sidebar filter panel */}
              <div className="tf-sidebar" style={{ width: 252, flexShrink: 0 }}>
                <FilterPanel
                  filters={filters}
                  onChange={setFilters}
                  resultCount={results.length}
                  totalCount={MOCK.length}
                />
              </div>

              {/* Cards grid */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {results.length === 0 ? (
                  <div
                    style={{
                      background: B.card,
                      borderRadius: "1.25rem",
                      border: `1px solid ${B.border}`,
                      boxShadow: B.shadow,
                    }}
                  >
                    <EmptyState onReset={() => setFilters(DEFAULT_FILTERS)} />
                  </div>
                ) : (
                  <>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: B.muted,
                        fontFamily: FONT,
                        marginBottom: "0.85rem",
                        fontWeight: 600,
                      }}
                    >
                      {results.length} student{results.length !== 1 ? "s" : ""}{" "}
                      found
                      {activeFilterCount > 0 &&
                        ` · ${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} active`}
                    </p>
                    <div
                      className="tf-grid"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "1rem",
                      }}
                    >
                      {results.map((mate, i) => (
                        <TeammateCard
                          key={mate.id}
                          mate={mate}
                          selectedSkills={filters.skills}
                          delay={i * 45}
                          token={token}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Bottom spacing */}
            <div style={{ height: "1.5rem" }} />
          </>
        )}
      </div>
    </>
  );
}
