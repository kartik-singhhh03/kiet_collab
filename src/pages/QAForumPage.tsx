import { useState, useEffect, useRef } from 'react';
import { Search, ChevronUp, MessageSquare, Tag, X, Plus, Clock, Award, Send } from 'lucide-react';

/* ─── Brand ───────────────────────────────────── */
const B = {
    bg: '#F3F3F3', card: '#FFFFFF', dark: '#28292C',
    muted: '#96979A', border: 'rgba(40,41,44,0.07)',
    active: 'rgba(40,41,44,0.05)',
    shadow: '0 2px 12px rgba(40,41,44,0.06)',
    shadowH: '0 12px 36px rgba(40,41,44,0.11)',
} as const;
const FONT = "'Inter',-apple-system,BlinkMacSystemFont,sans-serif";

/* ─── CSS ──────────────────────────────────────── */
const CSS = `
.qa-fade{animation:qaFade .35s cubic-bezier(.4,0,.2,1) both}
@keyframes qaFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.qa-card{transition:box-shadow .2s,border-color .2s;cursor:pointer}
.qa-card:hover{box-shadow:0 10px 32px rgba(40,41,44,0.1)!important;border-color:rgba(40,41,44,0.13)!important}
.qa-upvote{transition:background .15s,transform .13s,color .15s}
.qa-upvote:hover{background:rgba(40,41,44,0.07)!important;transform:translateY(-1px)}
.qa-upvote.active{background:#28292C!important;color:#fff!important}
.qa-btn{transition:background .15s,transform .12s}
.qa-btn:hover{background:#3a3b3f!important;transform:translateY(-1px)}
.qa-overlay{animation:qaOv .22s ease both}
@keyframes qaOv{from{opacity:0}to{opacity:1}}
.qa-modal{animation:qaMod .28s cubic-bezier(.34,1.2,.64,1) both}
@keyframes qaMod{from{opacity:0;transform:scale(.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
.qa-tab{transition:color .15s,border-color .15s}
.qa-input{transition:border-color .15s,box-shadow .15s}
.qa-input:focus{outline:none;border-color:#28292C!important;box-shadow:0 0 0 3px rgba(40,41,44,0.07)}
.qa-scroll::-webkit-scrollbar{width:4px}
.qa-scroll::-webkit-scrollbar-thumb{background:rgba(40,41,44,0.12);border-radius:99px}
`;
function StyleInject() {
    useEffect(() => {
        if (document.getElementById('qa-style')) return;
        const el = document.createElement('style');
        el.id = 'qa-style'; el.textContent = CSS;
        document.head.appendChild(el);
        return () => el.remove();
    }, []);
    return null;
}

/* ─── Types ────────────────────────────────────── */
interface Answer {
    id: number; author: string; avatar: string; body: string;
    votes: number; userVoted: boolean; createdAt: string; accepted: boolean;
}
interface Question {
    id: number; title: string; body: string; tags: string[];
    author: string; avatar: string; votes: number; userVoted: boolean;
    answers: Answer[]; views: number; createdAt: string; solved: boolean;
}

/* ─── Mock Data ────────────────────────────────── */
const INIT: Question[] = [
    {
        id: 1, votes: 24, userVoted: false, views: 312, solved: true,
        title: 'How do I connect to MongoDB Atlas from a Node.js app deployed on Render?',
        body: 'I have a Node.js + Express backend and I\'m trying to connect it to MongoDB Atlas. Works locally but on Render I get "MongoServerSelectionError". I\'ve added the connection string to env vars but still failing.',
        tags: ['Node.js', 'MongoDB', 'Render', 'Deployment'],
        author: 'Aryan Sharma', avatar: 'AS', createdAt: '2026-02-22T08:30:00',
        answers: [
            {
                id: 101, votes: 18, userVoted: false, accepted: true, author: 'Priya Nair', avatar: 'PN', createdAt: '2026-02-22T09:15:00',
                body: 'You need to whitelist your Render server\'s IP (or use 0.0.0.0/0 for all IPs) in MongoDB Atlas under Network Access. Also double-check your connection string includes the database name and uses the +srv syntax.'
            },
            {
                id: 102, votes: 5, userVoted: false, accepted: false, author: 'Karan Mehta', avatar: 'KM', createdAt: '2026-02-22T10:45:00',
                body: 'Also make sure the MONGODB_URI env var is set in Render\'s dashboard under Environment. Render doesn\'t inherit .env files — you must add them manually in the service settings.'
            },
        ],
    },
    {
        id: 2, votes: 17, userVoted: false, views: 198, solved: false,
        title: 'Best way to implement real-time notifications in a React + Socket.io app?',
        body: 'Building a hackathon team chat. Need real-time notifications without polling. What\'s the cleanest pattern for Socket.io with React context/zustand?',
        tags: ['React', 'Socket.io', 'Real-time', 'Zustand'],
        author: 'Sneha Gupta', avatar: 'SG', createdAt: '2026-02-22T14:20:00',
        answers: [
            {
                id: 201, votes: 11, userVoted: false, accepted: false, author: 'Dev Patel', avatar: 'DP', createdAt: '2026-02-22T15:00:00',
                body: 'Use a custom hook like useSocket() that initializes the socket in a useEffect and exposes it via context. In Zustand, create a notificationSlice and call the store setter inside socket.on() listeners. Disconnect the socket in the cleanup function.'
            },
        ],
    },
    {
        id: 3, votes: 9, userVoted: false, views: 87, solved: false,
        title: 'How to handle JWT refresh tokens securely in a mobile app?',
        body: 'Using Flutter + FastAPI. Storing access tokens in memory, but refresh tokens — should they go in secure storage or SharedPreferences? What\'s the industry standard?',
        tags: ['Flutter', 'FastAPI', 'JWT', 'Security'],
        author: 'Mihir Joshi', avatar: 'MJ', createdAt: '2026-02-23T07:10:00',
        answers: [],
    },
    {
        id: 4, votes: 31, userVoted: false, views: 456, solved: true,
        title: 'YOLOv8 model runs at 2 FPS on Raspberry Pi 4 — how to optimize?',
        body: 'Deployed a YOLOv8n model for crop disease detection. Getting only 2 FPS on RPi4. Tried reducing input resolution to 320x320. Any other techniques?',
        tags: ['YOLOv8', 'Raspberry Pi', 'Edge AI', 'Optimization'],
        author: 'Ritu Singh', avatar: 'RS', createdAt: '2026-02-21T16:45:00',
        answers: [
            {
                id: 401, votes: 22, userVoted: false, accepted: true, author: 'Aditya Kumar', avatar: 'AK', createdAt: '2026-02-21T17:30:00',
                body: 'Export to ONNX or TFLite format and use the RPi\'s NEON SIMD via the tflite-runtime package. Also enable OpenCL via the VideoCore GPU. Another option: quantize to INT8 — that alone can give 3-5x speedup with minimal accuracy drop.'
            },
            {
                id: 402, votes: 8, userVoted: false, accepted: false, author: 'Priya Nair', avatar: 'PN', createdAt: '2026-02-21T18:00:00',
                body: 'Also consider using Hailo-8 AI HAT for RPi5, which brings it to 26 TOPS. If you\'re stuck on RPi4, try Coral USB Accelerator — it gives ~4x FPS improvement for TFLite models.'
            },
        ],
    },
    {
        id: 5, votes: 6, userVoted: false, views: 54, solved: false,
        title: 'Solidity: gas optimization for storing large structs on-chain?',
        body: 'My SupplyLedger contract stores detailed medication records as structs. Gas costs are huge. Should I store on IPFS and only hash on-chain, or use events?',
        tags: ['Solidity', 'Gas Optimization', 'IPFS', 'Blockchain'],
        author: 'Neha Verma', avatar: 'NV', createdAt: '2026-02-23T09:00:00',
        answers: [],
    },
];

/* ─── Helpers ──────────────────────────────────── */
function timeAgo(iso: string) {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}
function namehue(s: string) { return (s.charCodeAt(0) * 19 + (s.charCodeAt(1) ?? 7) * 11) % 360; }
function Av({ name, size = 28 }: { name: string; size?: number }) {
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%', flexShrink: 0,
            background: `hsl(${namehue(name)},14%,22%)`, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.36, fontWeight: 800, fontFamily: FONT,
        }}>{name}</div>
    );
}

/* ─── Vote Button ──────────────────────────────── */
function VoteBtn({ votes, voted, onVote }: { votes: number; voted: boolean; onVote: () => void }) {
    return (
        <button
            onClick={e => { e.stopPropagation(); onVote(); }}
            className={`qa-upvote${voted ? ' active' : ''}`}
            style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
                padding: '0.5rem 0.65rem', borderRadius: '0.75rem', border: 'none',
                background: voted ? B.dark : 'transparent', color: voted ? '#fff' : B.dark,
                cursor: 'pointer', fontFamily: FONT,
            }}
        >
            <ChevronUp size={16} strokeWidth={2.5} />
            <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{votes}</span>
        </button>
    );
}

/* ─── Tag Pill ─────────────────────────────────── */
function TagPill({ label }: { label: string }) {
    return (
        <span style={{
            padding: '0.18rem 0.6rem', borderRadius: '999px',
            background: B.active, color: B.muted,
            fontSize: '0.68rem', fontWeight: 700, fontFamily: FONT,
            border: `1px solid ${B.border}`,
        }}>{label}</span>
    );
}

/* ─── Ask Question Modal ───────────────────────── */
function AskModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (q: Question) => void }) {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const tagRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', h);
        return () => document.removeEventListener('keydown', h);
    }, [onClose]);

    const addTag = () => {
        const t = tagInput.trim();
        if (t && !tags.includes(t) && tags.length < 5) {
            setTags([...tags, t]);
            setTagInput('');
        }
    };

    const submit = () => {
        if (!title.trim() || !body.trim()) return;
        const q: Question = {
            id: Date.now(), title: title.trim(), body: body.trim(), tags,
            author: 'You', avatar: 'YO', votes: 0, userVoted: false,
            answers: [], views: 1, solved: false,
            createdAt: new Date().toISOString(),
        };
        onSubmit(q);
        onClose();
    };

    return (
        <div className="qa-overlay" onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(20,20,24,0.48)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="qa-modal" onClick={e => e.stopPropagation()}
                style={{ background: B.card, borderRadius: '1.5rem', width: '100%', maxWidth: 540, boxShadow: '0 24px 64px rgba(40,41,44,0.18)', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: '1.4rem 1.5rem', borderBottom: `1px solid ${B.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontFamily: FONT, fontSize: '1rem', fontWeight: 900, color: B.dark, letterSpacing: '-0.03em' }}>Ask a Question</p>
                    <button onClick={onClose} style={{ background: B.active, border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', color: B.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
                </div>
                {/* Body */}
                <div style={{ padding: '1.4rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: B.dark, fontFamily: FONT, display: 'block', marginBottom: '0.4rem' }}>Title <span style={{ color: B.muted, fontWeight: 400 }}>— be specific and clear</span></label>
                        <input className="qa-input" value={title} onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. How do I fix CORS error in FastAPI with React?"
                            style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '0.75rem', border: `1.5px solid ${B.border}`, fontFamily: FONT, fontSize: '0.85rem', color: B.dark, boxSizing: 'border-box', background: B.bg }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: B.dark, fontFamily: FONT, display: 'block', marginBottom: '0.4rem' }}>Details</label>
                        <textarea className="qa-input" value={body} onChange={e => setBody(e.target.value)} rows={5}
                            placeholder="Describe your problem in detail. Include code snippets, error messages, what you've tried…"
                            style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '0.75rem', border: `1.5px solid ${B.border}`, fontFamily: FONT, fontSize: '0.83rem', color: B.dark, resize: 'vertical', boxSizing: 'border-box', background: B.bg, lineHeight: 1.6 } as React.CSSProperties} />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: B.dark, fontFamily: FONT, display: 'block', marginBottom: '0.4rem' }}>Tags <span style={{ color: B.muted, fontWeight: 400 }}>(up to 5)</span></label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', padding: '0.5rem 0.75rem', borderRadius: '0.75rem', border: `1.5px solid ${B.border}`, background: B.bg, cursor: 'text' }} onClick={() => tagRef.current?.focus()}>
                            {tags.map(t => (
                                <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.18rem 0.55rem', borderRadius: '999px', background: B.dark, color: '#fff', fontSize: '0.7rem', fontWeight: 700, fontFamily: FONT }}>
                                    {t}<button onClick={() => setTags(tags.filter(x => x !== t))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', padding: 0, lineHeight: 1 }}><X size={11} /></button>
                                </span>
                            ))}
                            <input ref={tagRef} value={tagInput} onChange={e => setTagInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } if (e.key === 'Backspace' && !tagInput) setTags(tags.slice(0, -1)); }}
                                placeholder={tags.length === 0 ? 'Add tag & press Enter' : ''}
                                style={{ border: 'none', outline: 'none', background: 'none', fontFamily: FONT, fontSize: '0.8rem', color: B.dark, minWidth: 120, flex: 1 }} />
                        </div>
                    </div>
                </div>
                {/* Footer */}
                <div style={{ padding: '1rem 1.5rem', borderTop: `1px solid ${B.border}`, display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                    <button onClick={onClose} style={{ padding: '0.6rem 1.2rem', borderRadius: '999px', border: `1.5px solid ${B.border}`, background: 'none', color: B.dark, fontFamily: FONT, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={submit} disabled={!title.trim() || !body.trim()}
                        className="qa-btn"
                        style={{ padding: '0.6rem 1.4rem', borderRadius: '999px', border: 'none', background: B.dark, color: '#fff', fontFamily: FONT, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', opacity: (!title.trim() || !body.trim()) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Send size={13} /> Post Question
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Answer Card ──────────────────────────────── */
function AnswerCard({ ans, onVote }: { ans: Answer; onVote: () => void }) {
    return (
        <div style={{ display: 'flex', gap: '0.85rem', paddingTop: '1.1rem' }}>
            {/* Vote column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '0.1rem' }}>
                <VoteBtn votes={ans.votes} voted={ans.userVoted} onVote={onVote} />
                {ans.accepted && (
                    <div title="Accepted answer" style={{ marginTop: '0.4rem', color: '#059669' }}><Award size={16} /></div>
                )}
            </div>
            {/* Content */}
            <div style={{ flex: 1, borderLeft: `2px solid ${ans.accepted ? '#059669' : B.border}`, paddingLeft: '1rem', minWidth: 0 }}>
                {ans.accepted && (
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#059669', background: 'rgba(5,150,105,0.08)', padding: '0.18rem 0.6rem', borderRadius: '999px', display: 'inline-block', marginBottom: '0.45rem', fontFamily: FONT }}>✓ Accepted Answer</span>
                )}
                <p style={{ fontSize: '0.85rem', color: B.dark, fontFamily: FONT, lineHeight: 1.75, margin: 0 }}>{ans.body}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <Av name={ans.avatar} size={22} />
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: B.dark, fontFamily: FONT }}>{ans.author}</span>
                    <span style={{ fontSize: '0.7rem', color: B.muted, fontFamily: FONT }}>· {timeAgo(ans.createdAt)}</span>
                </div>
            </div>
        </div>
    );
}

/* ─── Question Detail ──────────────────────────── */
function QuestionDetail({ q, onBack, onVoteQ, onVoteA, onPostAnswer }: {
    q: Question; onBack: () => void;
    onVoteQ: () => void;
    onVoteA: (aid: number) => void;
    onPostAnswer: (body: string) => void;
}) {
    const [ansBody, setAnsBody] = useState('');
    const submit = () => { if (ansBody.trim()) { onPostAnswer(ansBody.trim()); setAnsBody(''); } };

    return (
        <div className="qa-fade">
            {/* Back */}
            <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: 'none', cursor: 'pointer', color: B.muted, fontFamily: FONT, fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.25rem', padding: 0 }}>
                ← Back to Questions
            </button>

            {/* Question */}
            <div style={{ background: B.card, borderRadius: '1.25rem', border: `1px solid ${B.border}`, boxShadow: B.shadow, padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <VoteBtn votes={q.votes} voted={q.userVoted} onVote={onVoteQ} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
                            {q.solved && <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#059669', background: 'rgba(5,150,105,0.08)', padding: '0.18rem 0.6rem', borderRadius: '999px', fontFamily: FONT }}>✓ Solved</span>}
                            {q.tags.map(t => <TagPill key={t} label={t} />)}
                        </div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: B.dark, fontFamily: FONT, letterSpacing: '-0.03em', lineHeight: 1.35, margin: '0 0 0.75rem' }}>{q.title}</h2>
                        <p style={{ fontSize: '0.85rem', color: B.dark, fontFamily: FONT, lineHeight: 1.8, margin: 0 }}>{q.body}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                            <Av name={q.avatar} size={22} />
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: B.dark, fontFamily: FONT }}>{q.author}</span>
                            <span style={{ fontSize: '0.7rem', color: B.muted, fontFamily: FONT }}>· {timeAgo(q.createdAt)} · {q.views} views</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Answers */}
            <div style={{ background: B.card, borderRadius: '1.25rem', border: `1px solid ${B.border}`, boxShadow: B.shadow, padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 800, color: B.dark, fontFamily: FONT, marginBottom: '0.5rem' }}>
                    {q.answers.length} {q.answers.length === 1 ? 'Answer' : 'Answers'}
                </p>
                {q.answers.length === 0 && (
                    <p style={{ fontSize: '0.82rem', color: B.muted, fontFamily: FONT, padding: '1rem 0' }}>No answers yet — be the first to help!</p>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0', divideY: `1px solid ${B.border}` } as React.CSSProperties}>
                    {q.answers.map((ans, i) => (
                        <div key={ans.id}>
                            {i > 0 && <div style={{ height: 1, background: B.border, margin: '0.25rem 0' }} />}
                            <AnswerCard ans={ans} onVote={() => onVoteA(ans.id)} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Post Answer */}
            <div style={{ background: B.card, borderRadius: '1.25rem', border: `1px solid ${B.border}`, boxShadow: B.shadow, padding: '1.25rem 1.5rem' }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 800, color: B.dark, fontFamily: FONT, marginBottom: '0.75rem' }}>Your Answer</p>
                <textarea className="qa-input" value={ansBody} onChange={e => setAnsBody(e.target.value)} rows={5}
                    placeholder="Write a clear, helpful answer. Include code examples where relevant…"
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.875rem', border: `1.5px solid ${B.border}`, fontFamily: FONT, fontSize: '0.83rem', color: B.dark, resize: 'vertical', lineHeight: 1.7, boxSizing: 'border-box', background: B.bg, display: 'block' } as React.CSSProperties} />
                <button onClick={submit} disabled={!ansBody.trim()}
                    className="qa-btn"
                    style={{ marginTop: '0.85rem', padding: '0.65rem 1.4rem', borderRadius: '999px', border: 'none', background: B.dark, color: '#fff', fontFamily: FONT, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', opacity: !ansBody.trim() ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Send size={13} /> Post Answer
                </button>
            </div>
        </div>
    );
}

/* ─── Question Card List Item ──────────────────── */
function QuestionCard({ q, onClick, onVote }: { q: Question; onClick: () => void; onVote: () => void }) {
    return (
        <div className="qa-card qa-fade" onClick={onClick}
            style={{ background: B.card, borderRadius: '1.125rem', border: `1px solid ${B.border}`, boxShadow: B.shadow, padding: '1.1rem 1.25rem', display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
            {/* Vote col */}
            <VoteBtn votes={q.votes} voted={q.userVoted} onVote={onVote} />

            {/* Main content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: B.dark, fontFamily: FONT, letterSpacing: '-0.02em', lineHeight: 1.35, margin: 0 }}>{q.title}</h3>
                    {q.solved && <span style={{ flexShrink: 0, fontSize: '0.65rem', fontWeight: 700, color: '#059669', background: 'rgba(5,150,105,0.09)', padding: '0.18rem 0.55rem', borderRadius: '999px', fontFamily: FONT }}>✓ Solved</span>}
                </div>
                <p style={{ fontSize: '0.8rem', color: B.muted, fontFamily: FONT, lineHeight: 1.55, margin: '0 0 0.65rem', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' } as React.CSSProperties}>{q.body}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {q.tags.map(t => <TagPill key={t} label={t} />)}
                    <span style={{ flex: 1 }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: B.muted, fontFamily: FONT }}>
                        <Av name={q.avatar} size={18} />
                        <span style={{ fontWeight: 600 }}>{q.author}</span>
                        <span>·</span>
                        <Clock size={11} />
                        <span>{timeAgo(q.createdAt)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: q.answers.length > 0 ? B.dark : B.muted, fontWeight: 700, fontFamily: FONT, background: q.answers.length > 0 ? B.active : 'none', padding: '0.15rem 0.5rem', borderRadius: '999px' }}>
                        <MessageSquare size={11} /> {q.answers.length}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Page ────────────────────────────────── */
const TABS = ['All', 'Unanswered', 'Solved', 'Popular'] as const;
type Tab = typeof TABS[number];

export default function QAForumPage() {
    const [questions, setQuestions] = useState<Question[]>(INIT);
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState<Tab>('All');
    const [selected, setSelected] = useState<number | null>(null);
    const [showAsk, setShowAsk] = useState(false);

    const filtered = questions.filter(q => {
        if (tab === 'Unanswered' && q.answers.length > 0) return false;
        if (tab === 'Solved' && !q.solved) return false;
        if (tab === 'Popular' && q.votes < 10) return false;
        if (search) {
            const s = search.toLowerCase();
            return q.title.toLowerCase().includes(s) || q.tags.some(t => t.toLowerCase().includes(s)) || q.author.toLowerCase().includes(s);
        }
        return true;
    });

    const selectedQ = questions.find(q => q.id === selected) ?? null;

    const handleVoteQ = (id: number) => {
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, votes: q.userVoted ? q.votes - 1 : q.votes + 1, userVoted: !q.userVoted } : q));
    };
    const handleVoteA = (qid: number, aid: number) => {
        setQuestions(prev => prev.map(q => q.id !== qid ? q : {
            ...q, answers: q.answers.map(a => a.id !== aid ? a : { ...a, votes: a.userVoted ? a.votes - 1 : a.votes + 1, userVoted: !a.userVoted })
        }));
    };
    const handlePostAnswer = (qid: number, body: string) => {
        setQuestions(prev => prev.map(q => q.id !== qid ? q : {
            ...q,
            answers: [...q.answers, { id: Date.now(), author: 'You', avatar: 'YO', body, votes: 0, userVoted: false, accepted: false, createdAt: new Date().toISOString() }]
        }));
    };

    return (
        <>
            <StyleInject />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {selectedQ ? (
                    <QuestionDetail
                        q={selectedQ}
                        onBack={() => setSelected(null)}
                        onVoteQ={() => handleVoteQ(selectedQ.id)}
                        onVoteA={aid => handleVoteA(selectedQ.id, aid)}
                        onPostAnswer={body => handlePostAnswer(selectedQ.id, body)}
                    />
                ) : (
                    <>
                        {/* ── Header ── */}
                        <div className="qa-fade" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <div>
                                <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: B.dark, letterSpacing: '-0.04em', fontFamily: FONT }}>Q&A Forum</h1>
                                <p style={{ fontSize: '0.8rem', color: B.muted, fontFamily: FONT, marginTop: '0.2rem' }}>{questions.length} questions · Ask the community for help</p>
                            </div>
                            <button onClick={() => setShowAsk(true)} className="qa-btn"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.25rem', borderRadius: '999px', border: 'none', background: B.dark, color: '#fff', fontFamily: FONT, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(40,41,44,0.18)' }}>
                                <Plus size={15} /> Ask Question
                            </button>
                        </div>

                        {/* ── Search + Tabs ── */}
                        <div className="qa-fade" style={{ background: B.card, borderRadius: '1.125rem', border: `1px solid ${B.border}`, boxShadow: B.shadow, padding: '0.85rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', animationDelay: '40ms' }}>
                            <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
                                <Search size={13} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: B.muted, pointerEvents: 'none' }} />
                                <input className="qa-input" value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="Search questions, tags…"
                                    style={{ width: '100%', padding: '0.52rem 0.85rem 0.52rem 2.2rem', borderRadius: '0.7rem', border: `1.5px solid ${B.border}`, background: B.bg, fontFamily: FONT, fontSize: '0.8rem', color: B.dark, boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '0.3rem' }}>
                                {TABS.map(t => (
                                    <button key={t} onClick={() => setTab(t)} className="qa-tab"
                                        style={{ padding: '0.45rem 0.9rem', borderRadius: '999px', border: 'none', background: tab === t ? B.dark : 'none', color: tab === t ? '#fff' : B.muted, fontFamily: FONT, fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: B.muted, fontFamily: FONT, background: B.active, padding: '0.28rem 0.7rem', borderRadius: '999px', fontWeight: 600 }}>
                                {filtered.length} results
                            </span>
                        </div>

                        {/* ── Tag filter strip ── */}
                        <div className="qa-fade" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center', animationDelay: '60ms' }}>
                            <Tag size={12} style={{ color: B.muted }} />
                            {['Node.js', 'React', 'Flutter', 'Python', 'Blockchain', 'AI / ML', 'Security'].map(t => (
                                <button key={t} onClick={() => setSearch(t === search ? '' : t)}
                                    style={{ padding: '0.2rem 0.7rem', borderRadius: '999px', border: `1.5px solid ${t === search ? B.dark : B.border}`, background: t === search ? B.dark : B.card, color: t === search ? '#fff' : B.muted, fontFamily: FONT, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', transition: 'all .15s' }}>
                                    {t}
                                </button>
                            ))}
                        </div>

                        {/* ── Questions list ── */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {filtered.length === 0 && (
                                <div style={{ background: B.card, borderRadius: '1.125rem', border: `1px solid ${B.border}`, padding: '3rem', textAlign: 'center' }}>
                                    <p style={{ color: B.muted, fontFamily: FONT, fontSize: '0.85rem' }}>No questions match your filters.</p>
                                    <button onClick={() => { setSearch(''); setTab('All'); }} style={{ marginTop: '0.75rem', background: 'none', border: 'none', color: B.dark, fontFamily: FONT, fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}>Clear filters</button>
                                </div>
                            )}
                            {filtered.map((q, i) => (
                                <div key={q.id} style={{ animationDelay: `${i * 40}ms` }}>
                                    <QuestionCard
                                        q={q}
                                        onClick={() => setSelected(q.id)}
                                        onVote={() => handleVoteQ(q.id)}
                                    />
                                </div>
                            ))}
                        </div>
                        <div style={{ height: '1rem' }} />
                    </>
                )}
            </div>

            {showAsk && (
                <AskModal
                    onClose={() => setShowAsk(false)}
                    onSubmit={q => setQuestions(prev => [q, ...prev])}
                />
            )}
        </>
    );
}
