import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Button from './Button';
import { sanitizeAsText } from '../utils/sanitize';
import { commentAPI } from '../api/apiService';

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

const Textarea = styled.textarea`
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

const CommentForm = ({ postId, onCommentSubmitted }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!content.trim()) {
      setError('Please enter a comment.');
      return;
    }
    
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Prepare comment data
      const commentData = {
        post: postId,
        author_name: name,
        author_email: email,
        content
      };
      
      // Send the comment using the API service directly
      await commentAPI.create(commentData);
      
      // Reset form
      setName('');
      setEmail('');
      setContent('');
      setSubmitted(true);
      setIsFormVisible(false);
      
      // Call the callback if provided
      if (onCommentSubmitted) {
        onCommentSubmitted(commentData);
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to submit comment. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <FormContainer>
      {submitted && (
        <SuccessMessage>
          Your comment has been submitted and is awaiting approval.
        </SuccessMessage>
      )}
      
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="name">Name</Label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="content">Comment</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your comment here..."
            rows={5}
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
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