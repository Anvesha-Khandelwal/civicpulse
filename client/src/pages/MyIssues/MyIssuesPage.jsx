// pages/MyIssues/MyIssuesPage.jsx
import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { fetchMyIssues } from '../../services/api';
import StatusTimeline from '../../components/StatusTimeline';

const STATUS_META = {
  open:          { label: 'Open',        bg: '#fef2f2', text: '#dc2626', dot: '#ef4444' },
  'in-progress': { label: 'In Progress', bg: '#fffbeb', text: '#d97706', dot: '#f59e0b' },
  resolved:      { label: 'Resolved',    bg: '#f0fdf4', text: '#059669', dot: '#10b981' },
};

const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
};

const MyIssuesPage = () => {
  const { user }     = useContext(AuthContext);
  const navigate     = useNavigate();
  const [issues,  setIssues]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchMyIssues()
      .then(setIssues)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    open:       issues.filter(i => i.status === 'open').length,
    inProgress: issues.filter(i => i.status === 'in-progress').length,
    resolved:   issues.filter(i => i.status === 'resolved').length,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate('/explore')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748b' }}>←</button>
        <div>
          <h1 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>My Reports</h1>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{user?.name}</p>
        </div>
        <a href="/report" style={{
          marginLeft: 'auto', padding: '8px 16px', borderRadius: 8,
          background: '#1d4ed8', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700,
        }}>+ New Report</a>
      </div>

      <div style={{ maxWidth: 720, margin: '24px auto', padding: '0 20px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Open',       value: stats.open,       color: '#dc2626', bg: '#fef2f2' },
            { label: 'In Progress',value: stats.inProgress, color: '#d97706', bg: '#fffbeb' },
            { label: 'Resolved',   value: stats.resolved,   color: '#059669', bg: '#f0fdf4' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '14px', textAlign: 'center', border: `1px solid ${s.color}25` }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{loading ? '–' : s.value}</div>
              <div style={{ fontSize: 11, color: s.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Issue list */}
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 20, marginBottom: 10, height: 120, opacity: 0.5 }} />
          ))
        ) : issues.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 8 }}>No reports yet</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>Be the first to report an issue in your area</div>
            <a href="/report" style={{ padding: '10px 24px', borderRadius: 8, background: '#1d4ed8', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
              Report an Issue
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {issues.map(issue => {
              const status = STATUS_META[issue.status] || STATUS_META.open;
              const open   = expanded === issue._id;
              return (
                <div key={issue._id} style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden', transition: 'box-shadow 0.15s' }}>
                  {/* Row */}
                  <div
                    onClick={() => setExpanded(open ? null : issue._id)}
                    style={{ display: 'flex', gap: 14, padding: '14px 16px', cursor: 'pointer', alignItems: 'flex-start' }}
                  >
                    {issue.mediaUrls?.[0] ? (
                      <img src={issue.mediaUrls[0]} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 64, height: 64, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>📍</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: status.bg, color: status.text, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: status.dot, display: 'inline-block' }} />
                          {status.label}
                        </span>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{issue.category}</span>
                        <span style={{ fontSize: 11, color: '#cbd5e1', marginLeft: 'auto' }}>{timeAgo(issue.createdAt)}</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {issue.title}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', display: 'flex', gap: 12 }}>
                        <span>▲ {issue.upvotes?.length || 0}</span>
                        {issue.assignedDepartment && <span>🏛 {issue.assignedDepartment}</span>}
                      </div>
                    </div>
                    <span style={{ color: '#94a3b8', fontSize: 12, flexShrink: 0, marginTop: 4 }}>{open ? '▲' : '▼'}</span>
                  </div>

                  {/* Expanded: timeline + admin note */}
                  {open && (
                    <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px 16px 20px' }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14, marginTop: 0 }}>Progress</p>
                      <StatusTimeline status={issue.status} />

                      {issue.adminNote && (
                        <div style={{ marginTop: 16, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '12px 14px' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', marginBottom: 4 }}>🏛 Official Update</div>
                          <div style={{ fontSize: 13, color: '#1e40af' }}>{issue.adminNote}</div>
                        </div>
                      )}

                      {issue.isDuplicate && (
                        <div style={{ marginTop: 10, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#92400e' }}>
                          ⚠️ A similar issue was already reported nearby. Your report has been linked to it.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyIssuesPage;