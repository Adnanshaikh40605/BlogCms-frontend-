import React from 'react';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';
import { MEDIA_URL } from '../api/apiService';

/**
 * SEO component for managing document head tags
 * Supports OpenGraph and Twitter meta tags with dynamic content
 */
const SEO = ({
  title,
  description,
  image,
  url,
  author = 'Blog CMS',
  type = 'article',
  published = null,
  modified = null,
  twitterUsername = '@yourtwitterhandle',
  children
}) => {
  // Default meta values
  const siteName = 'Blog CMS';
  const defaultDescription = 'A powerful, modern blog content management system';
  const defaultImage = '/default-social-image.png'; // Add a default image to your public folder
  
  // Format dates for OpenGraph if present
  const publishedTime = published ? new Date(published).toISOString() : null;
  const modifiedTime = modified ? new Date(modified).toISOString() : null;

  // Process image URL to ensure it's absolute
  const imageUrl = image 
    ? (image.startsWith('http') ? image : `${MEDIA_URL}${image}`)
    : defaultImage;

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{title}</title>
      <meta name="description" content={description || defaultDescription} />
      {url && <link rel="canonical" href={url} />}
      
      {/* OpenGraph tags */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:type" content={type} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      
      {/* Additional article meta tags for blogs */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          <meta property="article:author" content={author} />
        </>
      )}
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterUsername} />
      {twitterUsername && <meta name="twitter:creator" content={twitterUsername} />}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={title} />
      
      {/* Additional meta tags can be passed as children */}
      {children}
    </Helmet>
  );
};

SEO.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
  author: PropTypes.string,
  type: PropTypes.string,
  published: PropTypes.string,
  modified: PropTypes.string,
  twitterUsername: PropTypes.string,
  children: PropTypes.node
};

export default SEO; 