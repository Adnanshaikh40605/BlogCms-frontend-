import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { postAPI, mediaAPI } from '../api/apiService';
import SEO from '../components/SEO';
import SocialShare from '../components/SocialShare';
import Image from '../components/Image';

const BlogContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
`;

const BlogHeader = styled.div`
  margin-bottom: 2rem;
`;

const BlogTitle = styled.h1`
  font-size: 2rem;
  color: #333;
  margin-bottom: 1rem;
  line-height: 1.3;
`;

const BlogContent = styled.div`
  img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 2rem 0;
  }

  p {
    color: #444;
    line-height: 1.6;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
  }

  h2, h3, h4, h5, h6 {
    color: #333;
    margin: 2rem 0 1rem;
  }

  ul, ol {
    margin-bottom: 1.5rem;
    padding-left: 1.5rem;
    
    li {
      margin-bottom: 0.5rem;
      color: #444;
      line-height: 1.6;
    }
  }

  blockquote {
    border-left: 4px solid #0066cc;
    padding-left: 1rem;
    margin: 1.5rem 0;
    font-style: italic;
    color: #666;
  }

  a {
    color: #0066cc;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const PostMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.9rem;
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

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: #0066cc;
  text-decoration: none;
  margin-bottom: 2rem;
  font-size: 0.9rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const BlogPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get the current URL for sharing
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Extract a plain text excerpt from the post content for meta description and sharing
  const getPlainTextExcerpt = (content, maxLength = 160) => {
    if (!content) return '';
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

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await postAPI.getById(id);
        setPost(response);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post. Please try again later.');
        navigate('/blog');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  if (loading) {
    return (
      <BlogContainer>
        <LoadingMessage>Loading blog post...</LoadingMessage>
      </BlogContainer>
    );
  }

  if (error) {
    return (
      <BlogContainer>
        <ErrorMessage>{error}</ErrorMessage>
      </BlogContainer>
    );
  }

  if (!post) {
    return (
      <BlogContainer>
        <ErrorMessage>Blog post not found</ErrorMessage>
      </BlogContainer>
    );
  }
  
  const plainTextExcerpt = getPlainTextExcerpt(post.content);
  const imageUrl = post.featured_image ? mediaAPI.getImageUrl(post.featured_image) : null;
  
  return (
    <BlogContainer>
      {/* SEO Meta Tags */}
      <SEO 
        title={post.title}
        description={plainTextExcerpt}
        image={post.featured_image}
        url={currentUrl}
        published={post.created_at}
        modified={post.updated_at}
        type="article"
      />
      
      <BackLink to="/blog">← Back to Blog</BackLink>
      
      <BlogHeader>
        <PostMeta>
          <PostDate>{new Date(post.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</PostDate>
          <ReadTime>{post.read_time || '5 min read'}</ReadTime>
        </PostMeta>
        <BlogTitle>{post.title}</BlogTitle>
      </BlogHeader>

      {imageUrl && (
        <Image
          src={imageUrl}
          alt={post.title}
          aspectRatio="16/9"
          borderRadius="8px"
        />
      )}

      <BlogContent dangerouslySetInnerHTML={{ __html: post.content }} />
      
      {/* Social Sharing Component */}
      <SocialShare 
        url={currentUrl}
        title={post.title}
        summary={plainTextExcerpt}
      />
    </BlogContainer>
  );
};

export default BlogPage; 

1234