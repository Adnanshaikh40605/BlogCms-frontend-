import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import BlogPostCard from './BlogPostCard';
import SkeletonLoader from './SkeletonLoader';
import { postAPI } from '../api/apiService';

const PostsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const ErrorMessage = styled.div`
  padding: 1.5rem;
  background-color: #fff8f8;
  border-left: 4px solid #dc3545;
  border-radius: 4px;
  color: #dc3545;
`;

const LoadMoreButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  margin: 1rem auto;
  display: block;
  
  &:hover {
    background-color: #0055aa;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const LoaderContainer = styled.div`
  text-align: center;
  padding: 1rem;
`;

const BlogPostList = ({ 
  limit = 6, 
  loadMoreIncrement = 3, 
  showLoadMore = true,
  filter = {},
  title = "Latest Posts" 
}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visiblePostCount, setVisiblePostCount] = useState(limit);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch posts when component mounts or filter changes
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query params from filter object
        const response = await postAPI.getAll({
          ...filter,
          limit: 100 // Get more than we need to check if there are more
        });
        
        if (!Array.isArray(response)) {
          // Handle paginated response
          if (response.results && Array.isArray(response.results)) {
            setPosts(response.results);
            setHasMore(!!response.next);
          } else {
            throw new Error('Invalid response format');
          }
        } else {
          // Handle direct array response
          setPosts(response);
          setHasMore(response.length > visiblePostCount);
        }
        
        setInitialLoad(false);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load blog posts. Please try again later.');
        setInitialLoad(false);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [filter]);

  // Handle load more click
  const handleLoadMore = () => {
    setLoadingMore(true);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      setVisiblePostCount(prev => prev + loadMoreIncrement);
      setLoadingMore(false);
      
      // Check if we have more posts to show
      setHasMore(posts.length > visiblePostCount + loadMoreIncrement);
    }, 500);
  };

  // Show skeleton loader during initial load
  if (initialLoad) {
    return (
      <div>
        <h2>{title}</h2>
        <PostsContainer>
          <SkeletonLoader variant="card" count={limit} />
        </PostsContainer>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  const visiblePosts = posts.slice(0, visiblePostCount);

  return (
    <div>
      <h2>{title}</h2>
      
      {visiblePosts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <>
          <PostsContainer>
            {visiblePosts.map(post => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </PostsContainer>
          
          {showLoadMore && hasMore && (
            loadingMore ? (
              <LoaderContainer>
                <SkeletonLoader variant="text" width="120px" height="40px" />
              </LoaderContainer>
            ) : (
              <LoadMoreButton onClick={handleLoadMore}>
                Load More
              </LoadMoreButton>
            )
          )}
        </>
      )}
    </div>
  );
};

export default BlogPostList; 