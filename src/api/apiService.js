// src/api/apiService.js

// Get environment variables with fallback to development values
// IMPORTANT: When deploying to Vercel, set the VITE_API_URL environment variable to your backend URL
// For example: https://web-production-f03ff.up.railway.app (if your backend is deployed on Railway)
const API_URL = import.meta.env.VITE_API_URL || 'https://web-production-f03ff.up.railway.app';  // Fallback to deployed backend URL
const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || 'https://web-production-f03ff.up.railway.app/media/';

console.log('Using API URL:', API_URL);

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
      throw new Error(errorData.detail || 'API request failed');
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
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams ? `${API_URL}/api/posts/?${queryParams}` : `${API_URL}/api/posts/`;
      const response = await fetch(url);
      return handleResponse(response);
    } catch (error) {
      console.error('API Error fetching posts:', error);
      throw error;
    }
  },
  
  // Get single post by ID
  getById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/posts/${id}/`);
      return handleResponse(response);
    } catch (error) {
      console.error(`API Error fetching post ${id}:`, error);
      throw error;
    }
  },
  
  // Create new post
  create: async (postData) => {
    try {
      // Handle case where postData includes a file for featured_image
      if (postData.featured_image instanceof File) {
        const formData = new FormData();
        
        // Add each field to formData
        Object.keys(postData).forEach(key => {
          if (key === 'featured_image') {
            formData.append(key, postData[key]);
          } else {
            formData.append(key, postData[key]);
          }
        });
        
        const response = await fetch(`${API_URL}/api/posts/`, {
          method: 'POST',
          headers: getHeaders(false), // Don't include Content-Type for file uploads
          credentials: 'include',
          body: formData
        });
        
        return handleResponse(response);
      }
      
      // Regular JSON submission without files
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
      // Handle case where postData includes a file for featured_image
      if (postData.featured_image instanceof File) {
        const formData = new FormData();
        
        // Add each field to formData
        Object.keys(postData).forEach(key => {
          if (key === 'featured_image') {
            formData.append(key, postData[key]);
          } else {
            formData.append(key, postData[key]);
          }
        });
        
        const response = await fetch(`${API_URL}/api/posts/${id}/`, {
          method: 'PATCH',
          headers: getHeaders(false), // Don't include Content-Type for file uploads
          credentials: 'include',
          body: formData
        });
        
        return handleResponse(response);
      }
      
      // Regular JSON submission without files
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
  // Get all comments (with optional filtering)
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams ? `${API_URL}/api/comments/?${queryParams}` : `${API_URL}/api/comments/`;
      const response = await fetch(url);
      return handleResponse(response);
    } catch (error) {
      console.error('API Error fetching comments:', error);
      throw error;
    }
  },
  
  // Get all comments for a post (approved and pending)
  getAllForPost: async (postId) => {
    try {
      if (!postId) throw new Error('Post ID is required');
      
      const response = await fetch(`${API_URL}/api/comments/all/?post=${postId}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`API Error fetching comments for post ${postId}:`, error);
      throw error;
    }
  },
  
  // Get a specific comment
  getById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/comments/${id}/`);
      return handleResponse(response);
    } catch (error) {
      console.error(`API Error fetching comment ${id}:`, error);
      throw error;
    }
  },
  
  // Create new comment
  create: async (commentData) => {
    try {
      const response = await fetch(`${API_URL}/api/comments/`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(commentData)
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('API Error creating comment:', error);
      throw error;
    }
  },
  
  // Approve a comment
  approve: async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/comments/${id}/approve/`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify({})
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error(`API Error approving comment ${id}:`, error);
      throw error;
    }
  },
  
  // Reject a comment
  reject: async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/comments/${id}/reject/`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify({})
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error(`API Error rejecting comment ${id}:`, error);
      throw error;
    }
  },
  
  // Bulk approve comments
  bulkApprove: async (commentIds) => {
    try {
      const response = await fetch(`${API_URL}/api/comments/bulk_approve/`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ comment_ids: commentIds })
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('API Error bulk approving comments:', error);
      throw error;
    }
  },
  
  // Bulk reject comments
  bulkReject: async (commentIds) => {
    try {
      const response = await fetch(`${API_URL}/api/comments/bulk_reject/`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ comment_ids: commentIds })
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('API Error bulk rejecting comments:', error);
      throw error;
    }
  },
  
  // Get pending comment count
  getPendingCount: async () => {
    try {
      const response = await fetch(`${API_URL}/api/comments/pending_count/`);
      return handleResponse(response);
    } catch (error) {
      console.error('API Error fetching pending count:', error);
      throw error;
    }
  }
};

// CKEditor API helper
const ckEditorAPI = {
  // Upload an image for CKEditor
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('upload', file);
      
      const response = await fetch(`${API_URL}/ckeditor5/upload/`, {
        method: 'POST',
        headers: getHeaders(false), // Don't include Content-Type for file uploads
        credentials: 'include',
        body: formData
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('API Error uploading CKEditor image:', error);
      throw error;
    }
  }
};

// Debug/utility API
const debugAPI = {
  // Get debug info
  getDebugInfo: async () => {
    try {
      const response = await fetch(`${API_URL}/debug-info/`);
      return handleResponse(response);
    } catch (error) {
      console.error('API Error fetching debug info:', error);
      throw error;
    }
  }
};

// Media URL helper functions
const mediaAPI = {
  getImageUrl: imageAPI.getImageUrl
};

export { 
  postAPI, 
  imageAPI, 
  commentAPI,
  ckEditorAPI,
  debugAPI,
  mediaAPI,
  API_URL,
  MEDIA_URL
}; 