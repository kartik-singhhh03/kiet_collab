import { useState, useMemo, useEffect, useRef } from 'react';
import {
    Search, SlidersHorizontal, Heart, Eye, ExternalLink,
    Github, X, ChevronDown, Users, Layers, ArrowRight,
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
    shadowH: '0 12px 36px rgba(40,41,44,0.12)',
} as const;
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

/* ═══════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════ */
const CSS = `
.pg-fadein { animation: pgFade 0.4s cubic-bezier(.4,0,.2,1) both; }
@keyframes pgFade { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
.pg-card {
  transition: transform 0.22s cubic-bezier(.4,0,.2,1),
              box-shadow 0.22s cubic-bezier(.4,0,.2,1),
              border-color 0.22s;
  cursor: pointer;
}
.pg-card:hover {
  transform: translateY(-5px) !important;
  box-shadow: 0 16px 42px rgba(40,41,44,0.13) !important;
  border-color: rgba(40,41,44,0.13) !important;
}
.pg-btn { transition: background 0.15s, transform 0.12s; }
.pg-btn:hover { background: #3a3b3f !important; transform: translateY(-1px); }
.pg-view-btn { transition: background 0.15s, color 0.15s; }
.pg-view-btn:hover { background: rgba(40,41,44,0.07) !important; color: #28292C !important; }
.pg-like-btn { transition: color 0.15s, transform 0.15s; }
.pg-like-btn:hover { transform: scale(1.2); }
.pg-filter-select { transition: border-color 0.15s, box-shadow 0.15s; }
.pg-filter-select:focus { outline: none; border-color: #28292C !important; box-shadow: 0 0 0 3px rgba(40,41,44,0.06); }
.pg-panel { /* detail panel */ }
.pg-detail-overlay { animation: pgOverlay 0.25s ease both; }
@keyframes pgOverlay { from{opacity:0} to{opacity:1} }
.pg-detail-panel { animation: pgSlide 0.3s cubic-bezier(.4,0,.2,1) both; }
@keyframes pgSlide { from{transform:translateX(100%)} to{transform:translateX(0)} }
.pg-scroll::-webkit-scrollbar{width:4px}
.pg-scroll::-webkit-scrollbar-track{background:transparent}
.pg-scroll::-webkit-scrollbar-thumb{background:rgba(40,41,44,0.12);border-radius:99px}
.pg-badge { transition: transform 0.15s; }
.pg-badge:hover { transform: scale(1.05); }
`;
function StyleInject() {
    useEffect(() => {
        if (document.getElementById('pg-style')) return;
        const el = document.createElement('style');
        el.id = 'pg-style'; el.textContent = CSS;
        document.head.appendChild(el);
        return () => el.remove();
    }, []);
    return null;
}

/* ═══════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════ */
type Category = 'AI / ML' | 'IoT' | 'App Dev' | 'Blockchain' | 'Cybersecurity' | 'HealthTech' | 'EdTech' | 'Sustainability';
type Status = 'Winner' | 'Finalist' | 'Submitted';

interface Project {
    id: number;
    title: string;
    team: string;
    members: number;
    college: string;
    category: Category;
    hackathon: string;
    description: string;
    longDesc: string;
    tech: string[];
    github: string;
    demo: string;
    likes: number;
    views: number;
    status: Status;
    year: number;
}

/* ═══════════════════════════════════════════════════
   CATEGORY CONFIG
═══════════════════════════════════════════════════ */
const CAT: Record<Category, { color: string; bg: string; light: string }> = {
    'AI / ML': { color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', light: 'rgba(124,58,237,0.12)' },
    'IoT': { color: '#0891B2', bg: 'rgba(8,145,178,0.08)', light: 'rgba(8,145,178,0.12)' },
    'App Dev': { color: '#2563EB', bg: 'rgba(37,99,235,0.08)', light: 'rgba(37,99,235,0.12)' },
    'Blockchain': { color: '#D97706', bg: 'rgba(217,119,6,0.08)', light: 'rgba(217,119,6,0.12)' },
    'Cybersecurity': { color: '#DC2626', bg: 'rgba(220,38,38,0.07)', light: 'rgba(220,38,38,0.11)' },
    'HealthTech': { color: '#059669', bg: 'rgba(5,150,105,0.08)', light: 'rgba(5,150,105,0.12)' },
    'EdTech': { color: '#4F46E5', bg: 'rgba(79,70,229,0.08)', light: 'rgba(79,70,229,0.12)' },
    'Sustainability': { color: '#16A34A', bg: 'rgba(22,163,74,0.08)', light: 'rgba(22,163,74,0.12)' },
};

const STATUS_CFG: Record<Status, { label: string; color: string; bg: string }> = {
    Winner: { label: '🏆 Winner', color: '#92400E', bg: 'rgba(251,191,36,0.12)' },
    Finalist: { label: '🥈 Finalist', color: '#1E40AF', bg: 'rgba(59,130,246,0.09)' },
    Submitted: { label: '✅ Submitted', color: '#065F46', bg: 'rgba(16,185,129,0.08)' },
};

/* ═══════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════ */
const PROJECTS: Project[] = [
    {
        id: 1,
        title: 'CropSense AI',
        team: 'AgroTech Squad', members: 5, college: 'IIT Delhi',
        category: 'AI / ML', hackathon: 'Smart India Hackathon 2025',
        description: 'AI-powered real-time crop disease detection using computer vision and drone imagery, reducing yield loss by up to 40%.',
        longDesc: 'CropSense AI combines satellite imagery with on-ground drone data to detect crop diseases at an early stage using a custom-trained YOLOv8 model. The platform provides farmers with actionable recommendations via a mobile app available in 8 regional languages. Integration with the PM-KISAN database allows targeted advisory for 14 crore beneficiaries.',
        tech: ['Python', 'YOLOv8', 'FastAPI', 'Flutter', 'Firebase', 'GCP'],
        github: 'https://github.com/agrotechsquad/cropsense', demo: 'https://cropsense.vercel.app',
        likes: 312, views: 1840, status: 'Winner', year: 2025,
    },
    {
        id: 2,
        title: 'MindSpace',
        team: 'InnovateBots', members: 5, college: 'KIET Group of Institutions',
        category: 'HealthTech', hackathon: 'Smart India Hackathon 2025',
        description: 'Anonymous peer-support mental health platform with AI-assisted mood tracking and therapist matching for college students.',
        longDesc: 'MindSpace provides a safe, anonymous space for college students to share mental health struggles, track moods via NLP sentiment analysis, and get matched to verified therapists. The platform includes crisis detection algorithms and immediate helpline routing. Integrated with the national NIMHANS registry for verified therapist onboarding.',
        tech: ['React', 'Node.js', 'MongoDB', 'TensorFlow', 'WebSocket', 'Firebase'],
        github: 'https://github.com/innovatebots/mindspace', demo: 'https://mindspace.live',
        likes: 245, views: 1420, status: 'Finalist', year: 2025,
    },
    {
        id: 3,
        title: 'SupplyLedger',
        team: 'BlockBuilders', members: 4, college: 'NIT Trichy',
        category: 'Blockchain', hackathon: 'Hack4Change 2025',
        description: 'Transparent pharmaceutical supply chain on Ethereum — track medicine authenticity from manufacturer to patient in real time.',
        longDesc: 'SupplyLedger deploys smart contracts on Ethereum L2 (Polygon) to record every handoff in the pharmaceutical supply chain. QR codes on packages are scanned at each checkpoint, creating an immutable audit trail. Counterfeit detection accuracy improved by 94% in pilot across 3 government hospitals in Tamil Nadu.',
        tech: ['Solidity', 'Polygon', 'React', 'Node.js', 'IPFS', 'Web3.js'],
        github: 'https://github.com/blockbuilders/supplyledger', demo: 'https://supplyledger.eth.limo',
        likes: 198, views: 980, status: 'Winner', year: 2025,
    },
    {
        id: 4,
        title: 'NaviAR Indoor',
        team: 'SpaceWalkers', members: 6, college: 'VIT Vellore',
        category: 'App Dev', hackathon: 'HackVIT 2025',
        description: 'AR-based indoor navigation for hospitals and malls using Bluetooth beacons and ARCore — no GPS required.',
        longDesc: 'NaviAR uses a network of Bluetooth Low Energy beacons combined with Google ARCore to provide turn-by-turn AR navigation inside large buildings. Hospital pilot at AIIMS Delhi showed 78% reduction in patient disorientation. The admin dashboard allows facility managers to update floor plans and beacon positions without code.',
        tech: ['ARCore', 'Flutter', 'BLE', 'Firebase', 'Python', 'OpenCV'],
        github: 'https://github.com/spacewalkers/naviar', demo: 'https://naviar.app',
        likes: 167, views: 870, status: 'Finalist', year: 2025,
    },
    {
        id: 5,
        title: 'EduBridge',
        team: 'LearnLab', members: 5, college: 'BITS Pilani',
        category: 'EdTech', hackathon: 'Smart India Hackathon 2025',
        description: 'Adaptive learning platform for rural students with offline-first design, available in 12 Indian languages, aligned to NEP 2020.',
        longDesc: 'EduBridge delivers personalized curriculum using a spaced-repetition engine and knowledge graphs. The app works fully offline via Service Workers and syncs when connectivity is available. Content is crowdsourced from verified government school teachers and auto-translated using IndicBERT. Serves 20,000+ students in pilot across MP and Rajasthan.',
        tech: ['Next.js', 'PWA', 'Python', 'IndicBERT', 'SQLite', 'Redis'],
        github: 'https://github.com/learnlab/edubridge', demo: 'https://edubridge.in',
        likes: 289, views: 1650, status: 'Winner', year: 2025,
    },
    {
        id: 6,
        title: 'SmartGrid Monitor',
        team: 'CurrentFlow', members: 4, college: 'IIT Bombay',
        category: 'IoT', hackathon: 'Hackathon India 2025',
        description: 'Real-time electricity grid fault detection using IoT sensors and ML, reducing power outage response time by 65%.',
        longDesc: 'SmartGrid Monitor deploys a network of current transformers and voltage sensors across distribution lines, feeding data to a time-series anomaly detection model (Isolation Forest). Alerts are pushed to DISCOM control rooms with GPS-pinpointed fault location. Successfully deployed in a 50km grid stretch in Pune with zero false negatives.',
        tech: ['Raspberry Pi', 'MQTT', 'InfluxDB', 'TensorFlow', 'Grafana', 'FastAPI'],
        github: 'https://github.com/currentflow/smartgrid', demo: 'https://smartgrid-monitor.io',
        likes: 134, views: 720, status: 'Submitted', year: 2025,
    },
    {
        id: 7,
        title: 'VaultScan',
        team: 'CipherCrew', members: 3, college: 'IIIT Hyderabad',
        category: 'Cybersecurity', hackathon: 'CyberStrike 2024',
        description: 'Automated API vulnerability scanner with OWASP Top-10 coverage — finds security holes in minutes, not days.',
        longDesc: 'VaultScan uses a custom headless browser engine combined with static analysis to crawl REST and GraphQL APIs, checking against OWASP Top-10, CVE databases, and custom rulesets. Reports are generated with severity scores (CVSS v3.1) and remediation code snippets in 6 languages. Used by 500+ developers in private beta.',
        tech: ['Python', 'Playwright', 'Go', 'Docker', 'PostgreSQL', 'React'],
        github: 'https://github.com/ciphercrew/vaultscan', demo: 'https://vaultscan.dev',
        likes: 211, views: 1100, status: 'Winner', year: 2024,
    },
    {
        id: 8,
        title: 'FoodLoop',
        team: 'ZeroWaste', members: 5, college: 'Jadavpur University',
        category: 'Sustainability', hackathon: 'GreenHack 2025',
        description: 'Food surplus redistribution platform connecting restaurants and households to NGOs — prevented 12 tonnes of food waste in 3 months.',
        longDesc: 'FoodLoop uses a real-time matching engine to connect food donors (restaurants, caterers, households) with verified NGOs and community kitchens within a 5km radius. The platform handles cold-chain logistics via partnered delivery aggregators and provides impact dashboards to donors for CSR reporting. Pilot covers 40 restaurants in Kolkata.',
        tech: ['React Native', 'Node.js', 'PostgreSQL', 'Google Maps API', 'Twilio', 'AWS'],
        github: 'https://github.com/zerowaste/foodloop', demo: 'https://foodloop.org.in',
        likes: 178, views: 940, status: 'Finalist', year: 2025,
    },
    {
        id: 9,
        title: 'DiagnoAI',
        team: 'MedMatrix', members: 6, college: 'AIIMS Delhi',
        category: 'HealthTech', hackathon: 'HealthHack 2025',
        description: 'Chest X-ray AI diagnostic assistant that detects 14 lung conditions with 96.2% accuracy — built for PHC doctors.',
        longDesc: 'DiagnoAI deploys a DenseNet-121 model fine-tuned on the CheXpert + NIH ChestX-ray14 datasets. The web app allows PHC doctors with no specialist training to upload X-rays and receive annotated diagnostic reports in under 10 seconds. The model explains predictions using Grad-CAM heatmaps. Validated in clinical trials at 3 PHCs in Bihar.',
        tech: ['PyTorch', 'DenseNet', 'FastAPI', 'React', 'AWS S3', 'Docker'],
        github: 'https://github.com/medmatrix/diagnoai', demo: 'https://diagnoai.med',
        likes: 387, views: 2140, status: 'Winner', year: 2025,
    },
    {
        id: 10,
        title: 'TrafficBrain',
        team: 'Signal Squad', members: 4, college: 'DTU Delhi',
        category: 'IoT', hackathon: 'Smart India Hackathon 2025',
        description: 'Adaptive traffic signal control using computer vision and RL — reduced average waiting time by 38% in simulation.',
        longDesc: 'TrafficBrain processes CCTV feeds using YOLOv5 to estimate real-time vehicle density at intersections, then applies a Deep Q-Network to optimize signal phase timing. The simulation was validated on real traffic data from 5 Delhi intersections. A hardware prototype was built using Raspberry Pi + relay control for a live demo.',
        tech: ['YOLOv5', 'PyTorch', 'Raspberry Pi', 'OpenCV', 'SUMO Sim', 'React'],
        github: 'https://github.com/signalsquad/trafficbrain', demo: 'https://trafficbrain.dev',
        likes: 156, views: 830, status: 'Submitted', year: 2025,
    },
    {
        id: 11,
        title: 'LegalEase',
        team: 'JusticeTech', members: 5, college: 'NLSIU Bangalore',
        category: 'AI / ML', hackathon: 'HackForJustice 2025',
        description: 'AI-powered legal aid chatbot simplifying Indian law for citizens — answers questions in plain language across 10 languages.',
        longDesc: 'LegalEase fine-tunes LLaMA-3 on 50,000+ Indian court judgments, bare acts, and legal FAQs using PEFT (LoRA). The chatbot answers natural-language queries about consumer rights, tenant laws, RTI, and family law, citing specific sections. Available via WhatsApp and web. 10,000+ queries answered in first month of beta.',
        tech: ['LLaMA-3', 'LoRA', 'LangChain', 'FastAPI', 'React', 'WhatsApp API'],
        github: 'https://github.com/justicetech/legalease', demo: 'https://legalease.ai',
        likes: 224, views: 1290, status: 'Finalist', year: 2025,
    },
    {
        id: 12,
        title: 'AquaNet',
        team: 'BlueWave', members: 4, college: 'IIT Madras',
        category: 'Sustainability', hackathon: 'ClimaTech 2025',
        description: 'Smart water quality monitoring network using 50 IoT buoys across lakes — detects pollution events in under 5 minutes.',
        longDesc: 'AquaNet deploys a mesh network of custom-built IoT buoys equipped with turbidity, pH, dissolved oxygen, and heavy metal sensors. Data streams to an edge ML model running on each buoy for real-time anomaly detection, with alerts sent to pollution control boards. Pilot deployed on Hussain Sagar lake, Hyderabad, with plans to scale to 50 water bodies.',
        tech: ['ESP32', 'LoRaWAN', 'MQTT', 'InfluxDB', 'Grafana', 'TensorFlow Lite'],
        github: 'https://github.com/bluewave/aquanet', demo: 'https://aquanet.io',
        likes: 143, views: 760, status: 'Submitted', year: 2025,
    },
];

/* ═══════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════ */
function initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}
function namehue(name: string) {
    return (name.charCodeAt(0) * 17 + (name.charCodeAt(1) ?? 5) * 7) % 360;
}
function Avatar({ name, size = 28 }: { name: string; size?: number }) {
    const hue = namehue(name);
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%', flexShrink: 0,
            background: `hsl(${hue},14%,22%)`, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.36, fontWeight: 800, fontFamily: FONT,
        }}>{initials(name)}</div>
    );
}

/* ═══════════════════════════════════════════════════
   FILTER DROPDOWN
═══════════════════════════════════════════════════ */
function FilterSelect({ label, value, options, onChange }: {
    label: string; value: string; options: string[];
    onChange: (v: string) => void;
}) {
    return (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
                className="pg-filter-select"
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{
                    appearance: 'none', WebkitAppearance: 'none',
                    padding: '0.55rem 2.2rem 0.55rem 0.9rem',
                    borderRadius: '999px', border: `1.5px solid ${B.border}`,
                    background: value !== 'All' ? B.dark : B.card,
                    color: value !== 'All' ? '#fff' : B.dark,
                    fontSize: '0.8rem', fontWeight: 600, fontFamily: FONT,
                    cursor: 'pointer', transition: 'all 0.16s',
                }}
            >
                {options.map(o => <option key={o} value={o}>{o === 'All' ? `${label}: All` : o}</option>)}
            </select>
            <ChevronDown size={13} style={{
                position: 'absolute', right: '0.7rem', pointerEvents: 'none',
                color: value !== 'All' ? 'rgba(255,255,255,0.7)' : B.muted,
            }} />
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   TECH PILL
═══════════════════════════════════════════════════ */
function TechPill({ label }: { label: string }) {
    return (
        <span style={{
            padding: '0.18rem 0.6rem', borderRadius: '999px',
            background: B.active, color: B.dark,
            fontSize: '0.68rem', fontWeight: 600, fontFamily: FONT,
        }}>{label}</span>
    );
}

/* ═══════════════════════════════════════════════════
   PROJECT CARD
═══════════════════════════════════════════════════ */
interface CardProps {
    project: Project;
    liked: boolean;
    onLike: (id: number) => void;
    onSelect: (p: Project) => void;
}
function ProjectCard({ project: p, liked, onLike, onSelect }: CardProps) {
    const cat = CAT[p.category];
    const status = STATUS_CFG[p.status];

    return (
        <div
            className="pg-card pg-fadein"
            onClick={() => onSelect(p)}
            style={{
                background: B.card,
                border: `1px solid ${B.border}`,
                borderRadius: '1.25rem',
                boxShadow: B.shadow,
                overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
            }}
        >
            {/* Category accent bar */}
            <div style={{ height: 4, background: `linear-gradient(90deg, ${cat.color}, ${cat.color}88)` }} />

            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

                {/* Top row: category + status badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                        padding: '0.2rem 0.65rem', borderRadius: '999px',
                        background: cat.bg, color: cat.color,
                        fontSize: '0.68rem', fontWeight: 700, fontFamily: FONT,
                    }}>{p.category}</span>
                    <span className="pg-badge" style={{
                        padding: '0.2rem 0.6rem', borderRadius: '999px',
                        background: status.bg, color: status.color,
                        fontSize: '0.68rem', fontWeight: 700, fontFamily: FONT,
                    }}>{status.label}</span>
                </div>

                {/* Title + description */}
                <div>
                    <h3 style={{
                        fontSize: '1rem', fontWeight: 900, color: B.dark, fontFamily: FONT,
                        letterSpacing: '-0.03em', lineHeight: 1.25, marginBottom: '0.4rem',
                    }}>{p.title}</h3>
                    <p style={{
                        fontSize: '0.8rem', color: B.muted, fontFamily: FONT,
                        lineHeight: 1.6,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}>{p.description}</p>
                </div>

                {/* Tech pills (max 3 + overflow) */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {p.tech.slice(0, 3).map(t => <TechPill key={t} label={t} />)}
                    {p.tech.length > 3 && (
                        <span style={{
                            padding: '0.18rem 0.6rem', borderRadius: '999px',
                            background: B.active, color: B.muted,
                            fontSize: '0.68rem', fontWeight: 600, fontFamily: FONT,
                        }}>+{p.tech.length - 3}</span>
                    )}
                </div>

                {/* Team row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Avatar name={p.team} size={24} />
                    <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: B.dark, fontFamily: FONT }}>{p.team}</p>
                        <p style={{ fontSize: '0.65rem', color: B.muted, fontFamily: FONT }}>{p.college}</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{
                padding: '0.85rem 1.25rem',
                borderTop: `1px solid ${B.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                {/* Stats */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <button
                        className="pg-like-btn"
                        onClick={e => { e.stopPropagation(); onLike(p.id); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: liked ? '#E53E6A' : B.muted,
                            fontSize: '0.75rem', fontWeight: 600, fontFamily: FONT, padding: 0,
                        }}
                    >
                        <Heart size={13} fill={liked ? '#E53E6A' : 'none'} />
                        {p.likes + (liked ? 1 : 0)}
                    </button>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: B.muted, fontSize: '0.75rem', fontFamily: FONT }}>
                        <Eye size={13} /> {p.views.toLocaleString()}
                    </span>
                </div>

                {/* View details */}
                <button
                    className="pg-view-btn"
                    onClick={e => { e.stopPropagation(); onSelect(p); }}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                        padding: '0.4rem 0.85rem', borderRadius: '999px',
                        background: B.active, border: 'none', cursor: 'pointer',
                        color: B.muted, fontSize: '0.75rem', fontWeight: 700, fontFamily: FONT,
                    }}
                >
                    View Details <ArrowRight size={12} />
                </button>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   DETAIL PANEL
═══════════════════════════════════════════════════ */
function DetailPanel({ project: p, onClose, liked, onLike }: {
    project: Project; onClose: () => void;
    liked: boolean; onLike: (id: number) => void;
}) {
    const cat = CAT[p.category];
    const status = STATUS_CFG[p.status];
    const panelRef = useRef<HTMLDivElement>(null);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div
            className="pg-detail-overlay"
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(28,28,32,0.45)', backdropFilter: 'blur(4px)',
            }}
        >
            {/* Panel */}
            <div
                ref={panelRef}
                className="pg-detail-panel pg-scroll"
                onClick={e => e.stopPropagation()}
                style={{
                    position: 'fixed', top: 0, right: 0, bottom: 0,
                    width: '100%', maxWidth: 480,
                    background: B.card, overflowY: 'auto',
                    display: 'flex', flexDirection: 'column',
                }}
            >
                {/* Accent header */}
                <div style={{
                    background: `linear-gradient(135deg, ${cat.color}16, ${cat.color}04)`,
                    borderBottom: `1px solid ${B.border}`,
                    padding: '1.5rem',
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{
                                padding: '0.22rem 0.7rem', borderRadius: '999px',
                                background: cat.bg, color: cat.color,
                                fontSize: '0.72rem', fontWeight: 700, fontFamily: FONT,
                            }}>{p.category}</span>
                            <span style={{
                                padding: '0.22rem 0.7rem', borderRadius: '999px',
                                background: status.bg, color: status.color,
                                fontSize: '0.72rem', fontWeight: 700, fontFamily: FONT,
                            }}>{status.label}</span>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                width: 32, height: 32, borderRadius: '50%', border: 'none',
                                background: B.active, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: B.muted, flexShrink: 0,
                            }}
                        ><X size={15} /></button>
                    </div>

                    <h2 style={{
                        fontSize: '1.45rem', fontWeight: 900, color: B.dark, fontFamily: FONT,
                        letterSpacing: '-0.04em', lineHeight: 1.15, marginBottom: '0.5rem',
                    }}>{p.title}</h2>
                    <p style={{ fontSize: '0.83rem', color: B.muted, fontFamily: FONT, lineHeight: 1.6 }}>
                        {p.description}
                    </p>
                </div>

                {/* Body */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>

                    {/* Team info */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.85rem',
                        padding: '1rem', borderRadius: '1rem',
                        background: B.active, border: `1px solid ${B.border}`,
                    }}>
                        <Avatar name={p.team} size={40} />
                        <div>
                            <p style={{ fontSize: '0.9rem', fontWeight: 800, color: B.dark, fontFamily: FONT }}>{p.team}</p>
                            <p style={{ fontSize: '0.73rem', color: B.muted, fontFamily: FONT, marginTop: '0.1rem' }}>
                                {p.college} · {p.members} members · {p.hackathon}
                            </p>
                        </div>
                    </div>

                    {/* About */}
                    <div>
                        <p style={{
                            fontSize: '0.68rem', fontWeight: 700, color: B.muted,
                            letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: FONT,
                            marginBottom: '0.65rem',
                        }}>About the Project</p>
                        <p style={{ fontSize: '0.83rem', color: B.dark, fontFamily: FONT, lineHeight: 1.7 }}>
                            {p.longDesc}
                        </p>
                    </div>

                    {/* Tech stack */}
                    <div>
                        <p style={{
                            fontSize: '0.68rem', fontWeight: 700, color: B.muted,
                            letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: FONT,
                            marginBottom: '0.65rem',
                        }}>Tech Stack</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {p.tech.map(t => (
                                <span key={t} style={{
                                    padding: '0.3rem 0.8rem', borderRadius: '999px',
                                    background: B.dark, color: '#fff',
                                    fontSize: '0.75rem', fontWeight: 600, fontFamily: FONT,
                                }}>{t}</span>
                            ))}
                        </div>
                    </div>

                    {/* Stats row */}
                    <div style={{
                        display: 'flex', gap: '0.75rem',
                    }}>
                        {[
                            { icon: <Heart size={14} />, val: `${p.likes + (liked ? 1 : 0)} likes`, color: '#E53E6A' },
                            { icon: <Eye size={14} />, val: `${p.views.toLocaleString()} views`, color: B.muted },
                            { icon: <Users size={14} />, val: `${p.members} members`, color: B.muted },
                        ].map(({ icon, val, color }) => (
                            <div key={val} style={{
                                flex: 1, padding: '0.75rem', borderRadius: '0.85rem',
                                background: B.active, display: 'flex', flexDirection: 'column',
                                alignItems: 'center', gap: '0.3rem',
                            }}>
                                <div style={{ color }}>{icon}</div>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: B.dark, fontFamily: FONT }}>
                                    {val}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer actions */}
                <div style={{
                    padding: '1.25rem 1.5rem',
                    borderTop: `1px solid ${B.border}`,
                    display: 'flex', gap: '0.65rem',
                }}>
                    <button
                        onClick={() => onLike(p.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.7rem 1.1rem', borderRadius: '999px',
                            border: `1.5px solid ${liked ? '#E53E6A' : B.border}`,
                            background: liked ? 'rgba(229,62,106,0.07)' : 'none',
                            color: liked ? '#E53E6A' : B.muted,
                            fontSize: '0.82rem', fontWeight: 700, fontFamily: FONT,
                            cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
                        }}
                    >
                        <Heart size={14} fill={liked ? '#E53E6A' : 'none'} />
                        {liked ? 'Liked' : 'Like'}
                    </button>

                    <a
                        href={p.github}
                        target="_blank" rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                            padding: '0.7rem 1rem', borderRadius: '999px',
                            border: `1.5px solid ${B.border}`, background: 'none',
                            color: B.dark, fontSize: '0.82rem', fontWeight: 700, fontFamily: FONT,
                            cursor: 'pointer', textDecoration: 'none', transition: 'background 0.14s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = B.active)}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                        <Github size={14} /> GitHub
                    </a>

                    <a
                        href={p.demo}
                        target="_blank" rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                            padding: '0.7rem 1rem', borderRadius: '999px',
                            border: 'none', background: B.dark,
                            color: '#fff', fontSize: '0.82rem', fontWeight: 700, fontFamily: FONT,
                            cursor: 'pointer', textDecoration: 'none',
                            boxShadow: '0 3px 10px rgba(40,41,44,0.18)',
                        }}
                    >
                        <ExternalLink size={14} /> Live Demo
                    </a>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════ */
function EmptyState({ onReset }: { onReset: () => void }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '1rem', padding: '4rem 2rem', textAlign: 'center',
            background: B.card, border: `1px solid ${B.border}`,
            borderRadius: '1.5rem', boxShadow: B.shadow,
            gridColumn: '1 / -1',
        }}>
            <div style={{
                width: 64, height: 64, borderRadius: '1.25rem',
                background: B.active, color: B.muted,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Layers size={28} />
            </div>
            <div>
                <p style={{ fontSize: '1rem', fontWeight: 800, color: B.dark, fontFamily: FONT }}>No projects found</p>
                <p style={{ fontSize: '0.8rem', color: B.muted, fontFamily: FONT, marginTop: '0.3rem' }}>
                    Try adjusting your filters or search query.
                </p>
            </div>
            <button onClick={onReset} style={{
                padding: '0.6rem 1.4rem', borderRadius: '999px',
                border: `1.5px solid ${B.border}`, background: 'none',
                color: B.dark, fontSize: '0.82rem', fontWeight: 700,
                fontFamily: FONT, cursor: 'pointer',
            }}>Reset Filters</button>
        </div>
    );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════ */
const CATEGORIES: string[] = ['All', 'AI / ML', 'IoT', 'App Dev', 'Blockchain', 'Cybersecurity', 'HealthTech', 'EdTech', 'Sustainability'];
const STATUSES: string[] = ['All', 'Winner', 'Finalist', 'Submitted'];
const HACKATHONS: string[] = ['All', 'Smart India Hackathon 2025', 'Hack4Change 2025', 'HackVIT 2025', 'CyberStrike 2024', 'GreenHack 2025', 'HealthHack 2025', 'HackForJustice 2025', 'ClimaTech 2025', 'Hackathon India 2025'];
const SORTS: string[] = ['Most Liked', 'Most Viewed', 'Newest', 'Oldest'];

export default function ProjectGalleryPage() {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [status, setStatus] = useState('All');
    const [hackathon, setHackathon] = useState('All');
    const [sort, setSort] = useState('Most Liked');
    const [selected, setSelected] = useState<Project | null>(null);
    const [liked, setLiked] = useState<Set<number>>(new Set());

    const reset = () => { setSearch(''); setCategory('All'); setStatus('All'); setHackathon('All'); setSort('Most Liked'); };
    const toggleLike = (id: number) => setLiked(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });

    const activeFilters = [category, status, hackathon].filter(f => f !== 'All').length;

    const results = useMemo(() => {
        let list = [...PROJECTS];
        if (search) list = list.filter(p =>
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.team.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase()) ||
            p.tech.some(t => t.toLowerCase().includes(search.toLowerCase()))
        );
        if (category !== 'All') list = list.filter(p => p.category === category);
        if (status !== 'All') list = list.filter(p => p.status === status);
        if (hackathon !== 'All') list = list.filter(p => p.hackathon === hackathon);
        switch (sort) {
            case 'Most Liked': list.sort((a, b) => b.likes - a.likes); break;
            case 'Most Viewed': list.sort((a, b) => b.views - a.views); break;
            case 'Newest': list.sort((a, b) => b.year - a.year); break;
            case 'Oldest': list.sort((a, b) => a.year - b.year); break;
        }
        return list;
    }, [search, category, status, hackathon, sort]);

    return (
        <>
            <StyleInject />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* ── Page header ── */}
                <div className="pg-fadein">
                    <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: B.dark, letterSpacing: '-0.04em', fontFamily: FONT }}>
                        Project Gallery
                    </h1>
                    <p style={{ fontSize: '0.82rem', color: B.muted, fontFamily: FONT, marginTop: '0.25rem' }}>
                        {PROJECTS.length} projects submitted · browse, explore, and get inspired.
                    </p>
                </div>

                {/* ── Search + Filters bar ── */}
                <div className="pg-fadein" style={{
                    background: B.card, border: `1px solid ${B.border}`,
                    borderRadius: '1.25rem', boxShadow: B.shadow,
                    padding: '1rem 1.25rem',
                    display: 'flex', flexDirection: 'column', gap: '0.85rem',
                    animationDelay: '40ms',
                }}>
                    {/* Row 1: Search */}
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            position: 'absolute', left: '0.95rem', top: '50%', transform: 'translateY(-50%)',
                            color: B.muted, display: 'flex', pointerEvents: 'none',
                        }}>
                            <Search size={16} />
                        </div>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search projects, teams, or technologies…"
                            style={{
                                width: '100%', padding: '0.7rem 1rem 0.7rem 2.6rem',
                                borderRadius: '0.875rem', border: `1.5px solid ${B.border}`,
                                background: B.bg, fontSize: '0.875rem', color: B.dark, fontFamily: FONT,
                                outline: 'none', boxSizing: 'border-box',
                                transition: 'border-color 0.16s',
                            }}
                            onFocus={e => (e.target.style.borderColor = B.dark)}
                            onBlur={e => (e.target.style.borderColor = B.border)}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} style={{
                                position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: B.muted, display: 'flex', padding: '0.15rem',
                            }}><X size={14} /></button>
                        )}
                    </div>

                    {/* Row 2: Filters */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: B.muted, fontSize: '0.78rem', fontFamily: FONT, flexShrink: 0 }}>
                            <SlidersHorizontal size={14} />
                            <span>Filters</span>
                            {activeFilters > 0 && (
                                <span style={{
                                    width: 18, height: 18, borderRadius: '50%', background: B.dark, color: '#fff',
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.65rem', fontWeight: 800, fontFamily: FONT,
                                }}>{activeFilters}</span>
                            )}
                        </div>

                        <FilterSelect label="Category" value={category} options={CATEGORIES} onChange={setCategory} />
                        <FilterSelect label="Status" value={status} options={STATUSES} onChange={setStatus} />
                        <FilterSelect label="Hackathon" value={hackathon} options={HACKATHONS} onChange={setHackathon} />
                        <FilterSelect label="Sort" value={sort} options={SORTS} onChange={setSort} />

                        {activeFilters > 0 && (
                            <button onClick={reset} style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: B.muted, fontSize: '0.78rem', fontFamily: FONT, fontWeight: 600,
                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                                padding: '0.4rem 0.5rem', borderRadius: '0.5rem',
                                transition: 'color 0.13s',
                            }}
                                onMouseEnter={e => (e.currentTarget.style.color = B.dark)}
                                onMouseLeave={e => (e.currentTarget.style.color = B.muted)}
                            >
                                <X size={12} /> Reset
                            </button>
                        )}

                        {/* Result count (right-aligned) */}
                        <span style={{
                            marginLeft: 'auto', fontSize: '0.75rem', color: B.muted, fontFamily: FONT,
                            background: B.active, padding: '0.3rem 0.75rem', borderRadius: '999px',
                            fontWeight: 600,
                        }}>
                            {results.length} / {PROJECTS.length} projects
                        </span>
                    </div>
                </div>

                {/* ── Category quick-filter pills ── */}
                <div className="pg-fadein" style={{
                    display: 'flex', gap: '0.45rem', flexWrap: 'wrap',
                    animationDelay: '70ms',
                }}>
                    {CATEGORIES.map(cat => {
                        const active = category === cat;
                        const cfg = cat === 'All' ? null : CAT[cat as Category];
                        return (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                style={{
                                    padding: '0.38rem 0.9rem', borderRadius: '999px',
                                    border: `1.5px solid ${active ? (cfg ? cfg.light : B.dark) : B.border}`,
                                    background: active ? (cfg ? cfg.bg : B.dark) : B.card,
                                    color: active ? (cfg ? cfg.color : '#fff') : B.muted,
                                    fontSize: '0.75rem', fontWeight: 700, fontFamily: FONT,
                                    cursor: 'pointer', transition: 'all 0.15s',
                                }}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>

                {/* ── Grid ── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.1rem',
                }}>
                    {results.length === 0
                        ? <EmptyState onReset={reset} />
                        : results.map((p, i) => (
                            <div key={p.id} style={{ animationDelay: `${i * 35}ms` }}>
                                <ProjectCard
                                    project={p}
                                    liked={liked.has(p.id)}
                                    onLike={toggleLike}
                                    onSelect={setSelected}
                                />
                            </div>
                        ))
                    }
                </div>

                <div style={{ height: '1rem' }} />
            </div>

            {/* ── Detail Panel ── */}
            {selected && (
                <DetailPanel
                    project={selected}
                    onClose={() => setSelected(null)}
                    liked={liked.has(selected.id)}
                    onLike={id => { toggleLike(id); }}
                />
            )}
        </>
    );
}
