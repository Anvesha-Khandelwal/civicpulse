// components/IssueRow.jsx
import VoteButtons from './VoteButtons';

const STATUS_CONFIG = {
  open:          { label: 'Open',        color: 'bg-rose-500/15 text-rose-400 border-rose-500/30'         },
  'in-progress': { label: 'In Progress', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30'      },
  resolved:      { label: 'Resolved',    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'},
};

const CATEGORY_ICONS = {
  pothole: '🕳️', streetlight: '💡', garbage: '🗑️',
  waterlogging: '💧', fallen_tree: '🌳', stray_animals: '🐕', other: '⚠️',
};

const timeAgo = (dateStr) => {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const IssueRow = ({ issue, onClick, onVote }) => {
  const status = STATUS_CONFIG[issue.status] || STATUS_CONFIG.open;

  return (
    <div
      className="group bg-[#111827] border border-white/8 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-blue-500/30 hover:shadow-[0_0_24px_rgba(37,99,235,0.1)] hover:-translate-y-0.5"
      onClick={() => onClick(issue)}
    >
      {/* ── Duplicate warning banner ── */}
      {issue.isDuplicate === true && (
        <div className="flex items-center gap-2 bg-amber-500/10 border-b border-amber-500/20 px-4 py-2">
          <span className="text-amber-400 text-sm">⚠️</span>
          <p className="text-xs font-semibold text-amber-400">
            Possible duplicate — this issue may already be reported nearby
          </p>
        </div>
      )}

      <div className="flex items-center gap-4 p-4">
        {/* Category icon */}
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-xl flex-shrink-0">
          {CATEGORY_ICONS[issue.category] || '📍'}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.color}`}>
              {status.label}
            </span>
            <span className="text-[10px] text-slate-600">{timeAgo(issue.createdAt)}</span>
            {issue.location?.ward && (
              <span className="text-[10px] text-slate-600">📍 {issue.location.ward}</span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white truncate transition-colors">
            {issue.title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{issue.description}</p>
        </div>

        {/* Vote buttons */}
        <div className="flex-shrink-0" onClick={e => e.stopPropagation()}>
          <VoteButtons issue={issue} onVote={onVote} compact />
        </div>
      </div>
    </div>
  );
};

export default IssueRow;