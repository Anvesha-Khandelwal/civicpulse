// pages/ExplorePage.jsx
// Add to index.html <head>:
// <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">

import { useState, useContext } from 'react';
import useIssues from '../hooks/useIssues';
import { AuthContext } from '../context/AuthContext';
import IssueDetailModal from '../components/IssueDetailModal';
import MapView from '../components/MapView';

const CATEGORIES = [
  { id: 'all',         label: 'All Issues',   icon: '🗂️',  color: '#5c6bc0' },
  { id: 'Pothole',     label: 'Potholes',     icon: '🕳️',  color: '#e53935' },
  { id: 'Streetlight', label: 'Streetlights', icon: '💡',  color: '#f57c00' },
  { id: 'Garbage',     label: 'Garbage',      icon: '🗑️',  color: '#2e7d32' },
  { id: 'Water',       label: 'Water',        icon: '💧',  color: '#0277bd' },
  { id: 'Drainage',    label: 'Drainage',     icon: '🌊',  color: '#6a1b9a' },
  { id: 'Other',       label: 'Other',        icon: '⚠️',  color: '#5d4037' },
];

const SORT_OPTIONS = [
  { id: 'upvotes', label: 'Hot' },
  { id: 'newest',  label: 'New' },
  { id: 'nearby',  label: 'Nearby' },
];

const STATUS_OPTIONS = ['all', 'open', 'in-progress', 'resolved'];

const STATUS_META = {
  open:          { label: 'Open',        dot: '#ef4444', bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  'in-progress': { label: 'In Progress', dot: '#f59e0b', bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  resolved:      { label: 'Resolved',    dot: '#10b981', bg: '#f0fdf4', text: '#059669', border: '#bbf7d0' },
};

const CATEGORY_MAP = CATEGORIES.reduce((a, c) => { a[c.id] = c; return a; }, {});

const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

/* ─── Vote Column (Reddit-style left rail) ─── */
const VoteColumn = ({ issue, onVote }) => {
  const { user } = useContext(AuthContext);
  const hasUp   = user && issue.upvotes?.includes(user._id);
  const hasDown = user && issue.downvotes?.includes(user._id);
  const score   = (issue.upvotes?.length || 0) - (issue.downvotes?.length || 0);
  const vote    = (type, e) => { e.stopPropagation(); if (user) onVote(issue._id, type, user._id); };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 2, minWidth: 48, padding: '12px 0',
      background: '#f6f7f8', borderRight: '1px solid #edeff1',
      borderRadius: '4px 0 0 4px', flexShrink: 0,
    }}>
      <button
        onClick={(e) => vote('up', e)}
        title="Upvote"
        style={{
          background: 'none', border: 'none', cursor: user ? 'pointer' : 'default',
          padding: '4px 8px', borderRadius: 2, lineHeight: 1,
          color: hasUp ? '#ff4500' : '#878a8c',
          transition: 'color 0.1s',
          fontSize: 18,
        }}
      >▲</button>
      <span style={{
        fontSize: 12, fontWeight: 700,
        fontFamily: "'IBM Plex Mono', monospace",
        color: hasUp ? '#ff4500' : hasDown ? '#7193ff' : '#1c1c1c',
        lineHeight: 1,
      }}>
        {score > 9999 ? `${(score / 1000).toFixed(1)}k` : score}
      </span>
      <button
        onClick={(e) => vote('down', e)}
        title="Downvote"
        style={{
          background: 'none', border: 'none', cursor: user ? 'pointer' : 'default',
          padding: '4px 8px', borderRadius: 2, lineHeight: 1,
          color: hasDown ? '#7193ff' : '#878a8c',
          transition: 'color 0.1s',
          fontSize: 18,
        }}
      >▼</button>
    </div>
  );
};

/* ─── Issue Card (Reddit-style) ─── */
const IssueRow = ({ issue, onClick, onVote, index }) => {
  const [hovered, setHovered] = useState(false);
  const status = STATUS_META[issue.status] || STATUS_META.open;
  const cat    = CATEGORY_MAP[issue.category] || CATEGORY_MAP.Other;

  return (
    <div
      onClick={() => onClick(issue)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        background: hovered ? '#f8f8f8' : 'white',
        borderRadius: 4,
        border: `1px solid ${hovered ? '#818384' : '#ccc'}`,
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'border-color 0.1s, background 0.1s',
        animation: `slideIn 0.2s ease both`,
        animationDelay: `${index * 25}ms`,
        marginBottom: 8,
      }}
    >
      <VoteColumn issue={issue} onVote={onVote} />

      {/* Content */}
      <div style={{ flex: 1, padding: '8px 12px', minWidth: 0 }}>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 2,
            background: cat.color + '14', color: cat.color, border: `1px solid ${cat.color}30`,
            letterSpacing: '0.02em',
          }}>
            {cat.icon} {issue.category || 'Other'}
          </span>
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 2, fontWeight: 600,
            background: status.bg, color: status.text, border: `1px solid ${status.border}`,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: status.dot, display: 'inline-block' }} />
            {status.label}
          </span>
          {issue.assignedDepartment && (
            <span style={{ fontSize: 11, color: '#0277bd', fontWeight: 500 }}>
              🏛 {issue.assignedDepartment}
            </span>
          )}
          {issue.downvotes?.length >= 10 && (
            <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>⚑ Flagged</span>
          )}
        </div>

        {/* Title */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: 18, fontWeight: 500, color: '#222', margin: '0 0 4px',
              lineHeight: 1.3, fontFamily: "'IBM Plex Sans', sans-serif",
            }}>
              {issue.title}
            </h3>
            <p style={{
              fontSize: 14, color: '#555', margin: '0 0 8px', lineHeight: 1.6,
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {issue.description}
            </p>
          </div>

          {/* Thumbnail */}
          {issue.mediaUrls?.[0] && (
            <div style={{
              width: 96, height: 72, flexShrink: 0, borderRadius: 4,
              overflow: 'hidden', background: '#edeff1', border: '1px solid #edeff1',
            }}>
              <img src={issue.mediaUrls[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {issue.location?.address && (
            <span style={{ fontSize: 12, color: '#878a8c', display: 'flex', alignItems: 'center', gap: 4 }}>
              📍
              <span style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {issue.location.address}
              </span>
            </span>
          )}
          <span style={{
            fontSize: 12, color: '#878a8c',
            marginLeft: 'auto',
            fontFamily: "'IBM Plex Mono', monospace",
          }}>
            {timeAgo(issue.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ─── Skeleton ─── */
const SkeletonRow = () => (
  <div style={{
    display: 'flex', background: 'white', borderRadius: 4,
    border: '1px solid #ccc', overflow: 'hidden', height: 110, marginBottom: 8,
  }}>
    <div style={{ width: 48, background: '#f6f7f8', borderRight: '1px solid #edeff1' }} />
    <div style={{ flex: 1, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ height: 18, width: 80, borderRadius: 2, background: '#edeff1' }} />
        <div style={{ height: 18, width: 90, borderRadius: 2, background: '#edeff1' }} />
      </div>
      <div style={{ height: 20, width: '50%', borderRadius: 2, background: '#f6f7f8' }} />
      <div style={{ height: 14, width: '75%', borderRadius: 2, background: '#f6f7f8' }} />
    </div>
  </div>
);

/* ─── Filters Panel (Left Sidebar) ─── */
const FilterPanel = ({ filters, onFilterChange }) => {
  const activeCategory = filters.category || 'all';
  const activeStatus   = filters.status || 'all';

  const sectionHeader = (label) => (
    <div style={{
      padding: '10px 12px 6px',
      fontSize: 10, fontWeight: 700, color: '#878a8c',
      textTransform: 'uppercase', letterSpacing: '0.1em',
    }}>
      {label}
    </div>
  );

  const categoryBtn = (cat) => {
    const active = activeCategory === cat.id;
    return (
      <button
        key={cat.id}
        onClick={() => onFilterChange({ category: cat.id })}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          padding: '7px 12px', background: active ? cat.color + '12' : 'transparent',
          border: 'none', borderLeft: `3px solid ${active ? cat.color : 'transparent'}`,
          cursor: 'pointer', textAlign: 'left', transition: 'all 0.1s',
        }}
      >
        <span style={{ fontSize: 14 }}>{cat.icon}</span>
        <span style={{
          fontSize: 13, fontWeight: active ? 600 : 400,
          color: active ? cat.color : '#374151',
        }}>
          {cat.label}
        </span>
      </button>
    );
  };

  const statusBtn = (s) => {
    const meta   = STATUS_META[s];
    const active = activeStatus === s;
    return (
      <button
        key={s}
        onClick={() => onFilterChange({ status: s })}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          padding: '7px 12px', background: active ? (meta?.bg || '#f6f7f8') : 'transparent',
          border: 'none', borderLeft: `3px solid ${active ? (meta?.dot || '#5c6bc0') : 'transparent'}`,
          cursor: 'pointer', textAlign: 'left', transition: 'all 0.1s',
        }}
      >
        <span style={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
          background: meta?.dot || '#878a8c',
        }} />
        <span style={{
          fontSize: 13, fontWeight: active ? 600 : 400,
          color: active ? (meta?.text || '#374151') : '#374151',
          textTransform: 'capitalize',
        }}>
          {s === 'all' ? 'All Statuses' : s.replace('-', ' ')}
        </span>
      </button>
    );
  };

  return (
    <aside style={{ width: 220, flexShrink: 0, position: 'sticky', top: 60 }}>
      {/* Categories */}
      <div style={{
        background: 'white', borderRadius: 4, border: '1px solid #ccc',
        overflow: 'hidden', marginBottom: 10,
      }}>
        {sectionHeader('Categories')}
        <div style={{ borderTop: '1px solid #edeff1' }}>
          {CATEGORIES.map(categoryBtn)}
        </div>
      </div>

      {/* Status */}
      <div style={{
        background: 'white', borderRadius: 4, border: '1px solid #ccc',
        overflow: 'hidden', marginBottom: 10,
      }}>
        {sectionHeader('Status')}
        <div style={{ borderTop: '1px solid #edeff1' }}>
          {STATUS_OPTIONS.map(statusBtn)}
        </div>
      </div>

      {/* CTA */}
      <div style={{
        background: '#ff4500', borderRadius: 4, padding: '14px 16px', color: 'white',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>📣 See a problem?</div>
        <div style={{ fontSize: 12, lineHeight: 1.5, opacity: 0.9, marginBottom: 12 }}>
          Report local civic issues and help your community.
        </div>
        <a href="/report" style={{
          display: 'block', textAlign: 'center', padding: '8px 0',
          background: 'white', color: '#ff4500', borderRadius: 4,
          fontSize: 13, fontWeight: 700, textDecoration: 'none',
        }}>
          + Report Issue
        </a>
      </div>
    </aside>
  );
};

/* ─── Sort & Search Bar ─── */
const FeedControls = ({ filters, onFilterChange, onReset, count, view, setView }) => {
  const [localSearch, setLocalSearch] = useState(filters.locality || '');
  const hasFilters = filters.category !== 'all' || filters.status !== 'all' || filters.locality;

  const handleSearch = (e) => {
    e.preventDefault();
    onFilterChange({ locality: localSearch });
  };

  return (
    <div style={{
      background: 'white', borderRadius: 4, border: '1px solid #ccc',
      padding: '8px 12px', marginBottom: 10,
    }}>
      {/* Top row: sort + view toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
        {/* Sort tabs */}
        <div style={{ display: 'flex', gap: 2, flex: 1 }}>
          {SORT_OPTIONS.map((s) => {
            const active = filters.sortBy === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onFilterChange({ sortBy: s.id })}
                style={{
                  padding: '6px 14px', borderRadius: 20, border: 'none',
                  cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  background: active ? '#ff4500' : 'transparent',
                  color: active ? 'white' : '#878a8c',
                  transition: 'all 0.12s',
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Spacer */}
        <div style={{ width: 1, height: 20, background: '#edeff1' }} />

        {/* View toggle */}
        <div style={{ display: 'flex', gap: 2 }}>
          {[{ id: 'feed', label: '☰ Feed' }, { id: 'map', label: '🗺 Map' }].map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              style={{
                padding: '6px 12px', borderRadius: 20, border: 'none',
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: view === v.id ? '#edeff1' : 'transparent',
                color: view === v.id ? '#1c1c1c' : '#878a8c',
                transition: 'all 0.12s',
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom row: search + results count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 6, flex: 1 }}>
          <input
            type="text"
            placeholder="Filter by area or locality…"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            style={{
              flex: 1, padding: '6px 10px', borderRadius: 4,
              border: '1px solid #edeff1', fontSize: 13, color: '#1c1c1c',
              background: '#f6f7f8', outline: 'none', fontFamily: 'inherit',
            }}
            onFocus={(e) => e.target.style.borderColor = '#878a8c'}
            onBlur={(e) => e.target.style.borderColor = '#edeff1'}
          />
          <button
            type="submit"
            style={{
              padding: '6px 14px', borderRadius: 4, border: 'none',
              background: '#ff4500', color: 'white', fontSize: 13,
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            Search
          </button>
          {filters.locality && (
            <button
              type="button"
              onClick={() => { setLocalSearch(''); onFilterChange({ locality: '' }); }}
              style={{
                padding: '6px 10px', borderRadius: 4, border: '1px solid #fecaca',
                background: '#fef2f2', color: '#dc2626', fontSize: 13, cursor: 'pointer',
              }}
            >
              ✕
            </button>
          )}
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {count !== undefined && (
            <span style={{
              fontSize: 12, color: '#878a8c',
              fontFamily: "'IBM Plex Mono', monospace",
            }}>
              {count} results
            </span>
          )}
          {hasFilters && (
            <button
              onClick={onReset}
              style={{
                fontSize: 12, color: '#dc2626', background: 'none',
                border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0,
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Main Page ─── */
const ExplorePage = () => {
  const { issues, loading, error, filters, updateFilters, resetFilters, handleVote } = useIssues();
  const [view, setView]               = useState('feed');
  const [selectedIssue, setSelectedIssue] = useState(null);

  const stats = {
    open:       issues.filter((i) => i.status === 'open').length,
    inProgress: issues.filter((i) => i.status === 'in-progress').length,
    resolved:   issues.filter((i) => i.status === 'resolved').length,
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#dae0e6',
      fontFamily: "'IBM Plex Sans', sans-serif",
    }}>

      {/* ── Header ── */}
      <div style={{
        background: 'white', borderBottom: '1px solid #edeff1',
        padding: '0 20px', height: 48, display: 'flex', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 30,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', width: '100%',
          display: 'flex', alignItems: 'center', gap: 20,
        }}>
          {/* Logo */}
          <a href="/explore" style={{
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#ff4500', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 17,
            }}>
              🏙️
            </div>
            <span style={{
              fontSize: 16, fontWeight: 800, color: '#1c1c1c', letterSpacing: '-0.02em',
            }}>
              Civic<span style={{ color: '#ff4500' }}>Pulse</span>
            </span>
          </a>

          {/* Stats */}
          <div style={{
            display: 'flex', gap: 0, background: '#f6f7f8',
            borderRadius: 4, border: '1px solid #edeff1', overflow: 'hidden',
          }}>
            {[
              { label: 'Open',     value: stats.open,       color: '#dc2626' },
              { label: 'Active',   value: stats.inProgress, color: '#d97706' },
              { label: 'Resolved', value: stats.resolved,   color: '#059669' },
            ].map((s, i) => (
              <div key={s.label} style={{
                padding: '4px 16px', textAlign: 'center',
                borderRight: i < 2 ? '1px solid #edeff1' : 'none',
              }}>
                <div style={{
                  fontSize: 14, fontWeight: 800, color: s.color,
                  fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1,
                }}>
                  {loading ? '–' : s.value}
                </div>
                <div style={{
                  fontSize: 10, color: '#878a8c', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2,
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Report CTA */}
          <a href="/report" style={{
            marginLeft: 'auto', padding: '6px 16px', borderRadius: 20,
            background: '#ff4500', color: 'white', textDecoration: 'none',
            fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Report Issue
          </a>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '20px',
        display: 'flex', gap: 20, alignItems: 'flex-start',
      }}>
        {/* Left sidebar — filters */}
        <FilterPanel filters={filters} onFilterChange={updateFilters} />

        {/* Main feed */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Feed controls */}
          <FeedControls
            filters={filters}
            onFilterChange={updateFilters}
            onReset={resetFilters}
            count={loading ? undefined : issues.length}
            view={view}
            setView={setView}
          />

          {/* Error */}
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 4, padding: '10px 14px', color: '#dc2626',
              fontSize: 13, marginBottom: 10,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Map view */}
          {view === 'map' && (
            <div style={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #ccc' }}>
              <MapView issues={issues} onIssueClick={setSelectedIssue} showHeatmap={false} />
            </div>
          )}

          {/* Feed view */}
          {view === 'feed' && (
            <div>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : issues.length === 0
                ? (
                  <div style={{
                    background: 'white', borderRadius: 4, border: '1px solid #ccc',
                    padding: '60px 20px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#222', marginBottom: 8 }}>
                      No issues found
                    </div>
                    <div style={{ fontSize: 13, color: '#878a8c', marginBottom: 20 }}>
                      Try adjusting your filters
                    </div>
                    <button
                      onClick={resetFilters}
                      style={{
                        padding: '8px 20px', borderRadius: 20,
                        border: 'none', background: '#ff4500',
                        color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      Clear filters
                    </button>
                  </div>
                )
                : issues.map((issue, i) => (
                  <IssueRow
                    key={issue._id}
                    issue={issue}
                    index={i}
                    onClick={setSelectedIssue}
                    onVote={handleVote}
                  />
                ))
              }
            </div>
          )}
        </div>
      </div>

      {/* Issue detail modal */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onVote={handleVote}
        />
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        button:hover { opacity: 0.9; }
      `}</style>
    </div>
  );
};

export default ExplorePage;