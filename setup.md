# Frontend Dev 2 — Setup Guide

## 📦 Install Dependencies

```bash
# Map + heatmap
npm install react-leaflet leaflet leaflet.heat

# Types (optional, for VS Code intellisense)
npm install -D @types/leaflet
```

## 🔗 Required in `index.html` (inside <head>)

```html
<!-- Leaflet CSS -->
<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
/>

<!-- Google Fonts -->
<link
  href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Mono&display=swap"
  rel="stylesheet"
/>
```

## 🗂️ Where Each File Goes in Your Project

```
client/src/
│
├── hooks/
│   └── useIssues.js           ← copy here
│
├── pages/
│   └── ExplorePage.jsx        ← copy here
│
└── components/
    ├── IssueCard.jsx          ← copy here
    ├── IssueDetailModal.jsx   ← copy here
    ├── FilterBar.jsx          ← copy here
    ├── VoteButtons.jsx        ← copy here
    └── MapView.jsx            ← copy here
```

## 🔌 What You Import From Dev 1 (don't edit these yourself)

```js
// From Dev 1's AuthContext:
import { AuthContext } from '../context/AuthContext';
// Used in: VoteButtons.jsx → to check if user is logged in

// From Dev 1's api.js — ask them to add these functions:
import { fetchIssues, voteOnIssue } from '../services/api';
// fetchIssues(params, signal) → returns array of issues
// voteOnIssue(issueId, 'up'|'down') → returns updated issue
```

## 📡 API Shape You Expect (share with backend person)

### GET /api/issues
Query params: `category`, `status`, `sortBy`, `locality`, `radius`, `lat`, `lng`

Returns:
```json
[
  {
    "_id": "abc123",
    "title": "Pothole on MG Road",
    "description": "Large pothole causing accidents",
    "category": "Pothole",
    "status": "open",
    "location": { "lat": 12.9716, "lng": 77.5946, "address": "MG Road, Bengaluru" },
    "mediaUrls": ["https://cloudinary.com/..."],
    "upvotes": ["userId1", "userId2"],
    "downvotes": [],
    "createdAt": "2026-04-01T10:00:00.000Z",
    "assignedDepartment": "Roads Dept",
    "adminNote": "Team dispatched"
  }
]
```

### POST /api/issues/:id/vote
Body: `{ type: 'up' | 'down' }`

## 🪲 Leaflet Heatmap Note

`leaflet.heat` needs to be imported after leaflet. Add this to your `main.jsx`:

```js
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat'; // makes L.heatLayer available globally
```

## 🎨 Tailwind Config

Make sure your `tailwind.config.js` includes:
```js
content: ['./src/**/*.{js,jsx,ts,tsx}']
```