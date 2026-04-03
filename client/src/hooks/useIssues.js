import { useState, useEffect } from 'react';

const MOCK_ISSUES = [
  { _id: '1', title: 'Large pothole on MG Road', description: 'Deep pothole causing accidents near the signal', category: 'pothole', status: 'open', upvotes: 34, downvotes: 2, ward: 'Ward 42', city: 'Bengaluru', lat: 12.9716, lng: 77.5946, createdAt: new Date(Date.now() - 86400000).toISOString(), reportedBy: { name: 'Arjun S' }, media: [] },
  { _id: '2', title: 'Broken streetlight near park', description: 'Street has been dark for 2 weeks, very unsafe at night', category: 'streetlight', status: 'in-progress', upvotes: 21, downvotes: 1, ward: 'Ward 10', city: 'Bengaluru', lat: 12.9352, lng: 77.6245, createdAt: new Date(Date.now() - 172800000).toISOString(), reportedBy: { name: 'Priya N' }, media: [] },
  { _id: '3', title: 'Garbage pile near bus stop', description: 'Uncollected garbage for over a week, terrible smell', category: 'garbage', status: 'open', upvotes: 58, downvotes: 3, ward: 'Ward 42', city: 'Bengaluru', lat: 12.9816, lng: 77.6041, createdAt: new Date(Date.now() - 259200000).toISOString(), reportedBy: { name: 'Rahul M' }, media: [] },
  { _id: '4', title: 'Waterlogging after rain', description: 'Road completely flooded, vehicles getting stuck', category: 'waterlogging', status: 'resolved', upvotes: 44, downvotes: 0, ward: 'Ward 15', city: 'Bengaluru', lat: 12.9616, lng: 77.5846, createdAt: new Date(Date.now() - 345600000).toISOString(), reportedBy: { name: 'Sneha K' }, media: [] },
  { _id: '5', title: 'Fallen tree blocking road', description: 'Tree fell during storm, one lane completely blocked', category: 'fallen_tree', status: 'in-progress', upvotes: 19, downvotes: 1, ward: 'Ward 10', city: 'Bengaluru', lat: 12.9516, lng: 77.6146, createdAt: new Date(Date.now() - 432000000).toISOString(), reportedBy: { name: 'Kiran P' }, media: [] },
  { _id: '6', title: 'Stray dogs near school', description: 'Pack of aggressive stray dogs near the school gate', category: 'stray_animals', status: 'open', upvotes: 27, downvotes: 5, ward: 'Ward 42', city: 'Bengaluru', lat: 12.9416, lng: 77.5746, createdAt: new Date(Date.now() - 518400000).toISOString(), reportedBy: { name: 'Meera R' }, media: [] },
];

const useIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    sortBy: 'upvotes',
    ward: '',
  });

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let filtered = [...MOCK_ISSUES];
      if (filters.search)
        filtered = filtered.filter(i =>
          i.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          i.description.toLowerCase().includes(filters.search.toLowerCase())
        );
      if (filters.category)
        filtered = filtered.filter(i => i.category === filters.category);
      if (filters.status)
        filtered = filtered.filter(i => i.status === filters.status);
      if (filters.ward)
        filtered = filtered.filter(i => i.ward === filters.ward);
      if (filters.sortBy === 'upvotes')
        filtered.sort((a, b) => b.upvotes - a.upvotes);
      else if (filters.sortBy === 'newest')
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setIssues(filtered);
      setLoading(false);
    }, 800);
  }, [filters]);

  const updateFilters = (newFilters) => setFilters(prev => ({ ...prev, ...newFilters }));
  const resetFilters = () => setFilters({ search: '', category: '', status: '', sortBy: 'upvotes', ward: '' });

  const handleVote = (issueId, type) => {
    setIssues(prev =>
      prev.map(issue =>
        issue._id === issueId
          ? { ...issue, upvotes: type === 'up' ? issue.upvotes + 1 : issue.upvotes, downvotes: type === 'down' ? issue.downvotes + 1 : issue.downvotes }
          : issue
      )
    );
  };

  return { issues, loading, error, filters, updateFilters, resetFilters, handleVote };
};

export default useIssues;