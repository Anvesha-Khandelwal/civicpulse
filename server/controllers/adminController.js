const Issue = require('../models/issueModel');

// ── GET /api/admin/issues ────────────────────────────────────────────────────
// Returns issues assigned to the logged-in authority's department
const getDepartmentIssues = async (req, res, next) => {
  try {
    const { status, sortBy = 'newest', page = 1, limit = 30 } = req.query;
    const filter = { assignedDepartment: req.user.departmentName };
    if (status && status !== 'all') filter.status = status;

    let issues = await Issue.find(filter)
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    if (sortBy === 'upvotes')
      issues = issues.sort((a, b) => b.upvotes.length - a.upvotes.length);

    const total = await Issue.countDocuments(filter);
    const stats = {
      open:       await Issue.countDocuments({ ...filter, status: 'open' }),
      inProgress: await Issue.countDocuments({ ...filter, status: 'in-progress' }),
      resolved:   await Issue.countDocuments({ ...filter, status: 'resolved' }),
      flagged:    await Issue.countDocuments({ ...filter, flagged: true }),
    };

    res.json({ issues, total, stats });
  } catch (err) { next(err); }
};

// ── PATCH /api/admin/issues/:id ──────────────────────────────────────────────
// Update status, add admin note, or remove issue
const updateIssue = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    // Ensure admin only touches their department
    if (issue.assignedDepartment !== req.user.departmentName)
      return res.status(403).json({ message: 'Not your department' });

    if (status)    issue.status    = status;
    if (adminNote !== undefined) issue.adminNote = adminNote;

    await issue.save();
    res.json(issue);
  } catch (err) { next(err); }
};

// ── DELETE /api/admin/issues/:id ─────────────────────────────────────────────
const removeIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    if (issue.assignedDepartment !== req.user.departmentName)
      return res.status(403).json({ message: 'Not your department' });
    await issue.deleteOne();
    res.json({ message: 'Issue removed' });
  } catch (err) { next(err); }
};

module.exports = { getDepartmentIssues, updateIssue, removeIssue };