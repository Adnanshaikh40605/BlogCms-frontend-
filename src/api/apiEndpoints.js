/**
 * API Endpoints for the Blog CMS
 * This file centralizes all API endpoint URLs to ensure consistency
 */

// Base API URL for proxying in development or direct access in production
const API_URL = import.meta.env.VITE_API_BASE_URL || '';

// Post Endpoints
export const POST_ENDPOINTS = {
  LIST: `${API_URL}/api/posts/`,
  DETAIL: (id) => `${API_URL}/api/posts/${id}/`,
  UPLOAD_IMAGES: (id) => `${API_URL}/api/posts/${id}/upload_images/`,
};

// Image Endpoints
export const IMAGE_ENDPOINTS = {
  LIST: `${API_URL}/api/images/`,
  DETAIL: (id) => `${API_URL}/api/images/${id}/`,
};

// Comment Endpoints
export const COMMENT_ENDPOINTS = {
  LIST: `${API_URL}/api/comments/`,
  DETAIL: (id) => `${API_URL}/api/comments/${id}/`,
  PENDING_COUNT: `${API_URL}/api/comments/pending-count/`,
  BULK_APPROVE: `${API_URL}/api/comments/bulk_approve/`,
  BULK_REJECT: `${API_URL}/api/comments/bulk_reject/`,
  APPROVE: (id) => `${API_URL}/api/comments/${id}/approve/`,
  REJECT: (id) => `${API_URL}/api/comments/${id}/reject/`,
  ALL_FOR_POST: `${API_URL}/api/comments/all/`,
};

// Media Endpoints
export const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || '/media/';

export default {
  POST_ENDPOINTS,
  IMAGE_ENDPOINTS,
  COMMENT_ENDPOINTS,
  MEDIA_URL,
}; 