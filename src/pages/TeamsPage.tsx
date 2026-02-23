import React, { useState, useEffect } from 'react';
import TeamChatPage from './TeamChatPage';
import {
    Trophy, Users, UserPlus, UserMinus, Copy,
    CheckCircle2, Crown, Share2, Settings,
    ChevronRight, AlertCircle, Sparkles, ShieldCheck, MessageSquare,
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
    shadowH: '0 10px 30px rgba(40,41,44,0.10)',
    green: '#38A169',
    rose: '#E53E6A',
    amber: '#D97706',
    blue: '#3B82F6',
} as const;
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

/* ═══════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════ */
const CSS = `
.td-fadein { animation: tdFade 0.4s cubic-bezier(.4,0,.2,1) both; }
@keyframes tdFade { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
.td-card { transition: box-shadow 0.22s ease, border-color 0.22s ease; }
.td-card:hover { box-shadow: 0 10px 30px rgba(40,41,44,0.10) !important; }
.td-row { transition: background 0.15s; }
.td-row:hover { background: rgba(40,41,44,0.025) !important; }
.td-remove-btn { transition: color 0.15s, background 0.15s; }
.td-remove-btn:hover { color: #E53E6A !important; background: rgba(229,62,106,0.07) !important; }
.td-invite-btn { transition: background 0.17s, transform 0.13s, box-shadow 0.17s; }
.td-invite-btn:hover:not(:disabled) { background: #3a3b3f !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(40,41,44,0.22); }
.td-bar-fill { transition: width 0.9s cubic-bezier(.4,0,.2,1); }
.td-copy-btn:hover { background: rgba(40,41,44,0.08) !important; }
`;
function StyleInject() {
    useEffect(() => {
        if (document.getElementById('td-style')) return;
        const el = document.createElement('style');
        el.id = 'td-style'; el.textContent = CSS;
        document.head.appendChild(el);
        return () => el.remove();
    }, []);
    return null;
}

/* ═══════════════════════════════════════════════════
   TYPES / MOCK DATA
═══════════════════════════════════════════════════ */
type Gender = 'female' | 'male' | 'other';
interface Member {
    id: number;
    name: string;
    branch: string;
    year: number;
    gender: Gender;
    role: 'leader' | 'member';
    skills: string[];
}

interface Team {
    id: string;
    name: string;
    hackathon: string;
    hackathonCategory: string;
    inviteCode: string;
    maxSize: number;
    requiredFemale: number;
    requiredSkills: string[];
    members: Member[];
}

const MOCK_TEAM: Team = {
    id: 'team-001',
    name: 'InnovateBots',
    hackathon: 'Smart India Hackathon 2025',
    hackathonCategory: 'Software · Problem Statement #SIH1547',
    inviteCode: 'INB-2025-K7X',
    maxSize: 6,
    requiredFemale: 1,
    requiredSkills: ['React', 'Python', 'Machine Learning', 'Node.js', 'UI/UX', 'Firebase'],
    members: [
        { id: 1, name: 'Arjun Mehta', branch: 'IT', year: 3, gender: 'male', role: 'leader', skills: ['Python', 'Machine Learning', 'FastAPI', 'TensorFlow'] },
        { id: 2, name: 'Priya Sharma', branch: 'CSE', year: 3, gender: 'female', role: 'member', skills: ['React', 'TypeScript', 'Node.js', 'MongoDB'] },
        { id: 3, name: 'Rohan Verma', branch: 'ECE', year: 4, gender: 'male', role: 'member', skills: ['IoT', 'C++', 'Arduino', 'Embedded C'] },
        { id: 4, name: 'Sneha Gupta', branch: 'CSE', year: 2, gender: 'female', role: 'member', skills: ['Flutter', 'Figma', 'Firebase', 'UI/UX'] },
        { id: 5, name: 'Kabir Malhotra', branch: 'IT', year: 2, gender: 'male', role: 'member', skills: ['Cybersecurity', 'Python', 'Networking'] },
    ],
};

/* ═══════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════ */
function initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}
function namehue(name: string) {
    return (name.charCodeAt(0) * 17 + name.charCodeAt(1) * 7) % 360;
}

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
    const hue = namehue(name);
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%', flexShrink: 0,
            background: `hsl(${hue},12%,22%)`, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.36, fontWeight: 800, fontFamily: FONT,
        }}>{initials(name)}</div>
    );
}

function GenderBadge({ gender }: { gender: Gender }) {
    const cfg = {
        female: { label: 'Female', bg: 'rgba(229,62,106,0.08)', color: '#C0385A', dot: '#E53E6A' },
        male: { label: 'Male', bg: 'rgba(59,130,246,0.08)', color: '#2563EB', dot: '#3B82F6' },
        other: { label: 'Other', bg: 'rgba(40,41,44,0.07)', color: B.muted, dot: B.muted },
    }[gender];
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.2rem 0.65rem', borderRadius: '999px',
            background: cfg.bg, color: cfg.color,
            fontSize: '0.7rem', fontWeight: 700, fontFamily: FONT,
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
            {cfg.label}
        </span>
    );
}

function SkillPill({ label, covered }: { label: string; covered?: boolean }) {
    return (
        <span style={{
            padding: '0.18rem 0.6rem', borderRadius: '999px',
            background: covered ? B.dark : B.active,
            color: covered ? '#fff' : B.dark,
            fontSize: '0.7rem', fontWeight: 600, fontFamily: FONT,
            display: 'inline-flex', alignItems: 'center',
        }}>{label}</span>
    );
}

/* ═══════════════════════════════════════════════════
   SKILL COVERAGE BAR
═══════════════════════════════════════════════════ */
function CoverageBar({ covered, total }: { covered: number; total: number }) {
    const pct = total === 0 ? 0 : Math.round((covered / total) * 100);
    const color = pct >= 80 ? B.green : pct >= 50 ? B.amber : '#E53E6A';
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: B.dark, fontFamily: FONT }}>{pct}%</span>
                <span style={{ fontSize: '0.7rem', color: B.muted, fontFamily: FONT }}>{covered}/{total} skills</span>
            </div>
            <div style={{
                height: 7, borderRadius: '999px',
                background: 'rgba(40,41,44,0.07)', overflow: 'hidden',
            }}>
                <div className="td-bar-fill" style={{
                    height: '100%', borderRadius: '999px',
                    background: color, width: `${pct}%`,
                }} />
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   STAT ROW
═══════════════════════════════════════════════════ */
function StatRow({ icon, label, value, sub, accent = false }: {
    icon: React.ReactNode; label: string; value: string | number;
    sub?: string; accent?: boolean;
}) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.75rem 0',
            borderBottom: `1px solid ${B.border}`,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                    width: 30, height: 30, borderRadius: '0.6rem',
                    background: B.active,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: B.dark, flexShrink: 0,
                }}>
                    {icon}
                </div>
                <div>
                    <p style={{ fontSize: '0.78rem', fontWeight: 600, color: B.dark, fontFamily: FONT }}>{label}</p>
                    {sub && <p style={{ fontSize: '0.68rem', color: B.muted, fontFamily: FONT }}>{sub}</p>}
                </div>
            </div>
            <span style={{
                fontSize: '1rem', fontWeight: 900, color: accent ? B.green : B.dark,
                fontFamily: FONT, letterSpacing: '-0.04em',
            }}>{value}</span>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   MEMBER ROW
═══════════════════════════════════════════════════ */
interface MemberRowProps {
    member: Member;
    covered: Set<string>;
    onRemove: (id: number) => void;
}
function MemberRow({ member, covered, onRemove }: MemberRowProps) {
    const [removing, setRemoving] = useState(false);
    const yearLabel = ['', '1st', '2nd', '3rd', '4th'][member.year] ?? `${member.year}th`;

    const handleRemove = async () => {
        if (member.role === 'leader') return;
        setRemoving(true);
        await new Promise(r => setTimeout(r, 600));
        onRemove(member.id);
    };

    return (
        <div className="td-row" style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '1rem 1.5rem',
            borderBottom: `1px solid ${B.border}`,
            opacity: removing ? 0.4 : 1, transition: 'opacity 0.3s',
        }}>
            {/* Avatar */}
            <Avatar name={member.name} size={40} />

            {/* Name + info */}
            <div style={{ flex: '0 0 180px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <p style={{ fontSize: '0.88rem', fontWeight: 800, color: B.dark, fontFamily: FONT, letterSpacing: '-0.02em' }}>
                        {member.name}
                    </p>
                    {member.role === 'leader' && (
                        <Crown size={12} style={{ color: '#D97706', flexShrink: 0 }} />
                    )}
                </div>
                <p style={{ fontSize: '0.72rem', color: B.muted, fontFamily: FONT }}>
                    {member.branch} · {yearLabel} Year
                </p>
            </div>

            {/* Gender badge */}
            <div style={{ flex: '0 0 90px' }}>
                <GenderBadge gender={member.gender} />
            </div>

            {/* Skills */}
            <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '0.3rem', minWidth: 0 }}>
                {member.skills.map(s => (
                    <SkillPill key={s} label={s} covered={covered.has(s)} />
                ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                {member.role !== 'leader' && (
                    <button
                        className="td-remove-btn"
                        onClick={handleRemove}
                        disabled={removing}
                        title="Remove member"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            padding: '0.45rem 0.85rem', borderRadius: '0.6rem',
                            background: 'none', border: `1px solid ${B.border}`,
                            color: B.muted, fontSize: '0.75rem', fontWeight: 600,
                            fontFamily: FONT, cursor: 'pointer',
                        }}
                    >
                        <UserMinus size={13} /> Remove
                    </button>
                )}
                {member.role === 'leader' && (
                    <span style={{
                        padding: '0.35rem 0.7rem', borderRadius: '0.6rem',
                        background: 'rgba(217,119,6,0.08)',
                        color: '#D97706', fontSize: '0.72rem', fontWeight: 700, fontFamily: FONT,
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    }}>
                        <Crown size={11} /> Leader
                    </span>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   INVITE MODAL (inline, not a real modal)
═══════════════════════════════════════════════════ */
function InvitePanel({ code, onClose }: { code: string; onClose: () => void }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard?.writeText(code).catch(() => { });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="td-fadein" style={{
            background: B.card, border: `1px solid ${B.border}`,
            borderRadius: '1.25rem', padding: '1.5rem',
            boxShadow: B.shadowH, marginBottom: '1.25rem',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                    <p style={{ fontSize: '0.93rem', fontWeight: 800, color: B.dark, fontFamily: FONT }}>Invite to Team</p>
                    <p style={{ fontSize: '0.78rem', color: B.muted, fontFamily: FONT, marginTop: '0.15rem' }}>
                        Share the code or link with your teammate.
                    </p>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: B.muted, display: 'flex', padding: '2px' }}>
                    ✕
                </button>
            </div>

            <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                background: B.active, borderRadius: '0.85rem', padding: '0.85rem 1rem',
            }}>
                <code style={{ flex: 1, fontSize: '1.05rem', fontWeight: 900, color: B.dark, letterSpacing: '0.12em', fontFamily: 'monospace' }}>
                    {code}
                </code>
                <button
                    className="td-copy-btn"
                    onClick={copy}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                        padding: '0.55rem 1rem', borderRadius: '999px',
                        background: copied ? B.green : B.dark,
                        color: '#fff', border: 'none', cursor: 'pointer',
                        fontSize: '0.8rem', fontWeight: 700, fontFamily: FONT,
                        transition: 'background 0.18s',
                    }}
                >
                    {copied ? <><CheckCircle2 size={14} /> Copied!</> : <><Copy size={13} /> Copy</>}
                </button>
            </div>

            <p style={{ fontSize: '0.72rem', color: B.muted, fontFamily: FONT, marginTop: '0.85rem' }}>
                Teammates can use this code on the Join Team page. Code expires in 48 hours.
            </p>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   STATS SIDEBAR
═══════════════════════════════════════════════════ */
interface StatsProps { team: Team; members: Member[]; }
function StatsSidebar({ team, members }: StatsProps) {
    const femaleCount = members.filter(m => m.gender === 'female').length;
    const femaleOk = femaleCount >= team.requiredFemale;
    const teamSkills = new Set(members.flatMap(m => m.skills));
    const coveredCount = team.requiredSkills.filter(s => teamSkills.has(s)).length;
    const slotsLeft = team.maxSize - members.length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Stats card */}
            <div className="td-card" style={{
                background: B.card, borderRadius: '1.25rem',
                border: `1px solid ${B.border}`, boxShadow: B.shadow,
                overflow: 'hidden',
            }}>
                <div style={{ padding: '1.2rem 1.4rem', borderBottom: `1px solid ${B.border}` }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: B.muted, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: FONT }}>
                        Team Stats
                    </p>
                </div>
                <div style={{ padding: '0 1.4rem' }}>
                    <StatRow
                        icon={<Users size={15} />}
                        label="Team Size"
                        value={`${members.length}/${team.maxSize}`}
                        sub={slotsLeft > 0 ? `${slotsLeft} slot${slotsLeft > 1 ? 's' : ''} open` : 'Team full'}
                    />
                    <StatRow
                        icon={<span style={{ fontSize: '0.85rem' }}>♀</span>}
                        label="Female Members"
                        value={femaleCount}
                        sub={`Min. ${team.requiredFemale} required`}
                        accent={femaleOk}
                    />
                    <StatRow
                        icon={<ShieldCheck size={15} />}
                        label="Required Female"
                        value={team.requiredFemale}
                        sub={femaleOk ? 'Requirement met ✓' : 'Not yet fulfilled'}
                    />
                </div>

                {/* Skill coverage */}
                <div style={{ padding: '1rem 1.4rem 1.4rem' }}>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, color: B.muted, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: FONT, marginBottom: '0.75rem' }}>
                        Skill Coverage
                    </p>
                    <CoverageBar covered={coveredCount} total={team.requiredSkills.length} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.85rem' }}>
                        {team.requiredSkills.map(s => (
                            <SkillPill key={s} label={s} covered={teamSkills.has(s)} />
                        ))}
                    </div>
                    <p style={{ fontSize: '0.68rem', color: B.muted, fontFamily: FONT, marginTop: '0.6rem' }}>
                        Dark = covered · Light = missing
                    </p>
                </div>
            </div>

            {/* Warning alert */}
            {!femaleOk && (
                <div className="td-fadein" style={{
                    background: 'rgba(229,62,106,0.06)',
                    border: '1px solid rgba(229,62,106,0.15)',
                    borderRadius: '1rem', padding: '1rem 1.1rem',
                    display: 'flex', gap: '0.65rem', alignItems: 'flex-start',
                }}>
                    <AlertCircle size={16} style={{ color: B.rose, flexShrink: 0, marginTop: '1px' }} />
                    <div>
                        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: B.rose, fontFamily: FONT }}>
                            Female Requirement Unmet
                        </p>
                        <p style={{ fontSize: '0.72rem', color: '#C0385A', fontFamily: FONT, marginTop: '0.2rem', lineHeight: 1.5 }}>
                            SIH 2025 requires at least {team.requiredFemale} female member. Add one to be eligible.
                        </p>
                    </div>
                </div>
            )}

            {/* Eligible badge */}
            {femaleOk && coveredCount >= Math.ceil(team.requiredSkills.length * 0.6) && (
                <div style={{
                    background: 'rgba(56,161,105,0.07)',
                    border: '1px solid rgba(56,161,105,0.18)',
                    borderRadius: '1rem', padding: '1rem 1.1rem',
                    display: 'flex', gap: '0.65rem', alignItems: 'center',
                }}>
                    <Sparkles size={16} style={{ color: B.green, flexShrink: 0 }} />
                    <div>
                        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: B.green, fontFamily: FONT }}>
                            Team Eligible!
                        </p>
                        <p style={{ fontSize: '0.72rem', color: '#2E7D5A', fontFamily: FONT, marginTop: '0.15rem' }}>
                            Requirements met. Ready to submit.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   NO TEAM STATE
═══════════════════════════════════════════════════ */
function NoTeamState({ onCreate, onJoin }: { onCreate: () => void; onJoin: () => void }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '4rem 2rem', gap: '1.25rem',
            maxWidth: 420, margin: '0 auto', textAlign: 'center',
        }}>
            <div style={{
                width: 72, height: 72, borderRadius: '1.5rem',
                background: B.active, color: B.muted,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Users size={32} />
            </div>
            <div>
                <p style={{ fontSize: '1.1rem', fontWeight: 900, color: B.dark, fontFamily: FONT, letterSpacing: '-0.03em' }}>
                    You're not in a team yet
                </p>
                <p style={{ fontSize: '0.83rem', color: B.muted, fontFamily: FONT, marginTop: '0.4rem', lineHeight: 1.6 }}>
                    Create a new team for your hackathon or join an existing one with an invite code.
                </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                    onClick={onCreate}
                    style={{
                        padding: '0.72rem 1.5rem', borderRadius: '999px', border: 'none',
                        background: B.dark, color: '#fff',
                        fontSize: '0.85rem', fontWeight: 700, fontFamily: FONT,
                        cursor: 'pointer',
                        boxShadow: '0 3px 12px rgba(40,41,44,0.18)',
                    }}
                >+ Create Team</button>
                <button
                    onClick={onJoin}
                    style={{
                        padding: '0.72rem 1.5rem', borderRadius: '999px',
                        border: `1.5px solid ${B.border}`,
                        background: 'transparent', color: B.dark,
                        fontSize: '0.85rem', fontWeight: 700, fontFamily: FONT,
                        cursor: 'pointer',
                    }}
                >Join with Code</button>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   JOIN WITH CODE PANEL
═══════════════════════════════════════════════════ */
function JoinPanel({ onJoin, onCancel }: { onJoin: () => void; onCancel: () => void }) {
    const [code, setCode] = useState('');
    const [focused, setFocused] = useState(false);
    return (
        <div className="td-fadein" style={{
            background: B.card, border: `1px solid ${B.border}`,
            borderRadius: '1.25rem', padding: '1.75rem',
            boxShadow: B.shadowH, maxWidth: 400, margin: '0 auto',
        }}>
            <p style={{ fontSize: '0.97rem', fontWeight: 800, color: B.dark, fontFamily: FONT, marginBottom: '0.35rem' }}>Join a Team</p>
            <p style={{ fontSize: '0.78rem', color: B.muted, fontFamily: FONT, marginBottom: '1.25rem' }}>Enter the invite code your team leader shared.</p>
            <input
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="e.g. INB-2025-K7X"
                style={{
                    width: '100%', fontFamily: 'monospace',
                    padding: '0.8rem 1rem', borderRadius: '0.75rem',
                    border: `1.5px solid ${focused ? B.dark : B.border}`,
                    background: focused ? B.card : 'rgba(40,41,44,0.02)',
                    fontSize: '1rem', color: B.dark, letterSpacing: '0.08em',
                    outline: 'none', transition: 'all 0.18s', boxSizing: 'border-box',
                    boxShadow: focused ? '0 0 0 3px rgba(40,41,44,0.05)' : 'none',
                }}
            />
            <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1rem' }}>
                <button
                    onClick={onJoin}
                    disabled={code.length < 5}
                    style={{
                        flex: 1, padding: '0.72rem',
                        borderRadius: '999px', border: 'none',
                        background: code.length >= 5 ? B.dark : 'rgba(40,41,44,0.12)',
                        color: code.length >= 5 ? '#fff' : B.muted,
                        fontSize: '0.85rem', fontWeight: 700, fontFamily: FONT,
                        cursor: code.length >= 5 ? 'pointer' : 'not-allowed',
                        transition: 'all 0.18s',
                    }}
                >Join Team</button>
                <button onClick={onCancel} style={{
                    padding: '0.72rem 1.2rem', borderRadius: '999px',
                    border: `1px solid ${B.border}`, background: 'none',
                    color: B.muted, fontSize: '0.85rem', fontFamily: FONT,
                    cursor: 'pointer',
                }}>Cancel</button>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════ */
export default function TeamsPage() {
    const [hasTeam, setHasTeam] = useState(true);  // flip to false for empty state
    const [joinMode, setJoinMode] = useState(false);
    const [showInvite, setShowInvite] = useState(false);
    const [members, setMembers] = useState<Member[]>(MOCK_TEAM.members);
    const [tab, setTab] = useState<'overview' | 'chat'>('overview');

    // Compute which required skills are covered
    const teamSkills = new Set(members.flatMap(m => m.skills));
    const coveredSkills = new Set(MOCK_TEAM.requiredSkills.filter(s => teamSkills.has(s)));

    const removeM = (id: number) => setMembers(prev => prev.filter(m => m.id !== id));

    // ── No team state ──
    if (!hasTeam) {
        return (
            <>
                <StyleInject />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: B.dark, letterSpacing: '-0.04em', fontFamily: FONT }}>Teams</h1>
                        <p style={{ fontSize: '0.82rem', color: B.muted, fontFamily: FONT, marginTop: '0.25rem' }}>Collaborate with teammates on hackathons.</p>
                    </div>
                    <div style={{
                        background: B.card, border: `1px solid ${B.border}`,
                        borderRadius: '1.5rem', boxShadow: B.shadow,
                    }}>
                        {joinMode
                            ? <div style={{ padding: '2rem' }}><JoinPanel onJoin={() => { setHasTeam(true); setJoinMode(false); }} onCancel={() => setJoinMode(false)} /></div>
                            : <NoTeamState onCreate={() => setHasTeam(true)} onJoin={() => setJoinMode(true)} />
                        }
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <StyleInject />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* ── Page breadcrumb ── */}
                <div className="td-fadein" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.8rem', color: B.muted, fontFamily: FONT }}>Teams</span>
                    <ChevronRight size={13} style={{ color: B.muted }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: B.dark, fontFamily: FONT }}>{MOCK_TEAM.name}</span>
                </div>

                {/* ── Overview / Chat tab switcher ── */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: B.card, border: `1px solid ${B.border}`,
                    borderRadius: '999px', padding: '0.3rem',
                    width: 'fit-content', boxShadow: B.shadow,
                }}>
                    {([['overview', 'Overview', Users], ['chat', 'Chat', MessageSquare]] as const).map(([v, label, Icon]) => {
                        const active = tab === v;
                        return (
                            <button
                                key={v}
                                onClick={() => setTab(v)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    padding: '0.45rem 1.1rem', borderRadius: '999px', border: 'none',
                                    background: active ? B.dark : 'transparent',
                                    color: active ? '#fff' : B.muted,
                                    fontSize: '0.8rem', fontWeight: 700, fontFamily: FONT,
                                    cursor: 'pointer', transition: 'all 0.18s',
                                }}
                            >
                                <Icon size={14} />
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* ── Chat tab ── */}
                {tab === 'chat' && <TeamChatPage />}

                {/* ── Overview tab ── */}
                {tab === 'overview' && (<>

                    {/* ── Invite panel (conditional) ── */}
                    {showInvite && (
                        <InvitePanel code={MOCK_TEAM.inviteCode} onClose={() => setShowInvite(false)} />
                    )}


                    {/* ── BODY: Left content + Right sidebar ── */}
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

                        {/* LEFT */}
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                            {/* ── Team Header Card ── */}
                            <div className="td-card td-fadein" style={{
                                background: B.dark, borderRadius: '1.25rem',
                                boxShadow: '0 4px 20px rgba(40,41,44,0.18)',
                                padding: '1.75rem 2rem',
                                animationDelay: '0ms',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>

                                    <div>
                                        {/* Hackathon label */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.6rem' }}>
                                            <Trophy size={14} style={{ color: 'rgba(243,243,243,0.55)' }} />
                                            <span style={{ fontSize: '0.75rem', color: 'rgba(243,243,243,0.55)', fontFamily: FONT, fontWeight: 600 }}>
                                                {MOCK_TEAM.hackathon}
                                            </span>
                                        </div>

                                        {/* Team name */}
                                        <h1 style={{
                                            fontSize: '2rem', fontWeight: 900, color: '#F3F3F3',
                                            letterSpacing: '-0.05em', fontFamily: FONT, lineHeight: 1.1,
                                            marginBottom: '0.4rem',
                                        }}>
                                            {MOCK_TEAM.name}
                                        </h1>

                                        {/* Category */}
                                        <p style={{ fontSize: '0.78rem', color: 'rgba(243,243,243,0.5)', fontFamily: FONT }}>
                                            {MOCK_TEAM.hackathonCategory}
                                        </p>
                                    </div>

                                    {/* Member count pill */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.65rem' }}>
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            background: 'rgba(243,243,243,0.10)', borderRadius: '999px',
                                            padding: '0.45rem 1rem',
                                        }}>
                                            <Users size={14} style={{ color: 'rgba(243,243,243,0.7)' }} />
                                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#F3F3F3', fontFamily: FONT }}>
                                                {members.length} / {MOCK_TEAM.maxSize} Members
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => setShowInvite(v => !v)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                                                    padding: '0.55rem 1.1rem', borderRadius: '999px',
                                                    background: 'rgba(243,243,243,0.13)',
                                                    border: '1px solid rgba(243,243,243,0.18)',
                                                    color: '#F3F3F3', cursor: 'pointer',
                                                    fontSize: '0.8rem', fontWeight: 700, fontFamily: FONT,
                                                    transition: 'background 0.15s',
                                                }}
                                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(243,243,243,0.22)')}
                                                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(243,243,243,0.13)')}
                                            >
                                                <Share2 size={13} /> Invite
                                            </button>
                                            <button
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                                                    padding: '0.55rem 1.1rem', borderRadius: '999px',
                                                    background: 'rgba(243,243,243,0.08)',
                                                    border: '1px solid rgba(243,243,243,0.12)',
                                                    color: 'rgba(243,243,243,0.7)', cursor: 'pointer',
                                                    fontSize: '0.8rem', fontWeight: 700, fontFamily: FONT,
                                                    transition: 'background 0.15s',
                                                }}
                                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(243,243,243,0.16)')}
                                                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(243,243,243,0.08)')}
                                            >
                                                <Settings size={13} /> Settings
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Members avatar row */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                                    <div style={{ display: 'flex' }}>
                                        {members.slice(0, 5).map((m, i) => {
                                            const hue = namehue(m.name);
                                            return (
                                                <div key={m.id} title={m.name} style={{
                                                    width: 32, height: 32, borderRadius: '50%',
                                                    background: `hsl(${hue},12%,22%)`,
                                                    border: '2px solid rgba(243,243,243,0.25)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.65rem', fontWeight: 800, color: '#fff', fontFamily: FONT,
                                                    marginLeft: i === 0 ? 0 : -8, zIndex: members.length - i,
                                                    position: 'relative',
                                                }}>{initials(m.name)}</div>
                                            );
                                        })}
                                        {members.length < MOCK_TEAM.maxSize && (
                                            <div style={{
                                                width: 32, height: 32, borderRadius: '50%',
                                                background: 'rgba(243,243,243,0.10)',
                                                border: '2px dashed rgba(243,243,243,0.25)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.75rem', color: 'rgba(243,243,243,0.4)', fontFamily: FONT,
                                                marginLeft: -8, cursor: 'pointer',
                                            }}
                                                onClick={() => setShowInvite(true)}
                                                title="Add member"
                                            >+</div>
                                        )}
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: 'rgba(243,243,243,0.5)', fontFamily: FONT, marginLeft: '0.5rem' }}>
                                        {MOCK_TEAM.maxSize - members.length} slot{MOCK_TEAM.maxSize - members.length !== 1 ? 's' : ''} remaining
                                    </span>
                                </div>
                            </div>

                            {/* ── Members Card ── */}
                            <div className="td-fadein" style={{
                                background: B.card, borderRadius: '1.25rem',
                                border: `1px solid ${B.border}`, boxShadow: B.shadow,
                                overflow: 'hidden',
                                animationDelay: '70ms',
                            }}>
                                {/* Header */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '1.1rem 1.5rem',
                                    borderBottom: `1px solid ${B.border}`,
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Users size={15} style={{ color: B.dark }} />
                                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: B.dark, fontFamily: FONT, letterSpacing: '-0.02em' }}>
                                            Members
                                        </span>
                                        <span style={{
                                            padding: '0.15rem 0.55rem', borderRadius: '999px',
                                            background: B.active, color: B.muted,
                                            fontSize: '0.72rem', fontWeight: 700, fontFamily: FONT,
                                        }}>{members.length}</span>
                                    </div>
                                    {members.length < MOCK_TEAM.maxSize && (
                                        <button
                                            className="td-invite-btn"
                                            onClick={() => setShowInvite(v => !v)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                                padding: '0.55rem 1.1rem', borderRadius: '999px', border: 'none',
                                                background: B.dark, color: '#fff',
                                                fontSize: '0.8rem', fontWeight: 700, fontFamily: FONT,
                                                cursor: 'pointer',
                                                boxShadow: '0 3px 10px rgba(40,41,44,0.18)',
                                            }}
                                        >
                                            <UserPlus size={14} /> Invite Member
                                        </button>
                                    )}
                                </div>

                                {/* Table header */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '1rem',
                                    padding: '0.65rem 1.5rem',
                                    background: 'rgba(40,41,44,0.02)',
                                    borderBottom: `1px solid ${B.border}`,
                                }}>
                                    <div style={{ width: 40, flexShrink: 0 }} />
                                    <p style={{ ...colLabel, flex: '0 0 180px' }}>Member</p>
                                    <p style={{ ...colLabel, flex: '0 0 90px' }}>Gender</p>
                                    <p style={{ ...colLabel, flex: 1 }}>Skills</p>
                                    <p style={{ ...colLabel, flex: '0 0 100px', textAlign: 'right' }}>Actions</p>
                                </div>

                                {/* Member rows */}
                                {members.map(m => (
                                    <MemberRow
                                        key={m.id}
                                        member={m}
                                        covered={coveredSkills}
                                        onRemove={removeM}
                                    />
                                ))}

                                {/* Empty slots */}
                                {Array.from({ length: MOCK_TEAM.maxSize - members.length }).map((_, i) => (
                                    <div key={`slot-${i}`} style={{
                                        padding: '1rem 1.5rem',
                                        borderBottom: `1px dashed ${B.border}`,
                                        display: 'flex', alignItems: 'center', gap: '1rem',
                                        opacity: 0.5,
                                    }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: '50%',
                                            border: `2px dashed rgba(40,41,44,0.12)`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <UserPlus size={14} style={{ color: B.muted }} />
                                        </div>
                                        <span style={{ fontSize: '0.82rem', color: B.muted, fontFamily: FONT, fontStyle: 'italic' }}>
                                            Open slot — invite a teammate
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT SIDEBAR */}
                        <div style={{ width: 280, flexShrink: 0, position: 'sticky', top: '1rem', alignSelf: 'flex-start' }}>
                            <StatsSidebar team={MOCK_TEAM} members={members} />
                        </div>
                    </div>

                    <div style={{ height: '1.5rem' }} />
                </>)}
            </div>
        </>
    );
}

const colLabel: React.CSSProperties = {
    fontSize: '0.68rem', fontWeight: 700, color: B.muted,
    letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: FONT,
};
