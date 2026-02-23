import { useState, useMemo, useEffect, useCallback } from 'react';
import type { CSSProperties } from 'react';
import {
    Search, X, ChevronDown,
    CheckCircle2, Clock, AlertCircle, BarChart3,
    FileText, Star, Loader2, ChevronRight,
    Users, Filter,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════
   BRAND
═══════════════════════════════════════════════════ */
const B = {
    bg: '#F3F3F3',
    card: '#FFFFFF',
    dark: '#28292C',
    muted: '#96979A',
    border: 'rgba(40,41,44,0.07)',
    active: 'rgba(40,41,44,0.06)',
    shadow: '0 2px 12px rgba(40,41,44,0.06)',
    shadowH: '0 16px 48px rgba(40,41,44,0.15)',
    green: '#059669',
    amber: '#D97706',
    rose: '#DC2626',
} as const;
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

/* ═══════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════ */
const CSS = `
.jd-fadein { animation: jdFade 0.38s cubic-bezier(.4,0,.2,1) both; }
@keyframes jdFade { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
.jd-row { transition: background 0.15s; cursor: pointer; }
.jd-row:hover { background: rgba(40,41,44,0.025) !important; }
.jd-eval-btn { transition: background 0.15s, transform 0.12s; }
.jd-eval-btn:hover { background: #28292C !important; color: #fff !important; transform: translateY(-1px); }
.jd-submit-btn { transition: background 0.15s, transform 0.12s, box-shadow 0.15s; }
.jd-submit-btn:hover:not(:disabled) { background: #3a3b3f !important; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(40,41,44,0.22) !important; }
.jd-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.jd-overlay { animation: jdOverlay 0.22s ease both; }
@keyframes jdOverlay { from{opacity:0} to{opacity:1} }
.jd-modal { animation: jdModal 0.28s cubic-bezier(.34,1.3,.64,1) both; }
@keyframes jdModal { from{opacity:0;transform:scale(0.96) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
.jd-scroll::-webkit-scrollbar{width:4px}
.jd-scroll::-webkit-scrollbar-track{background:transparent}
.jd-scroll::-webkit-scrollbar-thumb{background:rgba(40,41,44,0.12);border-radius:99px}
.jd-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; border-radius: 99px; outline: none; cursor: pointer; }
.jd-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #28292C; cursor: pointer; box-shadow: 0 2px 8px rgba(40,41,44,0.22); transition: transform 0.12s; }
.jd-slider::-webkit-slider-thumb:hover { transform: scale(1.18); }
.jd-slider::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: #28292C; cursor: pointer; border: none; box-shadow: 0 2px 8px rgba(40,41,44,0.22); }
.jd-score-input { transition: border-color 0.15s, box-shadow 0.15s; }
.jd-score-input:focus { outline: none; border-color: #28292C !important; box-shadow: 0 0 0 3px rgba(40,41,44,0.07); }
.jd-stat-card { transition: transform 0.18s, box-shadow 0.18s; }
.jd-stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(40,41,44,0.09) !important; }
`;
function StyleInject() {
    useEffect(() => {
        if (document.getElementById('jd-style')) return;
        const el = document.createElement('style');
        el.id = 'jd-style'; el.textContent = CSS;
        document.head.appendChild(el);
        return () => el.remove();
    }, []);
    return null;
}

/* ═══════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════ */
type Category = 'AI / ML' | 'IoT' | 'App Dev' | 'Blockchain' | 'Cybersecurity' | 'HealthTech' | 'EdTech' | 'Sustainability';
type EvalStatus = 'Pending' | 'Evaluated' | 'In Progress';

interface RubricScores {
    innovation: number;
    technical: number;
    uiux: number;
    feasibility: number;
}
interface Evaluation {
    scores: RubricScores;
    total: number;
    comments: string;
    evaluatedAt: string;
}
interface Project {
    id: number;
    title: string;
    team: string;
    college: string;
    members: number;
    category: Category;
    hackathon: string;
    description: string;
    status: EvalStatus;
    evaluation?: Evaluation;
}

/* ═══════════════════════════════════════════════════
   RUBRIC CRITERIA CONFIG
═══════════════════════════════════════════════════ */
const RUBRIC: { key: keyof RubricScores; label: string; desc: string; color: string }[] = [
    {
        key: 'innovation',
        label: 'Innovation',
        desc: 'Originality, creativity, and novelty of the solution in the problem space.',
        color: '#7C3AED',
    },
    {
        key: 'technical',
        label: 'Technical Complexity',
        desc: 'Quality of implementation, architecture choices, and engineering depth.',
        color: '#0891B2',
    },
    {
        key: 'uiux',
        label: 'UI / UX Design',
        desc: 'User experience polish, accessibility, and visual interface quality.',
        color: '#2563EB',
    },
    {
        key: 'feasibility',
        label: 'Feasibility',
        desc: 'Real-world viability, scalability, and potential for deployment/impact.',
        color: '#059669',
    },
];

const MAX_PER = 25; // max per criterion

/* ═══════════════════════════════════════════════════
   CATEGORY CONFIG
═══════════════════════════════════════════════════ */
const CAT_CLR: Record<Category, { color: string; bg: string }> = {
    'AI / ML': { color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
    'IoT': { color: '#0891B2', bg: 'rgba(8,145,178,0.08)' },
    'App Dev': { color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
    'Blockchain': { color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
    'Cybersecurity': { color: '#DC2626', bg: 'rgba(220,38,38,0.07)' },
    'HealthTech': { color: '#059669', bg: 'rgba(5,150,105,0.08)' },
    'EdTech': { color: '#4F46E5', bg: 'rgba(79,70,229,0.08)' },
    'Sustainability': { color: '#16A34A', bg: 'rgba(22,163,74,0.08)' },
};

/* ═══════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════ */
const INITIAL_PROJECTS: Project[] = [
    {
        id: 1, title: 'CropSense AI', team: 'AgroTech Squad', college: 'IIT Delhi', members: 5, category: 'AI / ML', hackathon: 'SIH 2025', description: 'AI-powered crop disease detection using computer vision and drone imagery.',
        status: 'Evaluated',
        evaluation: { scores: { innovation: 23, technical: 22, uiux: 19, feasibility: 21 }, total: 85, comments: 'Excellent use of YOLOv8. Regional language support is commendable. Demo was polished.', evaluatedAt: '2026-02-22T09:14:00' },
    },
    {
        id: 2, title: 'MindSpace', team: 'InnovateBots', college: 'KIET GI', members: 5, category: 'HealthTech', hackathon: 'SIH 2025', description: 'Anonymous peer-support mental health platform with AI mood tracking.',
        status: 'Evaluated',
        evaluation: { scores: { innovation: 20, technical: 18, uiux: 22, feasibility: 17 }, total: 77, comments: 'UI is very clean. Therapist matching algorithm needs more detail in the pitch.', evaluatedAt: '2026-02-22T10:30:00' },
    },
    {
        id: 3, title: 'SupplyLedger', team: 'BlockBuilders', college: 'NIT Trichy', members: 4, category: 'Blockchain', hackathon: 'Hack4Change 2025', description: 'Transparent pharmaceutical supply chain on Ethereum/Polygon L2.',
        status: 'Pending',
    },
    {
        id: 4, title: 'NaviAR Indoor', team: 'SpaceWalkers', college: 'VIT Vellore', members: 6, category: 'App Dev', hackathon: 'HackVIT 2025', description: 'AR-based indoor navigation using Bluetooth beacons and ARCore.',
        status: 'In Progress',
    },
    {
        id: 5, title: 'EduBridge', team: 'LearnLab', college: 'BITS Pilani', members: 5, category: 'EdTech', hackathon: 'SIH 2025', description: 'Adaptive offline-first learning platform for rural students in 12 languages.',
        status: 'Pending',
    },
    {
        id: 6, title: 'SmartGrid Monitor', team: 'CurrentFlow', college: 'IIT Bombay', members: 4, category: 'IoT', hackathon: 'Hackathon India 2025', description: 'Real-time electricity grid fault detection using IoT sensors and ML.',
        status: 'Pending',
    },
    {
        id: 7, title: 'VaultScan', team: 'CipherCrew', college: 'IIIT Hyderabad', members: 3, category: 'Cybersecurity', hackathon: 'CyberStrike 2024', description: 'Automated API vulnerability scanner with OWASP Top-10 coverage.',
        status: 'Evaluated',
        evaluation: { scores: { innovation: 21, technical: 24, uiux: 16, feasibility: 20 }, total: 81, comments: 'Technically impressive. CVSS scoring is thorough. UI could be more intuitive for less technical users.', evaluatedAt: '2026-02-22T14:05:00' },
    },
    {
        id: 8, title: 'FoodLoop', team: 'ZeroWaste', college: 'Jadavpur University', members: 5, category: 'Sustainability', hackathon: 'GreenHack 2025', description: 'Food surplus redistribution connecting restaurants, households, and NGOs.',
        status: 'In Progress',
    },
    {
        id: 9, title: 'DiagnoAI', team: 'MedMatrix', college: 'AIIMS Delhi', members: 6, category: 'HealthTech', hackathon: 'HealthHack 2025', description: 'Chest X-ray AI diagnostic assistant detecting 14 lung conditions (96.2% accuracy).',
        status: 'Pending',
    },
    {
        id: 10, title: 'TrafficBrain', team: 'Signal Squad', college: 'DTU Delhi', members: 4, category: 'IoT', hackathon: 'SIH 2025', description: 'Adaptive traffic signal control using computer vision and deep RL.',
        status: 'Pending',
    },
    {
        id: 11, title: 'LegalEase', team: 'JusticeTech', college: 'NLSIU Bangalore', members: 5, category: 'AI / ML', hackathon: 'HackForJustice 2025', description: 'LLM-powered legal aid chatbot for Indian law in 10 regional languages.',
        status: 'Pending',
    },
    {
        id: 12, title: 'AquaNet', team: 'BlueWave', college: 'IIT Madras', members: 4, category: 'Sustainability', hackathon: 'ClimaTech 2025', description: 'Smart water quality monitoring with 50 IoT buoys — real-time pollution alerts.',
        status: 'Pending',
    },
];

/* ═══════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════ */
function scoreColor(score: number, max = 100): string {
    const pct = score / max;
    if (pct >= 0.80) return B.green;
    if (pct >= 0.60) return B.amber;
    return B.rose;
}
function initials(name: string) {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
function namehue(name: string) {
    return (name.charCodeAt(0) * 17 + (name.charCodeAt(1) ?? 5) * 7) % 360;
}
function Avatar({ name, size = 32 }: { name: string; size?: number }) {
    const hue = namehue(name);
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%', flexShrink: 0,
            background: `hsl(${hue},14%,22%)`, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.34, fontWeight: 800, fontFamily: FONT,
        }}>{initials(name)}</div>
    );
}

/* ═══════════════════════════════════════════════════
   STATUS BADGE
═══════════════════════════════════════════════════ */
function StatusBadge({ status }: { status: EvalStatus }) {
    const cfg = {
        Pending: { icon: <Clock size={11} />, color: B.amber, bg: 'rgba(217,119,6,0.08)', label: 'Pending' },
        Evaluated: { icon: <CheckCircle2 size={11} />, color: B.green, bg: 'rgba(5,150,105,0.08)', label: 'Evaluated' },
        'In Progress': { icon: <AlertCircle size={11} />, color: '#2563EB', bg: 'rgba(37,99,235,0.08)', label: 'In Progress' },
    }[status];
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.22rem 0.65rem', borderRadius: '999px',
            background: cfg.bg, color: cfg.color,
            fontSize: '0.7rem', fontWeight: 700, fontFamily: FONT,
        }}>
            {cfg.icon} {cfg.label}
        </span>
    );
}

/* ═══════════════════════════════════════════════════
   STAT CARD
═══════════════════════════════════════════════════ */
function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
    return (
        <div className="jd-stat-card jd-fadein" style={{
            background: B.card, border: `1px solid ${B.border}`,
            borderRadius: '1.125rem', boxShadow: B.shadow,
            padding: '1.1rem 1.25rem', flex: 1, minWidth: 0,
        }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: B.muted, fontFamily: FONT, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {label}
            </p>
            <p style={{ fontSize: '1.85rem', fontWeight: 900, color: color ?? B.dark, fontFamily: FONT, letterSpacing: '-0.05em', lineHeight: 1.1, marginTop: '0.3rem' }}>
                {value}
            </p>
            {sub && (
                <p style={{ fontSize: '0.7rem', color: B.muted, fontFamily: FONT, marginTop: '0.2rem' }}>{sub}</p>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   RUBRIC SLIDER ROW
═══════════════════════════════════════════════════ */
function RubricRow({
    criterion, score, onChange, isReadonly
}: {
    criterion: typeof RUBRIC[0]; score: number; onChange?: (v: number) => void; isReadonly?: boolean;
}) {
    const pct = (score / MAX_PER) * 100;
    const trackBg = `linear-gradient(90deg, ${criterion.color} ${pct}%, rgba(40,41,44,0.08) ${pct}%)`;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {/* Label row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <p style={{ fontSize: '0.83rem', fontWeight: 800, color: B.dark, fontFamily: FONT }}>{criterion.label}</p>
                    <p style={{ fontSize: '0.7rem', color: B.muted, fontFamily: FONT, marginTop: '0.1rem', lineHeight: 1.4 }}>
                        {criterion.desc}
                    </p>
                </div>
                {/* Score input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0, marginLeft: '1rem' }}>
                    <input
                        className="jd-score-input"
                        type="number"
                        min={0} max={MAX_PER}
                        value={score}
                        readOnly={isReadonly}
                        onChange={e => {
                            if (!onChange) return;
                            const v = Math.min(MAX_PER, Math.max(0, parseInt(e.target.value) || 0));
                            onChange(v);
                        }}
                        style={{
                            width: 52, padding: '0.38rem 0.5rem',
                            border: `1.5px solid ${B.border}`,
                            borderRadius: '0.6rem', textAlign: 'center',
                            fontFamily: FONT, fontSize: '0.92rem', fontWeight: 800,
                            color: criterion.color, background: B.card,
                            MozAppearance: 'textfield',
                        } as CSSProperties}
                    />
                    <span style={{ fontSize: '0.72rem', color: B.muted, fontFamily: FONT, fontWeight: 600 }}>
                        / {MAX_PER}
                    </span>
                </div>
            </div>

            {/* Slider */}
            {!isReadonly && (
                <input
                    className="jd-slider"
                    type="range" min={0} max={MAX_PER} value={score}
                    onChange={e => onChange?.(parseInt(e.target.value))}
                    style={{ background: trackBg }}
                />
            )}

            {/* Readonly progress bar */}
            {isReadonly && (
                <div style={{ height: 6, borderRadius: 99, background: 'rgba(40,41,44,0.07)' }}>
                    <div style={{
                        height: '100%', borderRadius: 99,
                        width: `${pct}%`,
                        background: criterion.color,
                        transition: 'width 0.5s ease',
                    }} />
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   EVALUATION MODAL
═══════════════════════════════════════════════════ */
interface EvalModalProps {
    project: Project;
    onClose: () => void;
    onSave: (id: number, ev: Evaluation) => void;
}
function EvalModal({ project: p, onClose, onSave }: EvalModalProps) {
    const [scores, setScores] = useState<RubricScores>(
        p.evaluation?.scores ?? { innovation: 0, technical: 0, uiux: 0, feasibility: 0 }
    );
    const [comments, setComments] = useState(p.evaluation?.comments ?? '');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const total = scores.innovation + scores.technical + scores.uiux + scores.feasibility;

    const setScore = useCallback((key: keyof RubricScores, v: number) => {
        setScores(prev => ({ ...prev, [key]: v }));
    }, []);

    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', h);
        return () => document.removeEventListener('keydown', h);
    }, [onClose]);

    const handleSubmit = async () => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 1500));
        const ev: Evaluation = {
            scores, total,
            comments,
            evaluatedAt: new Date().toISOString(),
        };
        onSave(p.id, ev);
        setLoading(false);
        setDone(true);
    };

    const cat = CAT_CLR[p.category];

    return (
        <div
            className="jd-overlay"
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 900,
                background: 'rgba(20,20,24,0.5)', backdropFilter: 'blur(5px)',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                padding: '2.5vh 1rem',
                overflowY: 'auto',
            }}
        >
            <div
                className="jd-modal jd-scroll"
                onClick={e => e.stopPropagation()}
                style={{
                    background: B.card, borderRadius: '1.5rem',
                    width: '100%', maxWidth: 560,
                    boxShadow: B.shadowH,
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden',
                    margin: 'auto',
                }}
            >
                {/* ── Modal Header ── */}
                <div style={{
                    background: `linear-gradient(135deg, ${cat.color}12, ${cat.color}03)`,
                    borderBottom: `1px solid ${B.border}`,
                    padding: '1.5rem',
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{
                                padding: '0.2rem 0.65rem', borderRadius: '999px',
                                background: cat.bg, color: cat.color,
                                fontSize: '0.7rem', fontWeight: 700, fontFamily: FONT,
                            }}>{p.category}</span>
                            <StatusBadge status={done ? 'Evaluated' : p.status} />
                        </div>
                        <button onClick={onClose} style={{
                            width: 30, height: 30, borderRadius: '50%', border: 'none',
                            background: B.active, cursor: 'pointer', color: B.muted,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}><X size={14} /></button>
                    </div>

                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: B.dark, fontFamily: FONT, letterSpacing: '-0.04em', marginBottom: '0.3rem' }}>
                        {p.title}
                    </h2>
                    <p style={{ fontSize: '0.78rem', color: B.muted, fontFamily: FONT, lineHeight: 1.55 }}>
                        {p.description}
                    </p>

                    {/* Team info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.85rem' }}>
                        <Avatar name={p.team} size={26} />
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: B.dark, fontFamily: FONT }}>{p.team}</span>
                        <span style={{ fontSize: '0.72rem', color: B.muted, fontFamily: FONT }}>· {p.college}</span>
                        <span style={{ fontSize: '0.72rem', color: B.muted, fontFamily: FONT }}>· {p.members} members</span>
                    </div>
                </div>

                {/* ── Success State ── */}
                {done ? (
                    <div style={{
                        padding: '3rem 2rem', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: '1rem', textAlign: 'center',
                    }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: '50%',
                            background: 'rgba(5,150,105,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            animation: 'jdFade 0.4s ease both',
                        }}>
                            <CheckCircle2 size={36} style={{ color: B.green }} />
                        </div>
                        <div>
                            <p style={{ fontSize: '1.1rem', fontWeight: 900, color: B.dark, fontFamily: FONT, letterSpacing: '-0.03em' }}>
                                Evaluation Submitted!
                            </p>
                            <p style={{ fontSize: '0.8rem', color: B.muted, fontFamily: FONT, marginTop: '0.3rem' }}>
                                Total Score: <strong style={{ color: scoreColor(total), fontSize: '1rem' }}>{total}/100</strong>
                            </p>
                        </div>
                        {/* Score breakdown (readonly) */}
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                            {RUBRIC.map(c => (
                                <RubricRow key={c.key} criterion={c} score={scores[c.key]} isReadonly />
                            ))}
                        </div>
                        <button onClick={onClose} style={{
                            marginTop: '0.5rem',
                            padding: '0.7rem 2rem', borderRadius: '999px',
                            border: 'none', background: B.dark, color: '#fff',
                            fontSize: '0.85rem', fontWeight: 700, fontFamily: FONT,
                            cursor: 'pointer', boxShadow: '0 4px 14px rgba(40,41,44,0.2)',
                        }}>Done</button>
                    </div>
                ) : (

                    /* ── Rubric Form ── */
                    <>
                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>

                            {/* Section label */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Star size={14} style={{ color: B.muted }} />
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: B.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: FONT }}>
                                    Evaluation Rubric — Score each criterion out of {MAX_PER}
                                </span>
                            </div>

                            {/* Criteria */}
                            {RUBRIC.map((c, i) => (
                                <div key={c.key}>
                                    <RubricRow
                                        criterion={c}
                                        score={scores[c.key]}
                                        onChange={v => setScore(c.key, v)}
                                    />
                                    {i < RUBRIC.length - 1 && (
                                        <div style={{ height: 1, background: B.border, marginTop: '1.4rem' }} />
                                    )}
                                </div>
                            ))}

                            {/* Total */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '1.1rem 1.25rem', borderRadius: '1rem',
                                background: B.active, border: `1px solid ${B.border}`,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <BarChart3 size={16} style={{ color: B.dark }} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: B.dark, fontFamily: FONT }}>Total Score</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                                    <span style={{
                                        fontSize: '2rem', fontWeight: 900, fontFamily: FONT,
                                        color: scoreColor(total), letterSpacing: '-0.05em', lineHeight: 1,
                                    }}>{total}</span>
                                    <span style={{ fontSize: '0.9rem', color: B.muted, fontFamily: FONT, fontWeight: 600 }}>/100</span>
                                </div>
                            </div>

                            {/* Score bar */}
                            <div style={{ height: 6, borderRadius: 99, background: 'rgba(40,41,44,0.07)', marginTop: '-1rem' }}>
                                <div style={{
                                    height: '100%', borderRadius: 99,
                                    width: `${total}%`,
                                    background: scoreColor(total),
                                    transition: 'width 0.3s ease',
                                }} />
                            </div>

                            {/* Comments */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: B.dark, fontFamily: FONT }}>
                                    Remarks / Comments
                                </label>
                                <textarea
                                    value={comments}
                                    onChange={e => setComments(e.target.value)}
                                    rows={3}
                                    placeholder="Add notes, observations, or feedback for the team…"
                                    style={{
                                        width: '100%', padding: '0.8rem 1rem',
                                        borderRadius: '0.875rem', border: `1.5px solid ${B.border}`,
                                        background: 'rgba(40,41,44,0.015)',
                                        fontFamily: FONT, fontSize: '0.82rem', color: B.dark,
                                        resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box',
                                        outline: 'none', transition: 'border-color 0.15s',
                                    } as React.CSSProperties}
                                    onFocus={e => (e.target.style.borderColor = B.dark)}
                                    onBlur={e => (e.target.style.borderColor = B.border)}
                                />
                            </div>
                        </div>

                        {/* ── Footer ── */}
                        <div style={{
                            padding: '1.1rem 1.5rem',
                            borderTop: `1px solid ${B.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            gap: '0.75rem',
                        }}>
                            <p style={{ fontSize: '0.72rem', color: B.muted, fontFamily: FONT }}>
                                {total === 0 ? 'Score all criteria to submit.' : `${total}/100 pts · ${total >= 80 ? 'Excellent' : total >= 60 ? 'Good' : 'Needs Improvement'}`}
                            </p>
                            <div style={{ display: 'flex', gap: '0.6rem' }}>
                                <button onClick={onClose} style={{
                                    padding: '0.65rem 1.2rem', borderRadius: '999px',
                                    border: `1.5px solid ${B.border}`, background: 'none',
                                    color: B.dark, fontSize: '0.82rem', fontWeight: 700, fontFamily: FONT,
                                    cursor: 'pointer',
                                }}>Cancel</button>

                                <button
                                    className="jd-submit-btn"
                                    disabled={total === 0 || loading}
                                    onClick={handleSubmit}
                                    style={{
                                        padding: '0.65rem 1.4rem', borderRadius: '999px',
                                        border: 'none', background: B.dark, color: '#fff',
                                        fontSize: '0.82rem', fontWeight: 700, fontFamily: FONT,
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                                        boxShadow: '0 4px 14px rgba(40,41,44,0.18)',
                                        minWidth: 120, justifyContent: 'center',
                                    }}
                                >
                                    {loading
                                        ? <><Loader2 size={14} style={{ animation: 'spin 0.9s linear infinite' }} /> Submitting…</>
                                        : <><CheckCircle2 size={14} /> Submit Score</>
                                    }
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   PROJECT ROW
═══════════════════════════════════════════════════ */
function ProjectRow({ project: p, rank, onEval }: { project: Project; rank: number; onEval: () => void }) {
    const cat = CAT_CLR[p.category];
    return (
        <tr
            className="jd-row"
            onClick={onEval}
            style={{ background: 'transparent', borderBottom: `1px solid ${B.border}` }}
        >
            {/* Rank */}
            <td style={{ padding: '0.9rem 1rem 0.9rem 1.25rem', width: 40 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: B.muted, fontFamily: FONT }}>{rank}</span>
            </td>

            {/* Project */}
            <td style={{ padding: '0.9rem 0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Avatar name={p.team} size={34} />
                    <div>
                        <p style={{ fontSize: '0.85rem', fontWeight: 800, color: B.dark, fontFamily: FONT, lineHeight: 1.2 }}>
                            {p.title}
                        </p>
                        <p style={{ fontSize: '0.7rem', color: B.muted, fontFamily: FONT, marginTop: '0.1rem' }}>
                            {p.team} · {p.college}
                        </p>
                    </div>
                </div>
            </td>

            {/* Category */}
            <td style={{ padding: '0.9rem 0.75rem' }}>
                <span style={{
                    padding: '0.2rem 0.6rem', borderRadius: '999px',
                    background: cat.bg, color: cat.color,
                    fontSize: '0.68rem', fontWeight: 700, fontFamily: FONT,
                    whiteSpace: 'nowrap',
                }}>{p.category}</span>
            </td>

            {/* Members */}
            <td style={{ padding: '0.9rem 0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: B.muted, fontFamily: FONT }}>
                    <Users size={12} /> {p.members}
                </span>
            </td>

            {/* Status */}
            <td style={{ padding: '0.9rem 0.75rem' }}>
                <StatusBadge status={p.status} />
            </td>

            {/* Score */}
            <td style={{ padding: '0.9rem 0.75rem' }}>
                {p.evaluation ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{
                            fontSize: '1.05rem', fontWeight: 900, fontFamily: FONT,
                            color: scoreColor(p.evaluation.total), letterSpacing: '-0.04em',
                        }}>{p.evaluation.total}</span>
                        <span style={{ fontSize: '0.68rem', color: B.muted, fontFamily: FONT }}>/100</span>
                    </div>
                ) : (
                    <span style={{ fontSize: '0.75rem', color: B.muted, fontFamily: FONT }}>—</span>
                )}
            </td>

            {/* Action */}
            <td style={{ padding: '0.9rem 1.25rem 0.9rem 0.75rem' }}>
                <button
                    className="jd-eval-btn"
                    onClick={e => { e.stopPropagation(); onEval(); }}
                    style={{
                        padding: '0.4rem 1rem', borderRadius: '999px',
                        border: `1.5px solid ${B.border}`,
                        background: p.status === 'Evaluated' ? B.dark : 'none',
                        color: p.status === 'Evaluated' ? '#fff' : B.dark,
                        fontSize: '0.75rem', fontWeight: 700, fontFamily: FONT,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {p.status === 'Evaluated' ? 'Re-evaluate' : 'Evaluate'} <ChevronRight size={12} />
                </button>
            </td>
        </tr>
    );
}

/* ═══════════════════════════════════════════════════
   MAIN JUDGE DASHBOARD
═══════════════════════════════════════════════════ */
const STATUS_OPTS = ['All', 'Pending', 'In Progress', 'Evaluated'];
const CAT_OPTS = ['All', 'AI / ML', 'IoT', 'App Dev', 'Blockchain', 'Cybersecurity', 'HealthTech', 'EdTech', 'Sustainability'];

export default function JudgeDashboard() {
    const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
    const [search, setSearch] = useState('');
    const [statusF, setStatusF] = useState('All');
    const [catF, setCatF] = useState('All');
    const [selected, setSelected] = useState<Project | null>(null);

    const handleSave = (id: number, ev: Evaluation) => {
        setProjects(prev => prev.map(p =>
            p.id === id ? { ...p, status: 'Evaluated', evaluation: ev } : p
        ));
    };

    /* Stats */
    const evaluated = projects.filter(p => p.status === 'Evaluated');
    const pending = projects.filter(p => p.status === 'Pending');
    const inProgress = projects.filter(p => p.status === 'In Progress');
    const avgScore = evaluated.length
        ? Math.round(evaluated.reduce((s, p) => s + (p.evaluation?.total ?? 0), 0) / evaluated.length)
        : null;

    /* Filtered list */
    const filtered = useMemo(() => {
        return projects.filter(p => {
            if (statusF !== 'All' && p.status !== statusF) return false;
            if (catF !== 'All' && p.category !== catF) return false;
            if (search) {
                const q = search.toLowerCase();
                return p.title.toLowerCase().includes(q) || p.team.toLowerCase().includes(q) || p.college.toLowerCase().includes(q);
            }
            return true;
        });
    }, [projects, statusF, catF, search]);

    return (
        <>
            <StyleInject />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* ── Page heading ── */}
                <div className="jd-fadein">
                    <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: B.dark, letterSpacing: '-0.04em', fontFamily: FONT }}>
                        Judge Dashboard
                    </h1>
                    <p style={{ fontSize: '0.82rem', color: B.muted, fontFamily: FONT, marginTop: '0.25rem' }}>
                        Smart India Hackathon 2025 · Evaluate and score project submissions.
                    </p>
                </div>

                {/* ── Stats row ── */}
                <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                    <StatCard label="Total Projects" value={projects.length} sub="assigned to you" />
                    <StatCard label="Evaluated" value={evaluated.length} sub={`${Math.round((evaluated.length / projects.length) * 100)}% complete`} color={B.green} />
                    <StatCard label="Pending" value={pending.length} sub="awaiting review" color={B.amber} />
                    <StatCard label="In Progress" value={inProgress.length} sub="partially scored" color="#2563EB" />
                    <StatCard label="Avg Score" value={avgScore !== null ? `${avgScore}` : '—'} sub={avgScore !== null ? `out of 100` : 'no scores yet'} color={avgScore !== null ? scoreColor(avgScore) : B.muted} />
                </div>

                {/* ── Progress bar ── */}
                <div className="jd-fadein" style={{
                    background: B.card, border: `1px solid ${B.border}`,
                    borderRadius: '1rem', padding: '1rem 1.25rem',
                    boxShadow: B.shadow, animationDelay: '60ms',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.55rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: B.dark, fontFamily: FONT }}>
                            Evaluation Progress
                        </span>
                        <span style={{ fontSize: '0.75rem', color: B.muted, fontFamily: FONT }}>
                            {evaluated.length} / {projects.length} evaluated
                        </span>
                    </div>
                    <div style={{ height: 8, borderRadius: 99, background: 'rgba(40,41,44,0.07)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{
                            position: 'absolute', left: 0, top: 0, bottom: 0,
                            width: `${(evaluated.length / projects.length) * 100}%`,
                            background: B.green, borderRadius: 99,
                            transition: 'width 0.5s ease',
                        }} />
                    </div>
                </div>

                {/* ── Search + Filter bar ── */}
                <div className="jd-fadein" style={{
                    background: B.card, border: `1px solid ${B.border}`,
                    borderRadius: '1.125rem', boxShadow: B.shadow,
                    padding: '0.85rem 1.25rem',
                    display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap',
                    animationDelay: '80ms',
                }}>
                    {/* Search */}
                    <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                        <Search size={14} style={{
                            position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)',
                            color: B.muted, pointerEvents: 'none',
                        }} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by title, team or college…"
                            style={{
                                width: '100%', padding: '0.55rem 0.85rem 0.55rem 2.3rem',
                                borderRadius: '0.75rem', border: `1.5px solid ${B.border}`,
                                background: B.bg, fontFamily: FONT, fontSize: '0.82rem',
                                color: B.dark, outline: 'none', boxSizing: 'border-box',
                                transition: 'border-color 0.15s',
                            } as React.CSSProperties}
                            onFocus={e => (e.target.style.borderColor = B.dark)}
                            onBlur={e => (e.target.style.borderColor = B.border)}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} style={{
                                position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', cursor: 'pointer', color: B.muted,
                                display: 'flex', padding: 0,
                            }}><X size={13} /></button>
                        )}
                    </div>

                    {/* Filters */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, color: B.muted, fontSize: '0.78rem', fontFamily: FONT }}>
                        <Filter size={13} />
                    </div>
                    {[
                        { label: 'Status', value: statusF, opts: STATUS_OPTS, set: setStatusF },
                        { label: 'Category', value: catF, opts: CAT_OPTS, set: setCatF },
                    ].map(({ label, value, opts, set }) => (
                        <div key={label} style={{ position: 'relative' }}>
                            <select
                                value={value}
                                onChange={e => set(e.target.value)}
                                style={{
                                    appearance: 'none', WebkitAppearance: 'none',
                                    padding: '0.5rem 2rem 0.5rem 0.85rem',
                                    borderRadius: '999px', border: `1.5px solid ${value !== 'All' ? B.dark : B.border}`,
                                    background: value !== 'All' ? B.dark : B.card,
                                    color: value !== 'All' ? '#fff' : B.dark,
                                    fontSize: '0.78rem', fontWeight: 600, fontFamily: FONT,
                                    cursor: 'pointer',
                                }}
                            >
                                {opts.map(o => <option key={o} value={o}>{o === 'All' ? `${label}: All` : o}</option>)}
                            </select>
                            <ChevronDown size={12} style={{
                                position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)',
                                pointerEvents: 'none', color: value !== 'All' ? 'rgba(255,255,255,0.7)' : B.muted,
                            }} />
                        </div>
                    ))}

                    {/* Count */}
                    <span style={{
                        fontSize: '0.75rem', color: B.muted, fontFamily: FONT,
                        background: B.active, padding: '0.3rem 0.75rem',
                        borderRadius: '999px', fontWeight: 600, marginLeft: 'auto',
                    }}>{filtered.length} / {projects.length}</span>
                </div>

                {/* ── Projects Table ── */}
                <div className="jd-fadein" style={{
                    background: B.card, border: `1px solid ${B.border}`,
                    borderRadius: '1.25rem', boxShadow: B.shadow,
                    overflow: 'hidden', animationDelay: '100ms',
                }}>
                    <div style={{
                        padding: '0.85rem 1.25rem',
                        borderBottom: `1px solid ${B.border}`,
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                    }}>
                        <FileText size={14} style={{ color: B.muted }} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: B.dark, fontFamily: FONT }}>
                            Project Submissions
                        </span>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${B.border}` }}>
                                    {['#', 'Project / Team', 'Category', 'Members', 'Status', 'Score', 'Action'].map((h, i) => (
                                        <th key={h} style={{
                                            padding: `0.65rem ${i === 0 ? '1rem 0.65rem 1.25rem' : i === 6 ? '0.65rem 1.25rem 0.65rem 0.75rem' : '0.65rem 0.75rem'}`,
                                            textAlign: 'left',
                                            fontSize: '0.68rem', fontWeight: 700, color: B.muted,
                                            fontFamily: FONT, letterSpacing: '0.07em', textTransform: 'uppercase',
                                            whiteSpace: 'nowrap',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: B.muted, fontFamily: FONT, fontSize: '0.85rem' }}>
                                        No projects match current filters.
                                    </td></tr>
                                ) : (
                                    filtered.map((p, i) => (
                                        <ProjectRow
                                            key={p.id}
                                            project={p}
                                            rank={i + 1}
                                            onEval={() => setSelected(p)}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Evaluated scoreboard */}
                {evaluated.length > 0 && (
                    <div className="jd-fadein" style={{
                        background: B.card, border: `1px solid ${B.border}`,
                        borderRadius: '1.25rem', boxShadow: B.shadow,
                        overflow: 'hidden', animationDelay: '130ms',
                    }}>
                        <div style={{
                            padding: '0.85rem 1.25rem', borderBottom: `1px solid ${B.border}`,
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                        }}>
                            <BarChart3 size={14} style={{ color: B.muted }} />
                            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: B.dark, fontFamily: FONT }}>
                                Score Summary
                            </span>
                        </div>
                        <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column' }}>
                            {[...evaluated]
                                .sort((a, b) => (b.evaluation?.total ?? 0) - (a.evaluation?.total ?? 0))
                                .map((p, i) => (
                                    <div
                                        key={p.id}
                                        onClick={() => setSelected(p)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.85rem',
                                            padding: '0.6rem 1.25rem', cursor: 'pointer',
                                            transition: 'background 0.13s',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = B.active)}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <span style={{
                                            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                                            background: i === 0 ? 'rgba(251,191,36,0.15)' : i === 1 ? 'rgba(156,163,175,0.12)' : i === 2 ? 'rgba(180,83,9,0.1)' : B.active,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.65rem', fontWeight: 800, fontFamily: FONT,
                                            color: i === 0 ? '#B45309' : i === 1 ? '#374151' : i === 2 ? '#92400E' : B.muted,
                                        }}>{i + 1}</span>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.2rem' }}>
                                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: B.dark, fontFamily: FONT }}>{p.title}</span>
                                                <span style={{ fontSize: '0.68rem', color: B.muted, fontFamily: FONT }}>{p.team}</span>
                                            </div>
                                            <div style={{ height: 5, borderRadius: 99, background: 'rgba(40,41,44,0.07)' }}>
                                                <div style={{
                                                    height: '100%', borderRadius: 99,
                                                    width: `${p.evaluation!.total}%`,
                                                    background: scoreColor(p.evaluation!.total),
                                                    transition: 'width 0.4s ease',
                                                }} />
                                            </div>
                                        </div>

                                        <span style={{
                                            fontSize: '1rem', fontWeight: 900, fontFamily: FONT,
                                            color: scoreColor(p.evaluation!.total), letterSpacing: '-0.04em',
                                            flexShrink: 0,
                                        }}>{p.evaluation!.total}<span style={{ fontSize: '0.65rem', color: B.muted, fontWeight: 600 }}>/100</span></span>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                <div style={{ height: '1rem' }} />
            </div>

            {/* ── Evaluation Modal ── */}
            {selected && (
                <EvalModal
                    project={selected}
                    onClose={() => setSelected(null)}
                    onSave={(id, ev) => {
                        handleSave(id, ev);
                        // update selected so re-open shows new data
                        setSelected(prev => prev && prev.id === id ? { ...prev, status: 'Evaluated', evaluation: ev } : prev);
                    }}
                />
            )}
        </>
    );
}
