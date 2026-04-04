// pages/AdminDashboard/AdminDashboard.jsx
import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { fetchAdminIssues, updateAdminIssue, deleteAdminIssue } from '../../services/api';

const STATUS_OPTIONS = ['open', 'in-progress', 'resolved'];
const STATUS_META = {
  open:          { label: 'Open',        bg: '#fef2f2', text: '#dc2626', dot: '#ef4444' },
  'in-progress': { label: 'In Progress', bg: '#fffbeb', text: '#d97706', dot: '#f59e0b' },
  resolved:      { label: 'Resolved',    bg: '#f0fdf4', text: '#059669', dot: '#10b981' },
};

const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
};

const AdminDashboard = () => {
  const { user }      = useContext(AuthContext);
  const [issues,    setIssues]    = useState([]);
  const [stats,     setStats]     = useState({});
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('all');
  const [noteInputs, setNoteInputs] = useState({});
  const [saving,    setSaving]    = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminIssues({ status: filter });
      setIssues(data.issues);
      setStats(data.stats);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const handleStatusChange = async (id, status) => {
    setSaving(p => ({ ...p, [id]: true }));
    try {
      await updateAdminIssue(id, { status });
      setIssues(p => p.map(i => i._id === id ? { ...i, status } : i));
    } finally { setSaving(p => ({ ...p, [id]: false })); }
  };

  const handleNoteSubmit = async (id) => {
    setSaving(p => ({ ...p, [`note_${id}`]: true }));
    try {
      await updateAdminIssue(id, { adminNote: noteInputs[id] || '' });
      setIssues(p => p.map(i => i._id === id ? { ...i, adminNote: noteInputs[id] } : i));
    } finally { setSaving(p => ({ ...p, [`note_${id}`]: false })); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this issue? This cannot be undone.')) return;
    try {
      await deleteAdminIssue(id);
      setIssues(p => p.filter(i => i._id !== id));
    } catch (e) { alert('Failed to remove'); }
  };

  const statCards = [
    { label: 'Open',       value: stats.open,       color: '#dc2626', bg: '#fef2f2' },
    { label: 'In Progress',value: stats.inProgress, color: '#d97706', bg: '#fffbeb' },
    { label: 'Resolved',   value: stats.resolved,   color: '#059669', bg: '#f0fdf4' },
    { label: 'Flagged',    value: stats.flagged,     color: '#7c3aed', bg: '#f5f3ff' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '14px 24px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              🏛 {user?.departmentName || 'Department'} Dashboard
            </h1>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Manage assigned issues</p>
          </div>
          <a href="/explore" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>← Back to Explore</a>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '24px auto', padding: '0 20px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
          {statCards.map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '16px', border: `1px solid ${s.color}20` }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{loading ? '–' : (s.value ?? 0)}</div>
              <div style={{ fontSize: 12, color: s.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 6, width: 'fit-content', marginBottom: 16 }}>
          {['all', ...STATUS_OPTIONS].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '6px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
              background: filter === s ? '#1d4ed8' : 'transparent',
              color: filter === s ? 'white' : '#64748b',
              transition: 'all 0.15s',
            }}>
              {s === 'all' ? 'All' : s.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Issues table */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 180px 100px', gap: 0, padding: '10px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            {['Issue', 'Category', 'Status', 'Official Note', 'Action'].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</div>
            ))}
          </div>

          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ padding: '16px', borderBottom: '1px solid #f8fafc', display: 'flex', gap: 12, opacity: 0.4 }}>
                <div style={{ height: 14, flex: 2, background: '#f1f5f9', borderRadius: 4 }} />
                <div style={{ height: 14, flex: 1, background: '#f1f5f9', borderRadius: 4 }} />
              </div>
            ))
          ) : issues.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
              No issues found for this filter
            </div>
          ) : (
            issues.map(issue => {
              const sm = STATUS_META[issue.status] || STATUS_META.open;
              return (
                <div key={issue._id} style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 180px 100px',
                  gap: 0, padding: '14px 16px', borderBottom: '1px solid #f8fafc',
                  alignItems: 'center',
                  background: issue.flagged ? '#fffbeb' : 'white',
                }}>
                  {/* Title + meta */}
                  <div style={{ minWidth: 0, paddingRight: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {issue.flagged && <span style={{ color: '#d97706', marginRight: 4 }}>⚑</span>}
                      {issue.title}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                      📍 {issue.location?.address?.split(',')[0]} · {timeAgo(issue.createdAt)} · ▲ {issue.upvotes?.length || 0}
                    </div>
                  </div>

                  {/* Category */}
                  <div style={{ fontSize: 12, color: '#64748b' }}>{issue.category}</div>

                  {/* Status dropdown */}
                  <div>
                    <select
                      value={issue.status}
                      onChange={e => handleStatusChange(issue._id, e.target.value)}
                      disabled={saving[issue._id]}
                      style={{
                        padding: '5px 8px', borderRadius: 6, border: `1px solid ${sm.dot}40`,
                        background: sm.bg, color: sm.text, fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', outline: 'none',
                      }}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s.replace('-', ' ')}</option>
                      ))}
                    </select>
                  </div>

                  {/* Note input */}
                  <div style={{ display: 'flex', gap: 4, paddingRight: 8 }}>
                    <input
                      type="text"
                      placeholder={issue.adminNote || 'Add note...'}
                      value={noteInputs[issue._id] ?? issue.adminNote ?? ''}
                      onChange={e => setNoteInputs(p => ({ ...p, [issue._id]: e.target.value }))}
                      style={{ flex: 1, padding: '5px 8px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, outline: 'none', minWidth: 0 }}
                    />
                    <button
                      onClick={() => handleNoteSubmit(issue._id)}
                      disabled={saving[`note_${issue._id}`]}
                      style={{ padding: '5px 8px', borderRadius: 6, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                    >
                      {saving[`note_${issue._id}`] ? '...' : '✓'}
                    </button>
                  </div>

                  {/* Delete */}
                  <div>
                    <button
                      onClick={() => handleDelete(issue._id)}
                      style={{ padding: '5px 10px', borderRadius: 6, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;