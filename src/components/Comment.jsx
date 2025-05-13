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

const Date = styled.span`
  color: #6c757d;
  font-size: 0.875rem;
  transition: color 0.3s ease;
`;

const Content = styled.p`
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

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const BadgeContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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

const Comment = ({ comment, onApprove, onReject, showActionButtons = false }) => {
  const formattedDate = formatDate(comment.created_at);
  const relativeTime = getRelativeTime(comment.created_at);
  
  // Sanitize content
  const content = sanitize(comment.content);
  
  return (
    <CommentContainer $approved={comment.approved}>
      <CommentHeader>
        <Date title={formattedDate}>{relativeTime || formattedDate}</Date>
      </CommentHeader>
      <Content dangerouslySetInnerHTML={{ __html: content }} />
      
      <BadgeContainer>
        <StatusBadge $approved={comment.approved}>
          {comment.approved ? 'Approved' : 'Pending Approval'}
        </StatusBadge>
        
        {showActionButtons && !comment.approved && (
          <ButtonContainer>
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
          </ButtonContainer>
        )}
      </BadgeContainer>
    </CommentContainer>
  );
};

export default Comment; 