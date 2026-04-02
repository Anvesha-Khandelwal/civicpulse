// components/IssueCard.jsx
import VoteButtons from './VoteButtons';

const STATUS_CONFIG = {
  open:          { label: 'Open',        color: 'bg-rose-500/15 text-rose-400 border-rose-500/30'    },
  'in-progress': { label: 'In Progress', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  resolved:      { label: 'Resolved',    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
};

const CATEGORY_ICONS = {
  Pothole: '🕳️', Streetlight: '💡', Garbage: '🗑️',
  Water: '💧', Drainage: '🌊', Other: '⚠️',
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  return `${days}d ago`;
};

const IssueCard = ({ issue, onClick, onVote }) => {
  const status = STATUS_CONFIG[issue.status] || STATUS_CONFIG.open;
  const score  = (issue.upvotes?.length || 0) - (issue.downvotes?.length || 0);

  return (
    <div
      onClick={() => onClick(issue)}
      className="
        group relative bg-[#111827] border border-white/8 rounded-2xl overflow-hidden
        cursor-pointer transition-all duration-300
        hover:border-blue-500/30 hover:shadow-[0_0_24px_rgba(37,99,235,0.12)]
        hover:-translate-y-0.5
      "
    >
      {/* Media thumbnail */}
      {issue.mediaUrls?.[0] ? (
        <div className="relative h-44 overflow-hidden">
          <img
            src={issue.mediaUrls[0]}
            alt={issue.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
          {/* Status badge on image */}
          <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.color}`}>
            {status.label}
          </span>
        </div>
      ) : (
        <div className="h-20 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
          <span className="text-4xl opacity-30">{CATEGORY_ICONS[issue.category] || '📍'}</span>
          <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.color}`}>
            {status.label}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Category chip + time */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>{CATEGORY_ICONS[issue.category] || '📍'}</span>
            <span>{issue.category || 'Other'}</span>
          </span>
          <span className="text-[10px] text-slate-600">{timeAgo(issue.createdAt)}</span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-slate-200 leading-snug line-clamp-2 group-hover:text-white transition-colors">
          {issue.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
          {issue.description}
        </p>

        {/* Location */}
        {issue.location?.address && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <span>📍</span>
            <span className="truncate">{issue.location.address}</span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-white/6" />

        {/* Vote row */}
        <div className="flex items-center justify-between">
          <VoteButtons issue={issue} onVote={onVote} compact />
          <span className="text-[10px] text-slate-600">
            {issue.downvotes?.length >= 10 && (
              <span className="text-rose-500/70">⚑ Flagged</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;