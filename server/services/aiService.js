const Issue = require('../models/issueModel');

const DISTANCE_THRESHOLD_KM = 0.2; // 200 metres
const TIME_THRESHOLD_MS     = 24 * 60 * 60 * 1000; // 24 hours

// Haversine distance between two lat/lng points in km
const haversine = (lat1, lng1, lat2, lng2) => {
  const R  = 6371;
  const dL = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lng2 - lng1) * Math.PI) / 180;
  const a  =
    Math.sin(dL / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dl / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Check if a new issue is a duplicate of an existing one.
 * Returns { isDuplicate, duplicateOf } 
 */
const checkDuplicate = async ({ lat, lng, category }) => {
  const since = new Date(Date.now() - TIME_THRESHOLD_MS);
  const candidates = await Issue.find({
    category,
    createdAt: { $gte: since },
    isDuplicate: false,
  }).lean();

  for (const c of candidates) {
    const dist = haversine(lat, lng, c.location.lat, c.location.lng);
    if (dist <= DISTANCE_THRESHOLD_KM) {
      return { isDuplicate: true, duplicateOf: c._id };
    }
  }
  return { isDuplicate: false, duplicateOf: null };
};

/**
 * Simple spam detection — same user posting same category 
 * more than 3 times in 1 hour.
 */
const isSpam = async (userId, category) => {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const count = await Issue.countDocuments({
    reportedBy: userId,
    category,
    createdAt: { $gte: since },
  });
  return count >= 3;
};

/**
 * Suggest which department should handle an issue based on category.
 */
const suggestDepartment = (category) => {
  const MAP = {
    Pothole:     'BBMP Roads',
    Streetlight: 'BESCOM',
    Garbage:     'BBMP Sanitation',
    Water:       'BWSSB',
    Drainage:    'BBMP Drainage',
    Other:       'BBMP General',
  };
  return MAP[category] || 'BBMP General';
};

module.exports = { checkDuplicate, isSpam, suggestDepartment };