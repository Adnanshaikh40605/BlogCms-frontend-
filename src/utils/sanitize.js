import DOMPurify from 'dompurify';

// Basic sanitization with default configuration
export const sanitize = (content) => {
  if (!content) return '';
  return DOMPurify.sanitize(content);
};

// Sanitize with specific allowed tags for blog content
export const sanitizeBlogContent = (content) => {
  if (!content) return '';
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'a', 'b', 'br', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
      'i', 'img', 'li', 'ol', 'p', 'span', 'strong', 'u', 'ul', 'blockquote', 
      'code', 'pre', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'style', 'target', 'width', 'height'
    ],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    ALLOW_DATA_ATTR: false
  });
};

// Sanitize plain text (removes all HTML)
export const sanitizeAsText = (content) => {
  if (!content) return '';
  return DOMPurify.sanitize(content, { ALLOWED_TAGS: [] });
};