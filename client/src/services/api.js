// services/api.js
// ⚠️ MOCK VERSION — replace BASE_URL and remove mock data once backend is ready

const BASE_URL = 'http://localhost:5000/api'; // change when backend is live

// ── MOCK DATA ──────────────────────────────────────────────────────────────
const MOCK_ISSUES = [
  {
    _id: '1', title: 'Large pothole on MG Road near Ulsoor',
    description: 'Massive pothole causing accidents, especially at night. Multiple vehicles damaged.',
    category: 'Pothole', status: 'open',
    location: { lat: 12.9756, lng: 77.6197, address: 'MG Road, Bengaluru' },
    mediaUrls: ['https://picsum.photos/seed/pot1/600/400'],
    upvotes: ['u1','u2','u3','u4','u5'], downvotes: ['u6'],
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    assignedDepartment: 'BBMP Roads', adminNote: null,
  },
  {
    _id: '2', title: 'Street light broken for 2 weeks — Koramangala 5th Block',
    description: 'Three consecutive lights are out making the road very unsafe after 8pm.',
    category: 'Streetlight', status: 'in-progress',
    location: { lat: 12.9352, lng: 77.6245, address: 'Koramangala 5th Block, Bengaluru' },
    mediaUrls: ['https://picsum.photos/seed/light2/600/400'],
    upvotes: ['u1','u2','u7'], downvotes: [],
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    assignedDepartment: 'BESCOM', adminNote: 'Technician visit scheduled for Thursday.',
  },
  {
    _id: '3', title: 'Garbage pile not collected — Indiranagar 100ft road',
    description: 'Garbage has been piling up for 5 days. Stray dogs scattering waste everywhere.',
    category: 'Garbage', status: 'open',
    location: { lat: 12.9784, lng: 77.6408, address: 'Indiranagar 100ft Road, Bengaluru' },
    mediaUrls: ['https://picsum.photos/seed/garb3/600/400'],
    upvotes: ['u3','u8','u9','u10','u11','u12'], downvotes: ['u1','u2'],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    assignedDepartment: 'BBMP Sanitation', adminNote: null,
  },
  {
    _id: '4', title: 'Water pipe burst — HSR Layout Sector 2',
    description: 'Underground pipe burst causing water logging and road damage.',
    category: 'Water', status: 'resolved',
    location: { lat: 12.9116, lng: 77.6389, address: 'HSR Layout Sector 2, Bengaluru' },
    mediaUrls: ['https://picsum.photos/seed/water4/600/400'],
    upvotes: ['u1','u4'], downvotes: [],
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    assignedDepartment: 'BWSSB', adminNote: 'Pipe repaired and road restored.',
  },
  {
    _id: '5', title: 'Drainage overflow — Jayanagar 4th Block',
    description: 'Drain is overflowing onto the footpath, making it unusable.',
    category: 'Drainage', status: 'open',
    location: { lat: 12.9308, lng: 77.5836, address: 'Jayanagar 4th Block, Bengaluru' },
    mediaUrls: ['https://picsum.photos/seed/drain5/600/400'],
    upvotes: ['u2','u5','u6'], downvotes: ['u7','u8','u9','u10','u11','u12','u13','u14','u15','u16'],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    assignedDepartment: null, adminNote: null,
  },
  {
    _id: '6', title: 'Footpath blocked by construction debris — Whitefield',
    description: 'Construction material dumped on footpath for 3 weeks. Pedestrians forced onto road.',
    category: 'Other', status: 'in-progress',
    location: { lat: 12.9698, lng: 77.7499, address: 'Whitefield Main Road, Bengaluru' },
    mediaUrls: [],
    upvotes: ['u1'], downvotes: [],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    assignedDepartment: 'BBMP', adminNote: null,
  },
];

// ── HELPERS ─────────────────────────────────────────────────────────────────
const delay = (ms = 600) => new Promise((res) => setTimeout(res, ms));

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

// ── ISSUES ──────────────────────────────────────────────────────────────────

/**
 * Fetch issues with optional filters.
 * Switches to real API once backend is live — just set USE_MOCK = false.
 */
const USE_MOCK = true; // ← flip to false when backend is ready

export const fetchIssues = async (params = {}, signal) => {
  if (USE_MOCK) {
    await delay();
    let result = [...MOCK_ISSUES];

    if (params.category && params.category !== 'all')
      result = result.filter((i) => i.category === params.category);

    if (params.status && params.status !== 'all')
      result = result.filter((i) => i.status === params.status);

    if (params.locality)
      result = result.filter((i) =>
        i.location.address.toLowerCase().includes(params.locality.toLowerCase())
      );

    if (params.sortBy === 'upvotes')
      result.sort((a, b) => b.upvotes.length - a.upvotes.length);
    else if (params.sortBy === 'newest')
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return result;
  }

  // ── Real API ──
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString();
  const res = await fetch(`${BASE_URL}/issues?${query}`, { signal, headers: headers() });
  if (!res.ok) throw new Error('Failed to fetch issues');
  return res.json();
};

// ── VOTES ────────────────────────────────────────────────────────────────────

export const voteOnIssue = async (issueId, type) => {
  if (USE_MOCK) {
    await delay(300);
    return { success: true }; // optimistic update already done in useIssues hook
  }

  const res = await fetch(`${BASE_URL}/issues/${issueId}/vote`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ type }),
  });
  if (!res.ok) throw new Error('Vote failed');
  return res.json();
};

// ── AUTH (Dev 1 will fill these in properly) ─────────────────────────────────

export const loginUser = async (email, password, role) => {
  if (USE_MOCK) {
    await delay(800);
    return {
      token: 'mock-jwt-token',
      user: { _id: 'mockUser1', name: 'Test User', email, role },
    };
  }
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST', headers: headers(),
    body: JSON.stringify({ email, password, role }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
};

export const registerUser = async (data) => {
  if (USE_MOCK) {
    await delay(800);
    return { success: true };
  }
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST', headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Registration failed');
  return res.json();
};

// ── ISSUES CRUD (for ReportPage — Dev 1's territory but useful reference) ───

export const createIssue = async (formData) => {
  if (USE_MOCK) { await delay(); return { ...MOCK_ISSUES[0], _id: 'new_' + Date.now() }; }
  const res = await fetch(`${BASE_URL}/issues`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` }, // no Content-Type → multipart
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to create issue');
  return res.json();
};