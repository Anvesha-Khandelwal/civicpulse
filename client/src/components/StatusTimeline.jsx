// components/StatusTimeline.jsx
const STEPS = ['Reported', 'Acknowledged', 'In Progress', 'Resolved'];
const STATUS_TO_STEP = { open: 0, 'in-progress': 2, resolved: 3 };

const StatusTimeline = ({ status }) => {
  const current = STATUS_TO_STEP[status] ?? 0;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      {STEPS.map((step, i) => {
        const done    = i <= current;
        const active  = i === current;
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', border: '2px solid',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, transition: 'all 0.2s',
                borderColor: active ? '#1d4ed8' : done ? '#059669' : '#e2e8f0',
                background: active ? '#1d4ed8' : done ? '#f0fdf4' : '#f8fafc',
                color: active ? 'white' : done ? '#059669' : '#94a3b8',
                boxShadow: active ? '0 0 0 4px #dbeafe' : 'none',
              }}>
                {done && !active ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: 10, marginTop: 4, textAlign: 'center', width: 64, lineHeight: 1.3,
                fontWeight: active ? 600 : done ? 500 : 400,
                color: active ? '#1d4ed8' : done ? '#059669' : '#94a3b8',
              }}>{step}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2, marginBottom: 20,
                background: i < current ? '#bbf7d0' : '#e2e8f0',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;