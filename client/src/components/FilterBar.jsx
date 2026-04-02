// components/FilterBar.jsx
import { useState } from 'react';

const CATEGORIES = ['all', 'Pothole', 'Streetlight', 'Garbage', 'Water', 'Drainage', 'Other'];
const STATUSES   = ['all', 'open', 'in-progress', 'resolved'];
const SORTS      = [
  { value: 'newest',  label: '🕐 Newest'   },
  { value: 'upvotes', label: '🔥 Top Voted' },
  { value: 'nearby',  label: '📍 Nearby'   },
];

const CATEGORY_ICONS = {
  all: '🗂️', Pothole: '🕳️', Streetlight: '💡',
  Garbage: '🗑️', Water: '💧', Drainage: '🌊', Other: '⚠️',
};

const STATUS_COLORS = {
  all: 'border-white/20 text-slate-400',
  open: 'border-rose-500/40 text-rose-400',
  'in-progress': 'border-amber-500/40 text-amber-400',
  resolved: 'border-emerald-500/40 text-emerald-400',
};

const FilterBar = ({ filters, onFilterChange, onReset, resultCount }) => {
  const [localityInput, setLocalityInput] = useState(filters.locality || '');

  const handleLocalitySubmit = (e) => {
    e.preventDefault();
    onFilterChange({ locality: localityInput });
  };

  const hasActiveFilters =
    filters.category !== 'all' || filters.status !== 'all' ||
    filters.sortBy !== 'newest' || filters.locality;

  return (
    <div className="space-y-3">
      {/* Top row: sort + result count */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1.5">
          {SORTS.map((s) => (
            <button
              key={s.value}
              onClick={() => onFilterChange({ sortBy: s.value })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                filters.sortBy === s.value
                  ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:border-blue-500/40 hover:text-blue-400'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {resultCount !== undefined && (
            <span className="text-xs text-slate-500">
              <span className="text-slate-300 font-semibold">{resultCount}</span> issues
            </span>
          )}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-xs text-slate-500 hover:text-rose-400 transition-colors underline underline-offset-2"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onFilterChange({ category: cat })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
              filters.category === cat
                ? 'bg-blue-600/20 border-blue-500/60 text-blue-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/25 hover:text-slate-300'
            }`}
          >
            <span>{CATEGORY_ICONS[cat]}</span>
            <span className="capitalize">{cat}</span>
          </button>
        ))}
      </div>

      {/* Status + locality row */}
      <div className="flex gap-2 flex-wrap items-center">
        {/* Status */}
        <div className="flex gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => onFilterChange({ status: s })}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-150 capitalize ${
                filters.status === s
                  ? `${STATUS_COLORS[s]} bg-white/10`
                  : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-400'
              }`}
            >
              {s === 'all' ? 'All Status' : s.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Locality search */}
        <form onSubmit={handleLocalitySubmit} className="flex gap-1.5 ml-auto">
          <input
            type="text"
            placeholder="Filter by area..."
            value={localityInput}
            onChange={(e) => setLocalityInput(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 w-40"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-400 hover:text-blue-400 hover:border-blue-500/30 transition-colors"
          >
            Go
          </button>
          {filters.locality && (
            <button
              type="button"
              onClick={() => { setLocalityInput(''); onFilterChange({ locality: '' }); }}
              className="text-xs text-rose-500 hover:text-rose-400 px-1"
            >
              ✕
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default FilterBar;