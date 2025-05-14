import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import BlogPostCard from '../components/BlogPostCard';
import Button from '../components/Button';
import { postAPI } from '../api/apiService';

const Container = styled.div`
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  width: 100%;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin: 0;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 576px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const FilterButton = styled(Button)`
  opacity: ${props => (props.$active ? 1 : 0.6)};
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
  }
`;

const Message = styled.p`
  text-align: center;
  color: #6c757d;
  padding: 3rem;
  width: 100%;
  background-color: #f8f9fa;
  border-radius: 8px;
  
  @media (max-width: 576px) {
    padding: 2rem;
  }
`;

const PostListPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('published'); // Default to 'published' instead of 'all'
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        let params = {};
        if (filter === 'published') {
          params.published = true;
        } else if (filter === 'draft') {
          params.published = false;
        }
        
        const data = await postAPI.getAll(params);
        // Ensure we have an array before setting state
        setPosts(Array.isArray(data.results) ? data.results : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again later.');
        // Set posts to empty array on error
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [filter]);
  
  return (
    <Container>
      <Header>
        <Title>All Blog Posts</Title>
        <FilterContainer>
          <Button
            onClick={() => setFilter('all')}
            $variant={filter === 'all' ? 'primary' : 'outline'}
          >
            All Posts
          </Button>
          <Button
            onClick={() => setFilter('published')}
            $variant={filter === 'published' ? 'primary' : 'outline'}
          >
            Published
          </Button>
          <Button
            onClick={() => setFilter('draft')}
            $variant={filter === 'draft' ? 'primary' : 'outline'}
          >
            Drafts
          </Button>
        </FilterContainer>
      </Header>
      
      {loading ? (
        <Message>Loading posts...</Message>
      ) : error ? (
        <Message>{error}</Message>
      ) : posts.length === 0 ? (
        <Message>No posts found.</Message>
      ) : (
        <PostGrid>
          {/* Ensure posts is an array before mapping */}
          {Array.isArray(posts) && posts.map(post => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </PostGrid>
      )}
    </Container>
  );
};

export default PostListPage; 