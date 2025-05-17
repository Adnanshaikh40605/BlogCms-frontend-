import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Image from './Image';
import { mediaAPI } from '../api/apiService';
import { formatDate } from '../utils/dateUtils';
import placeholderImage from '../assets/placeholder-image.js';

const Card = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  }
`;

const ImageContainer = styled.div`
  height: 0;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  position: relative;
  overflow: hidden;
`;

const CardContent = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #333;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const Excerpt = styled.div`
  color: #666;
  margin-bottom: 1rem;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 0.95rem;
  line-height: 1.5;
  
  p {
    margin-top: 0;
  }
`;

const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #888;
  margin-top: auto;
`;

const Date = styled.span``;

const ReadMore = styled(Link)`
  display: inline-block;
  color: #0066cc;
  font-weight: 500;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
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

const PostImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
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
  
  const imageUrl = post.featured_image 
    ? mediaAPI.getImageUrl(post.featured_image)
    : null;
  
  // Create a clean excerpt from the post content
  const createExcerpt = (content, maxLength = 120) => {
    // Remove HTML tags
    const plainText = content.replace(/<[^>]+>/g, ' ');
    
    // Truncate to max length
    if (plainText.length <= maxLength) return plainText;
    
    // Find the last space before maxLength
    const excerpt = plainText.substring(0, maxLength);
    const lastSpaceIndex = excerpt.lastIndexOf(' ');
    
    if (lastSpaceIndex > 0) {
      return excerpt.substring(0, lastSpaceIndex) + '...';
    }
    
    return excerpt + '...';
  };
  
  const excerpt = post.content ? createExcerpt(post.content) : '';
  const formattedDate = formatDate(post.created_at);
  
  return (
    <Card>
      {imageUrl && (
        <ImageContainer>
          <Image
            src={imageUrl}
            alt={post.title}
            aspectRatio="16/9"
            borderRadius="8px 8px 0 0"
          />
        </ImageContainer>
      )}
      
      <CardContent>
        <Title>{post.title}</Title>
        
        {excerpt && <Excerpt dangerouslySetInnerHTML={{ __html: excerpt }} />}
        
        <Meta>
          <Date>{formattedDate}</Date>
          <ReadMore to={`/posts/${post.id}`}>Read More</ReadMore>
        </Meta>
      </CardContent>
    </Card>
  );
};

export default BlogPostCard; 