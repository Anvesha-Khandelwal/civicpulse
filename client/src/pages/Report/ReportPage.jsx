// pages/Report/ReportPage.jsx
// npm install react-leaflet leaflet (already installed)
import { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { AuthContext } from '../../context/AuthContext';
import { createIssue } from '../../services/api';

const CATEGORIES = ['Pothole','Streetlight','Garbage','Water','Drainage','Other'];
const CATEGORY_ICONS = { Pothole:'🕳️', Streetlight:'💡', Garbage:'🗑️', Water:'💧', Drainage:'🌊', Other:'⚠️' };

const pinIcon = L.divIcon({
  html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#1d4ed8;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);transform:rotate(-45deg)"></div>`,
  iconSize: [28, 28], iconAnchor: [14, 28], className: '',
});

const LocationPicker = ({ onPick }) => {
  useMapEvents({
    click(e) { onPick({ lat: e.latlng.lat, lng: e.latlng.lng }); },
  });
  return null;
};

const ReportPage = () => {
  const { user }   = useContext(AuthContext);
  const navigate   = useNavigate();
  const fileRef    = useRef();

  const [form, setForm] = useState({
    title: '', description: '', category: '', lat: null, lng: null, address: '',
  });
  const [files,    setFiles]    = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [step,     setStep]     = useState(1); // 1=details 2=location 3=review

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleFiles = (e) => {
    const chosen = Array.from(e.target.files).slice(0, 5);
    setFiles(chosen);
    setPreviews(chosen.map(f => URL.createObjectURL(f)));
  };

  const handleMapPick = ({ lat, lng }) => {
    set('lat', lat); set('lng', lng);
    // Reverse geocode using Nominatim (free)
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      .then(r => r.json())
      .then(d => set('address', d.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`))
      .catch(() => set('address', `${lat.toFixed(4)}, ${lng.toFixed(4)}`));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.category || !form.lat)
      return setError('Please fill all fields and pick a location.');
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v != null && fd.append(k, v));
      files.forEach(f => fd.append('media', f));
      await createIssue(fd);
      navigate('/explore');
    } catch (e) {
      setError(e.message || 'Submission failed');
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1px solid #e2e8f0', fontSize: 14, color: '#0f172a',
    outline: 'none', background: 'white', fontFamily: 'inherit',
  };

  const labelStyle = { fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748b' }}>←</button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Report an Issue</h1>
      </div>

      {/* Step indicator */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '12px 20px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', gap: 0 }}>
          {['Details', 'Location', 'Review'].map((s, i) => {
            const n = i + 1;
            const done = step > n; const active = step === n;
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                    background: active ? '#1d4ed8' : done ? '#059669' : '#f1f5f9',
                    color: active || done ? 'white' : '#94a3b8',
                  }}>{done ? '✓' : n}</div>
                  <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#1d4ed8' : done ? '#059669' : '#94a3b8' }}>{s}</span>
                </div>
                {i < 2 && <div style={{ flex: 1, height: 2, background: done ? '#bbf7d0' : '#e2e8f0', margin: '0 12px', marginBottom: 0 }} />}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '24px auto', padding: '0 20px' }}>
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Step 1: Details ── */}
        {step === 1 && (
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={labelStyle}>Issue Title *</label>
              <input
                style={inputStyle} placeholder="e.g. Large pothole on MG Road"
                value={form.title} onChange={e => set('title', e.target.value)}
                onFocus={e => e.target.style.borderColor = '#93c5fd'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div>
              <label style={labelStyle}>Category *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => set('category', cat)} style={{
                    padding: '10px 8px', borderRadius: 8, border: '1px solid',
                    borderColor: form.category === cat ? '#1d4ed8' : '#e2e8f0',
                    background: form.category === cat ? '#eff6ff' : 'white',
                    color: form.category === cat ? '#1d4ed8' : '#374151',
                    cursor: 'pointer', fontSize: 13, fontWeight: 500,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  }}>
                    <span style={{ fontSize: 20 }}>{CATEGORY_ICONS[cat]}</span>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Description *</label>
              <textarea
                style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
                placeholder="Describe the issue in detail..."
                value={form.description} onChange={e => set('description', e.target.value)}
                onFocus={e => e.target.style.borderColor = '#93c5fd'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div>
              <label style={labelStyle}>Photos / Videos (optional, max 5)</label>
              <div
                onClick={() => fileRef.current.click()}
                style={{
                  border: '2px dashed #e2e8f0', borderRadius: 10, padding: '24px',
                  textAlign: 'center', cursor: 'pointer', background: '#f8fafc',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#93c5fd'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>Click to upload photos or videos</div>
                <input ref={fileRef} type="file" multiple accept="image/*,video/*" style={{ display: 'none' }} onChange={handleFiles} />
              </div>
              {previews.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  {previews.map((p, i) => (
                    <img key={i} src={p} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => { if (!form.title || !form.category || !form.description) return setError('Fill all required fields'); setError(''); setStep(2); }}
              style={{ padding: '12px', borderRadius: 8, background: '#1d4ed8', color: 'white', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              Next: Pick Location →
            </button>
          </div>
        )}

        {/* ── Step 2: Location ── */}
        {step === 2 && (
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12, marginTop: 0 }}>
              📍 Click on the map to pin the exact location of the issue
            </p>

            <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: 16 }}>
              <MapContainer center={[12.9716, 77.5946]} zoom={12} style={{ height: 380 }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker onPick={handleMapPick} />
                {form.lat && <Marker position={[form.lat, form.lng]} icon={pinIcon} />}
              </MapContainer>
            </div>

            {form.lat && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#059669', marginBottom: 16 }}>
                ✓ Location pinned: {form.address || `${form.lat.toFixed(5)}, ${form.lng.toFixed(5)}`}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '11px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
                ← Back
              </button>
              <button
                onClick={() => { if (!form.lat) return setError('Pick a location on the map'); setError(''); setStep(3); }}
                style={{ flex: 2, padding: '11px', borderRadius: 8, background: '#1d4ed8', color: 'white', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                Next: Review →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Review ── */}
        {step === 3 && (
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Review your report</h2>

            {previews[0] && <img src={previews[0]} alt="" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 10, border: '1px solid #e2e8f0' }} />}

            {[
              { label: 'Title',       value: form.title },
              { label: 'Category',    value: `${CATEGORY_ICONS[form.category]} ${form.category}` },
              { label: 'Description', value: form.description },
              { label: 'Location',    value: form.address || `${form.lat?.toFixed(5)}, ${form.lng?.toFixed(5)}` },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', width: 80, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: 1 }}>{r.label}</span>
                <span style={{ fontSize: 14, color: '#0f172a', lineHeight: 1.5 }}>{r.value}</span>
              </div>
            ))}

            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#92400e' }}>
              ℹ️ This issue will be automatically assigned to the relevant department.
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, padding: '11px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
                ← Back
              </button>
              <button onClick={handleSubmit} disabled={loading} style={{
                flex: 2, padding: '11px', borderRadius: 8, border: 'none',
                background: loading ? '#93c5fd' : '#1d4ed8', color: 'white',
                fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              }}>
                {loading ? 'Submitting...' : '✓ Submit Report'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPage;