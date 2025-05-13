import { format, formatDistanceToNow, parseISO } from 'date-fns';

// Format date to Month Day, Year (e.g. January 1, 2024)
export const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date';
  
  try {
    // First check if it's a valid ISO date string
    const parsedDate = parseISO(dateString);
    
    // Check if the parsed date is valid
    if (isNaN(parsedDate.getTime())) {
      return dateString || 'Unknown date';
    }
    
    return format(parsedDate, 'MMMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    // Return a safe fallback
    return dateString || 'Unknown date';
  }
};

// Get relative time (e.g. "2 days ago")
export const getRelativeTime = (dateString) => {
  if (!dateString) return '';
  
  try {
    const parsedDate = parseISO(dateString);
    
    // Check if the parsed date is valid
    if (isNaN(parsedDate.getTime())) {
      return '';
    }
    
    return formatDistanceToNow(parsedDate, { addSuffix: true });
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return '';
  }
};

// Safe date parser that doesn't throw errors
export const safeParse = (dateString) => {
  if (!dateString) return null;
  
  try {
    const parsedDate = parseISO(dateString);
    
    // Return null for invalid dates
    if (isNaN(parsedDate.getTime())) {
      return null;
    }
    
    return parsedDate;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

// Format date with custom format string
export const formatWithPattern = (dateString, pattern = 'PP') => {
  if (!dateString) return '';
  
  try {
    const parsedDate = parseISO(dateString);
    
    // Check if the parsed date is valid
    if (isNaN(parsedDate.getTime())) {
      return '';
    }
    
    return format(parsedDate, pattern);
  } catch (error) {
    console.error('Error formatting date with pattern:', error);
    return '';
  }
};

// Estimate reading time for content
export const estimateReadTime = (content) => {
  if (!content) return 4; // Default read time if no content
  
  // Calculate based on average reading speed of 200 words per minute
  const wordsPerMinute = 200;
  
  // Count words in content (strip HTML tags if needed)
  const text = content.replace(/<[^>]*>/g, '');
  const wordCount = text.split(/\s+/).length;
  
  // Calculate reading time in minutes, minimum 1 minute
  const readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  
  return readingTime;
}; 