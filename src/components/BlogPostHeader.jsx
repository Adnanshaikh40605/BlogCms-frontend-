import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const HeaderContainer = styled.div`
  margin-bottom: 2rem;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: #0066cc;
  text-decoration: none;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Breadcrumb = styled.div`
  display: flex;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  
  a {
    color: #0066cc;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
  line-height: 1.2;
  font-weight: 700;
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
  align-items: center;
`;

const Separator = styled.span`
  color: #ccc;
`;

const BlogPostHeader = ({ title, publishDate, readTime, category }) => {
  return (
    <HeaderContainer>
      <BackLink to="/blog">← Back to Blog</BackLink>
      
      <Breadcrumb>
        <Link to="/">Home</Link>
        <Separator>/</Separator>
        <Link to="/blog">Blog</Link>
        <Separator>/</Separator>
        <span>{category}</span>
      </Breadcrumb>
      
      <Title>{title}</Title>
      
      <MetaInfo>
        <span>Published on {publishDate}</span>
        <Separator>•</Separator>
        <span>{readTime}</span>
      </MetaInfo>
    </HeaderContainer>
  );
};

export default BlogPostHeader; 