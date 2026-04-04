// components/IssueDetailModal.jsx
import { useEffect, useRef } from 'react';
import VoteButtons from './VoteButtons';

const STATUS_CONFIG = {
  open:          { label: 'Open',        color: 'bg-rose-50 text-rose-600 border-rose-200'       },
  'in-progress': { label: 'In Progress', color: 'bg-amber-50 text-amber-600 border-amber-200'    },
  resolved:      { label: 'Resolved',    color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
};

const TIMELINE_STEPS = ['Reported', 'Acknowledged', 'In Progress', 'Resolved'];
const STATUS_TO_STEP = { open: 0, 'in-progress': 2, resolved: 3 };

const IssueDetailModal = ({ issue, onClose, onVote }) => {
  const overlayRef = useRef(null);

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

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)' }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all text-sm"
        >✕</button>

        {/* Media */}
        {issue.mediaUrls?.length > 0 && (
          <div className="relative h-56 overflow-hidden rounded-t-2xl">
            <img src={issue.mediaUrls[0]} alt={issue.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent" />
          </div>
        )}

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="space-y-2">
            {/* Duplicate warning */}
            {issue.isDuplicate && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-2">
                <span className="text-amber-500 text-sm">⚠️</span>
                <p className="text-xs font-semibold text-amber-600">
                  Possible duplicate — a similar issue may already be reported nearby
                </p>
              </div>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${status.color}`}>
                {status.label}
              </span>
              <span className="text-xs text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full capitalize">
                {issue.category}
              </span>
              {issue.assignedDepartment && (
                <span className="text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                  🏛 {issue.assignedDepartment}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-800 leading-snug">{issue.title}</h2>
            <p className="text-sm text-slate-500 leading-relaxed">{issue.description}</p>
          </div>

          {/* Location */}
          {issue.location?.address && (
            <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-base mt-0.5">📍</span>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Location</p>
                <p className="text-sm text-slate-700">{issue.location.address}</p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Progress</p>
            <div className="flex items-center">
              {TIMELINE_STEPS.map((step, i) => {
                const done    = i <= stepIndex;
                const current = i === stepIndex;
                return (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all ${
                        current
                          ? 'border-blue-500 bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                          : done
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                          : 'border-slate-200 bg-white text-slate-400'
                      }`}>
                        {done && !current ? '✓' : i + 1}
                      </div>
                      <span className={`text-[9px] mt-1 text-center w-16 leading-tight ${
                        current ? 'text-blue-500 font-semibold' : done ? 'text-emerald-600' : 'text-slate-400'
                      }`}>{step}</span>
                    </div>
                    {i < TIMELINE_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mb-4 ${i < stepIndex ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Admin note */}
          {issue.adminNote && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-600 mb-1">🏛 Official Update</p>
              <p className="text-sm text-slate-700">{issue.adminNote}</p>
            </div>
          )}

          {/* Extra images */}
          {issue.mediaUrls?.length > 1 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Photos</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {issue.mediaUrls.slice(1).map((url, i) => (
                  <img key={i} src={url} alt="" className="h-20 w-28 object-cover rounded-lg border border-slate-200 flex-shrink-0" />
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-slate-100" />

          {/* Footer */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <VoteButtons issue={issue} onVote={onVote} />
            <div className="text-xs text-slate-400 space-x-3">
              <span>Reported {new Date(issue.createdAt).toLocaleDateString()}</span>
              {(issue.downvotes?.length ?? issue.downvotes ?? 0) >= 10 && (
                <span className="text-rose-400">⚑ Under review</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailModal;