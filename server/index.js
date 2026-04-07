require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests and local dev origins.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
const authRoutes   = require('./routes/authRoutes');
const issueRoutes  = require('./routes/issueRoutes');
const adminRoutes  = require('./routes/adminRoutes');

app.use('/api/auth',   authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/admin',  adminRoutes);

app.get('/', (req, res) => res.json({ message: 'CivicPulse API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));