import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Comment from '../components/Comment';
import { commentService } from '../api/api';

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

const CommentsPage = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending'); // 'pending', 'approved', 'all'
  
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('CommentsPage - Fetching comments with filter:', filter);
        
        let commentsData = [];
        if (filter === 'pending') {
          // Use getPendingComments to get all pending comments
          console.log('CommentsPage - Fetching pending comments');
          const pendingData = await commentService.getPendingComments(1, 10);
          console.log('CommentsPage - Pending comments response:', pendingData);
          commentsData = Array.isArray(pendingData.results) ? pendingData.results : [];
        } else if (filter === 'approved') {
          // Get approved comments across all posts
          console.log('CommentsPage - Fetching approved comments');
          const approvedData = await commentService.getComments(null, true, 1, 10);
          console.log('CommentsPage - Approved comments response:', approvedData);
          commentsData = Array.isArray(approvedData.results) ? approvedData.results : [];
        } else {
          // For 'all' filter case
          try {
            console.log('CommentsPage - Fetching all comments');
            // The updated getAllCommentsForPost function now handles null postId properly
            const response = await commentService.getAllCommentsForPost(null);
            console.log('CommentsPage - All comments response:', response);
            commentsData = [
              ...(Array.isArray(response.approved) ? response.approved : []), 
              ...(Array.isArray(response.pending) ? response.pending : [])
            ];
          } catch (error) {
            console.warn('Error fetching comments:', error);
            setError('Failed to load all comments. Please try a different filter.');
          }
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
      await commentService.approveComment(commentId);
      
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
      await commentService.rejectComment(commentId);
      
      // Remove the rejected comment from the list
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (err) {
      console.error('Error rejecting comment:', err);
      alert('Failed to reject comment. Please try again.');
    }
  };
  
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
            $active={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            All
          </FilterButton>
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
              showActionButtons={filter !== 'approved'}
            />
          ))}
        </CommentsList>
      )}
    </Container>
  );
};

export default CommentsPage;