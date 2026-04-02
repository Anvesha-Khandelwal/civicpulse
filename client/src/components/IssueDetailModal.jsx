// components/IssueDetailModal.jsx
import { useEffect, useRef } from 'react';
import VoteButtons from './VoteButtons';

const STATUS_CONFIG = {
  open:          { label: 'Open',        color: 'bg-rose-500/15 text-rose-400 border-rose-500/30'         },
  'in-progress': { label: 'In Progress', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30'      },
  resolved:      { label: 'Resolved',    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'},
};

const TIMELINE_STEPS = ['Reported', 'Acknowledged', 'In Progress', 'Resolved'];
const STATUS_TO_STEP = { open: 0, 'in-progress': 2, resolved: 3 };

const IssueDetailModal = ({ issue, onClose, onVote }) => {
  const overlayRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!issue) return null;

  const status    = STATUS_CONFIG[issue.status] || STATUS_CONFIG.open;
  const stepIndex = STATUS_TO_STEP[issue.status] ?? 0;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 shadow-2xl"
        style={{ background: '#0D1117' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-all text-sm"
        >
          ✕
        </button>

        {/* Media */}
        {issue.mediaUrls?.length > 0 && (
          <div className="relative h-56 overflow-hidden rounded-t-2xl">
            <img
              src={issue.mediaUrls[0]}
              alt={issue.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117] via-transparent to-transparent" />
          </div>
        )}

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${status.color}`}>
                {status.label}
              </span>
              <span className="text-xs text-slate-500 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                {issue.category}
              </span>
              {issue.assignedDepartment && (
                <span className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
                  🏛 {issue.assignedDepartment}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white leading-snug">{issue.title}</h2>
            <p className="text-sm text-slate-400 leading-relaxed">{issue.description}</p>
          </div>

          {/* Location */}
          {issue.location?.address && (
            <div className="flex items-start gap-2 bg-white/5 border border-white/8 rounded-xl p-3">
              <span className="text-base mt-0.5">📍</span>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Location</p>
                <p className="text-sm text-slate-300">{issue.location.address}</p>
              </div>
            </div>
          )}

          {/* Status Timeline */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Progress</p>
            <div className="flex items-center gap-0">
              {TIMELINE_STEPS.map((step, i) => {
                const done    = i <= stepIndex;
                const current = i === stepIndex;
                return (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    {/* Circle */}
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all ${
                        current
                          ? 'border-blue-500 bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]'
                          : done
                          ? 'border-emerald-500 bg-emerald-600/20 text-emerald-400'
                          : 'border-white/15 bg-white/5 text-slate-600'
                      }`}>
                        {done && !current ? '✓' : i + 1}
                      </div>
                      <span className={`text-[9px] mt-1 text-center w-16 leading-tight ${
                        current ? 'text-blue-400 font-semibold' : done ? 'text-emerald-500' : 'text-slate-600'
                      }`}>
                        {step}
                      </span>
                    </div>
                    {/* Line */}
                    {i < TIMELINE_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mb-4 ${i < stepIndex ? 'bg-emerald-600/40' : 'bg-white/8'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Admin update note */}
          {issue.adminNote && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-400 mb-1">🏛 Official Update</p>
              <p className="text-sm text-slate-300">{issue.adminNote}</p>
            </div>
          )}

          {/* Multiple images */}
          {issue.mediaUrls?.length > 1 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Photos</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {issue.mediaUrls.slice(1).map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt=""
                    className="h-20 w-28 object-cover rounded-lg border border-white/10 flex-shrink-0"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-white/8" />

          {/* Footer: vote + meta */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <VoteButtons issue={issue} onVote={onVote} />
            <div className="text-xs text-slate-600 space-x-3">
              <span>Reported {new Date(issue.createdAt).toLocaleDateString()}</span>
              {issue.downvotes?.length >= 10 && (
                <span className="text-rose-500/70">⚑ Under review</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailModal;