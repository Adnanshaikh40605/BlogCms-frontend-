import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Comment from '../components/Comment';
import { commentAPI } from '../api/apiService';

const Container = styled.div`
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  margin: 0;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #0066cc;
  background-color: ${props => props.$active ? '#0066cc' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#0066cc'};
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.$active ? '#0055aa' : '#e6f2ff'};
  }
`;

const CommentsList = styled.div`
  margin-bottom: 2rem;
`;

const Message = styled.p`
  text-align: center;
  color: #6c757d;
  padding: 2rem;
`;

const DebugInfo = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
  font-family: monospace;
  font-size: 0.8rem;
  overflow-x: auto;
`;

const CommentsPage = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending'); // 'pending', 'approved', 'rejected', 'all'
  const [debug, setDebug] = useState({});
  
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('CommentsPage - Fetching comments with filter:', filter);
        
        let commentsData = [];
        let responseData = {};
        
        if (filter === 'pending') {
          // Fetch pending comments (not approved and not rejected)
          console.log('CommentsPage - Fetching pending comments');
          responseData = await commentAPI.getAll({ approved: false, rejected: false });
          console.log('CommentsPage - Pending comments response:', responseData);
          
        } else if (filter === 'approved') {
          // Get approved comments across all posts
          console.log('CommentsPage - Fetching approved comments');
          responseData = await commentAPI.getAll({ approved: true, rejected: false });
          console.log('CommentsPage - Approved comments response:', responseData);
          
        } else if (filter === 'rejected') {
          // Get rejected comments
          console.log('CommentsPage - Fetching rejected comments');
          responseData = await commentAPI.getAll({ rejected: true });
          console.log('CommentsPage - Rejected comments response:', responseData);
          
        } else {
          // For 'all' filter case
          try {
            console.log('CommentsPage - Fetching all comments');
            // Get all comments (no filter)
            responseData = await commentAPI.getAll();
            console.log('CommentsPage - All comments response:', responseData);
          } catch (error) {
            console.warn('Error fetching comments:', error);
            setError('Failed to load all comments. Please try a different filter.');
          }
        }
        
        // Store debug info
        setDebug(responseData);
        
        // Handle both paginated and non-paginated responses
        if (responseData && responseData.results) {
          // Paginated response
          commentsData = responseData.results;
        } else if (Array.isArray(responseData)) {
          // Non-paginated array response
          commentsData = responseData;
        } else {
          console.warn('Unexpected response format:', responseData);
          commentsData = [];
        }
        
        console.log('CommentsPage - Final comments data:', commentsData);
        
        if (Array.isArray(commentsData) && commentsData.length > 0) {
          setComments(commentsData);
          setError(null);
        } else {
          setComments([]);
          console.log('CommentsPage - No comments found for filter:', filter);
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments. Please try again later.');
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchComments();
  }, [filter]);
  
  const handleApproveComment = async (commentId) => {
    try {
      await commentAPI.approve(commentId);
      
      // If we're viewing pending comments, remove the approved comment from the list
      if (filter === 'pending') {
        setComments(comments.filter(comment => comment.id !== commentId));
      } else {
        // Otherwise, update the comment's approved status in the list
        setComments(comments.map(comment => 
          comment.id === commentId ? { ...comment, approved: true } : comment
        ));
      }
    } catch (err) {
      console.error('Error approving comment:', err);
      alert('Failed to approve comment. Please try again.');
    }
  };
  
  const handleRejectComment = async (commentId) => {
    try {
      await commentAPI.reject(commentId);
      
      // If we're viewing pending comments, remove the rejected comment from the list
      if (filter === 'pending') {
        setComments(comments.filter(comment => comment.id !== commentId));
      } else if (filter === 'rejected') {
        // If viewing rejected comments, update the status
        setComments(comments.map(comment => 
          comment.id === commentId ? { ...comment, rejected: true, approved: false } : comment
        ));
      } else if (filter === 'all') {
        // If viewing all comments, update the status
        setComments(comments.map(comment => 
          comment.id === commentId ? { ...comment, rejected: true, approved: false } : comment
        ));
      } else {
        // Remove from approved list if that's what we're viewing
        setComments(comments.filter(comment => comment.id !== commentId));
      }
    } catch (err) {
      console.error('Error rejecting comment:', err);
      alert('Failed to reject comment. Please try again.');
    }
  };
  
  // For development: show debug button
  const isDevelopment = import.meta.env.DEV;
  const [showDebug, setShowDebug] = useState(false);
  
  return (
    <Container>
      <Header>
        <Title>Comments Management</Title>
        
        <FilterContainer>
          <FilterButton 
            $active={filter === 'pending'}
            onClick={() => setFilter('pending')}
          >
            Pending
          </FilterButton>
          <FilterButton 
            $active={filter === 'approved'}
            onClick={() => setFilter('approved')}
          >
            Approved
          </FilterButton>
          <FilterButton 
            $active={filter === 'rejected'}
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </FilterButton>
          <FilterButton 
            $active={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            All
          </FilterButton>
          
          {isDevelopment && (
            <FilterButton
              onClick={() => setShowDebug(!showDebug)}
              style={{ backgroundColor: showDebug ? '#ff9900' : 'transparent', color: showDebug ? 'white' : '#ff9900' }}
            >
              Debug
            </FilterButton>
          )}
        </FilterContainer>
      </Header>
      
      {loading ? (
        <Message>Loading comments...</Message>
      ) : error ? (
        <Message>{error}</Message>
      ) : comments.length === 0 ? (
        <Message>
          {filter === 'pending' ? 'No pending comments found.' : 
           filter === 'approved' ? 'No approved comments found.' : 
           filter === 'rejected' ? 'No rejected comments found.' : 
           'No comments found.'}
        </Message>
      ) : (
        <CommentsList>
          {comments.map(comment => (
            <Comment 
              key={comment.id}
              comment={comment}
              onApprove={handleApproveComment}
              onReject={handleRejectComment}
              showActionButtons={filter !== 'approved' && filter !== 'rejected'}
            />
          ))}
        </CommentsList>
      )}
      
      {showDebug && (
        <DebugInfo>
          <h4>Debug Info:</h4>
          <pre>{JSON.stringify(debug, null, 2)}</pre>
        </DebugInfo>
      )}
    </Container>
  );
};

export default CommentsPage;