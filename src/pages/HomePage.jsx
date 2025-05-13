import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import BlogPostCard from '../components/BlogPostCard';
import Button from '../components/Button';
import { useBlog } from '../context/BlogContext';

const HomeContainer = styled.div`
  width: 100%;
`;

const Hero = styled.div`
  background-color: #e6f2ff;
  background-image: linear-gradient(135deg, #e6f2ff 0%, #f0f8ff 100%);
  padding: 5rem 2rem;
  border-radius: 8px;
  margin-bottom: 3rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 4rem 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 3rem 1rem;
    margin-bottom: 2rem;
  }
`;

const Title = styled.h1`
  font-size: 3rem;
  color: #333;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
    margin-bottom: 1.25rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  color: #666;
  margin-bottom: 2rem;
  max-width: 800px;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.125rem;
    margin-bottom: 1.25rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  color: #333;
  margin-bottom: 2rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
  width: 100%;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
    margin-bottom: 1.25rem;
  }
`;

const PostGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2.5rem;
  margin-bottom: 3rem;
  width: 100%;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const Message = styled.p`
  text-align: center;
  color: #6c757d;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  
  @media (max-width: 576px) {
    padding: 1.5rem 1rem;
  }
`;

const ViewAllLink = styled(Link)`
  display: block;
  text-align: center;
  margin-top: 1.5rem;
  color: #0066cc;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem;
  transition: all 0.2s;
  
  &:hover {
    text-decoration: underline;
    background-color: #f8f9fa;
    border-radius: 4px;
  }
`;

const SectionContainer = styled.div`
  margin-bottom: 4rem;
`;

const DashboardSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const DashboardCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
`;

const CardTitle = styled.h3`
  font-size: 1.4rem;
  color: #333;
  margin-bottom: 0.75rem;
`;

const CardDescription = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
  flex-grow: 1;
`;

const HomePage = () => {
  const { fetchPosts, loading, error } = useBlog();
  const [recentPosts, setRecentPosts] = useState([]);
  
  useEffect(() => {
    const loadRecentPosts = async () => {
      try {
        // Only fetch recent published posts limited to 3
        const data = await fetchPosts('published');
        
        // Only update state if data is valid (handle server errors)
        if (data && Array.isArray(data)) {
          setRecentPosts(data.slice(0, 3)); // Only show 3 most recent posts
        } else {
          console.warn('Received invalid data format from API');
          setRecentPosts([]);
        }
      } catch (err) {
        console.error('Error loading blog posts:', err);
        // Ensure we have empty posts array on error
        setRecentPosts([]);
      }
    };
    
    loadRecentPosts();
  }, [fetchPosts]);
  
  return (
    <HomeContainer>
      <Hero>
        <Title>Welcome to Blog CMS</Title>
        <Subtitle>
          Manage your blog content, view analytics, and engage with your audience
        </Subtitle>
        <ButtonContainer>
          <Button $variant="primary" as={Link} to="/posts/new">
            Create New Post
          </Button>
          <Button $variant="outline" as={Link} to="/blog">
            View Public Blog
          </Button>
        </ButtonContainer>
      </Hero>
      
      <SectionContainer>
        <SectionTitle>Admin Dashboard</SectionTitle>
        <DashboardSection>
          <DashboardCard>
            <CardTitle>Content Management</CardTitle>
            <CardDescription>
              Create, edit, and manage all your blog posts. Control publication status.
            </CardDescription>
            <Button $variant="primary" as={Link} to="/posts">
              Manage Posts
            </Button>
          </DashboardCard>
          
          <DashboardCard>
            <CardTitle>Comment Moderation</CardTitle>
            <CardDescription>
              Review, approve, and manage comments from your readers.
            </CardDescription>
            <Button $variant="primary" as={Link} to="/comments">
              Moderate Comments
            </Button>
          </DashboardCard>
        </DashboardSection>
      </SectionContainer>
      
      <SectionContainer>
        <SectionTitle>Recent Blog Posts</SectionTitle>
        
        {loading ? (
          <Message>Loading recent posts...</Message>
        ) : error ? (
          <Message>Error loading posts. Please try again later.</Message>
        ) : recentPosts.length === 0 ? (
          <Message>No posts yet. Create your first blog post!</Message>
        ) : (
          <>
            <PostGrid>
              {recentPosts.map(post => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </PostGrid>
            <ViewAllLink to="/blog">View all blog posts →</ViewAllLink>
          </>
        )}
      </SectionContainer>
    </HomeContainer>
  );
};

export default HomePage; 