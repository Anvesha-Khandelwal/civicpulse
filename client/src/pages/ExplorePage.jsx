// pages/ExplorePage.jsx
// Google Fonts: Add to index.html → 
// <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Mono&display=swap" rel="stylesheet">

import { useState } from 'react';
import useIssues from '../hooks/useIssues';
import IssueCard from '../components/IssueCard';
import IssueDetailModal from '../components/IssueDetailModal';
import FilterBar from '../components/FilterBar';
import MapView from '../components/MapView';

const TABS = [
  { id: 'feed', label: 'Feed',    icon: '▦' },
  { id: 'map',  label: 'Map',     icon: '🗺' },
  { id: 'heat', label: 'Heatmap', icon: '🔥' },
];

const SkeletonCard = () => (
  <div className="bg-[#111827] border border-white/8 rounded-2xl overflow-hidden animate-pulse">
    <div className="h-44 bg-white/5" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-white/5 rounded-full w-24" />
      <div className="h-4 bg-white/8 rounded-full w-3/4" />
      <div className="h-3 bg-white/5 rounded-full w-full" />
      <div className="h-3 bg-white/5 rounded-full w-2/3" />
    </div>
  </div>
);

const EmptyState = ({ onReset }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
    <div className="text-6xl mb-4 opacity-40">🏙️</div>
    <h3 className="text-lg font-semibold text-slate-400 mb-2">No issues found</h3>
    <p className="text-sm text-slate-600 mb-5">Try adjusting your filters or search a different area</p>
    <button
      onClick={onReset}
      className="px-5 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-xl text-sm font-medium hover:bg-blue-600/30 transition-colors"
    >
      Clear all filters
    </button>
  </div>
);

const ExplorePage = () => {
  const { issues, loading, error, filters, updateFilters, resetFilters, handleVote } = useIssues();
  const [activeTab,    setActiveTab]    = useState('feed');
  const [selectedIssue, setSelectedIssue] = useState(null);

  const handleCardClick = (issue) => setSelectedIssue(issue);
  const handleModalClose = () => setSelectedIssue(null);

  return (
    <div
      style={{ fontFamily: "'Outfit', sans-serif", minHeight: '100vh', background: '#080C14', color: '#e2e8f0' }}
    >
      {/* ── Header ── */}
      <div
        className="sticky top-0 z-40 border-b border-white/8"
        style={{ background: 'rgba(8,12,20,0.92)', backdropFilter: 'blur(16px)' }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* Title row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Civic<span style={{ color: '#3b82f6' }}>Pulse</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">Community issue tracker</p>
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-400">Live</span>
            </div>
          </div>

          {/* View tabs */}
          <div className="flex gap-1 mb-4 bg-white/5 rounded-xl p-1 w-fit">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* FilterBar */}
          <FilterBar
            filters={filters}
            onFilterChange={updateFilters}
            onReset={resetFilters}
            resultCount={loading ? undefined : issues.length}
          />
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Error state */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3 text-sm mb-6">
            ⚠️ {error}
          </div>
        )}

        {/* MAP VIEW */}
        {(activeTab === 'map' || activeTab === 'heat') && (
          <MapView
            issues={issues}
            onIssueClick={handleCardClick}
            showHeatmap={activeTab === 'heat'}
          />
        )}

        {/* FEED VIEW */}
        {activeTab === 'feed' && (
          <>
            {/* Stats strip */}
            {!loading && issues.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: 'Open',        value: issues.filter(i => i.status === 'open').length,          color: 'text-rose-400'    },
                  { label: 'In Progress', value: issues.filter(i => i.status === 'in-progress').length,   color: 'text-amber-400'   },
                  { label: 'Resolved',    value: issues.filter(i => i.status === 'resolved').length,      color: 'text-emerald-400' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white/5 border border-white/8 rounded-xl p-3 text-center">
                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                : issues.length === 0
                ? <EmptyState onReset={resetFilters} />
                : issues.map((issue, i) => (
                    <div
                      key={issue._id}
                      style={{ animationDelay: `${i * 40}ms` }}
                      className="animate-[fadeSlideIn_0.3s_ease_forwards] opacity-0"
                    >
                      <IssueCard
                        issue={issue}
                        onClick={handleCardClick}
                        onVote={handleVote}
                      />
                    </div>
                  ))
              }
            </div>
          </>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={handleModalClose}
          onVote={handleVote}
        />
      )}

      {/* ── Global keyframe ── */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
};

export default ExplorePage;