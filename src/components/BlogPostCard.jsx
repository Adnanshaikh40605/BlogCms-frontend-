import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { formatDate } from '../utils/dateUtils';
import placeholderImage from '../assets/placeholder-image.js';

const Card = styled.div`
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background-color: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #eaeaea;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }
`;

const ImageContainer = styled.div`
  height: 200px;
  overflow: hidden;
  position: relative;
  background-color: #f3f3f3;
`;

const PostImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
`;

const PlaceholderImage = styled.div`
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  font-size: 0.8rem;
  
  &::after {
    content: "No image available";
  }
`;

const CardContent = styled.div`
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3`
  margin: 0 0 0.75rem 0;
  color: #333;
  font-size: 1.25rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
`;

const Excerpt = styled.p`
  margin: 0 0 1.25rem 0;
  color: #666;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: inline-block;
`;

const PostMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  font-size: 0.85rem;
  color: #6c757d;
`;

const PostDate = styled.span`
  font-size: 0.85rem;
`;

const ReadTime = styled.span`
  background-color: #f7df1e;
  color: #333;
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.75rem;
`;

const ReadMoreButton = styled(Link)`
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #ffcc00;
  color: #333;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  margin-top: 1rem;
  align-self: flex-start;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f0c000;
  }
`;

const BlogPostCard = ({ post }) => {
  // Protect against undefined post object
  if (!post) {
    return null;
  }
  
  // Handle error posts (marked with _error_occurred)
  if (post._error_occurred) {
    return (
      <Card>
        <CardContent>
          <Title style={{ color: '#dc3545' }}>{post.title}</Title>
          <Excerpt>{post.content}</Excerpt>
          <PostMeta>
            <PostDate>{formatDate(post.created_at)}</PostDate>
            <ReadTime>Error loading post</ReadTime>
          </PostMeta>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <ImageContainer>
        {post.featured_image ? (
          <PostImage 
            src={post.featured_image} 
            alt={post.title}
            onError={(e) => {
              e.target.src = placeholderImage;
            }}
          />
        ) : (
          <PlaceholderImage />
        )}
      </ImageContainer>
      <CardContent>
        <Title>
          <StyledLink to={`/blog/${post.id}`}>{post.title}</StyledLink>
        </Title>
        <Excerpt>
          {post.excerpt || 'Click to read more about our professional driving services and insights.'}
        </Excerpt>
        <PostMeta>
          <PostDate>{formatDate(post.created_at)}</PostDate>
          <ReadTime>{post.read_time || '5 min read'}</ReadTime>
        </PostMeta>
        <ReadMoreButton to={`/blog/${post.id}`}>
          Read More
        </ReadMoreButton>
      </CardContent>
    </Card>
  );
};

export default BlogPostCard; 