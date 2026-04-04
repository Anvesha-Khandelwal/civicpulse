const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category:    {
    type: String,
    enum: ['Pothole','Streetlight','Garbage','Water','Drainage','Other'],
    required: true,
  },
  status: {
    type: String,
    enum: ['open','in-progress','resolved'],
    default: 'open',
  },
  location: {
    lat:     { type: Number, required: true },
    lng:     { type: Number, required: true },
    address: { type: String },
  },
  mediaUrls:          [{ type: String }],
  reportedBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedDepartment: { type: String },
  adminNote:          { type: String },
  upvotes:            [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes:          [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  flagged:            { type: Boolean, default: false },
  isDuplicate:        { type: Boolean, default: false },
  duplicateOf:        { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
}, { timestamps: true });

// Auto-flag when downvotes exceed 10
issueSchema.post('save', async function () {
  if (this.downvotes.length >= 10 && !this.flagged) {
    await this.constructor.findByIdAndUpdate(this._id, { flagged: true });
  }
});

module.exports = mongoose.model('Issue', issueSchema);