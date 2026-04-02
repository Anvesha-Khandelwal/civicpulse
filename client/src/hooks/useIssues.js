// hooks/useIssues.js
import { useState, useEffect, useCallback } from 'react';
import { fetchIssues, voteOnIssue } from '../services/api';

const DEFAULT_FILTERS = {
  category: 'all',
  status: 'all',
  sortBy: 'newest',      // 'newest' | 'upvotes' | 'nearby'
  locality: '',          // address string for geo filter
  radius: 5,             // km
};

const useIssues = (externalFilters = {}) => {
  const [issues, setIssues]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [filters, setFilters]   = useState({ ...DEFAULT_FILTERS, ...externalFilters });
  const [userLocation, setUserLocation] = useState(null);

  // Get user's browser location once
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation(null)
      );
    }
  }, []);

  // Fetch whenever filters change
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          category: filters.category !== 'all' ? filters.category : undefined,
          status:   filters.status   !== 'all' ? filters.status   : undefined,
          sortBy:   filters.sortBy,
          locality: filters.locality || undefined,
          radius:   filters.radius,
          lat:      userLocation?.lat,
          lng:      userLocation?.lng,
        };
        const data = await fetchIssues(params, controller.signal);
        setIssues(data);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [filters, userLocation]);

  // Optimistic vote update
  const handleVote = useCallback(async (issueId, type, userId) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue._id !== issueId) return issue;
        const upvotes   = [...issue.upvotes];
        const downvotes = [...issue.downvotes];
        const inUp   = upvotes.includes(userId);
        const inDown = downvotes.includes(userId);

        if (type === 'up') {
          if (inUp) {
            upvotes.splice(upvotes.indexOf(userId), 1);      // toggle off
          } else {
            upvotes.push(userId);
            if (inDown) downvotes.splice(downvotes.indexOf(userId), 1);
          }
        } else {
          if (inDown) {
            downvotes.splice(downvotes.indexOf(userId), 1);  // toggle off
          } else {
            downvotes.push(userId);
            if (inUp) upvotes.splice(upvotes.indexOf(userId), 1);
          }
        }
        return { ...issue, upvotes, downvotes };
      })
    );

    try {
      await voteOnIssue(issueId, type);
    } catch {
      // revert on failure — re-fetch
      const data = await fetchIssues({});
      setIssues(data);
    }
  }, []);

  const updateFilters = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return {
    issues,
    loading,
    error,
    filters,
    userLocation,
    updateFilters,
    resetFilters,
    handleVote,
  };
};

export default useIssues;