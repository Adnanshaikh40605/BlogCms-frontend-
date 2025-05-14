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

// Post API functions
const postAPI = {
  // Get all posts
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `${API_URL}/api/posts/?${queryParams}` : `${API_URL}/api/posts/`;
    const response = await fetch(url);
    return response.json();
  },
  
  // Get single post by ID
  getById: async (id) => {
    const response = await fetch(`${API_URL}/api/posts/${id}/`);
    return response.json();
  },
  
  // Create new post
  create: async (postData) => {
    const response = await fetch(`${API_URL}/api/posts/`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(postData)
    });
    return response.json();
  },
  
  // Update existing post
  update: async (id, postData) => {
    const response = await fetch(`${API_URL}/api/posts/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(postData)
    });
    return response.json();
  },
  
  // Delete post
  delete: async (id) => {
    const response = await fetch(`${API_URL}/api/posts/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include'
    });
    return response.status === 204; // Returns true if successfully deleted
  },
  
  // Upload images for a post
  uploadImage: async (id, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await fetch(`${API_URL}/api/posts/${id}/upload_images/`, {
      method: 'POST',
      headers: getHeaders(false), // Don't include Content-Type for file uploads
      credentials: 'include',
      body: formData
    });
    return response.json();
  }
};

// Image API functions
const imageAPI = {
  // Get all images
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/images/`);
    return response.json();
  },
  
  // Get image by ID
  getById: async (id) => {
    const response = await fetch(`${API_URL}/api/images/${id}/`);
    return response.json();
  },
  
  // Upload new image
  upload: async (imageFile, title = '', description = '') => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    if (title) {
      formData.append('title', title);
    }
    
    if (description) {
      formData.append('description', description);
    }
    
    const response = await fetch(`${API_URL}/api/images/`, {
      method: 'POST',
      headers: getHeaders(false), // Don't include Content-Type for file uploads
      credentials: 'include',
      body: formData
    });
    return response.json();
  },
  
  // Update image
  update: async (id, imageData) => {
    const formData = new FormData();
    
    if (imageData.image) {
      formData.append('image', imageData.image);
    }
    
    if (imageData.title) {
      formData.append('title', imageData.title);
    }
    
    if (imageData.description) {
      formData.append('description', imageData.description);
    }
    
    const response = await fetch(`${API_URL}/api/images/${id}/`, {
      method: 'PUT',
      headers: getHeaders(false), // Don't include Content-Type for file uploads
      credentials: 'include',
      body: formData
    });
    return response.json();
  },
  
  // Partially update image
  partialUpdate: async (id, imageData) => {
    const formData = new FormData();
    
    if (imageData.image) {
      formData.append('image', imageData.image);
    }
    
    if (imageData.title) {
      formData.append('title', imageData.title);
    }
    
    if (imageData.description) {
      formData.append('description', imageData.description);
    }
    
    const response = await fetch(`${API_URL}/api/images/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(false), // Don't include Content-Type for file uploads
      credentials: 'include',
      body: formData
    });
    return response.json();
  },
  
  // Delete image
  delete: async (id) => {
    const response = await fetch(`${API_URL}/api/images/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include'
    });
    return response.status === 204; // Returns true if successfully deleted
  }
};

// Comment API functions
const commentAPI = {
  // Get all comments (with optional filtering)
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `${API_URL}/api/comments/?${queryParams}` : `${API_URL}/api/comments/`;
    const response = await fetch(url);
    return response.json();
  },
  
  // Get approved comments with pagination
  getApprovedComments: async (page = 1, pageSize = 10) => {
    const url = `${API_URL}/api/comments/?approved=true&page=${page}&page_size=${pageSize}`;
    console.log('Fetching approved comments from:', url);
    const response = await fetch(url);
    return response.json();
  },
  
  // Get a specific comment
  getById: async (id) => {
    const response = await fetch(`${API_URL}/api/comments/${id}/`);
    return response.json();
  },
  
  // Create new comment
  create: async (commentData) => {
    const response = await fetch(`${API_URL}/api/comments/`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(commentData)
    });
    return response.json();
  },
  
  // Update comment
  update: async (id, commentData) => {
    const response = await fetch(`${API_URL}/api/comments/${id}/`, {
      method: 'PUT',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(commentData)
    });
    return response.json();
  },
  
  // Partially update comment
  partialUpdate: async (id, commentData) => {
    const response = await fetch(`${API_URL}/api/comments/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(commentData)
    });
    return response.json();
  },
  
  // Delete comment
  delete: async (id) => {
    const response = await fetch(`${API_URL}/api/comments/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include'
    });
    return response.status === 204; // Returns true if successfully deleted
  },
  
  // Approve a comment
  approve: async (id) => {
    const response = await fetch(`${API_URL}/api/comments/${id}/approve/`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include'
    });
    return response.json();
  },
  
  // Reject a comment
  reject: async (id) => {
    const response = await fetch(`${API_URL}/api/comments/${id}/reject/`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include'
    });
    return response.json();
  },
  
  // Bulk approve comments
  bulkApprove: async (commentIds) => {
    const response = await fetch(`${API_URL}/api/comments/bulk_approve/`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ comment_ids: commentIds })
    });
    return response.json();
  },
  
  // Bulk reject comments
  bulkReject: async (commentIds) => {
    const response = await fetch(`${API_URL}/api/comments/bulk_reject/`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ comment_ids: commentIds })
    });
    return response.json();
  },
  
  // Get pending comment count
  getPendingCount: async () => {
    const response = await fetch(`${API_URL}/api/comments/pending-count/`);
    return response.json();
  },
  
  // Get all comments for a post (both approved and pending)
  getAllForPost: async (postId) => {
    const response = await fetch(`${API_URL}/api/comments/all/?post=${postId}`);
    return response.json();
  }
};

// Media handling
const mediaAPI = {
  getImageUrl: (imagePath) => {
    if (!imagePath) return null;
    return `${MEDIA_URL}${imagePath}`;
  }
};

export {
  API_URL,
  MEDIA_URL,
  postAPI,
  imageAPI,
  commentAPI,
  mediaAPI
}; 