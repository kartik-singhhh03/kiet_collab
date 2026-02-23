import React, { useState, useEffect, useRef } from 'react';
import {
    AlertTriangle, Clock, Github, Link2, Upload, FileText,
    CheckCircle2, X, ChevronRight, Send, Loader2,
    Shield, Users, Sparkles, ExternalLink, Info,
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
    shadowH: '0 10px 32px rgba(40,41,44,0.10)',
    green: '#38A169',
    amber: '#D97706',
    rose: '#E53E6A',
} as const;
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

/* ═══════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════ */
const CSS = `
.sp-fadein { animation: spFade 0.4s cubic-bezier(.4,0,.2,1) both; }
@keyframes spFade { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
@keyframes spSuccess { 
  0%{transform:scale(0.5);opacity:0} 
  60%{transform:scale(1.1)} 
  100%{transform:scale(1);opacity:1} 
}
@keyframes spTick { to { stroke-dashoffset: 0; } }
@keyframes spPulse { 0%,100%{opacity:1} 50%{opacity:0.55} }
@keyframes spCountdown { 0%{transform:translateY(-6px);opacity:0}100%{transform:translateY(0);opacity:1} }
.sp-input { transition: border-color 0.18s, box-shadow 0.18s; }
.sp-input:focus { outline: none; border-color: #28292C !important; box-shadow: 0 0 0 3px rgba(40,41,44,0.06); }
.sp-input.error { border-color: #E53E6A !important; }
.sp-submit { transition: background 0.16s, transform 0.13s, box-shadow 0.16s; }
.sp-submit:hover:not(:disabled) { background: #3a3b3f !important; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(40,41,44,0.22); }
.sp-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.sp-drop-zone { transition: border-color 0.18s, background 0.18s; }
.sp-drop-zone.drag-over { border-color: #28292C !important; background: rgba(40,41,44,0.04) !important; }
.sp-check-item { transition: background 0.15s; }
.sp-check-item:hover { background: rgba(40,41,44,0.03); }
.sp-tag { animation: spFade 0.2s ease both; }
`;
function StyleInject() {
    useEffect(() => {
        if (document.getElementById('sp-style')) return;
        const el = document.createElement('style');
        el.id = 'sp-style'; el.textContent = CSS;
        document.head.appendChild(el);
        return () => el.remove();
    }, []);
    return null;
}

/* ═══════════════════════════════════════════════════
   DEADLINE
═══════════════════════════════════════════════════ */
// SIH 2025 deadline: Feb 24 2026 23:59:00 IST
const DEADLINE = new Date('2026-02-24T23:59:00+05:30');

function useCountdown(target: Date) {
    const [diff, setDiff] = useState(target.getTime() - Date.now());
    useEffect(() => {
        const id = setInterval(() => setDiff(target.getTime() - Date.now()), 1000);
        return () => clearInterval(id);
    }, [target]);
    const total = Math.max(diff, 0);
    return {
        days: Math.floor(total / 86400000),
        hours: Math.floor((total % 86400000) / 3600000),
        minutes: Math.floor((total % 3600000) / 60000),
        seconds: Math.floor((total % 60000) / 1000),
        expired: diff <= 0,
        urgent: diff < 3600000 * 6,   // < 6 hours → red
        warning: diff < 3600000 * 24,  // < 24 hours → amber
    };
}

function CountdownUnit({ val, label }: { val: number; label: string }) {
    return (
        <div style={{ textAlign: 'center', minWidth: 52 }}>
            <div style={{
                fontSize: '1.8rem', fontWeight: 900, fontFamily: FONT,
                letterSpacing: '-0.05em', lineHeight: 1,
                animation: 'spCountdown 0.2s ease both',
            }}>{String(val).padStart(2, '0')}</div>
            <div style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '0.15rem', opacity: 0.7 }}>
                {label}
            </div>
        </div>
    );
}

function DeadlineBanner() {
    const { days, hours, minutes, seconds, expired, urgent, warning } = useCountdown(DEADLINE);

    const bg = urgent ? '#B91C1C' : warning ? '#92400E' : B.dark;
    const pulse = urgent ? 'spPulse 1.2s ease-in-out infinite' : 'none';

    return (
        <div style={{
            background: bg,
            borderRadius: '1.25rem',
            padding: '1.1rem 1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '1rem',
            color: '#fff',
            boxShadow: `0 4px 20px ${urgent ? 'rgba(185,28,28,0.3)' : 'rgba(40,41,44,0.18)'}`,
            animation: pulse,
        }}>
            {/* Left: label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                    width: 34, height: 34, borderRadius: '0.7rem',
                    background: 'rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {expired ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                </div>
                <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: FONT }}>
                        {expired ? 'Submission Closed' : 'Submission Deadline'}
                    </p>
                    <p style={{ fontSize: '0.72rem', opacity: 0.75, fontFamily: FONT }}>
                        Smart India Hackathon 2025 · Mon, 24 Feb 2026 · 11:59 PM IST
                    </p>
                </div>
            </div>

            {/* Right: countdown */}
            {!expired && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                    <CountdownUnit val={days} label="days" />
                    <span style={{ fontSize: '1.5rem', fontWeight: 300, opacity: 0.5, marginBottom: '0.5rem' }}>:</span>
                    <CountdownUnit val={hours} label="hrs" />
                    <span style={{ fontSize: '1.5rem', fontWeight: 300, opacity: 0.5, marginBottom: '0.5rem' }}>:</span>
                    <CountdownUnit val={minutes} label="min" />
                    <span style={{ fontSize: '1.5rem', fontWeight: 300, opacity: 0.5, marginBottom: '0.5rem' }}>:</span>
                    <CountdownUnit val={seconds} label="sec" />
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   FORM FIELD WRAPPER
═══════════════════════════════════════════════════ */
function Field({ label, required, hint, error, children }: {
    label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode;
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                <label style={{
                    fontSize: '0.82rem', fontWeight: 700, color: B.dark, fontFamily: FONT,
                }}>
                    {label}
                </label>
                {required && <span style={{ color: B.rose, fontSize: '0.8rem' }}>*</span>}
                {hint && (
                    <span style={{ fontSize: '0.7rem', color: B.muted, fontFamily: FONT }}>{hint}</span>
                )}
            </div>
            {children}
            {error && (
                <p style={{ fontSize: '0.72rem', color: B.rose, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <X size={11} /> {error}
                </p>
            )}
        </div>
    );
}

const inputBase: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem',
    borderRadius: '0.875rem', border: `1.5px solid ${B.border}`,
    background: 'rgba(40,41,44,0.015)',
    fontSize: '0.88rem', color: B.dark, fontFamily: FONT,
    boxSizing: 'border-box',
};

/* ═══════════════════════════════════════════════════
   TECH STACK TAG INPUT
═══════════════════════════════════════════════════ */
const TECH_SUGGEST = [
    'React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Express',
    'Python', 'FastAPI', 'Django', 'Flask', 'TensorFlow', 'PyTorch',
    'Flutter', 'React Native', 'Firebase', 'MongoDB', 'PostgreSQL',
    'Docker', 'Kubernetes', 'AWS', 'GCP', 'TypeScript', 'Figma',
    'Arduino', 'Raspberry Pi', 'OpenCV', 'Scikit-learn', 'Redis',
];

function TechTagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
    const [inputVal, setInputVal] = useState('');
    const [open, setOpen] = useState(false);

    const suggestions = TECH_SUGGEST.filter(s =>
        s.toLowerCase().includes(inputVal.toLowerCase()) && !tags.includes(s)
    ).slice(0, 6);

    const add = (tag: string) => {
        const t = tag.trim();
        if (!t || tags.includes(t) || tags.length >= 10) return;
        onChange([...tags, t]);
        setInputVal('');
        setOpen(false);
    };

    const remove = (tag: string) => onChange(tags.filter(t => t !== tag));

    return (
        <div>
            {/* Tag pills */}
            {tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
                    {tags.map(t => (
                        <span key={t} className="sp-tag" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                            padding: '0.3rem 0.75rem', borderRadius: '999px',
                            background: B.dark, color: '#fff',
                            fontSize: '0.78rem', fontWeight: 600, fontFamily: FONT,
                        }}>
                            {t}
                            <button onClick={() => remove(t)} style={{
                                background: 'none', border: 'none', color: 'rgba(255,255,255,0.65)',
                                cursor: 'pointer', display: 'flex', padding: 0, lineHeight: 1,
                            }}>
                                <X size={11} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Input */}
            <div style={{ position: 'relative' }}>
                <input
                    className="sp-input"
                    value={inputVal}
                    onChange={e => { setInputVal(e.target.value); setOpen(true); }}
                    onKeyDown={e => {
                        if ((e.key === 'Enter' || e.key === ',') && inputVal.trim()) {
                            e.preventDefault(); add(inputVal);
                        }
                        if (e.key === 'Backspace' && !inputVal && tags.length > 0) {
                            remove(tags[tags.length - 1]);
                        }
                    }}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 150)}
                    placeholder={tags.length >= 10 ? 'Max 10 tags' : 'Type and press Enter to add…'}
                    disabled={tags.length >= 10}
                    style={{ ...inputBase, width: '100%' }}
                />

                {open && inputVal && suggestions.length > 0 && (
                    <div style={{
                        position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 30,
                        background: B.card, border: `1px solid ${B.border}`,
                        borderRadius: '0.875rem', boxShadow: B.shadowH, overflow: 'hidden',
                    }}>
                        {suggestions.map(s => (
                            <button key={s} onMouseDown={() => add(s)} style={{
                                display: 'block', width: '100%', textAlign: 'left',
                                padding: '0.65rem 1rem', background: 'none', border: 'none',
                                fontSize: '0.83rem', color: B.dark, fontFamily: FONT,
                                cursor: 'pointer', transition: 'background 0.13s',
                            }}
                                onMouseEnter={e => (e.currentTarget.style.background = B.active)}
                                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                            >{s}</button>
                        ))}
                    </div>
                )}
            </div>
            <p style={{ fontSize: '0.68rem', color: B.muted, fontFamily: FONT, marginTop: '0.35rem' }}>
                {tags.length}/10 · Press Enter or comma to add custom tags
            </p>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   FILE UPLOAD ZONE
═══════════════════════════════════════════════════ */
function FileUpload({ file, onChange }: {
    file: File | null;
    onChange: (f: File | null) => void;
}) {
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) onChange(f);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) onChange(f);
    };

    const fmtSize = (bytes: number) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    if (file) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', gap: '0.85rem',
                padding: '1rem 1.25rem',
                borderRadius: '0.875rem',
                border: `1.5px solid ${B.green}`,
                background: 'rgba(56,161,105,0.04)',
            }}>
                <div style={{
                    width: 40, height: 40, borderRadius: '0.6rem',
                    background: 'rgba(56,161,105,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <FileText size={20} style={{ color: B.green }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: B.dark, fontFamily: FONT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {file.name}
                    </p>
                    <p style={{ fontSize: '0.7rem', color: B.muted, fontFamily: FONT }}>
                        {fmtSize(file.size)} · {file.type || 'application/octet-stream'}
                    </p>
                </div>
                <button
                    onClick={() => onChange(null)}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: B.muted, display: 'flex', padding: '0.25rem',
                        borderRadius: '0.4rem', transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = B.active)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                    <X size={14} />
                </button>
            </div>
        );
    }

    return (
        <div
            className={`sp-drop-zone${dragging ? ' drag-over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            style={{
                border: `1.5px dashed ${B.border}`,
                borderRadius: '0.875rem',
                padding: '2rem 1.5rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem',
                cursor: 'pointer',
                background: dragging ? 'rgba(40,41,44,0.04)' : 'rgba(40,41,44,0.01)',
            }}
        >
            <div style={{
                width: 44, height: 44, borderRadius: '0.85rem',
                background: B.active,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Upload size={20} style={{ color: B.muted }} />
            </div>
            <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: B.dark, fontFamily: FONT }}>
                    Drop PPT / PDF here
                </p>
                <p style={{ fontSize: '0.73rem', color: B.muted, fontFamily: FONT, marginTop: '0.2rem' }}>
                    or <span style={{ color: B.dark, textDecoration: 'underline' }}>browse files</span> · Max 50 MB
                </p>
            </div>
            <input ref={inputRef} type="file" accept=".ppt,.pptx,.pdf,.key" onChange={handleChange} style={{ display: 'none' }} />
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   PRE-SUBMISSION CHECKLIST
═══════════════════════════════════════════════════ */
const CHECKLIST_ITEMS = [
    'Team has at least 1 female member.',
    'Project title is under 80 characters.',
    'GitHub repository is public and README is updated.',
    'Demo video link is accessible (not private).',
    'PPT / PDF presentation is uploaded.',
    'All team members have verified their profile.',
];

function Checklist({ checks, onToggle }: {
    checks: boolean[];
    onToggle: (i: number) => void;
}) {
    const done = checks.filter(Boolean).length;
    return (
        <div style={{
            background: B.card, border: `1px solid ${B.border}`,
            borderRadius: '1.25rem', boxShadow: B.shadow, overflow: 'hidden',
        }}>
            <div style={{
                padding: '1rem 1.25rem',
                borderBottom: `1px solid ${B.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={15} style={{ color: B.dark }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: B.dark, fontFamily: FONT }}>
                        Pre-Submission Checklist
                    </span>
                </div>
                <span style={{
                    padding: '0.18rem 0.6rem', borderRadius: '999px',
                    background: done === CHECKLIST_ITEMS.length ? 'rgba(56,161,105,0.1)' : B.active,
                    color: done === CHECKLIST_ITEMS.length ? B.green : B.muted,
                    fontSize: '0.72rem', fontWeight: 700, fontFamily: FONT,
                }}>{done}/{CHECKLIST_ITEMS.length}</span>
            </div>

            {/* Progress bar */}
            <div style={{ height: 3, background: 'rgba(40,41,44,0.06)' }}>
                <div style={{
                    height: '100%', background: B.green,
                    width: `${(done / CHECKLIST_ITEMS.length) * 100}%`,
                    transition: 'width 0.4s ease',
                }} />
            </div>

            <div style={{ padding: '0.5rem 0' }}>
                {CHECKLIST_ITEMS.map((item, i) => (
                    <div
                        key={i}
                        className="sp-check-item"
                        onClick={() => onToggle(i)}
                        style={{
                            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                            padding: '0.65rem 1.25rem', cursor: 'pointer',
                        }}
                    >
                        <div style={{
                            width: 18, height: 18, borderRadius: '0.38rem', flexShrink: 0, marginTop: '0.05rem',
                            border: `1.5px solid ${checks[i] ? B.green : B.border}`,
                            background: checks[i] ? B.green : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s',
                        }}>
                            {checks[i] && <CheckCircle2 size={11} color="#fff" />}
                        </div>
                        <span style={{
                            fontSize: '0.8rem', fontFamily: FONT,
                            color: checks[i] ? B.muted : B.dark,
                            textDecoration: checks[i] ? 'line-through' : 'none',
                            transition: 'all 0.15s', lineHeight: 1.5,
                        }}>{item}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   GUIDELINES CARD
═══════════════════════════════════════════════════ */
function GuidelinesCard() {
    const items = [
        { icon: <FileText size={14} />, text: 'PPT must be under 50 MB (.pptx / .pdf)' },
        { icon: <Github size={14} />, text: 'GitHub repo must be public' },
        { icon: <Users size={14} />, text: 'At least 1 female member required' },
        { icon: <Clock size={14} />, text: 'Submissions close 24 Feb 2026 · 11:59 PM IST' },
        { icon: <Info size={14} />, text: 'You can update the form before deadline' },
    ];
    return (
        <div style={{
            background: B.card, border: `1px solid ${B.border}`,
            borderRadius: '1.25rem', boxShadow: B.shadow, overflow: 'hidden',
        }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${B.border}` }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 800, color: B.dark, fontFamily: FONT }}>
                    Submission Guidelines
                </p>
            </div>
            <div style={{ padding: '0.75rem 1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {items.map(({ icon, text }, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                        <div style={{
                            width: 26, height: 26, borderRadius: '0.5rem',
                            background: B.active, color: B.muted,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>{icon}</div>
                        <span style={{ fontSize: '0.78rem', color: B.muted, fontFamily: FONT, lineHeight: 1.55 }}>{text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   SUCCESS STATE
═══════════════════════════════════════════════════ */
function SuccessState({ title, onReset }: { title: string; onReset: () => void }) {
    return (
        <div className="sp-fadein" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '1.25rem',
            padding: '3.5rem 2rem', textAlign: 'center',
            background: B.card, borderRadius: '1.5rem',
            border: `1px solid ${B.border}`, boxShadow: B.shadow,
        }}>
            {/* Animated checkmark circle */}
            <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(56,161,105,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'spSuccess 0.5s cubic-bezier(.34,1.56,.64,1) both',
            }}>
                <CheckCircle2 size={40} style={{ color: B.green }} />
            </div>

            <div>
                <p style={{ fontSize: '1.3rem', fontWeight: 900, color: B.dark, fontFamily: FONT, letterSpacing: '-0.04em' }}>
                    Project Submitted! 🎉
                </p>
                <p style={{ fontSize: '0.85rem', color: B.muted, fontFamily: FONT, marginTop: '0.4rem', lineHeight: 1.6 }}>
                    <strong style={{ color: B.dark }}>"{title}"</strong> has been submitted to SIH 2025.<br />
                    You'll receive a confirmation email within 30 minutes.
                </p>
            </div>

            <div style={{
                background: B.active, borderRadius: '1rem', padding: '1rem 1.5rem',
                display: 'flex', flexDirection: 'column', gap: '0.5rem',
                width: '100%', maxWidth: 340,
            }}>
                {[
                    { label: 'Submission ID', val: 'SIH-2025-INB-0471' },
                    { label: 'Status', val: '✅ Under Review' },
                    { label: 'Submitted', val: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) },
                ].map(({ label, val }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: B.muted, fontFamily: FONT }}>{label}</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: B.dark, fontFamily: FONT }}>{val}</span>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                    onClick={onReset}
                    style={{
                        padding: '0.65rem 1.3rem', borderRadius: '999px',
                        border: `1.5px solid ${B.border}`, background: 'none',
                        color: B.dark, fontSize: '0.82rem', fontWeight: 700,
                        fontFamily: FONT, cursor: 'pointer',
                    }}
                >Edit Submission</button>
                <button style={{
                    padding: '0.65rem 1.3rem', borderRadius: '999px', border: 'none',
                    background: B.dark, color: '#fff',
                    fontSize: '0.82rem', fontWeight: 700, fontFamily: FONT,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                    boxShadow: '0 3px 10px rgba(40,41,44,0.18)',
                }}>
                    <ExternalLink size={13} /> View Submission
                </button>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════ */
interface FormData {
    title: string;
    description: string;
    techStack: string[];
    github: string;
    demo: string;
    ppt: File | null;
}
interface FormErrors {
    title?: string;
    description?: string;
    techStack?: string;
    github?: string;
}

export default function SubmissionPage() {
    const [form, setForm] = useState<FormData>({
        title: '', description: '', techStack: [],
        github: '', demo: '', ppt: null,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [checks, setChecks] = useState<boolean[]>(Array(6).fill(false));
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const set = (key: keyof FormData, val: unknown) =>
        setForm(f => ({ ...f, [key]: val }));

    const validate = (): boolean => {
        const e: FormErrors = {};
        if (!form.title.trim()) e.title = 'Project title is required.';
        else if (form.title.length > 80) e.title = 'Title must be 80 characters or fewer.';
        if (!form.description.trim()) e.description = 'Description is required.';
        else if (form.description.length < 80) e.description = 'Please write at least 80 characters.';
        if (form.techStack.length === 0) e.techStack = 'Add at least one technology.';
        if (form.github && !form.github.startsWith('https://'))
            e.github = 'Must be a valid https:// URL.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        await new Promise(r => setTimeout(r, 2000));
        setLoading(false);
        setSubmitted(true);
        // Mark all checklist done
        setChecks(Array(6).fill(true));
    };

    const toggleCheck = (i: number) =>
        setChecks(prev => prev.map((v, idx) => (idx === i ? !v : v)));

    if (submitted) {
        return (
            <>
                <StyleInject />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <DeadlineBanner />
                    <SuccessState title={form.title || 'InnovateBots Project'} onReset={() => setSubmitted(false)} />
                </div>
            </>
        );
    }

    return (
        <>
            <StyleInject />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* ── Breadcrumb ── */}
                <div className="sp-fadein" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.8rem', color: B.muted, fontFamily: FONT }}>Hackathons</span>
                    <ChevronRight size={13} style={{ color: B.muted }} />
                    <span style={{ fontSize: '0.8rem', color: B.muted, fontFamily: FONT }}>SIH 2025</span>
                    <ChevronRight size={13} style={{ color: B.muted }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: B.dark, fontFamily: FONT }}>Submit Project</span>
                </div>

                {/* ── Deadline Banner ── */}
                <div className="sp-fadein" style={{ animationDelay: '40ms' }}>
                    <DeadlineBanner />
                </div>

                {/* ── Body: Form + Sidebar ── */}
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

                    {/* ══ LEFT — Form ══ */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                        {/* Section 1: Project Details */}
                        <div className="sp-fadein" style={{
                            background: B.card, border: `1px solid ${B.border}`,
                            borderRadius: '1.25rem', boxShadow: B.shadow,
                            overflow: 'hidden', animationDelay: '60ms',
                        }}>
                            <SectionHeader icon={<Sparkles size={15} />} label="Project Details" />
                            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                                {/* Title */}
                                <Field label="Project Title" required error={errors.title}
                                    hint={form.title.length > 0 ? `${form.title.length}/80` : undefined}>
                                    <input
                                        className={`sp-input${errors.title ? ' error' : ''}`}
                                        value={form.title}
                                        onChange={e => set('title', e.target.value)}
                                        placeholder="e.g. SmartAgriculture — AI-powered crop monitoring"
                                        maxLength={80}
                                        style={{ ...inputBase }}
                                    />
                                </Field>

                                {/* Description */}
                                <Field label="Project Description" required error={errors.description}
                                    hint={`${form.description.length} chars · min 80`}>
                                    <textarea
                                        className={`sp-input${errors.description ? ' error' : ''}`}
                                        value={form.description}
                                        onChange={e => set('description', e.target.value)}
                                        placeholder="Describe your project — problem statement, solution, and impact. Be concise and clear."
                                        rows={5}
                                        style={{ ...inputBase, resize: 'vertical', lineHeight: 1.6 }}
                                    />
                                </Field>

                            </div>
                        </div>

                        {/* Section 2: Tech Stack */}
                        <div className="sp-fadein" style={{
                            background: B.card, border: `1px solid ${B.border}`,
                            borderRadius: '1.25rem', boxShadow: B.shadow,
                            overflow: 'hidden', animationDelay: '90ms',
                        }}>
                            <SectionHeader icon={<span style={{ fontSize: '0.9rem' }}>⚙️</span>} label="Tech Stack" />
                            <div style={{ padding: '1.5rem' }}>
                                <Field label="Technologies Used" required error={errors.techStack}>
                                    <TechTagInput
                                        tags={form.techStack}
                                        onChange={t => set('techStack', t)}
                                    />
                                </Field>
                            </div>
                        </div>

                        {/* Section 3: Links */}
                        <div className="sp-fadein" style={{
                            background: B.card, border: `1px solid ${B.border}`,
                            borderRadius: '1.25rem', boxShadow: B.shadow,
                            overflow: 'hidden', animationDelay: '120ms',
                        }}>
                            <SectionHeader icon={<Link2 size={15} />} label="Project Links" />
                            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                                {/* GitHub */}
                                <Field label="GitHub Repository" required error={errors.github}>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{
                                            position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)',
                                            color: B.muted, display: 'flex', pointerEvents: 'none',
                                        }}>
                                            <Github size={16} />
                                        </div>
                                        <input
                                            className={`sp-input${errors.github ? ' error' : ''}`}
                                            value={form.github}
                                            onChange={e => set('github', e.target.value)}
                                            placeholder="https://github.com/username/project"
                                            style={{ ...inputBase, paddingLeft: '2.5rem' }}
                                        />
                                    </div>
                                </Field>

                                {/* Demo */}
                                <Field label="Live Demo / Video" hint="optional">
                                    <div style={{ position: 'relative' }}>
                                        <div style={{
                                            position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)',
                                            color: B.muted, display: 'flex', pointerEvents: 'none',
                                        }}>
                                            <Link2 size={16} />
                                        </div>
                                        <input
                                            className="sp-input"
                                            value={form.demo}
                                            onChange={e => set('demo', e.target.value)}
                                            placeholder="https://youtu.be/demo or https://your-app.vercel.app"
                                            style={{ ...inputBase, paddingLeft: '2.5rem' }}
                                        />
                                    </div>
                                </Field>

                            </div>
                        </div>

                        {/* Section 4: Upload */}
                        <div className="sp-fadein" style={{
                            background: B.card, border: `1px solid ${B.border}`,
                            borderRadius: '1.25rem', boxShadow: B.shadow,
                            overflow: 'hidden', animationDelay: '150ms',
                        }}>
                            <SectionHeader icon={<Upload size={15} />} label="Presentation Upload" />
                            <div style={{ padding: '1.5rem' }}>
                                <Field label="PPT / PDF Slide Deck" hint="max 50 MB · .pptx / .pdf / .key">
                                    <FileUpload file={form.ppt} onChange={f => set('ppt', f)} />
                                </Field>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="sp-fadein" style={{ animationDelay: '180ms' }}>
                            <button
                                className="sp-submit"
                                onClick={handleSubmit}
                                disabled={loading}
                                style={{
                                    width: '100%', padding: '0.95rem',
                                    borderRadius: '999px', border: 'none',
                                    background: B.dark, color: '#fff',
                                    fontSize: '0.95rem', fontWeight: 800, fontFamily: FONT,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.55rem',
                                    boxShadow: '0 4px 16px rgba(40,41,44,0.22)',
                                }}
                            >
                                {loading ? (
                                    <><Loader2 size={18} style={{ animation: 'spCountdown 0.5s linear infinite' }} /> Submitting Project…</>
                                ) : (
                                    <><Send size={16} /> Submit Project</>
                                )}
                            </button>
                            <p style={{
                                fontSize: '0.72rem', color: B.muted, fontFamily: FONT,
                                textAlign: 'center', marginTop: '0.75rem',
                            }}>
                                By submitting, you confirm all information is accurate and your team meets SIH 2025 eligibility criteria.
                            </p>
                        </div>
                    </div>

                    {/* ══ RIGHT — Sidebar ══ */}
                    <div style={{ width: 290, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'sticky', top: '1rem' }}>
                        <Checklist checks={checks} onToggle={toggleCheck} />
                        <GuidelinesCard />
                    </div>
                </div>

                <div style={{ height: '1.5rem' }} />
            </div>
        </>
    );
}

/* ═══════════════════════════════════════════════════
   SECTION HEADER
═══════════════════════════════════════════════════ */
function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div style={{
            padding: '1rem 1.5rem',
            borderBottom: `1px solid ${B.border}`,
            display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
            <div style={{ color: B.dark }}>{icon}</div>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: B.dark, fontFamily: FONT, letterSpacing: '-0.02em' }}>
                {label}
            </span>
        </div>
    );
}
