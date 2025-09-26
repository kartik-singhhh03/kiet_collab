import React, { useEffect, useRef } from 'react';

function hashToAngle(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return (h % 360) * (Math.PI / 180);
}

function availabilityColor(av) {
  // monochrome palette with subtle differences
  if (av === 'available') return '#111827'; // near-black
  if (av === 'busy') return '#6b7280'; // gray-500
  if (av === 'away') return '#9ca3af'; // gray-400
  return '#d1d5db'; // offline/default
}

export default function Radar({ users, presenceMap, onInvite }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const size = 360;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.45;

    // Radar circle
    ctx.strokeStyle = '#e5e7eb'; // gray-200
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Rings
    [0.25, 0.5, 0.75].forEach((t) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r * t, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Center
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    // Draw blips
    const maxBlipR = 6;
    users.forEach((u, idx) => {
      const id = String(u._id || u.email || idx);
      const ang = hashToAngle(id);
      const dist = r * (0.2 + ((idx % 8) / 8) * 0.75);
      const x = cx + Math.cos(ang) * dist;
      const y = cy + Math.sin(ang) * dist;

      const online = presenceMap && presenceMap[id] === 'online';
      const col = availabilityColor(u.availability);

      // outer ring if online
      if (online) {
        ctx.beginPath();
        ctx.arc(x, y, maxBlipR + 2, 0, Math.PI * 2);
        ctx.strokeStyle = '#111827';
        ctx.stroke();
      }

      // blip
      ctx.beginPath();
      ctx.fillStyle = col;
      ctx.arc(x, y, maxBlipR, 0, Math.PI * 2);
      ctx.fill();

      // initials
      const initials = (u.name || '').split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase();
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px system-ui, -apple-system, Segoe UI, Roboto';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initials || '•', x, y);
    });
  }, [users, presenceMap]);

  const size = 360;
  // Precompute positions to overlay buttons
  const positions = users.map((u, idx) => {
    const id = String(u._id || u.email || idx);
    const ang = hashToAngle(id);
    const r = size * 0.45;
    const dist = r * (0.2 + ((idx % 8) / 8) * 0.75);
    const cx = size / 2;
    const cy = size / 2;
    const x = cx + Math.cos(ang) * dist;
    const y = cy + Math.sin(ang) * dist;
    return { id, x, y, user: u };
  });

  return (
    <div className="w-full flex items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <canvas ref={ref} className="absolute inset-0 border border-gray-200 dark:border-gray-800 rounded-full bg-white dark:bg-black" />
        {positions.map((p) => (
          <button
            key={p.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-[10px] px-2 py-0.5 rounded border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-black/80 hover:bg-gray-50 dark:hover:bg-white/10"
            style={{ left: p.x + 14, top: p.y - 14 }}
            onClick={() => onInvite && onInvite(p.user)}
            title={`Invite ${p.user.name}`}
            type="button"
          >
            Invite
          </button>
        ))}
      </div>
    </div>
  );
}
