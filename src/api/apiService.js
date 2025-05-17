// src/api/apiService.js

// Get environment variables with fallback to development values
// IMPORTANT: When deploying to Vercel, set the VITE_API_URL environment variable to your backend URL
// For example: https://web-production-f03ff.up.railway.app (if your backend is deployed on Railway)
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const DEFAULT_API_URL = isDevelopment ? 'http://localhost:8000' : 'https://web-production-f03ff.up.railway.app';
const API_URL = (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'undefined') 
  ? import.meta.env.VITE_API_URL 
  : DEFAULT_API_URL;
  
const MEDIA_URL = (import.meta.env.VITE_MEDIA_URL && import.meta.env.VITE_MEDIA_URL !== 'undefined') 
  ? import.meta.env.VITE_MEDIA_URL 
  : `${API_URL}/media/`;

// Import mock data for development fallback
import { mockAPI, handleApiWithFallback } from './apiMocks';

console.log('Using API URL:', API_URL);
console.log('Using MEDIA URL:', MEDIA_URL);
console.log('Development mode:', isDevelopment ? 'Yes (will fallback to mock data if API unavailable)' : 'No');

// Media API helper for working with images
export const mediaAPI = {
  getImageUrl: (path) => {
    if (!path) return null;
    
    // If the path is already a full URL, return it
    if (path.startsWith('http')) {
      return path;
    }
    
    // If path starts with /media, don't add media URL again
    if (path.startsWith('/media/')) {
      return path.startsWith('/media') && !MEDIA_URL.endsWith('/media') 
        ? `${MEDIA_URL}${path.substring(6)}` // Remove /media from path
        : path;
    }
    
    // Otherwise, add the media URL
    return `${MEDIA_URL}${path.replace(/^\//, '')}`;
  },
  
  // Get optimized image URL with size parameters (when supported by backend)
  getOptimizedImageUrl: (path, { width, height, format } = {}) => {
    if (!path) return null;
    
    const baseUrl = mediaAPI.getImageUrl(path);
    if (!baseUrl) return null;
    
    // If no optimization parameters, return base URL
    if (!width && !height && !format) {
      return baseUrl;
    }
    
    // Build query parameters for optimized image
    const params = new URLSearchParams();
    if (width) params.append('w', width);
    if (height) params.append('h', height);
    if (format) params.append('fmt', format);
    
    // Add parameters to URL
    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${params.toString()}`;
  }
};

// Helper function to get cookies (for CSRF token)
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// Default request headers
const getHeaders = (includeContentType = true) => {
  const headers = {};
  const csrfToken = getCookie('csrftoken');
  
  if (csrfToken) {
    headers['X-CSRFToken'] = csrfToken;
  }
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

// Helper to format API responses with appropriate error handling
const handleResponse = async (response) => {
  // For DELETE operations that return 204 No Content
  if (response.status === 204) {
    return true;
  }
  
  // Check if response is OK
  if (!response.ok) {
    const errorText = await response.text();
    try {
      // Try to parse as JSON
      const errorData = JSON.parse(errorText);
      throw new Error(JSON.stringify(errorData));
    } catch (e) {
      // If not JSON, use text or status
      throw new Error(errorText || `API request failed with status: ${response.status}`);
    }
  }
  
  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text();
};

// Post API functions
const postAPI = {
  // Get all posts
  getAll: async (params = {}) => {
    if (isDevelopment) {
      return handleApiWithFallback(
        async () => {
          const queryParams = new URLSearchParams(params).toString();
          const url = queryParams ? `${API_URL}/api/posts/?${queryParams}` : `${API_URL}/api/posts/`;
          
          console.log('Fetching posts from URL:', url);
          
          const response = await fetch(url);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error: ${response.status} - ${response.statusText}`, errorText);
            
            // Provide more detailed error information for debugging
            throw new Error(`Server error (${response.status}): ${errorText || response.statusText}`);
          }
          
          return handleResponse(response);
        },
        mockAPI.posts.getAll()
      );
    } else {
      // Original implementation for production
      try {
        const queryParams = new URLSearchParams(params).toString();
        const url = queryParams ? `${API_URL}/api/posts/?${queryParams}` : `${API_URL}/api/posts/`;
        
        console.log('Fetching posts from URL:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API Error: ${response.status} - ${response.statusText}`, errorText);
          
          // Provide more detailed error information for debugging
          throw new Error(`Server error (${response.status}): ${errorText || response.statusText}`);
        }
        
        return handleResponse(response);
      } catch (error) {
        console.error('API Error fetching posts:', error);
        throw error;
      }
    }
  },
  
  // Get single post by ID (add development mode fallback)
  getById: async (id) => {
    if (isDevelopment) {
      return handleApiWithFallback(
        async () => {
          const response = await fetch(`${API_URL}/api/posts/${id}/`);
          return handleResponse(response);
        },
        mockAPI.posts.getById(id)
      );
    } else {
      try {
        const response = await fetch(`${API_URL}/api/posts/${id}/`);
        return handleResponse(response);
      } catch (error) {
        console.error(`API Error fetching post ${id}:`, error);
        throw error;
      }
    }
  },
  
  // Create new post
  create: async (postData) => {
    try {
      // Check if postData includes files (featured_image or additional_images)
      if (postData.featured_image instanceof File || 
          (postData.additional_images && postData.additional_images.some(img => img instanceof File))) {
        
        const formData = new FormData();
        
        // Add regular fields to formData
        Object.keys(postData).forEach(key => {
          // Skip files for now
          if (key !== 'featured_image' && key !== 'additional_images') {
            console.log(`Adding field ${key}:`, postData[key]);
            formData.append(key, postData[key]);
          }
        });
        
        // Explicitly ensure slug is included
        if (postData.slug) {
          console.log('Setting explicit slug:', postData.slug);
          formData.append('slug', postData.slug);
        } else if (postData.title) {
          // Generate slug from title as fallback
          const slug = postData.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .replace(/^-+|-+$/g, '')
            .trim();
          console.log('Generated slug from title:', slug);
          formData.append('slug', slug);
        }
        
        // Handle featured image
        if (postData.featured_image instanceof File) {
          formData.append('featured_image', postData.featured_image);
        }
        
        // Handle additional images array
        if (postData.additional_images && Array.isArray(postData.additional_images)) {
          postData.additional_images.forEach((image, index) => {
            if (image instanceof File) {
              formData.append(`additional_images[${index}]`, image);
            }
          });
        }
        
        // Log form data for debugging
        console.log('Sending form data with files');
        for (let [key, value] of formData.entries()) {
          console.log(`FormData contains: ${key}`, value instanceof File ? value.name : value);
        }
        
        const response = await fetch(`${API_URL}/api/posts/`, {
          method: 'POST',
          headers: getHeaders(false), // Don't include Content-Type for file uploads
          credentials: 'include',
          body: formData
        });
        
        return handleResponse(response);
      }
      
      // Regular JSON submission without files
      console.log('Sending JSON data without files');
      console.log('Post data:', postData);
      
      const response = await fetch(`${API_URL}/api/posts/`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(postData)
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('API Error creating post:', error);
      throw error;
    }
  },
  
  // Update existing post
  update: async (id, postData) => {
    try {
      // Check if postData includes files (featured_image or additional_images)
      if (postData.featured_image instanceof File || 
          (postData.additional_images && postData.additional_images.some(img => img instanceof File))) {
        
        const formData = new FormData();
        
        // Add regular fields to formData
        Object.keys(postData).forEach(key => {
          // Skip files for now
          if (key !== 'featured_image' && key !== 'additional_images') {
            console.log(`Adding field ${key}:`, postData[key]);
            formData.append(key, postData[key]);
          }
        });
        
        // Explicitly ensure slug is included
        if (postData.slug) {
          console.log('Setting explicit slug:', postData.slug);
          formData.append('slug', postData.slug);
        } else if (postData.title) {
          // Generate slug from title as fallback
          const slug = postData.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .replace(/^-+|-+$/g, '')
            .trim();
          console.log('Generated slug from title:', slug);
          formData.append('slug', slug);
        }
        
        // Handle featured image
        if (postData.featured_image instanceof File) {
          formData.append('featured_image', postData.featured_image);
        }
        
        // Handle additional images array
        if (postData.additional_images && Array.isArray(postData.additional_images)) {
          postData.additional_images.forEach((image, index) => {
            if (image instanceof File) {
              formData.append(`additional_images[${index}]`, image);
            }
          });
        }
        
        // Log form data for debugging
        console.log('Sending form data with files for update');
        for (let [key, value] of formData.entries()) {
          console.log(`FormData contains: ${key}`, value instanceof File ? value.name : value);
        }
        
        const response = await fetch(`${API_URL}/api/posts/${id}/`, {
          method: 'PATCH',
          headers: getHeaders(false), // Don't include Content-Type for file uploads
          credentials: 'include',
          body: formData
        });
        
        return handleResponse(response);
      }
      
      // Regular JSON submission without files
      console.log('Sending JSON data without files for update');
      console.log('Post data:', postData);
      
      const response = await fetch(`${API_URL}/api/posts/${id}/`, {
        method: 'PATCH',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(postData)
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error(`API Error updating post ${id}:`, error);
      throw error;
    }
  },
  
  // Delete post
  delete: async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/posts/${id}/`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include'
      });
      
      return response.status === 204; // Returns true if successfully deleted
    } catch (error) {
      console.error(`API Error deleting post ${id}:`, error);
      throw error;
    }
  },
  
  // Upload images for a post
  uploadImages: async (id, imageFiles) => {
    try {
      const formData = new FormData();
      
      // If imageFiles is an array, append each file
      if (Array.isArray(imageFiles)) {
        imageFiles.forEach(file => formData.append('images', file));
      } else {
        // If it's a single file
        formData.append('images', imageFiles);
      }
      
      const response = await fetch(`${API_URL}/api/posts/${id}/upload_images/`, {
        method: 'POST',
        headers: getHeaders(false), // Don't include Content-Type for file uploads
        credentials: 'include',
        body: formData
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error(`API Error uploading images for post ${id}:`, error);
      throw error;
    }
  }
};

// Image API functions
const imageAPI = {
  // Get all images
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/api/images/`);
      return handleResponse(response);
    } catch (error) {
      console.error('API Error fetching images:', error);
      throw error;
    }
  },
  
  // Get image by ID
  getById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/images/${id}/`);
      return handleResponse(response);
    } catch (error) {
      console.error(`API Error fetching image ${id}:`, error);
      throw error;
    }
  },
  
  // Upload new image
  upload: async (postId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('post', postId);
      formData.append('image', imageFile);
      
      const response = await fetch(`${API_URL}/api/images/`, {
        method: 'POST',
        headers: getHeaders(false), // Don't include Content-Type for file uploads
        credentials: 'include',
        body: formData
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('API Error uploading image:', error);
      throw error;
    }
  },
  
  // Delete image
  delete: async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/images/${id}/`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include'
      });
      
      return response.status === 204; // Returns true if successfully deleted
    } catch (error) {
      console.error(`API Error deleting image ${id}:`, error);
      throw error;
    }
  },
  
  // Helper to get full image URL
  getImageUrl: (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return it
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Strip leading slash if present in imagePath
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    
    // If it's a relative path starting with media/, make sure we don't duplicate
    if (cleanPath.startsWith('media/')) {
      return `${API_URL}/${cleanPath}`;
    }
    
    // Otherwise, prepend the media URL
    return `${MEDIA_URL}${cleanPath}`;
  }
};

// Comment API functions
const commentAPI = {
  // Get all comments (with optional post ID filter)
  getAll: async (postId = null) => {
    try {
      let url = `${API_URL}/api/comments/`;
      
      // Only add post filter if a valid postId is provided
      if (postId) {
        // Ensure postId is a string/number value, not an object
        const safePostId = String(postId);
        url += `?post=${safePostId}`;
      }
      
      console.log('Fetching comments with URL:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in commentAPI.getAll:', error);
      return [];
    }
  },
  
  // Get all comments for a specific post (both approved and pending)
  getAllForPost: async (postId) => {
    try {
      if (!postId) {
        console.error('No post ID provided to getAllForPost');
        return { approved: [], pending: [], total: 0 };
      }
      
      // Ensure postId is a string
      const safePostId = String(postId);
      console.log(`Fetching all comments for post ${safePostId}`);
      
      try {
        // Try using the all endpoint first
        const url = `${API_URL}/api/comments/all/?post=${safePostId}`;
        console.log('Request URL:', url);
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed with status ${response.status}`);
        }
        
        const data = await response.json();
        console.log('All comments response:', data);
        
        return data; // This should already have approved and pending arrays
      } catch (dedicatedEndpointError) {
        console.warn('Dedicated endpoint failed, falling back to query params:', dedicatedEndpointError);
        
        // If the dedicated endpoint fails, fetch approved and pending separately
        const approved = await commentAPI.getApproved(safePostId);
        const pending = await commentAPI.getPending(safePostId);
        
        return {
          approved: approved.results || [],
          pending: pending.results || [],
          total: (approved.results?.length || 0) + (pending.results?.length || 0)
        };
      }
    } catch (error) {
      console.error('Error fetching all comments for post:', error);
      return { approved: [], pending: [], total: 0 };
    }
  },
  
  // Get approved comments for a post
  getApproved: async (postId) => {
    try {
      if (!postId) {
        console.error('No post ID provided to getApproved');
        return { results: [], count: 0 };
      }
      
      // Ensure postId is a string to avoid [object Object] in URL
      const safePostId = String(postId);
      console.log(`Fetching approved comments for post ${safePostId} - ${new Date().toISOString()}`);
      
      // Try fallback method first (more reliable)
      try {
        const fallbackUrl = `${API_URL}/api/comments/?post=${safePostId}&approved=true`;
        console.log('Request URL:', fallbackUrl);
        
        const fallbackResponse = await fetch(fallbackUrl);
        if (!fallbackResponse.ok) {
          throw new Error(`Failed with status ${fallbackResponse.status}`);
        }
        
        const fallbackData = await fallbackResponse.json();
        console.log('Approved comments response (query params):', fallbackData);
        
        return {
          results: Array.isArray(fallbackData) ? fallbackData : [],
          count: Array.isArray(fallbackData) ? fallbackData.length : 0
        };
      } catch (fallbackError) {
        console.warn('Standard endpoint failed:', fallbackError);
        // Return empty results as ultimate fallback
        return { results: [], count: 0 };
      }
    } catch (error) {
      console.error('Error fetching approved comments:', error);
      // Return empty results to avoid UI breaking
      return { results: [], count: 0 };
    }
  },
  
  // Get pending comments for a post
  getPending: async (postId) => {
    try {
      if (!postId) {
        console.error('No post ID provided to getPending');
        return { results: [], count: 0 };
      }
      
      console.log(`Fetching pending comments for post ${postId} - ${new Date().toISOString()}`);
      // Use explicit query parameter for approved=false
      // Ensure postId is a string
      const safePostId = String(postId);
      const url = `${API_URL}/api/comments/?post=${safePostId}&approved=false`;
      console.log('Request URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      console.log('Pending comments response:', data);
      
      // Format the response to match what the component expects
      return {
        results: Array.isArray(data) ? data : [],
        count: Array.isArray(data) ? data.length : 0
      };
    } catch (error) {
      console.error('Error fetching pending comments:', error);
      return { results: [], count: 0 };
    }
  },
  
  // Create a new comment
  create: async (commentData) => {
    try {
      if (!commentData || !commentData.post) {
        console.error('Invalid comment data or missing post ID');
        throw new Error('Valid comment data with post ID is required');
      }
      
      // Ensure post ID is a string
      commentData.post = String(commentData.post);
      
      const url = `${API_URL}/api/comments/`;
      console.log('Creating comment with URL:', url, commentData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(commentData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },
  
  // Approve a comment
  approve: async (commentId) => {
    try {
      if (!commentId) {
        console.error('No comment ID provided to approve');
        throw new Error('Comment ID is required');
      }
      
      const safeCommentId = String(commentId);
      const url = `${API_URL}/api/comments/${safeCommentId}/approve/`;
      console.log('Approving comment with URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders()
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error approving comment:', error);
      throw error;
    }
  },
  
  // Reject (delete) a comment
  reject: async (commentId) => {
    try {
      if (!commentId) {
        console.error('No comment ID provided to reject');
        throw new Error('Comment ID is required');
      }
      
      const safeCommentId = String(commentId);
      const url = `${API_URL}/api/comments/${safeCommentId}/reject/`;
      console.log('Rejecting comment with URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders()
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error rejecting comment:', error);
      throw error;
    }
  },
  
  // Reply to a comment as admin
  replyToComment: async (commentId, replyData) => {
    try {
      if (!commentId) {
        console.error('No comment ID provided for reply');
        throw new Error('Comment ID is required');
      }
      
      const safeCommentId = String(commentId);
      const url = `${API_URL}/api/comments/${safeCommentId}/reply/`;
      console.log('Replying to comment with URL:', url, replyData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(replyData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error replying to comment:', error);
      throw error;
    }
  },
  
  // Update an existing admin reply
  updateReply: async (commentId, replyData) => {
    try {
      if (!commentId) {
        console.error('No comment ID provided for update reply');
        throw new Error('Comment ID is required');
      }
      
      const safeCommentId = String(commentId);
      const url = `${API_URL}/api/comments/${safeCommentId}/reply/`;
      console.log('Updating comment reply with URL:', url, replyData);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(replyData)
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error updating comment reply:', error);
      throw error;
    }
  },
  
  // Delete an admin reply
  deleteReply: async (commentId) => {
    try {
      if (!commentId) {
        console.error('No comment ID provided for delete reply');
        throw new Error('Comment ID is required');
      }
      
      const safeCommentId = String(commentId);
      const url = `${API_URL}/api/comments/${safeCommentId}/reply/`;
      console.log('Deleting comment reply with URL:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getHeaders()
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting comment reply:', error);
      throw error;
    }
  },
  
  // Get pending comment count
  getPendingCount: async () => {
    try {
      const response = await fetch(`${API_URL}/api/comments/pending-count/`);
      return await response.json();
    } catch (error) {
      console.error('Error getting pending count:', error);
      return { count: 0 };
    }
  },
  
  // Bulk approve comments
  bulkApprove: async (commentIds) => {
    try {
      if (!Array.isArray(commentIds) || commentIds.length === 0) {
        console.error('Invalid or empty comment IDs for bulk approve');
        throw new Error('Valid comment IDs array is required');
      }
      
      const url = `${API_URL}/api/comments/bulk_approve/`;
      console.log('Bulk approving comments:', commentIds);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ comment_ids: commentIds })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error bulk approving comments:', error);
      throw error;
    }
  },
  
  // Bulk reject comments
  bulkReject: async (commentIds) => {
    try {
      if (!Array.isArray(commentIds) || commentIds.length === 0) {
        console.error('Invalid or empty comment IDs for bulk reject');
        throw new Error('Valid comment IDs array is required');
      }
      
      const url = `${API_URL}/api/comments/bulk_reject/`;
      console.log('Bulk rejecting comments:', commentIds);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ comment_ids: commentIds })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error bulk rejecting comments:', error);
      throw error;
    }
  },

  // Trash a comment
  trashComment: async (commentId) => {
    try {
      if (!commentId) {
        throw new Error('Comment ID is required');
      }
      
      const url = `${API_URL}/api/comments/trash/`;
      console.log('Trashing comment:', commentId);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ comment_id: commentId })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error trashing comment:', error);
      throw error;
    }
  },

  // Restore a comment from trash
  restoreComment: async (commentId) => {
    try {
      if (!commentId) {
        throw new Error('Comment ID is required');
      }
      
      const url = `${API_URL}/api/comments/restore/`;
      console.log('Restoring comment:', commentId);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ comment_id: commentId })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error restoring comment:', error);
      throw error;
    }
  },

  // Permanently delete a comment
  deleteComment: async (commentId) => {
    try {
      if (!commentId) {
        throw new Error('Comment ID is required');
      }
      
      const url = `${API_URL}/api/comments/delete/`;
      console.log('Permanently deleting comment:', commentId);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ comment_id: commentId })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },
};

// CKEditor API helper
const ckEditorAPI = {
  // Upload an image for CKEditor
  uploadImage: async (file) => {
    try {
      console.log('CKEditor image upload started for file:', file.name);
      
      // If in development mode, check if we should use the mock implementation
      if (isDevelopment) {
        try {
          // First try with the real API
          return await uploadImageToServer(file);
        } catch (error) {
          console.warn('Error using real API for image upload, falling back to mock:', error.message);
          // If the real API fails, use the mock implementation
          return await mockAPI.ckEditor.uploadImage(file);
        }
      } else {
        // In production, always use real API
        return await uploadImageToServer(file);
      }
    } catch (error) {
      console.error('API Error uploading CKEditor image:', error);
      throw error;
    }
  }
};

// Helper function to upload images to the real server
const uploadImageToServer = async (file) => {
  const formData = new FormData();
  formData.append('upload', file);
  
  // Use the standard CKEditor endpoint
  const uploadUrl = `${API_URL}/ckeditor5/image_upload/`;
  console.log('Using CKEditor upload URL:', uploadUrl);
  
  // Prepare the form data
  const freshFormData = new FormData();
  freshFormData.append('upload', file);
  
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: getHeaders(false), // Don't include Content-Type for file uploads
    credentials: 'include',
    body: freshFormData
  });
  
  // Check response status first
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`CKEditor image upload failed with status ${response.status}:`, errorText);
    throw new Error(`Upload failed with status ${response.status}: ${errorText || response.statusText}`);
  }
  
  const result = await handleResponse(response);
  console.log('CKEditor image upload response:', result);
  
  // Standardize response structure across environments
  // CKEditor 5 expects a response with either url or error
  if (result && (result.url || result.default)) {
    return {
      url: result.url || result.default
    };
  } else if (result && result.error) {
    throw new Error(result.error.message || 'Unknown upload error');
  } else {
    console.error('Unexpected upload response format:', result);
    throw new Error('Invalid server response format');
  }
};

export { 
  postAPI, 
  imageAPI, 
  commentAPI,
  ckEditorAPI,
  API_URL,
  MEDIA_URL
}; 