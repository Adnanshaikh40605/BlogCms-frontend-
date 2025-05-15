// src/api/apiMocks.js - Helper file for local development CORS issues
// This file provides mock data for local development when backend is unreachable

const mockPosts = [
  {
    id: 1,
    title: "Sample Blog Post 1",
    slug: "sample-blog-post-1",
    content: "<p>This is a sample blog post for development.</p>",
    excerpt: "This is a sample blog post for development.",
    featured_image: null,
    author: "Developer",
    category: "Development",
    status: "published",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    comments_count: 0,
    likes_count: 0
  },
  {
    id: 2,
    title: "Sample Blog Post 2",
    slug: "sample-blog-post-2",
    content: "<p>This is another sample blog post for development.</p>",
    excerpt: "This is another sample blog post for development.",
    featured_image: null,
    author: "Developer",
    category: "Testing",
    status: "published",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    comments_count: 0,
    likes_count: 0
  }
];

const mockComments = [];

// Function to handle API fallback
export const handleApiWithFallback = async (apiCall, mockData) => {
  try {
    return await apiCall();
  } catch (error) {
    console.warn('API call failed, using mock data:', error.message);
    console.info('Using mock data for development');
    return mockData;
  }
};

export const mockAPI = {
  posts: {
    getAll: () => [...mockPosts],
    getById: (id) => mockPosts.find(post => post.id === parseInt(id)) || null
  },
  comments: {
    getAll: () => [...mockComments],
    getForPost: () => []
  }
};

export default { handleApiWithFallback, mockAPI }; 