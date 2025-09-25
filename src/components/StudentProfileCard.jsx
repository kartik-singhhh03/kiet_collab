import React from 'react';

function statusColor(status) {
  switch (status) {
    case 'available':
      return 'bg-green-500';
    case 'busy':
      return 'bg-red-500';
    case 'away':
      return 'bg-orange-500';
    default:
      return 'bg-gray-400';
  }
}

export default function StudentProfileCard({ user, onView }) {
  const name = user.name || user.fullName || 'Student';
  const branch = user.branch || user.department || '';
  const year = user.year ? `${user.year} Year` : '';
  const avatar = user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
  const skills = Array.isArray(user.skills) ? user.skills.slice(0, 5) : [];

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-black">
      <div className="flex items-center gap-3">
        <img src={avatar} alt={name} className="h-12 w-12 rounded-full border border-gray-200 dark:border-gray-700" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{name}</h3>
            <span className={`h-2.5 w-2.5 rounded-full ${statusColor(user.availability)}`}></span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">{branch}{branch && year ? ', ' : ''}{year}</p>
        </div>
      </div>
      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((s) => (
            <span key={s} className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">{s}</span>
          ))}
        </div>
      )}
      <div className="mt-4 flex justify-end">
        <button onClick={() => onView && onView(user)} className="px-3 py-1 rounded bg-black text-white dark:bg-white dark:text-black">View Profile</button>
      </div>
    </div>
  );
}
