import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, UserCheck, X, Zap } from 'lucide-react';

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
    shadow: '0 2px 12px rgba(40,41,44,0.07)',
    shadowH: '0 12px 32px rgba(40,41,44,0.13)',
    green: '#38A169',
    ring: 'rgba(40,41,44,0.05)',
    sweep: 'rgba(40,41,44,0.07)',
} as const;
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

/* ═══════════════════════════════════════════════════
   STYLE INJECT
═══════════════════════════════════════════════════ */
const CSS = `
@keyframes radarSweep {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes radarPing {
  0%   { transform: scale(1); opacity: 0.55; }
  70%  { transform: scale(2.4); opacity: 0; }
  100% { transform: scale(2.4); opacity: 0; }
}
@keyframes radarPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(56,161,105,0.4); }
  50%       { box-shadow: 0 0 0 7px rgba(56,161,105,0); }
}
@keyframes radarFadeIn {
  from { opacity:0; transform: scale(0.88) translateY(6px); }
  to   { opacity:1; transform: scale(1) translateY(0); }
}
@keyframes centerPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(40,41,44,0.15), 0 4px 20px rgba(40,41,44,0.18); }
  50%       { box-shadow: 0 0 0 10px rgba(40,41,44,0), 0 4px 20px rgba(40,41,44,0.18); }
}
@keyframes dotAppear {
  from { opacity:0; transform: scale(0); }
  to   { opacity:1; transform: scale(1); }
}
@keyframes blipSpin {
  to { transform: rotate(360deg); }
}

.radar-dot {
  transition: transform 0.18s cubic-bezier(.34,1.56,.64,1);
}
.radar-dot:hover {
  transform: scale(1.7) !important;
  z-index: 30 !important;
}
.radar-mini-card {
  animation: radarFadeIn 0.22s cubic-bezier(.4,0,.2,1) both;
}
.radar-invite-btn {
  transition: background 0.16s, transform 0.13s, box-shadow 0.16s;
}
.radar-invite-btn:hover:not(:disabled) {
  background: #3a3b3f !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(40,41,44,0.22);
}
`;

function StyleInject() {
    useEffect(() => {
        if (document.getElementById('radar-style')) return;
        const el = document.createElement('style');
        el.id = 'radar-style'; el.textContent = CSS;
        document.head.appendChild(el);
        return () => el.remove();
    }, []);
    return null;
}

/* ═══════════════════════════════════════════════════
   TYPES & DATA
═══════════════════════════════════════════════════ */
export interface RadarUser {
    id: string; name: string; email: string; avatar?: string;
}

interface Blip {
    id: number;
    name: string;
    branch: string;
    year: number;
    skills: string[];
    available: boolean;
    angle: number;   // degrees
    ring: 0 | 1 | 2; // 0=inner, 1=mid, 2=outer
}

const BLIPS: Blip[] = [
    { id: 1, name: 'Priya Sharma', branch: 'CSE', year: 3, skills: ['React', 'TypeScript', 'Node.js'], available: true, angle: 20, ring: 1 },
    { id: 2, name: 'Arjun Mehta', branch: 'IT', year: 3, skills: ['Python', 'ML', 'FastAPI'], available: true, angle: 72, ring: 2 },
    { id: 3, name: 'Sneha Gupta', branch: 'CSE', year: 2, skills: ['Flutter', 'Figma', 'Firebase'], available: true, angle: 130, ring: 0 },
    { id: 4, name: 'Rohan Verma', branch: 'ECE', year: 4, skills: ['IoT', 'C++', 'Arduino'], available: false, angle: 178, ring: 2 },
    { id: 5, name: 'Aisha Khan', branch: 'CSE', year: 1, skills: ['React', 'CSS', 'JavaScript'], available: true, angle: 225, ring: 1 },
    { id: 6, name: 'Vikram Singh', branch: 'IT', year: 4, skills: ['Java', 'Spring', 'Docker'], available: false, angle: 265, ring: 2 },
    { id: 7, name: 'Nandini Joshi', branch: 'CSE', year: 3, skills: ['Python', 'Pandas', 'Power BI'], available: true, angle: 310, ring: 0 },
    { id: 8, name: 'Dev Patel', branch: 'ME', year: 2, skills: ['SolidWorks', 'Arduino', 'Python'], available: true, angle: 42, ring: 2 },
    { id: 9, name: 'Ritika Agarwal', branch: 'CSE', year: 4, skills: ['Next.js', 'Go', 'PostgreSQL'], available: true, angle: 100, ring: 1 },
    { id: 10, name: 'Kabir Malhotra', branch: 'IT', year: 2, skills: ['Cybersecurity', 'Python', 'Linux'], available: true, angle: 155, ring: 2 },
    { id: 11, name: 'Pooja Rao', branch: 'ECE', year: 3, skills: ['VLSI', 'Verilog', 'MATLAB'], available: false, angle: 205, ring: 1 },
    { id: 12, name: 'Ansh Saxena', branch: 'CSE', year: 1, skills: ['C++', 'DSA', 'Competitive'], available: true, angle: 345, ring: 2 },
];

/* ═══════════════════════════════════════════════════
   GEOMETRY HELPERS
═══════════════════════════════════════════════════ */
const RADAR_SIZE = 500;
const CENTER = RADAR_SIZE / 2;
const RING_RADII = [92, 162, 225]; // px from center

function getPos(angle: number, ring: 0 | 1 | 2) {
    const r = RING_RADII[ring];
    const rad = (angle - 90) * (Math.PI / 180);
    return {
        x: CENTER + r * Math.cos(rad),
        y: CENTER + r * Math.sin(rad),
    };
}

/* Which quadrant is dx,dy in → determine card offset */
function cardOffset(dx: number, dy: number): { left?: number; right?: number; top?: number; bottom?: number } {
    const h = dx >= 0 ? { left: 18 } : { right: 18 };
    const v = dy >= 0 ? { top: 0 } : { bottom: 0 };
    return { ...h, ...v };
}

/* ═══════════════════════════════════════════════════
   AVATAR HELPER
═══════════════════════════════════════════════════ */
function initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}
function namehue(name: string) {
    return (name.charCodeAt(0) * 17 + name.charCodeAt(1) * 7) % 360;
}

/* ═══════════════════════════════════════════════════
   MINI CARD
═══════════════════════════════════════════════════ */
interface MiniCardProps {
    blip: Blip;
    offset: { left?: number; right?: number; top?: number; bottom?: number };
    onClose: () => void;
}
function MiniCard({ blip, offset, onClose }: MiniCardProps) {
    const [invited, setInvited] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleInvite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (invited || loading) return;
        setLoading(true);
        await new Promise(r => setTimeout(r, 850));
        setLoading(false);
        setInvited(true);
    };

    const yearLabel = ['', '1st', '2nd', '3rd', '4th'][blip.year] ?? `${blip.year}th`;
    const hue = namehue(blip.name);

    return (
        <div
            className="radar-mini-card"
            style={{
                position: 'absolute', ...offset,
                width: 210, zIndex: 50,
                background: B.card,
                border: `1px solid ${B.border}`,
                borderRadius: '1rem',
                boxShadow: B.shadowH,
                padding: '1rem',
                pointerEvents: 'all',
            }}
            onClick={e => e.stopPropagation()}
        >
            {/* Close */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: B.muted, display: 'flex', padding: 2,
                    borderRadius: '50%', transition: 'background 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = B.active)}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
                <X size={13} />
            </button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: `hsl(${hue},12%,22%)`, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.78rem', fontWeight: 800, fontFamily: FONT, flexShrink: 0,
                }}>{initials(blip.name)}</div>

                <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 800, color: B.dark, fontFamily: FONT, letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {blip.name}
                    </p>
                    <p style={{ fontSize: '0.7rem', color: B.muted, fontFamily: FONT }}>
                        {blip.branch} · {yearLabel} Year
                    </p>
                </div>
            </div>

            {/* Availability badge */}
            <div style={{ marginBottom: '0.65rem' }}>
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    padding: '0.18rem 0.6rem', borderRadius: '999px',
                    background: blip.available ? 'rgba(56,161,105,0.09)' : B.active,
                    fontSize: '0.68rem', fontWeight: 700, fontFamily: FONT,
                    color: blip.available ? B.green : B.muted,
                }}>
                    <span style={{
                        width: 5, height: 5, borderRadius: '50%',
                        background: blip.available ? B.green : B.muted,
                        display: 'inline-block',
                    }} />
                    {blip.available ? 'Looking for Team' : 'In a Team'}
                </span>
            </div>

            {/* Skill tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.85rem' }}>
                {blip.skills.slice(0, 3).map(s => (
                    <span key={s} style={{
                        padding: '0.18rem 0.55rem', borderRadius: '999px',
                        background: B.active, color: B.dark,
                        fontSize: '0.68rem', fontWeight: 600, fontFamily: FONT,
                    }}>{s}</span>
                ))}
            </div>

            {/* Invite */}
            <button
                className="radar-invite-btn"
                onClick={handleInvite}
                disabled={loading || invited}
                style={{
                    width: '100%', padding: '0.6rem',
                    borderRadius: '999px', border: 'none',
                    cursor: invited ? 'default' : 'pointer',
                    background: invited ? B.green : B.dark,
                    color: '#fff', fontSize: '0.78rem', fontWeight: 700, fontFamily: FONT,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    boxShadow: invited ? 'none' : '0 3px 10px rgba(40,41,44,0.18)',
                }}
            >
                {loading ? (
                    <>
                        <span style={{
                            width: 12, height: 12,
                            border: '2px solid rgba(255,255,255,0.35)',
                            borderTop: '2px solid #fff', borderRadius: '50%',
                            animation: 'blipSpin 0.75s linear infinite', display: 'inline-block',
                        }} />
                        Sending…
                    </>
                ) : invited ? (
                    <><UserCheck size={13} /> Sent!</>
                ) : (
                    <><Send size={12} /> Invite</>
                )}
            </button>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   RADAR DOT
═══════════════════════════════════════════════════ */
interface DotProps {
    blip: Blip;
    delay: number;
    active: boolean;
    onActivate: () => void;
    onDeactivate: () => void;
}
function RadarDot({ blip, delay, active, onActivate, onDeactivate }: DotProps) {
    const { x, y } = getPos(blip.angle, blip.ring);
    const hue = namehue(blip.name);
    const DOT = 11;

    // card offset: place card away from center
    const dx = x - CENTER;
    const dy = y - CENTER;
    const offset = cardOffset(dx, dy);

    return (
        <div
            style={{
                position: 'absolute',
                left: x - DOT / 2,
                top: y - DOT / 2,
                width: DOT, height: DOT,
                zIndex: active ? 40 : 10,
                cursor: 'pointer',
                animationDelay: `${delay}ms`,
            }}
        >
            {/* Ping ring for available */}
            {blip.available && !active && (
                <div style={{
                    position: 'absolute',
                    inset: -2,
                    borderRadius: '50%',
                    background: 'rgba(56,161,105,0.35)',
                    animation: `radarPing 2.2s ease-out ${delay * 0.8}ms infinite`,
                    pointerEvents: 'none',
                }} />
            )}

            {/* Dot itself */}
            <div
                className="radar-dot"
                onClick={onActivate}
                style={{
                    width: DOT, height: DOT, borderRadius: '50%',
                    background: blip.available ? B.green : `hsl(${hue},8%,55%)`,
                    border: active ? `2px solid ${B.dark}` : `2px solid ${B.card}`,
                    boxShadow: blip.available
                        ? `0 0 0 2px rgba(56,161,105,0.25), 0 2px 6px rgba(40,41,44,0.16)`
                        : `0 2px 6px rgba(40,41,44,0.1)`,
                    position: 'relative', zIndex: 2,
                    transition: 'transform 0.18s cubic-bezier(.34,1.56,.64,1), border 0.15s',
                    transform: active ? 'scale(1.7)' : 'scale(1)',
                    animation: `dotAppear 0.4s cubic-bezier(.34,1.56,.64,1) ${delay}ms both`,
                }}
            />

            {/* Mini card */}
            {active && (
                <MiniCard
                    blip={blip}
                    offset={offset}
                    onClose={onDeactivate}
                />
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   RADAR CANVAS
═══════════════════════════════════════════════════ */
function Radar({ user }: { user: RadarUser }) {
    const [activeId, setActiveId] = useState<number | null>(null);
    const [scanAngle, setScanAngle] = useState(0);
    const rafRef = useRef<number | null>(null);
    const lastRef = useRef<number>(0);

    // Animate scan angle
    useEffect(() => {
        const animate = (ts: number) => {
            const dt = ts - lastRef.current;
            lastRef.current = ts;
            setScanAngle(a => (a + dt * 0.045) % 360);
            rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(ts => { lastRef.current = ts; rafRef.current = requestAnimationFrame(animate); });
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, []);

    const dismiss = useCallback(() => setActiveId(null), []);

    const ini = initials(user.name);

    return (
        <div
            style={{
                position: 'relative',
                width: RADAR_SIZE, height: RADAR_SIZE,
                borderRadius: '50%',
                overflow: 'visible',
                flexShrink: 0,
            }}
            onClick={() => { if (activeId !== null) dismiss(); }}
        >
            {/* ── Radial background gradient ── */}
            <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: `radial-gradient(circle at center,
          rgba(40,41,44,0.03) 0%,
          rgba(40,41,44,0.05) 40%,
          rgba(40,41,44,0.02) 70%,
          transparent 100%
        )`,
            }} />

            {/* ── Concentric rings ── */}
            {RING_RADII.map((r, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    left: CENTER - r - 0.5,
                    top: CENTER - r - 0.5,
                    width: r * 2 + 1, height: r * 2 + 1,
                    borderRadius: '50%',
                    border: `1px ${i === 2 ? 'solid' : 'dashed'} rgba(40,41,44,${i === 2 ? 0.08 : 0.06})`,
                    pointerEvents: 'none',
                }} />
            ))}

            {/* ── Cross-hair lines ── */}
            {[0, 90, 45, 135].map(deg => (
                <div key={deg} style={{
                    position: 'absolute',
                    left: CENTER, top: CENTER,
                    width: RING_RADII[2] * 2,
                    height: 1,
                    background: 'rgba(40,41,44,0.05)',
                    transformOrigin: '0 50%',
                    transform: `translateX(-50%) rotate(${deg}deg)`,
                    pointerEvents: 'none',
                }} />
            ))}

            {/* ── Compass labels ── */}
            {[
                { label: 'N', x: CENTER, y: CENTER - RING_RADII[2] - 20 },
                { label: 'S', x: CENTER, y: CENTER + RING_RADII[2] + 8 },
                { label: 'E', x: CENTER + RING_RADII[2] + 8, y: CENTER },
                { label: 'W', x: CENTER - RING_RADII[2] - 20, y: CENTER },
            ].map(({ label, x, y }) => (
                <span key={label} style={{
                    position: 'absolute', left: x, top: y,
                    fontSize: '0.62rem', fontWeight: 700, color: 'rgba(40,41,44,0.2)',
                    fontFamily: FONT, userSelect: 'none', pointerEvents: 'none',
                }}>{label}</span>
            ))}

            {/* ── Radar sweep ── */}
            <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden',
                pointerEvents: 'none',
            }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    background: `conic-gradient(
            from ${scanAngle}deg at center,
            transparent 0deg,
            rgba(40,41,44,0.08) 22deg,
            rgba(40,41,44,0.04) 44deg,
            transparent 60deg
          )`,
                }} />
            </div>

            {/* ── Tick marks on outer ring ── */}
            {Array.from({ length: 36 }, (_, i) => {
                const deg = i * 10 - 90;
                const rad = deg * Math.PI / 180;
                const r = RING_RADII[2];
                const tickLen = i % 3 === 0 ? 7 : 4;
                const x1 = CENTER + (r - tickLen) * Math.cos(rad);
                const y1 = CENTER + (r - tickLen) * Math.sin(rad);
                const x2 = CENTER + r * Math.cos(rad);
                const y2 = CENTER + r * Math.sin(rad);
                return (
                    <svg key={i} style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}
                        width={RADAR_SIZE} height={RADAR_SIZE}>
                        <line x1={x1} y1={y1} x2={x2} y2={y2}
                            stroke="rgba(40,41,44,0.1)" strokeWidth={i % 3 === 0 ? 1.5 : 0.8} />
                    </svg>
                );
            })}

            {/* ── Blip dots ── */}
            {BLIPS.map((b, i) => (
                <RadarDot
                    key={b.id}
                    blip={b}
                    delay={i * 80}
                    active={activeId === b.id}
                    onActivate={() => setActiveId(b.id)}
                    onDeactivate={dismiss}
                />
            ))}

            {/* ── Center user avatar ── */}
            <div style={{
                position: 'absolute',
                left: CENTER - 34, top: CENTER - 34,
                width: 68, height: 68, borderRadius: '50%',
                background: B.dark, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', fontWeight: 900, fontFamily: FONT,
                zIndex: 20,
                animation: 'centerPulse 2.5s ease-in-out infinite',
                border: `3.5px solid ${B.card}`,
            }}>
                {user.avatar
                    ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    : ini
                }
                {/* "You" label */}
                <span style={{
                    position: 'absolute', top: 72, left: '50%', transform: 'translateX(-50%)',
                    fontSize: '0.65rem', fontWeight: 700, color: B.muted, fontFamily: FONT,
                    whiteSpace: 'nowrap', letterSpacing: '0.04em',
                }}>YOU</span>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   LEGEND
═══════════════════════════════════════════════════ */
function Legend() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
                { color: B.green, label: 'Available', sub: 'Looking for team' },
                { color: 'rgba(40,41,44,0.35)', label: 'In a Team', sub: 'Not accepting invites' },
            ].map(({ color, label, sub }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                    <div style={{ position: 'relative', width: 14, height: 14, flexShrink: 0 }}>
                        {color === B.green && (
                            <div style={{
                                position: 'absolute', inset: -3, borderRadius: '50%',
                                background: 'rgba(56,161,105,0.25)',
                                animation: 'radarPing 2s ease-out infinite',
                            }} />
                        )}
                        <div style={{ width: 14, height: 14, borderRadius: '50%', background: color, position: 'relative', zIndex: 1 }} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: B.dark, fontFamily: FONT }}>{label}</p>
                        <p style={{ fontSize: '0.7rem', color: B.muted, fontFamily: FONT }}>{sub}</p>
                    </div>
                </div>
            ))}

            <div style={{ borderTop: `1px solid ${B.border}`, paddingTop: '0.85rem', marginTop: '0.2rem' }}>
                <p style={{ fontSize: '0.68rem', fontWeight: 700, color: B.muted, fontFamily: FONT, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                    Rings
                </p>
                {['Close matches', 'Common branch', 'All students'].map((l, i) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.45rem' }}>
                        <div style={{
                            width: 22, height: 1,
                            border: `1px ${i === 2 ? 'solid' : 'dashed'} rgba(40,41,44,${0.15 + i * 0.06})`,
                        }} />
                        <span style={{ fontSize: '0.72rem', color: B.muted, fontFamily: FONT }}>{l}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   STATS STRIP
═══════════════════════════════════════════════════ */
function StatsStrip() {
    const available = BLIPS.filter(b => b.available).length;
    const branches = [...new Set(BLIPS.map(b => b.branch))].length;
    const skills = [...new Set(BLIPS.flatMap(b => b.skills))].length;

    return (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {[
                { val: BLIPS.length, label: 'Nearby' },
                { val: available, label: 'Available', accent: true },
                { val: branches, label: 'Branches' },
                { val: skills, label: 'Unique Skills' },
            ].map(({ val, label, accent }) => (
                <div key={label} style={{
                    flex: 1, minWidth: 80,
                    background: B.card,
                    border: `1px solid ${B.border}`,
                    borderRadius: '1rem',
                    padding: '0.85rem 1rem',
                    boxShadow: B.shadow,
                }}>
                    <p style={{
                        fontSize: '1.45rem', fontWeight: 900,
                        color: accent ? B.green : B.dark,
                        fontFamily: FONT, letterSpacing: '-0.05em', lineHeight: 1,
                    }}>{val}</p>
                    <p style={{ fontSize: '0.72rem', color: B.muted, fontFamily: FONT, marginTop: '0.2rem' }}>{label}</p>
                </div>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════ */
export default function RadarPage({ user }: { user: RadarUser }) {
    return (
        <>
            <StyleInject />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* ── Page title ── */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: '0.6rem',
                            background: B.dark, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Zap size={14} color="#fff" />
                        </div>
                        <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: B.dark, letterSpacing: '-0.04em', fontFamily: FONT }}>
                            Radar Discovery
                        </h1>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: B.muted, fontFamily: FONT }}>
                        Students near you — click a dot to view profile and send an invite.
                    </p>
                </div>

                {/* ── Stats ── */}
                <StatsStrip />

                {/* ── Main layout: Radar + Legend ── */}
                <div style={{
                    display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap',
                }}>

                    {/* Radar card */}
                    <div style={{
                        background: B.card,
                        border: `1px solid ${B.border}`,
                        borderRadius: '1.5rem',
                        boxShadow: '0 4px 24px rgba(40,41,44,0.06)',
                        padding: '2rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flex: '0 0 auto',
                    }}>
                        <Radar user={user} />
                    </div>

                    {/* Right panel: Legend + Instruction */}
                    <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                        {/* Legend card */}
                        <div style={{
                            background: B.card, border: `1px solid ${B.border}`,
                            borderRadius: '1.25rem', boxShadow: B.shadow,
                            padding: '1.4rem 1.5rem',
                        }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: B.muted, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: FONT, marginBottom: '1rem' }}>
                                Legend
                            </p>
                            <Legend />
                        </div>

                        {/* Tip card */}
                        <div style={{
                            background: 'rgba(40,41,44,0.03)',
                            border: `1px dashed rgba(40,41,44,0.1)`,
                            borderRadius: '1rem',
                            padding: '1rem 1.25rem',
                        }}>
                            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: B.dark, fontFamily: FONT, marginBottom: '0.35rem' }}>
                                How it works
                            </p>
                            <ul style={{ margin: 0, padding: '0 0 0 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                {[
                                    'Green dots are actively looking for a team.',
                                    'Inner ring = best skill match.',
                                    'Click a dot to see their profile.',
                                    'Invite sends a teammate request.',
                                ].map(t => (
                                    <li key={t} style={{ fontSize: '0.74rem', color: B.muted, fontFamily: FONT, lineHeight: 1.55 }}>{t}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div style={{ height: '1rem' }} />
            </div>
        </>
    );
}
