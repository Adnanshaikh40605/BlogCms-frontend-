import { useState, useEffect } from 'react';
import { postAPI, commentAPI } from '../api/apiService';
import CommentList from './CommentList';

const BlogPostDetail = ({ postId }) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState({ content: '', author: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await postAPI.getById(postId);
        setPost(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError('Failed to load blog post. Please try again later.');
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const handleCommentChange = (e) => {
    const { name, value } = e.target;
    setNewComment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.content.trim()) {
      setSubmitError('Comment cannot be empty');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      await commentAPI.create({
        post: postId,
        content: newComment.content,
        author: newComment.author || 'Anonymous'
      });
      
      setNewComment({ content: '', author: '' });
      setSubmitSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error("Error submitting comment:", err);
      setSubmitError('Failed to submit comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading post...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div className="blog-post-detail">
      <h1 className="post-title">{post.title}</h1>
      
      <div className="post-meta">
        <span className="post-date">Published on: {new Date(post.created_at).toLocaleDateString()}</span>
        {post.updated_at !== post.created_at && (
          <span className="post-updated">Updated on: {new Date(post.updated_at).toLocaleDateString()}</span>
        )}
      </div>
      
      {post.featured_image && (
        <div className="featured-image">
          <img 
            src={post.featured_image} 
            alt={post.title} 
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/800x400?text=No+Image';
            }}
          />
        </div>
      )}
      
      <div 
        className="post-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      
      <div className="comments-section">
        <h2>Comments</h2>
        
        <div className="comment-form-container">
          <h3>Leave a Comment</h3>
          
          {submitSuccess && (
            <div className="success-message">
              Comment submitted successfully! It will appear after approval.
            </div>
          )}
          
          {submitError && (
            <div className="error-message">{submitError}</div>
          )}
          
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <div className="form-group">
              <label htmlFor="author">Name (optional):</label>
              <input
                type="text"
                id="author"
                name="author"
                value={newComment.author}
                onChange={handleCommentChange}
                placeholder="Anonymous"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="content">Comment:</label>
              <textarea
                id="content"
                name="content"
                value={newComment.content}
                onChange={handleCommentChange}
                placeholder="Write your comment here..."
                rows={4}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Comment'}
            </button>
          </form>
        </div>
        
        <CommentList postId={postId} />
      </div>
    </div>
  );
};

export default BlogPostDetail; 