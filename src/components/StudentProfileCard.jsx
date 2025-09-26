import React from 'react';

function statusColor(status) {
  switch (status) {
    case 'available':
      return 'status-available';
    case 'busy':
      return 'status-busy';
    case 'away':
      return 'status-away';
    default:
      return 'bg-gray-500';
  }
}

export default function StudentProfileCard({ user, onView }) {
  const name = user.name || user.fullName || 'Student';
  const branch = user.branch || user.department || '';
  const year = user.year ? `${user.year} Year` : '';
  const avatar = user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
  const skills = Array.isArray(user.skills) ? user.skills.slice(0, 5) : [];

  return (
    <div className="rounded-xl card-futuristic p-4 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center gap-3">
        <img src={avatar} alt={name} className="h-12 w-12 rounded-full border border-purple-500/20" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-primary">{name}</h3>
            <span className={`h-2.5 w-2.5 rounded-full ${statusColor(user.availability)}`}></span>
          </div>
          <p className="text-sm text-secondary">{branch}{branch && year ? ', ' : ''}{year}</p>
        </div>
      </div>
      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((s) => (
            <span key={s} className="text-xs px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400">{s}</span>
          ))}
        </div>
      )}
      <div className="mt-4 flex justify-end">
        <button onClick={() => onView && onView(user)} className="px-3 py-1 rounded btn-primary-gradient text-white">View Profile</button>
      </div>
    </div>
  );
}
