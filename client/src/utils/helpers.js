export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const timeAgo = (dateStr) => {
  const now = new Date();
  const past = new Date(dateStr);
  const diff = Math.floor((now - past) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export const getCategoryLabel = (category) => {
  const map = {
    pothole: 'Pothole',
    garbage: 'Garbage',
    streetlight: 'Streetlight',
    waterlogging: 'Waterlogging',
    fallen_tree: 'Fallen Tree',
    stray_animals: 'Stray Animals',
    other: 'Other',
  };
  return map[category] || 'Other';
};

export const getCategoryColor = (category) => {
  const map = {
    pothole: 'bg-red-100 text-red-700',
    garbage: 'bg-green-100 text-green-700',
    streetlight: 'bg-yellow-100 text-yellow-700',
    waterlogging: 'bg-blue-100 text-blue-700',
    fallen_tree: 'bg-emerald-100 text-emerald-700',
    stray_animals: 'bg-orange-100 text-orange-700',
    other: 'bg-gray-100 text-gray-600',
  };
  return map[category] || 'bg-gray-100 text-gray-600';
};

export const getStatusColor = (status) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-700',
    assigned: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-purple-100 text-purple-700',
    resolved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-gray-100 text-gray-600';
};

export const getStatusLabel = (status) => {
  const map = {
    pending: 'Pending',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected',
  };
  return map[status] || status;
};

export const calcDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
};