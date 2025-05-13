import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useBlog } from '../context/BlogContext';
import { useComments } from '../context/CommentContext';
import CommentForm from '../components/CommentForm';
import Comment from '../components/Comment';
import { formatDate } from '../utils/dateUtils';
import { sanitizeBlogContent } from '../utils/sanitize';
import BlogHeader from '../components/BlogHeader';
import BlogFooter from '../components/BlogFooter';
import placeholderImage from '../assets/placeholder-image.js';
import { postAPI, commentAPI, mediaAPI } from '../api/apiService';

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

const BlogPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchPost, loading: blogLoading, error: blogError } = useBlog();
  const { comments: contextComments, fetchComments: contextFetchComments, createComment: contextCreateComment, loadMoreComments: contextLoadMoreComments, loading: commentsLoading } = useComments();
  const [post, setPost] = useState(() => postCache.get(id) || null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [pageLoading, setPageLoading] = useState(!post);
  const [visibleLoading, setVisibleLoading] = useState(!post);
  const [errorState, setError] = useState(null);
  const contentRef = useRef(null);
  const initialLoad = useRef(true);
  const commentsLoaded = useRef(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const isMounted = useRef(true);

  // Scroll to top when navigating to a new post
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [id, location.pathname]);

  useEffect(() => {
    isMounted.current = true;
    
    // If we have cached data, show it immediately
    if (postCache.has(id)) {
      setPost(postCache.get(id));
      if (initialLoad.current) {
        setPageLoading(false);
        setVisibleLoading(false);
        initialLoad.current = false;
      } else {
        // Still show briefly that we're loading new content
        setPageLoading(true);
        // But don't show the overlay for cached content
        setVisibleLoading(false);
        
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
      
      // Small delay before showing loading overlay to prevent flash
      const loadingTimer = setTimeout(() => {
        if (isMounted.current && pageLoading) {
          setVisibleLoading(true);
        }
      }, 200);
      
      return () => {
        clearTimeout(loadingTimer);
      };
    }

    // Reset comments loaded state when post ID changes
    commentsLoaded.current = false;
    
  }, [id]);

  useEffect(() => {
    isMounted.current = true;
    
    const loadPost = async () => {
      try {
        if (!isMounted.current) return;
        
        // Start loading
        setPageLoading(true);
        
        // Fetch the post data
        let postData;
        try {
          postData = await postAPI.getById(id);
        } catch (err) {
          console.error('Error fetching post data:', err);
          if (isMounted.current) {
            setError('Failed to load post');
            setPageLoading(false);
            setVisibleLoading(false);
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
            setVisibleLoading(false);
          }
        }, 300);
      } catch (err) {
        console.error('Error loading post:', err);
        if (isMounted.current) {
          setPageLoading(false);
          setVisibleLoading(false);
        }
      }
    };
    
    loadPost();
    
    return () => {
      isMounted.current = false;
    };
  }, [id]);

  // Separate effect for loading comments to prevent infinite loop
  useEffect(() => {
    if (id && post && !commentsLoaded.current) {
      // Only load comments after post is loaded and only ONCE
      contextFetchComments(id);
      commentsLoaded.current = true;
    }
  }, [id, post, contextFetchComments]);

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
      
      // Add the post ID to the comment data
      const fullCommentData = {
        ...commentData,
        post: id
      };
      
      // Use the new commentAPI service
      await commentAPI.create(fullCommentData);
      
      setCommentSubmitted(true);
      setShowCommentForm(false);
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to submit comment. Please try again later.');
    } finally {
      setPageLoading(false);
    }
  };

  const handleLoadMoreComments = async () => {
    await contextLoadMoreComments(id);
  };

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
    const title = post?.title || '';
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
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
              src={post.featured_image} 
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
                      src={relatedPost.featured_image} 
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
        
        {/* Comment section */}
        <CommentForm 
          postId={id}
          onCommentSubmitted={handleCommentSubmit} 
          showCommentForm={showCommentForm}
          setShowCommentForm={setShowCommentForm}
        />
        
        {contextComments && contextComments.length > 0 ? (
          <>
            {contextComments.map(comment => (
              <Comment key={comment.id} comment={comment} />
            ))}
            
            <button onClick={handleLoadMoreComments} disabled={commentsLoading}>
              {commentsLoading ? 'Loading more comments...' : 'Load more comments'}
            </button>
          </>
        ) : (
          <Message>No comments yet. Be the first to comment!</Message>
        )}
      </FadeIn>
    );
  };

  return (
    <PageContainer>
      <LoadingOverlay $isVisible={visibleLoading}>
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