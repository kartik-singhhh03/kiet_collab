import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Send, Smile, Paperclip, Search, Phone, Video,
    MoreHorizontal, CheckCheck, Plus,
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
    green: '#38A169',
    amber: '#D97706',
} as const;
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const ME_ID = 0; // current user

/* ═══════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════ */
const CSS = `
.tc-msg-row { animation: tcMsgIn 0.28s cubic-bezier(.4,0,.2,1) both; }
@keyframes tcMsgIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes tcDot {
  0%,80%,100%{transform:scale(0.55);opacity:0.4}
  40%{transform:scale(1);opacity:1}
}
.tc-typing-dot:nth-child(1){animation-delay:0ms}
.tc-typing-dot:nth-child(2){animation-delay:160ms}
.tc-typing-dot:nth-child(3){animation-delay:320ms}
.tc-scroll::-webkit-scrollbar{width:4px}
.tc-scroll::-webkit-scrollbar-track{background:transparent}
.tc-scroll::-webkit-scrollbar-thumb{background:rgba(40,41,44,0.1);border-radius:99px}
.tc-member-row{transition:background 0.14s;cursor:pointer}
.tc-member-row:hover{background:rgba(40,41,44,0.04)!important}
.tc-member-row.active{background:rgba(40,41,44,0.06)!important}
.tc-bubble-own:hover .tc-ts  { opacity:1 !important; }
.tc-bubble-other:hover .tc-ts { opacity:1 !important; }
.tc-react-btn{transition:transform 0.15s,opacity 0.15s;opacity:0}
.tc-msg-row:hover .tc-react-btn{opacity:1}
.tc-react-btn:hover{transform:scale(1.2)}
.tc-send-btn{transition:background 0.15s,transform 0.13s}
.tc-send-btn:hover:not(:disabled){transform:scale(1.07)}
.tc-send-btn:disabled{opacity:0.45}
.tc-attach-btn{transition:color 0.13s}
.tc-attach-btn:hover{color:#28292C!important}
`;
function StyleInject() {
    useEffect(() => {
        if (document.getElementById('tc-style')) return;
        const el = document.createElement('style');
        el.id = 'tc-style'; el.textContent = CSS;
        document.head.appendChild(el);
        return () => el.remove();
    }, []);
    return null;
}

/* ═══════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════ */
type Status = 'online' | 'away' | 'offline';
interface Member { id: number; name: string; branch: string; status: Status; role: 'leader' | 'member'; }
interface Reaction { emoji: string; count: number; mine: boolean; }
interface Message {
    id: number;
    senderId: number;
    text: string;
    ts: Date;
    read: boolean;
    reactions: Reaction[];
    system?: boolean;
}

/* ═══════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════ */
const MEMBERS: Member[] = [
    { id: 0, name: 'You (Ansh)', branch: 'CSE', status: 'online', role: 'member' },
    { id: 1, name: 'Arjun Mehta', branch: 'IT', status: 'online', role: 'leader' },
    { id: 2, name: 'Priya Sharma', branch: 'CSE', status: 'online', role: 'member' },
    { id: 3, name: 'Rohan Verma', branch: 'ECE', status: 'away', role: 'member' },
    { id: 4, name: 'Sneha Gupta', branch: 'CSE', status: 'online', role: 'member' },
    { id: 5, name: 'Kabir M.', branch: 'IT', status: 'offline', role: 'member' },
];

function ts(h: number, m: number, daysAgo = 0): Date {
    const d = new Date(); d.setDate(d.getDate() - daysAgo);
    d.setHours(h, m, 0, 0); return d;
}

const INITIAL_MESSAGES: Message[] = [
    { id: 1, senderId: -1, text: 'InnovateBots was created · 2 days ago', ts: ts(10, 0, 2), read: true, reactions: [], system: true },
    { id: 2, senderId: 1, text: 'Hey team! Let\'s finalize our SIH submission today. We need to polish the README and record the demo video. 🚀', ts: ts(10, 5, 2), read: true, reactions: [{ emoji: '🔥', count: 2, mine: false }] },
    { id: 3, senderId: 2, text: 'On it! I\'ve already pushed the frontend changes to the dev branch. The dashboard looks great now.', ts: ts(10, 7, 2), read: true, reactions: [] },
    { id: 4, senderId: 0, text: 'Backend APIs are all set. I\'m integrating with Arjun\'s ML model right now — should be done by afternoon.', ts: ts(10, 9, 2), read: true, reactions: [{ emoji: '👍', count: 1, mine: true }] },
    { id: 5, senderId: 4, text: 'Figma designs are finalized btw! Sharing the link in the resources channel. Let me know if anything needs tweaking.', ts: ts(10, 15, 2), read: true, reactions: [{ emoji: '❤️', count: 3, mine: true }] },
    { id: 6, senderId: 1, text: 'Amazing progress everyone 🔥 Rohan, how\'s the IoT sensor integration coming along?', ts: ts(14, 30, 2), read: true, reactions: [] },
    { id: 7, senderId: 3, text: 'Almost done — need maybe 2 more hours. Running edge case tests.', ts: ts(14, 45, 2), read: true, reactions: [] },
    { id: 8, senderId: 1, text: 'Great. Let\'s do a full team call tonight at 9 PM?', ts: ts(15, 0, 2), read: true, reactions: [] },
    { id: 9, senderId: 2, text: '👍 Works for me', ts: ts(15, 2, 2), read: true, reactions: [] },
    { id: 10, senderId: 0, text: 'Same here!', ts: ts(15, 3, 2), read: true, reactions: [] },
    { id: 11, senderId: -1, text: 'Yesterday', ts: ts(0, 0, 1), read: true, reactions: [], system: true },
    { id: 12, senderId: 2, text: 'The demo video is rendered! Uploading to drive now. Quality looks good.', ts: ts(11, 20, 1), read: true, reactions: [{ emoji: '🎉', count: 4, mine: true }] },
    { id: 13, senderId: 4, text: 'Can someone add the project docs link to the submission form?', ts: ts(11, 45, 1), read: true, reactions: [] },
    { id: 14, senderId: 0, text: 'On it! Just need the Drive link from Priya.', ts: ts(11, 47, 1), read: true, reactions: [] },
    { id: 15, senderId: 2, text: 'Here it is 👉 https://drive.google.com/innov8bots-sih-2025', ts: ts(11, 50, 1), read: true, reactions: [] },
    { id: 16, senderId: 0, text: 'Added! Submission form is 90% done. Just waiting on Rohan\'s module.', ts: ts(12, 0, 1), read: true, reactions: [] },
    { id: 17, senderId: 3, text: 'Done ✅ Pushed to main. All tests passing.', ts: ts(15, 30, 1), read: true, reactions: [{ emoji: '🔥', count: 3, mine: false }] },
    { id: 18, senderId: 1, text: 'Brilliant! Let\'s finalize tonight.', ts: ts(15, 35, 1), read: true, reactions: [] },
    { id: 19, senderId: -1, text: 'Today', ts: ts(0, 0, 0), read: true, reactions: [], system: true },
    { id: 20, senderId: 1, text: 'Good morning team! SIH submission deadline is at 11:59 PM tonight. Let\'s make it count 💪', ts: ts(9, 0, 0), read: true, reactions: [{ emoji: '💪', count: 4, mine: true }] },
    { id: 21, senderId: 2, text: 'Running final checks on the frontend. Will update by noon.', ts: ts(9, 5, 0), read: true, reactions: [] },
    { id: 22, senderId: 0, text: 'Backend performance looks solid. P95 latency under 120ms 🎯', ts: ts(9, 12, 0), read: true, reactions: [{ emoji: '🎯', count: 2, mine: false }] },
];

/* ═══════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════ */
function initials(name: string) {
    return name.replace('You (', '').replace(')', '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}
function namehue(name: string) {
    return (name.charCodeAt(0) * 17 + name.charCodeAt(1) * 7) % 360;
}
function fmtTime(d: Date) {
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function Avatar({ name, size = 34 }: { name: string; size?: number }) {
    const clean = name.replace(/^You \(/, '').replace(/\)$/, '');
    const hue = namehue(clean);
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%', flexShrink: 0,
            background: `hsl(${hue},12%,22%)`, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.36, fontWeight: 800, fontFamily: FONT,
        }}>{initials(name)}</div>
    );
}

function StatusDot({ status, size = 8 }: { status: Status; size?: number }) {
    const color = status === 'online' ? B.green : status === 'away' ? B.amber : 'rgba(40,41,44,0.25)';
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: color, flexShrink: 0,
            boxShadow: status === 'online' ? `0 0 0 2px rgba(56,161,105,0.2)` : 'none',
        }} />
    );
}

/* ═══════════════════════════════════════════════════
   MEMBERS SIDEBAR
═══════════════════════════════════════════════════ */
function MembersSidebar({ members, activeMemberId, onSelect }: {
    members: Member[];
    activeMemberId: number | null;
    onSelect: (id: number) => void;
}) {
    const online = members.filter(m => m.status === 'online');
    const away = members.filter(m => m.status === 'away');
    const offline = members.filter(m => m.status === 'offline');

    const renderGroup = (group: Member[], label: string) => (
        group.length > 0 && (
            <div>
                <p style={{
                    fontSize: '0.63rem', fontWeight: 700, color: B.muted,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    fontFamily: FONT, padding: '0.85rem 1.1rem 0.35rem',
                }}>{label} — {group.length}</p>
                {group.map(m => (
                    <div
                        key={m.id}
                        className={`tc-member-row${activeMemberId === m.id ? ' active' : ''}`}
                        onClick={() => onSelect(m.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.7rem',
                            padding: '0.6rem 1.1rem',
                            opacity: m.status === 'offline' ? 0.6 : 1,
                        }}
                    >
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <Avatar name={m.name} size={32} />
                            <div style={{
                                position: 'absolute', bottom: -1, right: -1,
                                border: `2px solid ${B.card}`, borderRadius: '50%',
                            }}>
                                <StatusDot status={m.status} size={7} />
                            </div>
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <p style={{
                                fontSize: '0.82rem', fontWeight: m.role === 'leader' ? 800 : 600,
                                color: B.dark, fontFamily: FONT,
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                                {m.name}
                                {m.id === ME_ID && <span style={{ color: B.muted, fontWeight: 400 }}> (you)</span>}
                            </p>
                            <p style={{ fontSize: '0.68rem', color: B.muted, fontFamily: FONT }}>
                                {m.role === 'leader' ? '👑 Leader · ' : ''}{m.branch}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        )
    );

    return (
        <div style={{
            width: 220, flexShrink: 0,
            background: B.card,
            borderRight: `1px solid ${B.border}`,
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem 1.1rem 0.85rem',
                borderBottom: `1px solid ${B.border}`,
            }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 800, color: B.dark, fontFamily: FONT, letterSpacing: '-0.02em' }}>
                    InnovateBots
                </p>
                <p style={{ fontSize: '0.7rem', color: B.muted, fontFamily: FONT, marginTop: '0.1rem' }}>
                    {members.filter(m => m.status === 'online').length} online
                </p>
            </div>

            {/* Member groups */}
            <div className="tc-scroll" style={{ flex: 1, overflowY: 'auto' }}>
                {renderGroup(online, 'Online')}
                {renderGroup(away, 'Away')}
                {renderGroup(offline, 'Offline')}
            </div>

            {/* Add member mini button */}
            <div style={{ padding: '0.85rem', borderTop: `1px solid ${B.border}` }}>
                <button style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.55rem 0.75rem', borderRadius: '0.75rem',
                    background: 'none', border: `1px dashed ${B.border}`,
                    color: B.muted, fontSize: '0.75rem', fontWeight: 600, fontFamily: FONT,
                    cursor: 'pointer', transition: 'all 0.15s',
                }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(40,41,44,0.2)'; e.currentTarget.style.color = B.dark; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = B.border; e.currentTarget.style.color = B.muted; }}
                >
                    <Plus size={14} /> Invite Member
                </button>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   TYPING INDICATOR
═══════════════════════════════════════════════════ */
function TypingIndicator({ name }: { name: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.55rem', padding: '0.5rem 0' }}>
            <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(40,41,44,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6rem', fontWeight: 800, color: B.muted, fontFamily: FONT,
            }}>
                {name[0]}
            </div>
            <div style={{
                padding: '0.7rem 0.9rem', borderRadius: '1rem 1rem 1rem 0.2rem',
                background: B.card, border: `1px solid ${B.border}`,
                display: 'flex', alignItems: 'center', gap: '4px',
                boxShadow: '0 1px 6px rgba(40,41,44,0.05)',
            }}>
                {[0, 1, 2].map(i => (
                    <div key={i} className="tc-typing-dot" style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: B.muted,
                        animation: 'tcDot 1.4s ease-in-out infinite',
                        animationDelay: `${i * 160}ms`,
                    }} />
                ))}
            </div>
            <span style={{ fontSize: '0.68rem', color: B.muted, fontFamily: FONT, marginBottom: '0.35rem' }}>
                {name} is typing…
            </span>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   REACTION PILL
═══════════════════════════════════════════════════ */
function ReactionPills({ reactions, onToggle }: {
    reactions: Reaction[];
    onToggle: (emoji: string) => void;
}) {
    if (reactions.length === 0) return null;
    return (
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
            {reactions.map(r => (
                <button
                    key={r.emoji}
                    onClick={() => onToggle(r.emoji)}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                        padding: '0.2rem 0.55rem', borderRadius: '999px',
                        border: `1.5px solid ${r.mine ? B.dark : B.border}`,
                        background: r.mine ? 'rgba(40,41,44,0.07)' : B.card,
                        fontSize: '0.78rem', cursor: 'pointer', fontFamily: FONT,
                        transition: 'all 0.14s',
                    }}
                >
                    <span>{r.emoji}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: B.dark }}>{r.count}</span>
                </button>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   MESSAGE BUBBLE
═══════════════════════════════════════════════════ */
interface BubbleProps {
    msg: Message;
    isMe: boolean;
    showAvatar: boolean;
    member?: Member;
    onReact: (msgId: number, emoji: string) => void;
    isLast: boolean;
}
function MessageBubble({ msg, isMe, showAvatar, member, onReact, isLast }: BubbleProps) {
    const QUICK = ['👍', '🔥', '❤️', '😂', '🎯'];
    const [showActions, setShowActions] = useState(false);

    if (msg.system) {
        return (
            <div style={{
                display: 'flex', justifyContent: 'center',
                padding: '0.75rem 0',
            }}>
                <span style={{
                    padding: '0.25rem 0.9rem', borderRadius: '999px',
                    background: B.active, color: B.muted,
                    fontSize: '0.7rem', fontWeight: 600, fontFamily: FONT,
                }}>{msg.text}</span>
            </div>
        );
    }

    const avatarSlot = (
        <div style={{ width: 28, flexShrink: 0 }}>
            {showAvatar && member && !isMe && (
                <Avatar name={member.name} size={28} />
            )}
        </div>
    );

    return (
        <div
            className="tc-msg-row"
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
            style={{
                display: 'flex',
                flexDirection: isMe ? 'row-reverse' : 'row',
                gap: '0.55rem', alignItems: 'flex-end',
                padding: '0.18rem 0',
            }}
        >
            {!isMe && avatarSlot}

            <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start',
                maxWidth: '68%',
            }}>
                {/* Sender name (only when avatar shown, not me) */}
                {showAvatar && !isMe && member && (
                    <p style={{
                        fontSize: '0.7rem', fontWeight: 700, color: B.dark,
                        fontFamily: FONT, marginBottom: '0.2rem',
                        paddingLeft: '0.5rem',
                    }}>{member.name}</p>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.4rem', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                    {/* Bubble */}
                    <div
                        className={isMe ? 'tc-bubble-own' : 'tc-bubble-other'}
                        style={{
                            padding: '0.65rem 0.95rem',
                            borderRadius: isMe
                                ? '1.1rem 1.1rem 0.25rem 1.1rem'
                                : '1.1rem 1.1rem 1.1rem 0.25rem',
                            background: isMe ? B.dark : B.card,
                            border: isMe ? 'none' : `1px solid rgba(40,41,44,0.06)`,
                            boxShadow: isMe
                                ? '0 2px 8px rgba(40,41,44,0.18)'
                                : '0 1px 6px rgba(40,41,44,0.05)',
                            color: isMe ? '#fff' : B.dark,
                            fontSize: '0.875rem', fontFamily: FONT, lineHeight: 1.55,
                            wordBreak: 'break-word',
                            position: 'relative',
                        }}
                    >
                        {msg.text}
                    </div>

                    {/* Timestamp (on hover) */}
                    <span className="tc-ts" style={{
                        fontSize: '0.62rem', color: B.muted, fontFamily: FONT,
                        whiteSpace: 'nowrap', opacity: 0, transition: 'opacity 0.15s',
                        flexShrink: 0, marginBottom: '0.25rem',
                    }}>
                        {fmtTime(msg.ts)}
                    </span>
                </div>

                {/* Read receipt */}
                {isMe && isLast && (
                    <div style={{ marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCheck size={12} style={{ color: B.green }} />
                        <span style={{ fontSize: '0.62rem', color: B.muted, fontFamily: FONT }}>Read</span>
                    </div>
                )}

                {/* Reactions */}
                <ReactionPills
                    reactions={msg.reactions}
                    onToggle={emoji => onReact(msg.id, emoji)}
                />
            </div>

            {/* Quick react (on hover) */}
            {showActions && (
                <div style={{
                    display: 'flex', gap: '0.2rem', alignItems: 'center',
                    background: B.card, border: `1px solid ${B.border}`,
                    borderRadius: '999px', padding: '0.25rem 0.55rem',
                    boxShadow: B.shadow, flexShrink: 0, alignSelf: 'center',
                }}>
                    {QUICK.map(e => (
                        <button
                            key={e}
                            className="tc-react-btn"
                            onClick={() => onReact(msg.id, e)}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: '0.85rem', padding: '0.1rem', lineHeight: 1,
                            }}
                        >{e}</button>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   CHAT WINDOW
═══════════════════════════════════════════════════ */
interface ChatWindowProps {
    messages: Message[];
    onSend: (text: string) => void;
    onReact: (msgId: number, emoji: string) => void;
    typing: boolean;
}
function ChatWindow({ messages, onSend, onReact, typing }: ChatWindowProps) {
    const [input, setInput] = useState('');
    const endRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const memberMap = Object.fromEntries(MEMBERS.map(m => [m.id, m]));

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typing]);

    const handleSend = useCallback(() => {
        const t = input.trim();
        if (!t) return;
        onSend(t);
        setInput('');
        inputRef.current?.focus();
    }, [input, onSend]);

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Group messages
    const lastOwnIdx = [...messages].reverse().findIndex(m => m.senderId === ME_ID && !m.system);
    const lastOwnId = lastOwnIdx >= 0 ? messages[messages.length - 1 - lastOwnIdx].id : -1;

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Chat header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.9rem 1.4rem',
                borderBottom: `1px solid ${B.border}`,
                background: B.card, flexShrink: 0,
            }}>
                <div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 800, color: B.dark, fontFamily: FONT, letterSpacing: '-0.02em' }}>
                        # team-general
                    </p>
                    <p style={{ fontSize: '0.7rem', color: B.muted, fontFamily: FONT, marginTop: '0.1rem' }}>
                        {MEMBERS.filter(m => m.status === 'online').length} members online
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {[
                        { icon: <Search size={16} />, label: 'Search' },
                        { icon: <Phone size={16} />, label: 'Call' },
                        { icon: <Video size={16} />, label: 'Video' },
                        { icon: <MoreHorizontal size={16} />, label: 'More' },
                    ].map(({ icon, label }) => (
                        <button key={label} title={label} style={{
                            width: 34, height: 34, borderRadius: '0.6rem',
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: B.muted, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.13s, color 0.13s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = B.active; e.currentTarget.style.color = B.dark; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = B.muted; }}
                        >{icon}</button>
                    ))}
                </div>
            </div>

            {/* Messages */}
            <div className="tc-scroll" style={{
                flex: 1, overflowY: 'auto',
                padding: '1rem 1.4rem',
                display: 'flex', flexDirection: 'column', gap: '0.1rem',
                background: B.bg,
            }}>
                {messages.map((msg, i) => {
                    const prev = messages[i - 1];
                    const isMe = msg.senderId === ME_ID;
                    const sameAs = prev && prev.senderId === msg.senderId && !msg.system && !prev.system;
                    const showAv = !isMe && !sameAs && !msg.system;
                    const isLastOwn = msg.id === lastOwnId && isMe;
                    return (
                        <MessageBubble
                            key={msg.id}
                            msg={msg}
                            isMe={isMe}
                            showAvatar={showAv}
                            member={memberMap[msg.senderId]}
                            onReact={onReact}
                            isLast={isLastOwn}
                        />
                    );
                })}

                {typing && <TypingIndicator name="Priya" />}
                <div ref={endRef} />
            </div>

            {/* Input bar */}
            <div style={{
                padding: '0.85rem 1.2rem',
                background: B.card,
                borderTop: `1px solid ${B.border}`,
                flexShrink: 0,
            }}>
                <div style={{
                    display: 'flex', alignItems: 'flex-end', gap: '0.6rem',
                    background: B.bg,
                    border: `1.5px solid ${B.border}`,
                    borderRadius: '999px',
                    padding: '0.55rem 0.65rem 0.55rem 1rem',
                    transition: 'border-color 0.18s, box-shadow 0.18s',
                }}
                    onFocus={() => { }}
                >
                    {/* Attachment */}
                    <button className="tc-attach-btn" style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: B.muted, display: 'flex', padding: '0.25rem', flexShrink: 0,
                    }}>
                        <Paperclip size={17} />
                    </button>

                    {/* Textarea */}
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="Message InnovateBots…"
                        rows={1}
                        style={{
                            flex: 1, border: 'none', outline: 'none',
                            background: 'transparent', resize: 'none',
                            fontSize: '0.875rem', color: B.dark, fontFamily: FONT,
                            lineHeight: 1.5, maxHeight: 120, overflowY: 'auto',
                            padding: '0.18rem 0',
                        }}
                    />

                    {/* Emoji */}
                    <button className="tc-attach-btn" style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: B.muted, display: 'flex', padding: '0.25rem', flexShrink: 0,
                    }}>
                        <Smile size={17} />
                    </button>

                    {/* Send */}
                    <button
                        className="tc-send-btn"
                        onClick={handleSend}
                        disabled={!input.trim()}
                        style={{
                            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                            background: input.trim() ? B.dark : 'rgba(40,41,44,0.12)',
                            border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: input.trim() ? '#fff' : B.muted,
                            boxShadow: input.trim() ? '0 2px 8px rgba(40,41,44,0.22)' : 'none',
                            transition: 'all 0.18s',
                        }}
                    >
                        <Send size={15} />
                    </button>
                </div>

                <p style={{
                    fontSize: '0.62rem', color: B.muted, fontFamily: FONT,
                    textAlign: 'center', marginTop: '0.5rem',
                }}>
                    Press <kbd style={{ background: B.active, padding: '0 0.3rem', borderRadius: '0.25rem', fontSize: '0.62rem', fontFamily: 'monospace' }}>Enter</kbd> to send &nbsp;·&nbsp;
                    <kbd style={{ background: B.active, padding: '0 0.3rem', borderRadius: '0.25rem', fontSize: '0.62rem', fontFamily: 'monospace' }}>Shift+Enter</kbd> for new line
                </p>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE EXPORT
═══════════════════════════════════════════════════ */
export default function TeamChatPage() {
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [activeMember, setActive] = useState<number | null>(null);
    const [typing, setTyping] = useState(false);
    const nextId = useRef(INITIAL_MESSAGES.length + 1);
    const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSend = useCallback((text: string) => {
        const msg: Message = {
            id: nextId.current++,
            senderId: ME_ID,
            text,
            ts: new Date(),
            read: false,
            reactions: [],
        };
        setMessages(prev => [...prev, msg]);

        // Simulate a reply after short delay
        if (Math.random() > 0.5) {
            if (typingTimer.current) clearTimeout(typingTimer.current);
            setTyping(true);
            typingTimer.current = setTimeout(() => {
                setTyping(false);
                const replies = [
                    'Got it! Working on it now 🔥',
                    'Sure, sounds good to me!',
                    'Let\'s do it. I\'ll push the changes.',
                    '👍',
                    'On it!',
                    'Great, I\'ll review and get back.',
                ];
                const replyMsg: Message = {
                    id: nextId.current++,
                    senderId: 2, // Priya
                    text: replies[Math.floor(Math.random() * replies.length)],
                    ts: new Date(),
                    read: true,
                    reactions: [],
                };
                setMessages(prev => [...prev, replyMsg]);
            }, 1800 + Math.random() * 1200);
        }
    }, []);

    const handleReact = useCallback((msgId: number, emoji: string) => {
        setMessages(prev => prev.map(m => {
            if (m.id !== msgId) return m;
            const existing = m.reactions.find(r => r.emoji === emoji);
            if (existing) {
                return {
                    ...m, reactions: m.reactions.map(r =>
                        r.emoji === emoji
                            ? { ...r, count: r.mine ? r.count - 1 : r.count + 1, mine: !r.mine }
                            : r
                    ).filter(r => r.count > 0),
                };
            }
            return { ...m, reactions: [...m.reactions, { emoji, count: 1, mine: true }] };
        }));
    }, []);

    useEffect(() => () => { if (typingTimer.current) clearTimeout(typingTimer.current); }, []);

    return (
        <>
            <StyleInject />
            <style>{`@keyframes tcDot{0%,80%,100%{transform:scale(0.55);opacity:0.4}40%{transform:scale(1);opacity:1}}`}</style>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Page title */}
                <div>
                    <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: B.dark, letterSpacing: '-0.04em', fontFamily: FONT }}>
                        Team Chat
                    </h1>
                    <p style={{ fontSize: '0.82rem', color: B.muted, fontFamily: FONT, marginTop: '0.25rem' }}>
                        Real-time messaging with InnovateBots.
                    </p>
                </div>

                {/* Chat container */}
                <div style={{
                    display: 'flex',
                    height: 'calc(100vh - 220px)',
                    minHeight: 520,
                    background: B.card,
                    border: `1px solid ${B.border}`,
                    borderRadius: '1.25rem',
                    boxShadow: B.shadow,
                    overflow: 'hidden',
                }}>
                    <MembersSidebar
                        members={MEMBERS}
                        activeMemberId={activeMember}
                        onSelect={setActive}
                    />
                    <ChatWindow
                        messages={messages}
                        onSend={handleSend}
                        onReact={handleReact}
                        typing={typing}
                    />
                </div>
            </div>
        </>
    );
}
