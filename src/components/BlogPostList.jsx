import { useState, useEffect } from 'react';
import { postAPI } from '../api/apiService';

const BlogPostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        // Get published posts with pagination
        const data = await postAPI.getAll({ 
          published: true, 
          page: page, 
          page_size: 5 
        });
        
        // Calculate total pages if pagination info is available
        const count = data.count || data.results.length;
        const calculatedTotalPages = Math.ceil(count / 5);
        
        setPosts(data.results || []);
        setTotalPages(calculatedTotalPages || 1);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError('Failed to load blog posts. Please try again later.');
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page]);

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  if (loading) return <div>Loading posts...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="blog-posts-container">
      <h1>Latest Blog Posts</h1>
      {posts.length === 0 ? (
        <p>No posts available.</p>
      ) : (
        <>
          <div className="post-grid">
            {posts.map((post) => (
              <div key={post.id} className="blog-post-card">
                {post.featured_image && (
                  <div className="post-image">
                    <img 
                      src={post.featured_image} 
                      alt={post.title} 
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                      }}
                    />
                  </div>
                )}
                <div className="post-content">
                  <h2 className="post-title">{post.title}</h2>
                  <div className="post-date">
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                  <div className="post-excerpt">
                    {post.content.substring(0, 150)}...
                  </div>
                  <a href={`/blog/${post.id}`} className="read-more">
                    Read More
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={handlePrevPage} 
                disabled={page === 1}
                className="pagination-button"
              >
                Previous
              </button>
              <span className="page-info">
                Page {page} of {totalPages}
              </span>
              <button 
                onClick={handleNextPage} 
                disabled={page === totalPages}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BlogPostList; 