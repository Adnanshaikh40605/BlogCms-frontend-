import { useState, useEffect, useCallback, useRef } from 'react';
import { commentAPI } from '../api/apiService';

/**
 * Custom hook for managing comments for a specific blog post
 * @param {string|number} postId - The ID of the post to fetch comments for
 * @param {boolean} autoFetch - Whether to automatically fetch comments on mount
 * @returns {Object} Comment state and functions
 */
export const usePostComments = (postId, autoFetch = true) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const alreadyFetched = useRef(false);

  /**
   * Fetch approved comments for the post
   */
  const fetchComments = useCallback(async (pageNumber = 1, append = false) => {
    if (!postId) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching approved comments for post ${postId} (page ${pageNumber})`);
      
      // Only fetch approved comments for public display using the getApproved helper
      // This ensures that rejected comments are not included
      const response = await commentAPI.getApproved(postId);
      
      console.log('Approved comments API response:', response);
      
      // Extract the results array, with fallback to empty array
      const results = response.results || [];
      
      // For first page, replace comments; for subsequent pages, append
      if (append) {
        setComments(prev => [...prev, ...results]);
      } else {
        setComments(results);
      }
      
      // Check if there are more comments to load
      setHasMore(!!response.next);
      
      // Update current page number
      setPage(pageNumber);
      
      return results;
    } catch (err) {
      console.error(`Error fetching approved comments for post ${postId}:`, err);
      setError('Failed to load comments. Please try again.');
      return [];
    } finally {
      setLoading(false);
    }
  }, [postId]);

  /**
   * Load more comments (next page)
   */
  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      await fetchComments(nextPage, true);
    }
  }, [fetchComments, loading, hasMore, page]);

  /**
   * Submit a new comment or reply
   */
  const submitComment = useCallback(async (commentData) => {
    if (!postId) {
      throw new Error('Post ID is required to submit a comment');
    }

    try {
      setSubmittingComment(true);
      setError(null);
      
      // Ensure the post ID is included as a string or number, not as an object
      const fullCommentData = {
        ...commentData,
        post: String(postId) // Convert to string to ensure it's not an object
      };
      
      console.log('Submitting comment:', fullCommentData);
      
      // Submit the comment
      const result = await commentAPI.create(fullCommentData);
      
      console.log('Comment submitted successfully:', result);
      
      // If it's a new top-level comment that's pre-approved, add it to the list
      if (result.approved) {
        setComments(currentComments => [result, ...currentComments]);
      }
      
      // Mark as submitted
      setCommentSubmitted(true);
      
      return result;
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to submit comment. Please try again.');
      throw err;
    } finally {
      setSubmittingComment(false);
    }
  }, [postId]);

  // Auto-fetch comments when postId changes
  useEffect(() => {
    if (autoFetch && postId && !alreadyFetched.current) {
      fetchComments(1, false);
      alreadyFetched.current = true;
    }
  }, [autoFetch, fetchComments, postId]);

  return {
    comments,
    loading,
    error,
    hasMore,
    commentSubmitted,
    submittingComment,
    fetchComments,
    loadMore,
    submitComment,
    setCommentSubmitted,
  };
};

export default usePostComments; 