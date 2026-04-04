// components/VoteButtons.jsx
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const VoteButtons = ({ issue, onVote, compact = false }) => {
  const { user } = useContext(AuthContext);
  const [animating, setAnimating] = useState(null);

  const userId = user?.id;

  const upvoteCount   = Array.isArray(issue.upvotes)   ? issue.upvotes.length   : (issue.upvotes   || 0);
  const downvoteCount = Array.isArray(issue.downvotes)  ? issue.downvotes.length  : (issue.downvotes  || 0);
  const hasUpvoted    = Array.isArray(issue.upvotes)    ? issue.upvotes.includes(userId)   : false;
  const hasDownvoted  = Array.isArray(issue.downvotes)  ? issue.downvotes.includes(userId) : false;
  const score         = upvoteCount - downvoteCount;

  const trigger = async (type) => {
    if (!user) return;
    setAnimating(type);
    setTimeout(() => setAnimating(null), 400);
    onVote(issue._id, type, user.id);
  };

  const btnBase = `
    flex items-center gap-1.5 rounded-xl font-semibold transition-all duration-200
    select-none cursor-pointer border
    ${compact ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-2 text-sm'}
  `;

  const upStyle = `${btnBase} ${
    hasUpvoted
      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_12px_rgba(52,211,153,0.25)]'
      : 'bg-white/5 text-slate-400 border-white/10 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30'
  }`;

  const downStyle = `${btnBase} ${
    hasDownvoted
      ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-[0_0_12px_rgba(251,113,133,0.25)]'
      : 'bg-white/5 text-slate-400 border-white/10 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30'
  }`;

  return (
    <div className="flex items-center gap-2">
      <button
        className={upStyle}
        style={{ transform: animating === 'up' ? 'scale(1.25)' : 'scale(1)', transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}
        onClick={(e) => { e.stopPropagation(); trigger('up'); }}
        title={user ? 'Upvote' : 'Login to vote'}
      >
        <span style={{ fontSize: compact ? 14 : 16 }}>▲</span>
        <span>{upvoteCount}</span>
      </button>

      {/* Score pill */}
      <span className={`font-bold tabular-nums ${compact ? 'text-xs' : 'text-sm'} ${
        score > 0 ? 'text-emerald-400' : score < 0 ? 'text-rose-400' : 'text-slate-500'
      }`}>
        {score > 0 ? '+' : ''}{score}
      </span>

      <button
        className={downStyle}
        style={{ transform: animating === 'down' ? 'scale(1.25)' : 'scale(1)', transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}
        onClick={(e) => { e.stopPropagation(); trigger('down'); }}
        title={user ? 'Downvote' : 'Login to vote'}
      >
        <span style={{ fontSize: compact ? 14 : 16 }}>▼</span>
        <span>{downvoteCount}</span>
      </button>

      {!user && (
        <span className="text-[10px] text-slate-600 ml-1">Login to vote</span>
      )}
    </div>
  );
};

export default VoteButtons;