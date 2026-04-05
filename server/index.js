require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
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