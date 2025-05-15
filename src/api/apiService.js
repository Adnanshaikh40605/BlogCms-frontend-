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

// Add health check to verify API connection
const checkApiHealth = async () => {
  try {
    console.log('Running API health check...');
    
    // Use the detailed health check for more comprehensive information
    const healthResults = await debugAPI.runDetailedHealthCheck();
    
    // Log detailed results
    console.log('Health check results:', healthResults);
    
    if (healthResults.basicApiConnection) {
      console.log('✅ API connection successful! Backend is reachable.');
      
      // Check database connection
      if (healthResults.databaseConnection) {
        console.log('✅ Database connection successful!');
      } else {
        console.error('❌ Database connection failed!', 
          healthResults.errors.find(e => e.test === 'databaseConnection')?.message || 'Unknown error');
      }
      
      return healthResults.basicApiConnection && healthResults.databaseConnection;
    } else {
      console.error('❌ API connection failed!', 
        healthResults.errors.find(e => e.test === 'basicApiConnection')?.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('❌ API health check failed!', error.message);
    return false;
  }
};

// Run health check on load
checkApiHealth();

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
          
          try {
            // First try to ping the API to check if it's responding
            const healthCheck = await fetch(`${API_URL}/debug-info/`, { method: 'GET' });
            if (!healthCheck.ok) {
              console.error('API health check failed:', healthCheck.status, healthCheck.statusText);
            } else {
              console.log('API health check successful');
            }
          } catch (healthError) {
            console.error('API health check error:', healthError);
          }
          
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
        
        try {
          // First try to ping the API to check if it's responding
          const healthCheck = await fetch(`${API_URL}/debug-info/`, { method: 'GET' });
          if (!healthCheck.ok) {
            console.error('API health check failed:', healthCheck.status, healthCheck.statusText);
          } else {
            console.log('API health check successful');
          }
        } catch (healthError) {
          console.error('API health check error:', healthError);
        }
        
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
            formData.append(key, postData[key]);
          }
        });
        
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
            formData.append(key, postData[key]);
          }
        });
        
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
  // Get all comments (with optional post ID filter)
  getAll: async (postId = null) => {
    let url = `${API_URL}/api/comments/`;
    if (postId) {
      url += `?post=${postId}`;
    }
    const response = await fetch(url);
    return response.json();
  },
  
  // Get approved comments for a post
  getApproved: async (postId) => {
    try {
      console.log(`Fetching approved comments for post ${postId} - ${new Date().toISOString()}`);
      // Use the dedicated endpoint for approved comments
      const url = `${API_URL}/api/comments/approved-for-post/?post=${postId}`;
      console.log('Request URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      console.log('Approved comments response:', data);
      
      // Format the response to match what the component expects
      return {
        results: Array.isArray(data) ? data : [],
        count: Array.isArray(data) ? data.length : 0
      };
    } catch (error) {
      console.error('Error fetching approved comments:', error);
      return { results: [], count: 0 };
    }
  },
  
  // Get pending comments for a post
  getPending: async (postId) => {
    try {
      console.log(`Fetching pending comments for post ${postId} - ${new Date().toISOString()}`);
      // Use explicit query parameter for approved=false
      const url = `${API_URL}/api/comments/?post=${postId}&approved=false`;
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
  
  // Debug utility to check approved comments status
  checkApproved: async (postId) => {
    try {
      console.log(`Checking approved comments status for post ${postId}`);
      const url = `${API_URL}/api/comments/check-approved/?post=${postId}`;
      console.log('Debug URL:', url);
      
      const response = await fetch(url);
      return response.json();
    } catch (error) {
      console.error('Error checking approved comments status:', error);
      throw error;
    }
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
  
  // Approve a comment
  approve: async (id) => {
    const response = await fetch(`${API_URL}/api/comments/${id}/approve/`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include'
    });
    return response.json();
  },
  
  // Get pending comment count
  getPendingCount: async () => {
    const response = await fetch(`${API_URL}/api/comments/pending-count/`);
    return response.json();
  }
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
  
  // Try the custom debug endpoint first, which provides more detailed error information
  const debugUploadUrl = `${API_URL}/api/debug-ckeditor-upload/`;
  console.log('Using debug upload URL:', debugUploadUrl);
  
  try {
    console.log('Attempting to use debug endpoint first...');
    const debugResponse = await fetch(debugUploadUrl, {
      method: 'POST',
      headers: getHeaders(false), // Don't include Content-Type for file uploads
      credentials: 'include',
      body: formData
    });
    
    // Check if the debug endpoint worked
    if (debugResponse.ok) {
      console.log('Debug endpoint successful');
      const result = await debugResponse.json();
      console.log('Debug upload response:', result);
      
      if (result && result.url) {
        return { url: result.url };
      }
    } else {
      console.warn('Debug endpoint failed, will try regular endpoint');
      const errorText = await debugResponse.text();
      console.error('Debug endpoint error:', errorText);
    }
  } catch (debugError) {
    console.warn('Error using debug endpoint:', debugError.message);
  }
  
  // Fall back to the regular CKEditor endpoint
  const uploadUrl = `${API_URL}/ckeditor5/image_upload/`;
  console.log('Falling back to standard upload URL:', uploadUrl);
  
  // Clone the FormData since it might have been consumed
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
  console.log('CKEditor standard image upload response:', result);
  
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
  },
  
  // Test database connection
  testDatabaseConnection: async () => {
    try {
      console.log('Testing database connection...');
      
      // First, try the test-db endpoint with trailing slash
      try {
        const response = await fetch(`${API_URL}/test-db/`);
        return handleResponse(response);
      } catch (error) {
        console.log('Error with /test-db/, trying without trailing slash...');
        // If first attempt fails, try without the trailing slash
        const response = await fetch(`${API_URL}/test-db`);
        return handleResponse(response);
      }
    } catch (error) {
      console.error('API Error testing database connection:', error);
      
      // Provide more specific error information for common Railway database issues
      const errorMsg = error.message || '';
      if (errorMsg.includes('Failed to fetch')) {
        return {
          status: 'error',
          error_type: 'ConnectionError',
          error_message: 'Failed to connect to the API server. The server may be down or unreachable.',
          railway_specific: 'Check if your Railway service is deployed and running correctly.'
        };
      }
      
      throw error;
    }
  },
  
  // Run detailed health check
  runDetailedHealthCheck: async () => {
    const results = {
      basicApiConnection: false,
      debugInfoAvailable: false,
      databaseConnection: false,
      errors: [],
      railwaySpecificChecks: {
        isRailwayEnvironment: false
      }
    };
    
    try {
      // Basic API check
      try {
        const response = await fetch(`${API_URL}/`);
        results.basicApiConnection = response.ok;
        
        // Check if we're running on Railway
        const host = response.headers.get('host') || '';
        if (host.includes('railway.app')) {
          results.railwaySpecificChecks.isRailwayEnvironment = true;
        }
      } catch (error) {
        results.errors.push({
          test: 'basicApiConnection',
          message: `API connection failed: ${error.message}`,
          details: error.toString()
        });
      }
      
      // Debug info check
      try {
        const debugInfo = await debugAPI.getDebugInfo();
        results.debugInfoAvailable = true;
        results.debugInfo = debugInfo;
        
        // Check if debug info contains database information
        if (debugInfo.database) {
          results.databaseInfo = {
            type: debugInfo.database,
            debug_mode: debugInfo.settings_debug,
            allowed_hosts: debugInfo.allowed_hosts
          };
        }
      } catch (error) {
        results.errors.push({
          test: 'debugInfoAvailable',
          message: `Debug info check failed: ${error.message}`,
          details: error.toString()
        });
      }
      
      // Database connection check
      try {
        const dbTest = await debugAPI.testDatabaseConnection();
        results.databaseConnection = dbTest.status === 'success';
        results.databaseTestDetails = dbTest;
      } catch (error) {
        results.errors.push({
          test: 'databaseConnection',
          message: `Database connection failed: ${error.message}`,
          details: error.toString()
        });
      }
      
      // Specific Railway database checks if in Railway environment
      if (results.railwaySpecificChecks.isRailwayEnvironment) {
        results.railwaySpecificChecks.recommendations = [
          'Verify DATABASE_URL environment variable is properly set in Railway',
          'Check if your PostgreSQL service is running in Railway',
          'Make sure your app has the correct connection parameters',
          'Verify network connectivity between your Railway services'
        ];
      }
      
      return results;
    } catch (error) {
      console.error('Error running health check:', error);
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