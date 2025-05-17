import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { postAPI, mediaAPI } from '../api/apiService';
import BlogHeader from '../components/BlogHeader';
import BlogFooter from '../components/BlogFooter';
import SEO from '../components/SEO';
import Image from '../components/Image';
import placeholderImage from '../assets/placeholder-image.js';

const PageContainer = styled.div`
  font-family: 'Inter', sans-serif;
  background-color: #fff;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 3rem;
`;

const BlogTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
`;

const BlogSubtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
`;

const SearchContainer = styled.div`
  max-width: 550px;
  margin: 2.5rem auto;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  
  &:focus {
    border-color: #0066cc;
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
`;

const BlogGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const BlogPost = styled.article`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const FeaturedImageContainer = styled.div`
  width: 100%;
  height: 200px;
  position: relative;
  overflow: hidden;
  background-color: #f3f3f3;
`;

const FeaturedImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PostContent = styled.div`
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const PostMeta = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  color: #666;
  font-size: 0.85rem;
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

const PostTitle = styled.h2`
  font-size: 1.4rem;
  color: #333;
  margin-bottom: 0.75rem;
  font-weight: 600;
  line-height: 1.3;

  a {
    color: inherit;
    text-decoration: none;
    
    &:hover {
      color: #0066cc;
    }
  }
`;

const PostExcerpt = styled.p`
  color: #555;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  flex-grow: 1;
`;

const ReadMoreButton = styled(Link)`
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #ffcc00;
  color: #333;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  align-self: flex-start;

  &:hover {
    background-color: #ffd633;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 4rem;
  color: #666;
  font-size: 1.1rem;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 4rem;
  color: #dc3545;
  font-size: 1.1rem;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 3rem;
  gap: 0.5rem;
`;

const PageButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${props => props.$active ? '#333' : '#f8f8f8'};
  color: ${props => props.$active ? 'white' : '#333'};
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.$active ? '#333' : '#e9e9e9'};
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

// Cache for blog posts list
let postsCache = null;

const BlogListPage = () => {
  const location = useLocation();
  const [posts, setPosts] = useState(() => postsCache || []);
  const [loading, setLoading] = useState(!postsCache);
  const [visibleLoading, setVisibleLoading] = useState(!postsCache);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [postsPerPage] = useState(9);
  const initialLoad = useRef(!postsCache);
  const isMounted = useRef(true);
  const mainContentRef = useRef(null);
  
  // Check if this is a category page
  const isCategoryPage = location.pathname.startsWith('/blog/category/');
  const category = isCategoryPage ? decodeURIComponent(location.pathname.split('/blog/category/')[1]) : null;
  
  // Generate appropriate page title and description
  const pageTitle = category 
    ? `${category} Articles - Blog CMS`
    : 'Blog - Latest Articles and Insights';
  const pageDescription = category 
    ? `Read our latest articles about ${category.toLowerCase()} and stay updated with the newest trends and insights.`
    : 'Explore our blog for the latest articles, insights, and updates from our team.';

  // Scroll to top on navigation
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Show the loading overlay
  useEffect(() => {
    if (loading && !visibleLoading && initialLoad.current) {
      const timer = setTimeout(() => {
        if (isMounted.current) {
          setVisibleLoading(true);
        }
      }, 200);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [loading, visibleLoading]);

  useEffect(() => {
    isMounted.current = true;
    
    const fetchPosts = async () => {
      if (postsCache && initialLoad.current) {
        // Use cache for first load to prevent flickering
        setPosts(postsCache);
        setLoading(false);
        setVisibleLoading(false);
        initialLoad.current = false;
        
        // Still update in the background
        try {
          const data = await postAPI.getAll();
          if (isMounted.current) {
            // Ensure we're getting an array from the API response
            const postsArray = Array.isArray(data.results) ? data.results : 
                              (Array.isArray(data) ? data : []);
            postsCache = postsArray;
            setPosts(postsArray);
          }
        } catch (err) {
          console.error('Error updating cached blog posts:', err);
        }
        
        return;
      }
      
      try {
        setLoading(true);
        // Small delay before showing the loading overlay
        const loadingTimer = setTimeout(() => {
          if (isMounted.current && loading) {
            setVisibleLoading(true);
          }
        }, 200);
        
        const data = await postAPI.getAll();
        console.log('Fetched blog posts:', data);
        
        clearTimeout(loadingTimer);
        
        if (isMounted.current) {
          // Ensure we're getting an array from the API response
          const postsArray = Array.isArray(data.results) ? data.results : 
                            (Array.isArray(data) ? data : []);
          postsCache = postsArray;
          setPosts(postsArray);
          
          // Add a small delay before hiding loading states for smoother transition
          setTimeout(() => {
            if (isMounted.current) {
              setLoading(false);
              setVisibleLoading(false);
            }
          }, 300);
        }
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        if (isMounted.current) {
          setError('Failed to load blog posts. Please try again later.');
          setLoading(false);
          setVisibleLoading(false);
        }
      }
    };

    fetchPosts();
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Make sure posts is an array before filtering
  const filteredPosts = Array.isArray(posts) ? posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : [];

  const renderContent = () => {
    if (loading && !posts.length) {
      return <LoadingMessage>Loading blog posts...</LoadingMessage>;
    }

    if (error) {
      return <ErrorMessage>{error}</ErrorMessage>;
    }

    return (
      <FadeIn>
        <Header>
          <BlogTitle>{category ? `${category} Articles` : 'Our Blog'}</BlogTitle>
          <BlogSubtitle>
            {category
              ? `Explore our latest articles about ${category.toLowerCase()}`
              : 'Insights, news, and expert perspectives from our team to help you stay informed.'}
          </BlogSubtitle>
        </Header>
        
        <SearchContainer>
          <SearchInput 
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchIcon aria-hidden="true">🔍</SearchIcon>
        </SearchContainer>

        <BlogGrid>
          {filteredPosts.map(post => (
            <BlogPost key={post.id}>
              <FeaturedImageContainer>
                {post.featured_image && (
                  <FeaturedImage 
                    src={post.featured_image} 
                    alt={post.title}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = placeholderImage;
                    }}
                  />
                )}
              </FeaturedImageContainer>
              <PostContent>
                <PostTitle>
                  <Link to={`/blog/${post.id}`}>{post.title}</Link>
                </PostTitle>
                <PostExcerpt>
                  {post.excerpt || 'Click to read more about our professional driving services and insights.'}
                </PostExcerpt>
                <PostMeta>
                  <PostDate>{new Date(post.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</PostDate>
                  <ReadTime>{post.read_time || '5 min read'}</ReadTime>
                </PostMeta>
                <ReadMoreButton to={`/blog/${post.id}`}>
                  Read More
                </ReadMoreButton>
              </PostContent>
            </BlogPost>
          ))}
        </BlogGrid>
      </FadeIn>
    );
  };

  return (
    <PageContainer>
      {/* SEO Meta Tags */}
      <SEO 
        title={pageTitle}
        description={pageDescription}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        type="website"
      />
      
      <LoadingOverlay $isVisible={visibleLoading}>
        <Spinner />
      </LoadingOverlay>
      <BlogHeader activeTab="blog" />
      <MainContent ref={mainContentRef}>
        <Header>
          <BlogTitle>{category ? `${category} Articles` : 'Our Blog'}</BlogTitle>
          <BlogSubtitle>
            {category
              ? `Explore our latest articles about ${category.toLowerCase()}`
              : 'Insights, news, and expert perspectives from our team to help you stay informed.'}
          </BlogSubtitle>
          
          <SearchContainer>
            <SearchInput 
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon aria-hidden="true">🔍</SearchIcon>
          </SearchContainer>
        </Header>
        
        {renderContent()}
        
        <Pagination>
          <PageButton 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1}
          >
            Previous
          </PageButton>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <PageButton 
              key={page} 
              $active={page === currentPage}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </PageButton>
          ))}
          
          <PageButton 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
          >
            Next
          </PageButton>
        </Pagination>
      </MainContent>
      <BlogFooter />
    </PageContainer>
  );
};

export default BlogListPage; 