import React, { useEffect, useMemo, useRef, useState } from 'react';

function parseSkills(str) {
  return String(str || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function availabilityColor(av) {
  if (av === 'available') return '#111827';
  if (av === 'busy') return '#6b7280';
  if (av === 'away') return '#9ca3af';
  return '#d1d5db';
}

function computeMatchScore(user, requestedSkills) {
  const uSkills = (user.skills || []).map((s) => String(s).toLowerCase());
  const matching = requestedSkills.filter((s) => uSkills.includes(s));
  return requestedSkills.length ? matching.length / requestedSkills.length : 0;
}

export default function RadarSearch({ users, presenceMap, requestedSkills, onBlipClick }) {
  const req = useMemo(() => parseSkills(requestedSkills), [requestedSkills]);
  const ref = useRef(null);
  const [hover, setHover] = useState(null); // {x,y,user}

  const size = 480;
  const cx = size / 2;
  const cy = size / 2;
  const baseR = size * 0.45;

  // Precompute positions by score
  const positions = useMemo(() => {
    return users.map((u, i) => {
      const score = computeMatchScore(u, req); // 0..1
      const distance = baseR * (1 - 0.8 * score); // closer if higher score
      // distribute angles deterministically
      const id = String(u._id || u.email || i);
      let h = 0;
      for (let k = 0; k < id.length; k++) h = (h * 31 + id.charCodeAt(k)) >>> 0;
      const angle = (h % 360) * (Math.PI / 180);
      const x = cx + Math.cos(angle) * distance;
      const y = cy + Math.sin(angle) * distance;
      return { user: u, x, y, score };
    });
  }, [users, req]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // clear
    ctx.clearRect(0, 0, size, size);

    // grid
    ctx.strokeStyle = '#e5e7eb';
    ;[0.25, 0.5, 0.75, 1].forEach((t) => {
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * t, 0, Math.PI * 2);
      ctx.stroke();
    });

    // center point (current user)
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    // blips
    positions.forEach(({ user, x, y }) => {
      const online = presenceMap && presenceMap[String(user._id || user.email)] === 'online';
      if (online) {
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#111827';
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.fillStyle = availabilityColor(user.availability);
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [positions, presenceMap]);

  return (
    <div className="w-full flex items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <canvas
          ref={ref}
          className="absolute inset-0 border border-gray-200 dark:border-gray-800 rounded-full bg-white dark:bg-black"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const hit = positions.find(({ x, y }) => (mx - x) ** 2 + (my - y) ** 2 <= 6 ** 2);
            setHover(hit || null);
          }}
          onMouseLeave={() => setHover(null)}
          onClick={(e) => {
            if (!hover) return;
            if (onBlipClick) onBlipClick(hover.user);
          }}
        />
        {hover && (
          <div
            className="absolute -translate-x-1/2 -translate-y-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-xs px-2 py-1 text-gray-800 dark:text-gray-100"
            style={{ left: hover.x, top: hover.y }}
          >
            <div className="font-medium">{hover.user.name}</div>
            <div className="opacity-70">{Array.isArray(hover.user.skills) ? hover.user.skills[0] : ''}</div>
          </div>
        )}
      </div>
    </div>
  );
}
