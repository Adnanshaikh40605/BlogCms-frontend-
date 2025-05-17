import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useBlog } from '../context/BlogContext';
import CommentForm from '../components/CommentForm';
import Comment from '../components/Comment';
import { formatDate } from '../utils/dateUtils';
import { sanitizeBlogContent } from '../utils/sanitize';
import BlogHeader from '../components/BlogHeader';
import BlogFooter from '../components/BlogFooter';
import placeholderImage from '../assets/placeholder-image.js';
import { postAPI, mediaAPI } from '../api/apiService';
import usePostComments from '../hooks/usePostComments';

const PageContainer = styled.div`
  font-family: 'Inter', sans-serif;
  background-color: #fff;
`;

const MainContent = styled.main`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const Breadcrumb = styled.div`
  display: flex;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  
  a {
    color: #0066cc;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const PostHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const PostTitle = styled.h1`
  font-size: 2.2rem;
  color: #333;
  margin-bottom: 1rem;
  line-height: 1.3;
  font-weight: 700;
`;

const PostMeta = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 2rem;
`;

const PostDate = styled.span`
  color: #666;
`;

const ReadTime = styled.span`
  color: #666;
  &:before {
    content: "•";
    margin: 0 0.5rem;
  }
`;

const FeaturedImageContainer = styled.div`
  width: 100%;
  position: relative;
  margin-bottom: 2rem;
  background-color: #f3f3f3;
  border-radius: 8px;
  overflow: hidden;
  
  &::before {
    content: "";
    display: block;
    padding-top: 56.25%; /* 16:9 Aspect Ratio */
  }
`;

const FeaturedImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const PostContent = styled.div`
  font-size: 1.05rem;
  line-height: 1.8;
  color: #444;
  
  h2 {
    font-size: 1.6rem;
    margin: 2rem 0 1rem;
    color: #333;
    font-weight: 600;
  }

  h3 {
    font-size: 1.4rem;
    margin: 1.8rem 0 0.8rem;
    color: #333;
    font-weight: 600;
  }
  
  p {
    margin-bottom: 1.5rem;
  }
  
  ul, ol {
    margin-bottom: 1.5rem;
    padding-left: 1.5rem;
  }
  
  li {
    margin-bottom: 0.5rem;
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1.5rem 0;
  }

  blockquote {
    border-left: 4px solid #ffcc00;
    padding-left: 1rem;
    margin: 1.5rem 0;
    font-style: italic;
    color: #555;
  }

  /* CKEditor 5 specific styles */
  figure {
    margin: 2rem 0;
    text-align: center;
    
    &.image {
      img {
        margin: 0 auto;
      }
    }
    
    figcaption {
      font-size: 0.9rem;
      color: #666;
      margin-top: 0.5rem;
    }
  }
  
  figure.table {
    overflow-x: auto;
    width: 100%;
    margin: 2rem 0;
    
    table {
      width: 100%;
      border-collapse: collapse;
      
      th, td {
        border: 1px solid #e0e0e0;
        padding: 0.5rem;
      }
      
      th {
        background-color: #f5f5f5;
        font-weight: 600;
      }
      
      tr:nth-child(even) {
        background-color: #f9f9f9;
      }
    }
    
    figcaption {
      font-style: italic;
      margin-top: 0.5rem;
      text-align: center;
      font-size: 0.9rem;
      color: #666;
    }
  }
  
  pre {
    background-color: #f5f5f5;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    margin: 1.5rem 0;
    
    code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 0.9rem;
    }
  }
  
  code {
    background-color: #f5f5f5;
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9rem;
  }
  
  .table-of-contents {
    background-color: #f9f9f9;
    padding: 1rem;
    border-radius: 4px;
    margin: 2rem 0;
    
    ol, ul {
      margin-bottom: 0;
    }
  }
  
  iframe {
    max-width: 100%;
    margin: 1.5rem 0;
    border: none;
    border-radius: 8px;
  }
`;

const ShareSection = styled.div`
  margin: 3rem 0;
  padding: 1.5rem;
  background: #f8f8f8;
  border-radius: 8px;
  text-align: center;
  
  h3 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    color: #333;
  }
`;

const ShareButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const ShareButton = styled.button`
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: opacity 0.2s;
  font-size: 0.9rem;
  
  &:hover {
    opacity: 0.9;
  }
  
  &.twitter {
    background-color: #1DA1F2;
    color: white;
  }
  
  &.facebook {
    background-color: #4267B2;
    color: white;
  }
  
  &.linkedin {
    background-color: #0077B5;
    color: white;
  }
`;

const RelatedPostsSection = styled.div`
  margin-top: 3rem;
  
  h2 {
    font-size: 1.6rem;
    margin-bottom: 1.5rem;
    text-align: center;
    color: #333;
  }
`;

const RelatedPostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const RelatedPostCard = styled.div`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const RelatedPostImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
`;

const RelatedPostContent = styled.div`
  padding: 1rem;
`;

const RelatedPostTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  
  a {
    color: #333;
    text-decoration: none;
    
    &:hover {
      color: #0066cc;
    }
  }
`;

const RelatedPostMeta = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

const Message = styled.p`
  text-align: center;
  color: #666;
  padding: 2rem;
  background-color: #f8f9f9;
  border-radius: 8px;
  margin: 2rem 0;
`;

const PageSubtitle = styled.p`
  text-align: center;
  font-size: 1.1rem;
  color: #666;
  max-width: 700px;
  margin: 0 auto 2rem;
  line-height: 1.6;
`;

const CtaSection = styled.div`
  margin: 3rem 0;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  text-align: center;
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #333;
  }
  
  p {
    color: #666;
    margin-bottom: 1.5rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
`;

const CtaButton = styled.a`
  display: inline-block;
  padding: 0.8rem 1.5rem;
  background-color: #ffcc00;
  color: #333;
  font-weight: 600;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #ffd633;
  }
`;

// Add fade-in animation for smooth transitions
const FadeIn = styled.div`
  animation: fadeIn 0.3s ease-in-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

// Add a loading overlay component
const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: ${props => props.$isVisible ? 1 : 0};
  visibility: ${props => props.$isVisible ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 204, 0, 0.3);
  border-radius: 50%;
  border-top-color: #ffcc00;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// Global post cache to store loaded posts
const postCache = new Map();

const CommentsSection = styled.div`
  margin-top: 3rem;
  border-top: 1px solid #eaeaea;
  padding-top: 2rem;
`;

const CommentsHeader = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
`;

const CommentsList = styled.div`
  margin-bottom: 2rem;
`;

const LoadMoreButton = styled.button`
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  margin: 1rem auto;
  display: block;
  
  &:hover {
    background-color: #e5e5e5;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BlogPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const contentRef = useRef(null);
  const initialLoad = useRef(true);
  const isMounted = useRef(true);
  
  // Local state
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [showCommentForm, setShowCommentForm] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [errorState, setError] = useState(null);
  
  // Use the custom comments hook
  const {
    comments,
    loading: commentsLoading,
    error: commentsError,
    hasMore: hasMoreComments,
    commentSubmitted,
    submittingComment,
    loadMore: loadMoreComments,
    submitComment,
    setCommentSubmitted
  } = usePostComments(id);
  
  // Context
  const { fetchPost, blogError } = useBlog();

  // Scroll to top when navigating to a new post
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [id, pathname]);

  useEffect(() => {
    isMounted.current = true;
    
    // If we have cached data, show it immediately
    if (postCache.has(id)) {
      setPost(postCache.get(id));
      if (initialLoad.current) {
        setPageLoading(false);
        initialLoad.current = false;
      } else {
        // Still show briefly that we're loading new content
        setPageLoading(true);
        
        // Hide loading after a small delay
        const timer = setTimeout(() => {
          if (isMounted.current) {
            setPageLoading(false);
          }
        }, 300);
        
        return () => {
          clearTimeout(timer);
        };
      }
    } else {
      // Show loading indicators for uncached content
      setPageLoading(true);
    }
  }, [id]);

  useEffect(() => {
    isMounted.current = true;
    
    const loadPost = async () => {
      try {
        if (!isMounted.current) return;
        
        // Fetch the post data
        let postData;
        try {
          postData = await postAPI.getById(id);
        } catch (err) {
          console.error('Error fetching post data:', err);
          if (isMounted.current) {
            setError('Failed to load post');
            setPageLoading(false);
          }
          return;
        }
        
        if (!isMounted.current) return;
        
        // Update state with post data
        setPost(postData);
        
        // Store in cache for future use
        postCache.set(id, postData);
        
        // Fetch related posts
        const related = await getRelatedPosts(postData);
        if (isMounted.current) {
          setRelatedPosts(related);
        }
        
        // Track view
        trackPostView(id);
        
        // Add a small delay before removing loading state for smoother transition
        setTimeout(() => {
          if (isMounted.current) {
            setPageLoading(false);
          }
        }, 300);
      } catch (err) {
        console.error('Error loading post:', err);
        if (isMounted.current) {
          setPageLoading(false);
        }
      }
    };
    
    loadPost();
    
    return () => {
      isMounted.current = false;
    };
  }, [id]);

  // Placeholder for related posts function
  const getRelatedPosts = async (currentPost) => {
    // In a real implementation, you'd fetch related posts based on tags, category, etc.
    // For now, we'll return empty array or mock data
    return []; 
  };
  
  // Placeholder for tracking views
  const trackPostView = async (postId) => {
    // Implement view tracking logic
  };

  const handleKeyDown = (e) => {
    // Navigation keyboard shortcuts
    if (e.altKey) {
      switch(e.key) {
        case 'ArrowLeft':
          navigate('/blog');
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleCommentSubmit = async (commentData) => {
    try {
      setPageLoading(true);
      await submitComment(commentData);
      setShowCommentForm(false);
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to submit comment. Please try again later.');
    } finally {
      setPageLoading(false);
    }
  };

  // Add back the share functions that were previously removed
  const shareOnTwitter = () => {
    const url = window.location.href;
    const text = post?.title || 'Check out this post';
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = window.location.href;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };
  
  const shareOnWhatsApp = () => {
    const url = window.location.href;
    const text = post?.title || 'Check out this post';
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}%20${encodeURIComponent(url)}`, '_blank');
  };

  const renderContent = () => {
    if (pageLoading && !post) {
      return <Message>Loading post...</Message>;
    }

    if (errorState || blogError || !post) {
      return (
        <>
          <Message>Failed to load this post. Please try again later.</Message>
          <Link to="/blog">← Back to Blog</Link>
        </>
      );
    }

    return (
      <FadeIn>
        <Breadcrumb>
          <Link to="/">Home</Link> / <Link to="/blog">Blog</Link> / <span>{post.title}</span>
        </Breadcrumb>
        
        <PostHeader>
          <PostTitle>{post.title}</PostTitle>
          <PostMeta>
            <PostDate>{formatDate(post.created_at)}</PostDate>
            <ReadTime>{post.read_time || '5 min read'}</ReadTime>
          </PostMeta>
        </PostHeader>
        
        {post.featured_image && (
          <FeaturedImageContainer>
            <FeaturedImage 
              src={mediaAPI.getImageUrl(post.featured_image)} 
              alt={post.title}
              loading="lazy"
              onError={(e) => {
                e.target.src = placeholderImage;
              }}
            />
          </FeaturedImageContainer>
        )}
        
        <PostContent 
          ref={contentRef}
          className="ck-content"
          dangerouslySetInnerHTML={{ __html: sanitizeBlogContent(post.content) }} 
        />
        
        <CtaSection>
          <h3>Need a Professional Driver in Pune?</h3>
          <p>Planning a long journey from Pune? Book a professional driver from Driveronhire for a safe, comfortable, and stress-free travel experience.</p>
          <CtaButton href="https://driveronhire.com" target="_blank">Hire a Driver Now</CtaButton>
        </CtaSection>
        
        <ShareSection>
          <h3>Share this post</h3>
          <ShareButtons>
            <ShareButton className="twitter" onClick={shareOnTwitter}>
              Twitter
            </ShareButton>
            <ShareButton className="facebook" onClick={shareOnFacebook}>
              Facebook
            </ShareButton>
            <ShareButton className="linkedin" onClick={shareOnLinkedIn}>
              LinkedIn
            </ShareButton>
            <ShareButton className="whatsapp" onClick={shareOnWhatsApp}>
              WhatsApp
            </ShareButton>
          </ShareButtons>
        </ShareSection>
        
        {relatedPosts.length > 0 && (
          <RelatedPostsSection>
            <h2>You might also like</h2>
            <RelatedPostsGrid>
              {relatedPosts.map(relatedPost => (
                <RelatedPostCard key={relatedPost.id}>
                  {relatedPost.featured_image && (
                    <RelatedPostImage 
                      src={mediaAPI.getImageUrl(relatedPost.featured_image)} 
                      alt={relatedPost.title}
                      onError={(e) => {
                        e.target.src = placeholderImage;
                      }}
                    />
                  )}
                  <RelatedPostContent>
                    <RelatedPostTitle>
                      <Link to={`/blog/${relatedPost.id}`}>{relatedPost.title}</Link>
                    </RelatedPostTitle>
                    <RelatedPostMeta>
                      {formatDate(relatedPost.created_at)} • {relatedPost.read_time || '5 min read'}
                    </RelatedPostMeta>
                  </RelatedPostContent>
                </RelatedPostCard>
              ))}
            </RelatedPostsGrid>
          </RelatedPostsSection>
        )}
        
        {/* Comment section - Updated to use our custom hook */}
        <CommentsSection>
          <CommentsHeader>Comments</CommentsHeader>
          
          <CommentForm 
            postId={id}
            onCommentSubmitted={handleCommentSubmit} 
            showCommentForm={showCommentForm}
            setShowCommentForm={setShowCommentForm}
            isSubmitting={submittingComment}
          />
          
          {commentSubmitted && (
            <Message>
              Thank you for your comment! It will be visible after approval.
            </Message>
          )}
          
          {commentsLoading && comments.length === 0 ? (
            <Message>Loading comments...</Message>
          ) : commentsError ? (
            <Message>{commentsError}</Message>
          ) : comments.length > 0 ? (
            <CommentsList>
              {comments.map(comment => (
                <Comment 
                  key={comment.id} 
                  comment={comment} 
                  showActionButtons={false}
                />
              ))}
              
              {hasMoreComments && (
                <LoadMoreButton 
                  onClick={loadMoreComments} 
                  disabled={commentsLoading}
                >
                  {commentsLoading ? 'Loading more comments...' : 'Load more comments'}
                </LoadMoreButton>
              )}
            </CommentsList>
          ) : (
            <Message>No comments yet. Be the first to comment!</Message>
          )}
        </CommentsSection>
      </FadeIn>
    );
  };

  return (
    <PageContainer>
      <LoadingOverlay $isVisible={pageLoading}>
        <Spinner />
      </LoadingOverlay>
      <BlogHeader activePage="blog" />
      <MainContent>
        {renderContent()}
      </MainContent>
      <BlogFooter />
    </PageContainer>
  );
};

export default BlogPostPage;