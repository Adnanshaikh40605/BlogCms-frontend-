import { useState } from 'react';
import styled from 'styled-components';
import Button from './Button';
import { formatDate, getRelativeTime } from '../utils/dateUtils';
import { sanitize } from '../utils/sanitize';

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
  margin-right: auto;
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

const ReplyForm = styled.div`
  margin-top: 1rem;
  border-top: 1px solid #e9ecef;
  padding-top: 1rem;
  width: 100%;
`;

const ReplyTextarea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 80px;
`;

const ReplyActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`;

const RepliesList = styled.div`
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px dashed #e9ecef;
`;

const ReplyItem = styled.div`
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ReplyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  font-size: 0.8rem;
`;

const ReplyAuthor = styled.span`
  font-weight: 600;
`;

const ReplyDate = styled.span`
  color: #6c757d;
`;

const ReplyContent = styled.div`
  color: #495057;
`;

const Comment = ({ 
  comment, 
  onApprove, 
  onReject, 
  onReply, 
  showActionButtons = false,
  showReplyOption = false 
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  
  if (!comment) return null;
  
  const formattedDate = formatDate(comment.created_at);
  const relativeTime = getRelativeTime(comment.created_at);
  
  // Sanitize content
  const sanitizedContent = sanitize(comment.content);
  const authorName = comment.author_name || 'Anonymous';
  
  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent);
      setReplyContent('');
      setIsReplying(false);
    }
  };
  
  const handleCancelReply = () => {
    setReplyContent('');
    setIsReplying(false);
  };
  
  return (
    <CommentContainer $approved={comment.approved}>
      <CommentHeader>
        <AuthorName>{authorName}</AuthorName>
        <Date title={formattedDate}>{relativeTime || formattedDate}</Date>
      </CommentHeader>
      
      <Content dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
      
      <BadgeContainer>
        {showActionButtons && (
          <StatusBadge $approved={comment.approved}>
            {comment.approved ? 'Approved' : 'Pending Approval'}
          </StatusBadge>
        )}
        
        <ButtonContainer>
          {showReplyOption && comment.approved && (
            <ReplyButton 
              $variant="primary" 
              onClick={() => setIsReplying(!isReplying)}
              size="small"
            >
              {isReplying ? 'Cancel Reply' : 'Reply'}
            </ReplyButton>
          )}
          
          {showActionButtons && !comment.approved && (
            <>
              <RejectButton 
                $variant="danger" 
                onClick={() => onReject(comment.id)}
                size="small"
              >
                Reject
              </RejectButton>
              <ApprovalButton 
                $variant="success" 
                onClick={() => onApprove(comment.id)}
                size="small"
              >
                Approve
              </ApprovalButton>
            </>
          )}
        </ButtonContainer>
      </BadgeContainer>
      
      {isReplying && (
        <ReplyForm>
          <ReplyTextarea
            placeholder="Write your reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <ReplyActions>
            <Button $variant="light" size="small" onClick={handleCancelReply}>
              Cancel
            </Button>
            <Button $variant="primary" size="small" onClick={handleReplySubmit}>
              Submit Reply
            </Button>
          </ReplyActions>
        </ReplyForm>
      )}
      
      {comment.replies && comment.replies.length > 0 && (
        <RepliesList>
          {comment.replies.map((reply, index) => (
            <ReplyItem key={reply.id || index}>
              <ReplyHeader>
                <ReplyAuthor>{reply.author_name || 'Admin'}</ReplyAuthor>
                <ReplyDate>
                  {getRelativeTime(reply.created_at) || formatDate(reply.created_at)}
                </ReplyDate>
              </ReplyHeader>
              <ReplyContent>{reply.content}</ReplyContent>
            </ReplyItem>
          ))}
        </RepliesList>
      )}
    </CommentContainer>
  );
};

export default Comment; 