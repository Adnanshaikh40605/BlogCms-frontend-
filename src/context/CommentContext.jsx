import { createContext, useContext, useState, useCallback } from 'react';
import { commentAPI } from '../api/apiService';

// Create context
const CommentContext = createContext();

// Custom hook to use the comment context
export const useComments = () => {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error('useComments must be used within a CommentProvider');
  }
  return context;
};

// Provider component
export const CommentProvider = ({ children }) => {
  const [comments, setComments] = useState([]);
  const [pendingComments, setPendingComments] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination state for comments
  const [commentPagination, setCommentPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    hasMore: false
  });
  
  // Pagination state for pending comments
  const [pendingPagination, setPendingPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    hasMore: false
  });
  
  // Fetch pending comments count
  const fetchPendingCount = useCallback(async () => {
    try {
      const data = await commentAPI.getPendingCount();
      setPendingCount(data.count);
      return data.count;
    } catch (err) {
      console.error('Error fetching pending comments count:', err);
      return 0;
    }
  }, []);

  // Fetch all comments for a post
  const fetchComments = useCallback(async (postId, page = 1, pageSize = 10, append = false) => {
    try {
      if (!postId) return { approved: [], pending: [] };
      
      setLoading(true);
      setError(null);
      
      // Use the new getAllForPost API method
      const data = await commentAPI.getAllForPost(postId);
      console.log('Fetched comments data:', data);
      
      // The API returns structured data with approved and pending arrays
      const approvedComments = Array.isArray(data?.approved) ? data.approved : [];
      const pendingCommentsList = Array.isArray(data?.pending) ? data.pending : [];
      
      // Set approved comments
      if (append && page > 1) {
        setComments(prev => [...prev, ...approvedComments]);
      } else {
        setComments(approvedComments);
      }
      
      // Set pending comments
      setPendingComments(pendingCommentsList);
      
      // Update pagination info
      setCommentPagination({
        count: approvedComments.length,
        next: null, // We're loading all at once with the new API
        previous: null,
        hasMore: false
      });
      
      setPendingPagination({
        count: pendingCommentsList.length,
        next: null,
        previous: null,
        hasMore: false
      });
      
      // Update pending count
      setPendingCount(pendingCommentsList.length);
      
      return { 
        approved: approvedComments, 
        pending: pendingCommentsList,
        total: data?.total || (approvedComments.length + pendingCommentsList.length)
      };
    } catch (err) {
      setError('Failed to fetch comments');
      console.error(`Error fetching comments for post ${postId}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Load more comments (for infinite scroll)
  const loadMoreComments = useCallback(async (postId) => {
    if (commentPagination.hasMore && !loading) {
      const page = Math.floor(comments.length / 10) + 1;
      return fetchComments(postId, page, 10, true);
    }
    return { approved: [], pending: [] };
  }, [commentPagination.hasMore, comments.length, loading, fetchComments]);

  // Fetch all pending comments (across all posts)
  const fetchPendingComments = useCallback(async (page = 1, pageSize = 10, append = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the new commentAPI service to get all comments and filter for pending
      const data = await commentAPI.getAll();
      const pendingData = Array.isArray(data) ? data.filter(c => !c.approved) : [];
      
      if (append && page > 1) {
        setPendingComments(prev => [...prev, ...pendingData]);
      } else {
        setPendingComments(pendingData);
      }
      
      // Update pagination for pending comments
      setPendingPagination({
        count: pendingData.length,
        next: null,
        previous: null,
        hasMore: false
      });
      
      // Update pending count
      setPendingCount(pendingData.length);
      
      return pendingData;
    } catch (err) {
      setError('Failed to fetch pending comments');
      console.error('Error fetching pending comments:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Load more pending comments (for infinite scroll)
  const loadMorePendingComments = useCallback(async () => {
    if (pendingPagination.hasMore && !loading) {
      const page = Math.floor(pendingComments.length / 10) + 1;
      return fetchPendingComments(page, 10, true);
    }
    return [];
  }, [pendingPagination.hasMore, pendingComments.length, loading, fetchPendingComments]);

  // Create a new comment
  const createComment = async (commentData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the new commentAPI service
      const newComment = await commentAPI.create(commentData);
      
      // Since new comments are pending by default, add to pending list
      setPendingComments([...pendingComments, newComment]);
      
      // Update pending count
      setPendingCount(prevCount => prevCount + 1);
      
      return newComment;
    } catch (err) {
      setError('Failed to submit comment');
      console.error('Error creating comment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Approve a comment
  const approveComment = async (commentId) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the new commentAPI service
      await commentAPI.approve(commentId);
      
      // Find the comment in pending comments
      const approvedComment = pendingComments.find(c => c.id === commentId);
      
      if (approvedComment) {
        // Remove from pending and add to approved
        setPendingComments(pendingComments.filter(c => c.id !== commentId));
        
        // Mark as approved and add to approved comments
        const updatedComment = { ...approvedComment, approved: true };
        setComments([...comments, updatedComment]);
        
        // Update pending count
        setPendingCount(prevCount => Math.max(0, prevCount - 1));
      }
      
      return true;
    } catch (err) {
      setError('Failed to approve comment');
      console.error(`Error approving comment with id ${commentId}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reject/delete a comment
  const rejectComment = async (commentId) => {
    try {
      setLoading(true);
      setError(null);
      
      await commentAPI.reject(commentId);
      
      // Remove from both pending and approved lists
      setPendingComments(pendingComments.filter(c => c.id !== commentId));
      setComments(comments.filter(c => c.id !== commentId));
      
      // Update pending count if it was pending
      if (pendingComments.some(c => c.id === commentId)) {
        setPendingCount(prevCount => Math.max(0, prevCount - 1));
      }
      
      return true;
    } catch (err) {
      setError('Failed to reject comment');
      console.error(`Error rejecting comment with id ${commentId}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Bulk approve comments
  const bulkApproveComments = async (commentIds) => {
    try {
      setLoading(true);
      setError(null);
      
      await commentAPI.bulkApprove(commentIds);
      
      // Move approved comments from pending to approved list
      const approvedComments = pendingComments.filter(c => commentIds.includes(c.id));
      
      // Remove from pending list
      setPendingComments(pendingComments.filter(c => !commentIds.includes(c.id)));
      
      // Add to approved list
      const updatedApprovedComments = approvedComments.map(c => ({ ...c, approved: true }));
      setComments([...comments, ...updatedApprovedComments]);
      
      // Update pending count
      setPendingCount(prevCount => Math.max(0, prevCount - commentIds.length));
      
      return true;
    } catch (err) {
      setError('Failed to approve comments');
      console.error('Error bulk approving comments:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Bulk reject comments
  const bulkRejectComments = async (commentIds) => {
    try {
      setLoading(true);
      setError(null);
      
      await commentAPI.bulkReject(commentIds);
      
      // Remove from both pending and approved lists
      setPendingComments(pendingComments.filter(c => !commentIds.includes(c.id)));
      setComments(comments.filter(c => !commentIds.includes(c.id)));
      
      // Count how many were pending
      const pendingCount = pendingComments.filter(c => commentIds.includes(c.id)).length;
      
      // Update pending count
      setPendingCount(prevCount => Math.max(0, prevCount - pendingCount));
      
      return true;
    } catch (err) {
      setError('Failed to reject comments');
      console.error('Error bulk rejecting comments:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    comments,
    pendingComments,
    pendingCount,
    loading,
    error,
    commentPagination,
    pendingPagination,
    fetchPendingCount,
    fetchComments,
    loadMoreComments,
    fetchPendingComments,
    loadMorePendingComments,
    createComment,
    approveComment,
    rejectComment,
    bulkApproveComments,
    bulkRejectComments
  };

  return (
    <CommentContext.Provider value={value}>
      {children}
    </CommentContext.Provider>
  );
};

export default CommentContext; 