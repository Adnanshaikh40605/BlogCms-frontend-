import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postAPI, mediaAPI } from '../api/apiService';

const BlogPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch blog posts when component mounts
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      
      // Use the postAPI service to get all posts
      const data = await postAPI.getAll();
      console.log('Fetched blog posts:', data);
      
      // For paginated responses from Django REST Framework
      setPosts(Array.isArray(data.results) ? data.results : 
               (Array.isArray(data) ? data : []));
               
      setError(null);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError('Failed to load blog posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading blog posts...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="blog-posts">
      <h1>Blog Posts</h1>
      
      {posts.length === 0 ? (
        <p>No blog posts found.</p>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              {post.featured_image && (
                <img 
                  src={mediaAPI.getImageUrl(post.featured_image)} 
                  alt={post.title} 
                  className="featured-image"
                />
              )}
              
              <div className="post-content">
                <h2>{post.title}</h2>
                
                <div className="post-meta">
                  <span className="date">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                  
                  {post.published ? (
                    <span className="status published">Published</span>
                  ) : (
                    <span className="status draft">Draft</span>
                  )}
                </div>
                
                <div 
                  className="post-excerpt"
                  dangerouslySetInnerHTML={{ 
                    __html: post.content && typeof post.content === 'string' 
                      ? post.content.substring(0, 150) + '...' 
                      : 'No content available'
                  }} 
                />
                
                <Link to={`/blog/${post.id}`} className="read-more-button">
                  Read More
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogPosts; 