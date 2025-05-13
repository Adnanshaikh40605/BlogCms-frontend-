import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { postAPI, mediaAPI } from '../api/apiService';

// Create context
const BlogContext = createContext();

// Custom hook to use the blog context
export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};

// Provider component
export const BlogProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    totalPages: 1,
    hasMore: false
  });
  
  // Post analytics state
  const [postViews, setPostViews] = useState({});
  
  // Record post view - define this BEFORE fetchPost to fix circular dependency
  const incrementPostView = useCallback((postId) => {
    const storedViews = localStorage.getItem('postViews');
    let viewData = storedViews ? JSON.parse(storedViews) : {};
    
    // Check if the post has been viewed in the current session
    if (!viewData[postId]) {
      // Record the view
      viewData[postId] = true;
      localStorage.setItem('postViews', JSON.stringify(viewData));
      
      // Update state
      setPostViews(prevViews => ({
        ...prevViews, 
        [postId]: (prevViews[postId] || 0) + 1
      }));
      
      // In a real app, you'd send this to the server
      // api.post(`/posts/${postId}/view/`);
    }
  }, []);
  
  // Fetch all posts with pagination
  const fetchPosts = useCallback(async (filter = 'published', page = 1, pageSize = 10, append = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the new postAPI service
      let data;
      try {
        data = await postAPI.getAll();
        console.log('API response data:', data);
      } catch (apiError) {
        console.error('API Error fetching posts:', apiError);
        setError('Failed to fetch posts. Please try again later.');
        setPosts([]);
        return [];
      }
      
      // Ensure we have a valid results array
      const validResults = Array.isArray(data?.results) ? data.results : 
                          (Array.isArray(data) ? data : []);
      
      if (append && page > 1) {
        // Append new posts for infinite scroll - ensure we don't duplicate
        setPosts(prevPosts => {
          const existingIds = new Set(prevPosts.map(p => p.id));
          const newPosts = validResults.filter(p => !existingIds.has(p.id));
          return [...prevPosts, ...newPosts];
        });
      } else {
        // Replace posts for initial load or filter change
        setPosts(validResults);
      }
      
      // Update pagination info (if applicable)
      setPagination({
        count: data?.count || validResults.length || 0,
        next: data?.next || null,
        previous: data?.previous || null,
        currentPage: page,
        totalPages: data?.count ? Math.ceil(data.count / pageSize) : 1,
        hasMore: !!data?.next
      });
      
      return validResults;
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to fetch posts. Please try again later.');
      setPosts([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Load more posts (for infinite scroll)
  const loadMorePosts = useCallback(async (filter = 'published') => {
    if (pagination.hasMore && !loading) {
      return fetchPosts(filter, pagination.currentPage + 1, 10, true);
    }
    return [];
  }, [fetchPosts, pagination.hasMore, pagination.currentPage, loading]);

  // Fetch a single post
  const fetchPost = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      try {
        // Use the new postAPI service
        data = await postAPI.getById(id);
        
        if (!data || !data.id) {
          throw new Error('Invalid post data received');
        }
      } catch (apiError) {
        console.error(`Error fetching post with id ${id} from API:`, apiError);
        setError('Failed to fetch post. It may have been removed or is unavailable.');
        setCurrentPost(null);
        throw apiError;
      }
      
      // Only update state and track views if API call was successful
      setCurrentPost(data);
      
      // Record a view for this post
      incrementPostView(id);
      
      return data;
    } catch (err) {
      console.error(`Error in fetchPost for post with id ${id}:`, err);
      setError('Failed to fetch post. It may have been removed or is unavailable.');
      setCurrentPost(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [incrementPostView]);
  
  // Create a new post
  const createPost = async (postData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the new postAPI service
      const newPost = await postAPI.create(postData);
      
      // Update the posts list
      setPosts(prevPosts => [newPost, ...prevPosts]);
      
      return newPost;
    } catch (err) {
      setError('Failed to create post');
      console.error('Error creating post:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Update an existing post
  const updatePost = async (id, postData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the new postAPI service
      const updatedPost = await postAPI.update(id, postData);
      
      // Update the posts list and current post
      setPosts(prevPosts => prevPosts.map(post => 
        post.id === id ? updatedPost : post
      ));
      
      if (currentPost && currentPost.id === id) {
        setCurrentPost(updatedPost);
      }
      
      return updatedPost;
    } catch (err) {
      setError('Failed to update post');
      console.error(`Error updating post with id ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Delete a post
  const deletePost = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the new postAPI service
      await postAPI.delete(id);
      
      // Remove from posts list
      setPosts(prevPosts => prevPosts.filter(post => post.id !== id));
      
      // Clear current post if deleted
      if (currentPost && currentPost.id === id) {
        setCurrentPost(null);
      }
      
      return true;
    } catch (err) {
      setError('Failed to delete post');
      console.error(`Error deleting post with id ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Toggle publish status
  const togglePublishStatus = async (id) => {
    try {
      if (!currentPost || currentPost.id !== id) {
        // Get the post directly from the API instead of using fetchPost
        const postData = await postAPI.getById(id);
        setCurrentPost(postData);
      }
      
      const newStatus = !currentPost.published;
      return await updatePost(id, { published: newStatus });
    } catch (err) {
      setError('Failed to toggle publish status');
      console.error(`Error toggling publish status for post ${id}:`, err);
      throw err;
    }
  };
  
  // Preview post
  const previewPost = async (postData) => {
    try {
      setLoading(true);
      setError(null);
      
      const previewData = await postAPI.previewPost(postData);
      return previewData;
    } catch (err) {
      setError('Failed to preview post');
      console.error('Error previewing post:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Check broken links in post content
  const checkBrokenLinks = async (content) => {
    try {
      const results = await postAPI.checkBrokenLinks(content);
      return results;
    } catch (err) {
      console.error('Error checking links:', err);
      throw err;
    }
  };

  // Add a method to get full image URL
  const getImageUrl = (imagePath) => {
    return mediaAPI.getImageUrl(imagePath);
  };
  
  const contextValue = {
    posts,
    currentPost,
    loading,
    error,
    pagination,
    postViews,
    fetchPosts,
    fetchPost,
    loadMorePosts,
    createPost,
    updatePost,
    deletePost,
    togglePublishStatus,
    previewPost,
    checkBrokenLinks,
    getImageUrl
  };

  return (
    <BlogContext.Provider value={contextValue}>
      {children}
    </BlogContext.Provider>
  );
};

export default BlogContext; 