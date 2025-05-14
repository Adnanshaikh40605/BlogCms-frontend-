import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Button from './Button';
import { sanitizeAsText } from '../utils/sanitize';

const FormContainer = styled.div`
  margin: 1.5rem 0;
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
  color: inherit;
  background-color: #ffffff;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
  
  &::placeholder {
    color: #adb5bd;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  color: inherit;
  background-color: #ffffff;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
  
  &::placeholder {
    color: #adb5bd;
  }
`;

const ErrorMessage = styled.p`
  color: #dc3545;
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
`;

const KeyboardHintContainer = styled.div`
  margin-top: 1rem;
  font-size: 0.85rem;
  color: #6c757d;
`;

const KeyboardShortcut = styled.kbd`
  background-color: #f1f1f1;
  border: 1px solid #ccc;
  border-radius: 3px;
  box-shadow: 0 1px 0 rgba(0,0,0,0.2);
  padding: 0.2rem 0.4rem;
  margin: 0 0.2rem;
  font-size: 0.8rem;
`;

const CommentForm = ({ 
  postId, 
  onCommentSubmitted, 
  showCommentForm = true, 
  setShowCommentForm = () => {}, 
  isSubmitting = false 
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [localError, setLocalError] = useState(null);
  const textareaRef = useRef(null);
  
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Submit on Ctrl+Enter
      if (event.ctrlKey && event.key === 'Enter' && showCommentForm) {
        const form = textareaRef.current?.form;
        if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCommentForm]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!content.trim()) {
      setLocalError('Please enter a comment.');
      return;
    }
    
    if (!name.trim()) {
      setLocalError('Please enter your name.');
      return;
    }
    
    if (!email.trim()) {
      setLocalError('Please enter your email.');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Please enter a valid email address.');
      return;
    }
    
    setLocalError(null);
    
    // Prepare comment data
    const commentData = {
      post: postId,
      author_name: name,
      author_email: email,
      content
    };
    
    // Call the callback if provided
    if (onCommentSubmitted) {
      try {
        await onCommentSubmitted(commentData);
        // Reset form
        setName('');
        setEmail('');
        setContent('');
      } catch (err) {
        console.error('Error submitting comment:', err);
        setLocalError('Failed to submit comment. Please try again later.');
      }
    }
  };
  
  if (!showCommentForm) {
    return null;
  }
  
  return (
    <FormContainer>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
            disabled={isSubmitting}
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={isSubmitting}
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="content">Comment</Label>
          <Textarea
            id="content"
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your comment here..."
            rows={5}
            required
            disabled={isSubmitting}
          />
          {localError && <ErrorMessage>{localError}</ErrorMessage>}
        </FormGroup>
        
        <Button
          type="submit"
          disabled={isSubmitting}
          $variant={isSubmitting ? "disabled" : "primary"}
        >
          {isSubmitting ? 'Submitting...' : 'Post Comment'}
        </Button>
      </form>
      
      <KeyboardHintContainer>
        <p>Tip: Press <KeyboardShortcut>Ctrl</KeyboardShortcut>+<KeyboardShortcut>Enter</KeyboardShortcut> to submit your comment quickly.</p>
      </KeyboardHintContainer>
    </FormContainer>
  );
};

export default CommentForm; 