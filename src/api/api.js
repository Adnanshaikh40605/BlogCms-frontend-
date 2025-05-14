import axios from 'axios';
import { COMMENT_ENDPOINTS } from './apiEndpoints';

// Use the full URL from the environment variable, without any relative path logic
const API_URL = import.meta.env.VITE_API_BASE_URL;

console.log('Using API URL:', API_URL); // Log the actual URL being used

// Create axios instance with timeout and cache headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'max-age=300', // Cache responses for 5 minutes
    'Access-Control-Allow-Origin': '*', // Request CORS headers
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
  },
  timeout: 10000, // 10 second timeout to prevent hanging requests
  withCredentials: false, // Make sure we don't send credentials
});

// Add a response interceptor to handle timeouts gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out:', error);
      return Promise.reject(new Error('Request timed out. Please try again.'));
    }
    return Promise.reject(error);
  }
);

// Keeps pending requests to avoid duplicates during navigation
const pendingRequests = new Map();

// API service for blog posts
export const blogPostService = {
  // Get all blog posts with pagination support
  getAllPosts: async (params = { published: true, page: 1, page_size: 10 }) => {
    // Create a request key based on the parameters
    const requestKey = JSON.stringify(params);
    
    // If we already have a pending request for these params, use that
    if (pendingRequests.has(requestKey)) {
      return pendingRequests.get(requestKey);
    }
    
    // Start a new request
    const request = new Promise(async (resolve, reject) => {
      try {
        // Add a timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await api.get('/api/posts/', { 
          params,
          headers: {
            'Cache-Control': 'max-age=300',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('API Response:', response.data); // Log the response to see its structure
        
        // Ensure we have a valid response
        const responseData = response.data || {};
        
        // Handle different API response structures
        const results = Array.isArray(responseData.results) 
          ? responseData.results 
          : (Array.isArray(responseData) 
              ? responseData 
              : []);
        
        const result = {
          results: results,
          count: responseData.count || results.length || 0,
          next: responseData.next || null,
          previous: responseData.previous || null,
          current_page: params.page || 1,
          total_pages: responseData.count ? Math.ceil(responseData.count / params.page_size) : 1,
        };
        
        resolve(result);
      } catch (error) {
        console.error('Error fetching posts:', error);
        
        // Provide fallback data on error
        resolve({
          results: [],
          count: 0,
          next: null,
          previous: null,
          current_page: params.page || 1,
          total_pages: 1,
          error: error.message || 'Failed to fetch posts'
        });
      } finally {
        // Remove this request from pending
        pendingRequests.delete(requestKey);
      }
    });
    
    // Store this promise so we can reuse it for identical requests
    pendingRequests.set(requestKey, request);
    
    return request;
  },

  // Get a single blog post by id with caching
  getPost: async (id) => {
    const requestKey = `post_${id}`;
    
    if (pendingRequests.has(requestKey)) {
      return pendingRequests.get(requestKey);
    }
    
    const request = new Promise(async (resolve, reject) => {
      try {
        // Add a timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await api.get(`/api/posts/${id}/`, {
          headers: {
            'Cache-Control': 'max-age=300',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        resolve(response.data);
      } catch (error) {
        console.error(`Error fetching post with id ${id}:`, error);
        // Instead of rejecting, resolve with a fallback empty post structure
        resolve({
          id: id,
          title: "Unable to load post",
          content: "There was an error loading this post. Please try again later.",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          error: error.message || `Failed to fetch post with ID ${id}`,
          _error_occurred: true // Special flag to detect error state
        });
      } finally {
        pendingRequests.delete(requestKey);
      }
    });
    
    pendingRequests.set(requestKey, request);
    
    return request;
  },

  // Create a new blog post with image uploads
  createPost: async (postData) => {
    try {
      const formData = new FormData();
      formData.append('title', postData.title);
      formData.append('content', postData.content);
      formData.append('published', postData.published.toString());
      
      if (postData.slug) {
        formData.append('slug', postData.slug);
      }
      
      if (postData.featured_image) {
        formData.append('featured_image', postData.featured_image);
      }
      
      if (postData.additional_images && postData.additional_images.length > 0) {
        postData.additional_images.forEach((image) => {
          formData.append('additional_images', image);
        });
      }
      
      const response = await api.post('/api/posts/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  // Update an existing blog post
  updatePost: async (id, postData) => {
    try {
      const formData = new FormData();
      
      if (postData.title) formData.append('title', postData.title);
      if (postData.content) formData.append('content', postData.content);
      if (postData.published !== undefined) formData.append('published', postData.published.toString());
      if (postData.slug) formData.append('slug', postData.slug);
      
      if (postData.featured_image) {
        formData.append('featured_image', postData.featured_image);
      }
      
      if (postData.additional_images && postData.additional_images.length > 0) {
        postData.additional_images.forEach((image) => {
          formData.append('additional_images', image);
        });
      }
      
      const response = await api.patch(`/api/posts/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error updating post with id ${id}:`, error);
      throw error;
    }
  },

  // Delete a blog post
  deletePost: async (id) => {
    try {
      const response = await api.delete(`/api/posts/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting post with id ${id}:`, error);
      throw error;
    }
  },

  // Upload additional images to an existing post
  uploadImages: async (postId, images) => {
    try {
      const formData = new FormData();
      
      images.forEach((image) => {
        formData.append('images', image);
      });
      
      const response = await api.post(`/api/posts/${postId}/upload_images/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error uploading images to post with id ${postId}:`, error);
      throw error;
    }
  },

  // Preview a post before publishing
  previewPost: async (postData) => {
    try {
      const formData = new FormData();
      formData.append('title', postData.title);
      formData.append('content', postData.content);
      
      if (postData.featured_image) {
        formData.append('featured_image', postData.featured_image);
      }
      
      const response = await api.post('/posts/preview/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error previewing post:', error);
      throw error;
    }
  },

  // Check for broken links in post content
  checkBrokenLinks: async (content) => {
    try {
      const response = await api.post('/posts/check-links/', { content });
      return response.data;
    } catch (error) {
      console.error('Error checking links:', error);
      throw error;
    }
  },

  // Generate or validate a slug
  validateSlug: async (title, currentSlug = null) => {
    try {
      const response = await api.post('/posts/validate-slug/', { 
        title,
        current_slug: currentSlug 
      });
      return response.data;
    } catch (error) {
      console.error('Error validating slug:', error);
      throw error;
    }
  },
};

// API service for comments
export const commentService = {
  // Get comments for a post with pagination
  getComments: async (postId, approved = true, page = 1, pageSize = 10) => {
    try {
      console.log(`Fetching comments with URL: ${COMMENT_ENDPOINTS.LIST} and params:`, { post: postId, approved, page, page_size: pageSize });
      const response = await api.get(COMMENT_ENDPOINTS.LIST, { 
        params: { 
          post: postId, 
          approved,
          page,
          page_size: pageSize
        } 
      });
      
      console.log('Comments API response:', response.data);
      return {
        results: response.data.results || response.data,
        count: response.data.count || response.data.length,
        next: response.data.next || null,
        previous: response.data.previous || null,
      };
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      throw error;
    }
  },

  // Create a new comment
  createComment: async (commentData) => {
    try {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] Submitting comment data:`, commentData);
      
      // Validate required fields before sending
      if (!commentData.post) {
        console.error(`[${timestamp}] Missing required field: post ID - Data:`, commentData);
        throw new Error('Missing required field: post ID');
      }
      
      if (!commentData.content || commentData.content.trim() === '') {
        console.error(`[${timestamp}] Invalid comment content - Raw data:`, JSON.stringify(commentData));
        throw new Error('Missing required field: comment content');
      }
      
      // Create a more complete comment object with default values for any missing fields
      const completeCommentData = {
        post: commentData.post,
        content: commentData.content,
        // Optionally add default values for other required fields
        approved: false,
        created_at: new Date().toISOString()
      };
      
      console.log(`[${timestamp}] Sending complete comment data:`, completeCommentData);
      
      const response = await api.post(COMMENT_ENDPOINTS.LIST, completeCommentData);
      console.log(`[${timestamp}] Comment submitted successfully:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error creating comment:`, error);
      
      // Log more detailed error information
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      }
      
      throw error;
    }
  },

  // Get all pending (unapproved) comments
  getPendingComments: async (page = 1, pageSize = 10) => {
    try {
      console.log(`Fetching pending comments with URL: ${COMMENT_ENDPOINTS.LIST} and params:`, { approved: false, page, page_size: pageSize });
      const response = await api.get(COMMENT_ENDPOINTS.LIST, { 
        params: { 
          approved: false,
          page,
          page_size: pageSize
        } 
      });
      
      console.log('Pending comments API response:', response.data);
      return {
        results: response.data.results || response.data,
        count: response.data.count || response.data.length,
        next: response.data.next || null,
        previous: response.data.previous || null,
      };
    } catch (error) {
      console.error('Error fetching pending comments:', error);
      throw error;
    }
  },

  // Get pending comments count
  getPendingCommentsCount: async () => {
    try {
      const response = await api.get(COMMENT_ENDPOINTS.PENDING_COUNT);
      return response.data.count;
    } catch (error) {
      console.error('Error fetching pending comments count:', error);
      throw error;
    }
  },

  // Bulk approve comments
  bulkApproveComments: async (commentIds) => {
    try {
      const response = await api.post(COMMENT_ENDPOINTS.BULK_APPROVE, { comment_ids: commentIds });
      return response.data;
    } catch (error) {
      console.error('Error bulk approving comments:', error);
      throw error;
    }
  },

  // Bulk reject comments
  bulkRejectComments: async (commentIds) => {
    try {
      const response = await api.post(COMMENT_ENDPOINTS.BULK_REJECT, { comment_ids: commentIds });
      return response.data;
    } catch (error) {
      console.error('Error bulk rejecting comments:', error);
      throw error;
    }
  },

  // Approve a comment
  approveComment: async (commentId) => {
    try {
      const response = await api.post(COMMENT_ENDPOINTS.APPROVE(commentId));
      return response.data;
    } catch (error) {
      console.error(`Error approving comment with id ${commentId}:`, error);
      throw error;
    }
  },

  // Reject a comment
  rejectComment: async (commentId) => {
    try {
      const response = await api.post(COMMENT_ENDPOINTS.REJECT(commentId));
      return response.data;
    } catch (error) {
      console.error(`Error rejecting comment with id ${commentId}:`, error);
      throw error;
    }
  },

  // Get all comments (approved and pending) for a post in a single request
  getAllCommentsForPost: async (postId) => {
    try {
      // If no postId is provided, use the standard methods instead
      if (!postId) {
        const approvedData = await commentService.getComments(null, true);
        const pendingData = await commentService.getPendingComments();
        
        return {
          approved: approvedData.results || [],
          pending: pendingData.results || [],
          total: (approvedData.results || []).length + (pendingData.results || []).length
        };
      }
      
      try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await api.get(COMMENT_ENDPOINTS.ALL_FOR_POST, { 
          params: { post: postId },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        return {
          approved: response.data.approved || [],
          pending: response.data.pending || [],
          total: response.data.total || 0
        };
      } catch (endpointError) {
        console.warn('Optimized endpoint not available, falling back to standard endpoints');
        // Fallback to using standard methods when the optimized endpoint fails
        try {
          const approvedData = await commentService.getComments(postId, true);
          const pendingData = await commentService.getComments(postId, false);
          
          return {
            approved: approvedData.results || [],
            pending: pendingData.results || [],
            total: (approvedData.results || []).length + (pendingData.results || []).length
          };
        } catch (fallbackError) {
          console.error('Fallback comment fetching also failed:', fallbackError);
          return {
            approved: [],
            pending: [],
            total: 0,
            error: fallbackError.message
          };
        }
      }
    } catch (error) {
      console.error(`Error fetching all comments for post ${postId}:`, error);
      // Return empty arrays in case of error to prevent UI issues
      return {
        approved: [],
        pending: [],
        total: 0,
        error: error.message
      };
    }
  },
};

// API service for FAQs removed 