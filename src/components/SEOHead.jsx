import React from 'react';
import { Helmet } from 'react-helmet';

/**
 * SEOHead component for managing meta tags, Open Graph and Twitter Card tags
 * 
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description (meta description)
 * @param {string} props.canonical - Canonical URL
 * @param {string} props.image - Image URL for social sharing
 * @param {string} props.type - Content type (default: 'website')
 * @param {Array} props.keywords - Array of keywords
 */
const SEOHead = ({
  title,
  description,
  canonical,
  image = '',
  type = 'website',
  keywords = [],
}) => {
  // Fallback image
  const defaultImage = '/logo.png';
  const imageUrl = image || defaultImage;
  
  // Site name
  const siteName = 'Blog CMS';
  
  // Format title to include site name if not already included
  const formattedTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{formattedTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      
      {/* Canonical Link */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
};

export default SEOHead; 