const Issue = require('../models/issueModel');
const { checkDuplicate, isSpam, suggestDepartment } = require('../services/aiService');
const cloudinary = require('cloudinary').v2;

// Cloudinary config (add keys to .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── GET /api/issues ──────────────────────────────────────────────────────────
const getIssues = async (req, res, next) => {
  try {
    const { category, status, sortBy, locality, lat, lng, radius = 10, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (status   && status   !== 'all') filter.status   = status;
    if (locality) {
      filter['location.address'] = { $regex: locality, $options: 'i' };
    }

    let query = Issue.find(filter).populate('reportedBy', 'name');

    // Sorting
    if (sortBy === 'upvotes') {
      query = query.sort({ 'upvotes': -1 }); // approximation; proper sort below
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const skip    = (Number(page) - 1) * Number(limit);
    let issues    = await query.skip(skip).limit(Number(limit)).lean();

    // Sort by upvote count in JS (MongoDB can't sort by array length natively without aggregation)
    if (sortBy === 'upvotes') {
      issues = issues.sort((a, b) => b.upvotes.length - a.upvotes.length);
    }

    // Sort by distance if lat/lng provided
    if (sortBy === 'nearby' && lat && lng) {
      issues = issues
        .map(i => {
          const R  = 6371;
          const dL = ((i.location.lat - lat) * Math.PI) / 180;
          const dl = ((i.location.lng - lng) * Math.PI) / 180;
          const a  =
            Math.sin(dL/2)**2 +
            Math.cos(lat*Math.PI/180)*Math.cos(i.location.lat*Math.PI/180)*Math.sin(dl/2)**2;
          i._dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          return i;
        })
        .filter(i => i._dist <= Number(radius))
        .sort((a, b) => a._dist - b._dist);
    }

    const total = await Issue.countDocuments(filter);
    res.json({ issues, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// ── GET /api/issues/:id ──────────────────────────────────────────────────────
const getIssueById = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id).populate('reportedBy', 'name email');
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    res.json(issue);
  } catch (err) { next(err); }
};

// ── POST /api/issues ─────────────────────────────────────────────────────────
const createIssue = async (req, res, next) => {
  try {
    const { title, description, category, lat, lng, address } = req.body;
    const userId = req.user._id;

    // Spam check
    if (await isSpam(userId, category))
      return res.status(429).json({ message: 'Too many reports in this category. Please wait.' });

    // Duplicate check
    const { isDuplicate, duplicateOf } = await checkDuplicate({
      lat: Number(lat), lng: Number(lng), category,
    });

    // Upload media to Cloudinary
    let mediaUrls = [];
    if (req.files?.length) {
      const uploads = await Promise.all(
        req.files.map(f =>
          cloudinary.uploader.upload_stream(
            { folder: 'civicpulse', resource_type: 'auto' },
            (err, result) => result?.secure_url
          )
        )
      );
      mediaUrls = uploads.filter(Boolean);
    }

    const issue = await Issue.create({
      title, description, category,
      location: { lat: Number(lat), lng: Number(lng), address },
      mediaUrls,
      reportedBy:         userId,
      assignedDepartment: suggestDepartment(category),
      isDuplicate,
      duplicateOf,
    });

    res.status(201).json(issue);
  } catch (err) { next(err); }
};

// ── POST /api/issues/:id/vote ─────────────────────────────────────────────────
const voteIssue = async (req, res, next) => {
  try {
    const { type } = req.body; // 'up' | 'down'
    const userId   = req.user._id;
    const issue    = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const inUp   = issue.upvotes.includes(userId);
    const inDown = issue.downvotes.includes(userId);

    if (type === 'up') {
      if (inUp)   issue.upvotes.pull(userId);       // toggle off
      else {
        issue.upvotes.push(userId);
        if (inDown) issue.downvotes.pull(userId);   // remove opposite
      }
    } else {
      if (inDown) issue.downvotes.pull(userId);
      else {
        issue.downvotes.push(userId);
        if (inUp) issue.upvotes.pull(userId);
      }
    }

    // Auto-flag
    if (issue.downvotes.length >= 10) issue.flagged = true;

    await issue.save();
    res.json({ upvotes: issue.upvotes, downvotes: issue.downvotes, flagged: issue.flagged });
  } catch (err) { next(err); }
};

// ── GET /api/issues/my ───────────────────────────────────────────────────────
const getMyIssues = async (req, res, next) => {
  try {
    const issues = await Issue.find({ reportedBy: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json(issues);
  } catch (err) { next(err); }
};

module.exports = { getIssues, getIssueById, createIssue, voteIssue, getMyIssues };