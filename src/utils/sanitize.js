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
      'code', 'pre', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'figure', 'figcaption', 'section', 'article', 'aside', 'nav', 'header', 
      'footer', 'main', 'address', 'details', 'summary', 'menu', 'del', 'ins',
      'caption', 'colgroup', 'col', 'source', 'track', 'video', 'audio', 'picture',
      'svg', 'path', 'rect', 'circle', 'g', 'iframe', 'sub', 'sup'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'style', 'target', 'width', 'height',
      'id', 'name', 'data-*', 'align', 'border', 'cellpadding', 'cellspacing',
      'colspan', 'rowspan', 'lang', 'dir', 'aria-*', 'role', 'type', 'controls',
      'autoplay', 'muted', 'loop', 'poster', 'preload', 'crossorigin', 'sizes',
      'srcset', 'start', 'reversed', 'download', 'rel', 'viewBox', 'xmlns',
      'x', 'y', 'd', 'cx', 'cy', 'r', 'fill', 'stroke', 'stroke-width', 'transform'
    ],
    FORBID_TAGS: ['script', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    ALLOW_DATA_ATTR: true,
    ADD_URI_SAFE_ATTR: ['data-*']
  });
};

// Sanitize plain text (removes all HTML)
export const sanitizeAsText = (content) => {
  if (!content) return '';
  return DOMPurify.sanitize(content, { ALLOWED_TAGS: [] });
};