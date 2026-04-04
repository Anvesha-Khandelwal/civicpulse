import { useState, useEffect } from 'react';

const MOCK_ISSUES = [
  { _id: '1', title: 'Large pothole on MG Road', description: 'Deep pothole causing accidents near the signal', category: 'pothole', status: 'open', upvotes: 34, downvotes: 2, ward: 'Ward 42', city: 'Bengaluru', location: { lat: 12.9716, lng: 77.5946, address: 'MG Road, Bengaluru' }, createdAt: new Date(Date.now() - 86400000).toISOString(), reportedBy: { name: 'Arjun S' }, mediaUrls: [], isDuplicate: false },
  { _id: '2', title: 'Broken streetlight near park', description: 'Street has been dark for 2 weeks, very unsafe at night', category: 'streetlight', status: 'in-progress', upvotes: 21, downvotes: 1, ward: 'Ward 10', city: 'Bengaluru', location: { lat: 12.9352, lng: 77.6245, address: 'Cubbon Park Road, Bengaluru' }, createdAt: new Date(Date.now() - 172800000).toISOString(), reportedBy: { name: 'Priya N' }, mediaUrls: [], isDuplicate: false },
  { _id: '3', title: 'Garbage pile near bus stop', description: 'Uncollected garbage for over a week, terrible smell', category: 'garbage', status: 'open', upvotes: 58, downvotes: 3, ward: 'Ward 42', city: 'Bengaluru', location: { lat: 12.9816, lng: 77.6041, address: 'Shivaji Nagar Bus Stop' }, createdAt: new Date(Date.now() - 259200000).toISOString(), reportedBy: { name: 'Rahul M' }, mediaUrls: [], isDuplicate: true },
  { _id: '4', title: 'Waterlogging after rain', description: 'Road completely flooded, vehicles getting stuck', category: 'waterlogging', status: 'resolved', upvotes: 44, downvotes: 0, ward: 'Ward 15', city: 'Bengaluru', location: { lat: 12.9616, lng: 77.5846, address: 'Jayanagar 4th Block' }, createdAt: new Date(Date.now() - 345600000).toISOString(), reportedBy: { name: 'Sneha K' }, mediaUrls: [], isDuplicate: false },
  { _id: '5', title: 'Fallen tree blocking road', description: 'Tree fell during storm, one lane completely blocked', category: 'fallen_tree', status: 'in-progress', upvotes: 19, downvotes: 1, ward: 'Ward 10', city: 'Bengaluru', location: { lat: 12.9516, lng: 77.6146, address: 'Indiranagar 100ft Road' }, createdAt: new Date(Date.now() - 432000000).toISOString(), reportedBy: { name: 'Kiran P' }, mediaUrls: [], isDuplicate: false },
  { _id: '6', title: 'Stray dogs near school', description: 'Pack of aggressive stray dogs near the school gate', category: 'stray_animals', status: 'open', upvotes: 27, downvotes: 5, ward: 'Ward 42', city: 'Bengaluru', location: { lat: 12.9416, lng: 77.5746, address: 'Koramangala 5th Block' }, createdAt: new Date(Date.now() - 518400000).toISOString(), reportedBy: { name: 'Meera R' }, mediaUrls: [], isDuplicate: true },
  { _id: '7', title: 'Open manhole on main road', description: 'Dangerous open manhole, no barricade placed', category: 'other', status: 'open', upvotes: 61, downvotes: 2, ward: 'Ward 42', city: 'Bengaluru', location: { lat: 12.9720, lng: 77.5900, address: 'Brigade Road, Bengaluru' }, createdAt: new Date(Date.now() - 600000000).toISOString(), reportedBy: { name: 'Ravi T' }, mediaUrls: [], isDuplicate: false },
  { _id: '8', title: 'Broken footpath tiles', description: 'Footpath tiles broken and uneven causing trip hazard', category: 'pothole', status: 'open', upvotes: 15, downvotes: 0, ward: 'Ward 15', city: 'Bengaluru', location: { lat: 12.9550, lng: 77.5800, address: 'Basavanagudi, Bengaluru' }, createdAt: new Date(Date.now() - 650000000).toISOString(), reportedBy: { name: 'Ananya G' }, mediaUrls: [], isDuplicate: false },
  { _id: '9', title: 'Overflowing drainage canal', description: 'Canal overflowing into road after heavy rains', category: 'waterlogging', status: 'in-progress', upvotes: 38, downvotes: 4, ward: 'Ward 10', city: 'Bengaluru', location: { lat: 12.9400, lng: 77.6200, address: 'HSR Layout, Bengaluru' }, createdAt: new Date(Date.now() - 700000000).toISOString(), reportedBy: { name: 'Suresh B' }, mediaUrls: [], isDuplicate: false },
];

const PAGE_SIZE = 6;

const useIssues = () => {
  const [allIssues, setAllIssues] = useState([]);
  const [issues, setIssues]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters]     = useState({
    search: '',
    category: '',
    status: '',
    sortBy: 'upvotes',
    ward: '',
  });

  // Filter + sort whenever filters change — reset to page 1
  useEffect(() => {
    setLoading(true);
    setPage(1);
    setTimeout(() => {
      let filtered = [...MOCK_ISSUES];
      if (filters.search)
        filtered = filtered.filter(i =>
          i.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          i.description.toLowerCase().includes(filters.search.toLowerCase())
        );
      if (filters.category && filters.category !== 'all')
        filtered = filtered.filter(i => i.category === filters.category);
      if (filters.status && filters.status !== 'all')
        filtered = filtered.filter(i => i.status === filters.status);
      if (filters.ward)
        filtered = filtered.filter(i => i.ward === filters.ward);
      if (filters.sortBy === 'upvotes')
        filtered.sort((a, b) => b.upvotes - a.upvotes);
      else if (filters.sortBy === 'newest')
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setAllIssues(filtered);
      setTotalPages(Math.ceil(filtered.length / PAGE_SIZE));
      setIssues(filtered.slice(0, PAGE_SIZE));
      setLoading(false);
    }, 600);
  }, [filters]);

  // Page changes slice from allIssues
  useEffect(() => {
    const start = (page - 1) * PAGE_SIZE;
    setIssues(allIssues.slice(start, start + PAGE_SIZE));
  }, [page, allIssues]);

  const updateFilters = (newFilters) => setFilters(prev => ({ ...prev, ...newFilters }));
  const resetFilters  = () => setFilters({ search: '', category: '', status: '', sortBy: 'upvotes', ward: '' });

  const handleVote = (issueId, type) => {
    const updater = prev => prev.map(issue =>
      issue._id === issueId
        ? { ...issue,
            upvotes:   type === 'up'   ? issue.upvotes   + 1 : issue.upvotes,
            downvotes: type === 'down' ? issue.downvotes + 1 : issue.downvotes }
        : issue
    );
    setAllIssues(updater);
    setIssues(updater);
  };

  return {
    issues, loading, error,
    filters, updateFilters, resetFilters,
    handleVote,
    page, setPage, totalPages,
    totalCount: allIssues.length,
  };
};

export default useIssues;