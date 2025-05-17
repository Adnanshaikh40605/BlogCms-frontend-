import { useState } from 'react';
import styled from 'styled-components';
import Button from './Button';
import { formatDate, getRelativeTime } from '../utils/dateUtils';
import { sanitize } from '../utils/sanitize';
import AdminReplyForm from './AdminReplyForm';

const CommentContainer = styled.div`
  background-color: ${props => props.$approved ? '#ffffff' : '#fff8f8'};
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-left: 4px solid ${props => props.$approved ? '#28a745' : '#dc3545'};
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const AuthorName = styled.span`
  font-weight: 600;
  color: #333;
`;

const Date = styled.span`
  color: #6c757d;
  font-size: 0.875rem;
  transition: color 0.3s ease;
`;

const Content = styled.div`
  margin: 0 0 1rem 0;
  color: #495057;
  line-height: 1.5;
  white-space: pre-line;
  transition: color 0.3s ease;
`;

const ApprovalButton = styled(Button)`
  margin-top: 0.5rem;
  margin-left: 0.5rem;
`;

const RejectButton = styled(Button)`
  margin-top: 0.5rem;
`;

const ReplyButton = styled(Button)`
  margin-top: 0.5rem;
  margin-left: 0.5rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const BadgeContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  background-color: ${props => props.$approved ? '#d4edda' : '#f8d7da'};
  color: ${props => props.$approved ? '#155724' : '#721c24'};
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const AdminReplyContainer = styled.div`
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background-color: #e9f5ff;
  border-radius: 6px;
  border-left: 3px solid #007bff;
`;

const AdminReplyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const AdminLabel = styled.span`
  font-weight: 600;
  color: #007bff;
  font-size: 0.875rem;
`;

const AdminReplyContent = styled.div`
  color: #333;
  line-height: 1.5;
  white-space: pre-line;
`;

const Comment = ({ 
  comment, 
  onApprove, 
  onReject,
  onReply,
  showActionButtons = false
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [currentComment, setCurrentComment] = useState(comment);
  
  if (!currentComment) return null;
  
  const formattedDate = formatDate(currentComment.created_at);
  const relativeTime = getRelativeTime(currentComment.created_at);
  
  // Sanitize content
  const sanitizedContent = sanitize(currentComment.content);
  const authorName = currentComment.author_name || 'Anonymous';
  
  // Handle reply submission callback
  const handleReplied = (updatedComment) => {
    if (updatedComment) {
      setCurrentComment(updatedComment);
    }
    setShowReplyForm(false);
    
    // Notify parent component if needed
    if (onReply) {
      onReply(updatedComment || currentComment);
    }
  };
  
  return (
    <CommentContainer $approved={currentComment.approved}>
      <CommentHeader>
        <AuthorName>{authorName}</AuthorName>
        <Date title={formattedDate}>{relativeTime || formattedDate}</Date>
      </CommentHeader>
      
      <Content dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
      
      {/* Display admin reply if it exists */}
      {currentComment.admin_reply && (
        <AdminReplyContainer>
          <AdminReplyHeader>
            <AdminLabel>Admin Reply</AdminLabel>
          </AdminReplyHeader>
          <AdminReplyContent>
            {currentComment.admin_reply}
          </AdminReplyContent>
        </AdminReplyContainer>
      )}
      
      <BadgeContainer>
        {showActionButtons && (
          <StatusBadge $approved={currentComment.approved}>
            {currentComment.approved ? 'Approved' : 'Pending Approval'}
          </StatusBadge>
        )}
        
        <ButtonContainer>
          {showActionButtons && !currentComment.approved && (
            <>
              <RejectButton 
                $variant="danger" 
                onClick={() => onReject(currentComment.id)}
                size="small"
              >
                Reject
              </RejectButton>
              <ApprovalButton 
                $variant="success" 
                onClick={() => onApprove(currentComment.id)}
                size="small"
              >
                Approve
              </ApprovalButton>
            </>
          )}
          
          {showActionButtons && currentComment.approved && (
            <ReplyButton 
              $variant="primary" 
              onClick={() => setShowReplyForm(true)} 
              size="small"
              disabled={showReplyForm}
            >
              {currentComment.admin_reply ? 'Edit Reply' : 'Reply'}
            </ReplyButton>
          )}
        </ButtonContainer>
      </BadgeContainer>
      
      {/* Show reply form when needed */}
      {showReplyForm && (
        <AdminReplyForm 
          commentId={currentComment.id}
          existingReply={currentComment.admin_reply}
          onReplied={handleReplied}
        />
      )}
    </CommentContainer>
  );
};

export default Comment; 