import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../components/Button';
import Comment from '../components/Comment';
import CommentForm from '../components/CommentForm';
import { blogPostService, commentService } from '../api/api';
import { formatDate } from '../utils/dateUtils';
import placeholderImage from '../assets/placeholder-image.js';

const Container = styled.div`
  width: 100%;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: #0066cc;
  text-decoration: none;
  margin-bottom: 1rem;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const HeaderContainer = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const PostInfo = styled.div`
  display: flex;
  gap: 1rem;
  color: #6c757d;
  margin-bottom: 1rem;
  font-size: 0.875rem;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  background-color: ${props => props.$published ? '#d4edda' : '#f8d7da'};
  color: ${props => props.$published ? '#155724' : '#721c24'};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const FeaturedImage = styled.img`
  width: 100%;
  max-height: 500px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const Content = styled.div`
  margin-bottom: 2rem;
  line-height: 1.6;
  font-size: 1.125rem;
  color: #333;
  
  h1, h2, h3, h4, h5, h6 {
    color: #222;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
  }
  
  p {
    margin-bottom: 1.25rem;
  }
  
  img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 1rem 0;
  }
  
  a {
    color: #0066cc;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  ul, ol {
    margin-bottom: 1.25rem;
    padding-left: 2rem;
  }
  
  blockquote {
    border-left: 4px solid #e9ecef;
    padding-left: 1rem;
    font-style: italic;
    color: #6c757d;
    margin: 1.5rem 0;
  }
`;

const AdditionalImages = styled.div`
  margin-bottom: 2rem;
`;

const ImagesTitle = styled.h3`
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 1rem;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const AdditionalImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const CommentsSection = styled.div`
  margin-top: 3rem;
`;

const CommentsTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
`;

const CommentsList = styled.div`
  margin-bottom: 2rem;
`;

const Message = styled.p`
  text-align: center;
  color: #6c757d;
  padding: 2rem;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  max-width: 90%;
  max-height: 90%;
`;

const ModalImage = styled.img`
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
`;

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [pendingComments, setPendingComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const fetchComments = async () => {
    try {
      // Fetch approved comments for the post
      const approvedCommentsData = await commentService.getComments(id, true);
      setComments(approvedCommentsData);

      // Also fetch pending comments for this post
      const pendingCommentsData = await commentService.getComments(id, false);
      setPendingComments(pendingCommentsData);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };
  
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await blogPostService.getPost(id);
        setPost(data);
        
        // Fetch comments
        await fetchComments();
        
        setError(null);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post. It may have been deleted or does not exist.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id]);
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await blogPostService.deletePost(id);
        navigate('/posts');
      } catch (err) {
        console.error('Error deleting post:', err);
        alert('Failed to delete post. Please try again.');
      }
    }
  };
  
  const handlePublishToggle = async () => {
    try {
      await blogPostService.updatePost(id, {
        published: !post.published
      });
      setPost({
        ...post,
        published: !post.published
      });
    } catch (err) {
      console.error('Error updating post publish status:', err);
      alert('Failed to update post status. Please try again.');
    }
  };
  
  const handleCommentSubmitted = async () => {
    await fetchComments();
  };
  
  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
  };
  
  const closeImageModal = () => {
    setSelectedImage(null);
  };
  
  if (loading) {
    return <Message>Loading post...</Message>;
  }
  
  if (error || !post) {
    return <Message>{error || 'Post not found'}</Message>;
  }
  
  const formattedDate = formatDate(post.created_at);
  
  return (
    <Container>
      <BackLink to="/posts">← Back to Posts</BackLink>
      
      <HeaderContainer>
        <Title>{post.title}</Title>
        <PostInfo>
          <span>Created on {formattedDate}</span>
          <StatusBadge $published={post.published}>
            {post.published ? 'Published' : 'Draft'}
          </StatusBadge>
        </PostInfo>
        
        <ButtonGroup>
          <Link to={`/posts/edit/${id}`}>
            <Button $variant="primary">Edit Post</Button>
          </Link>
          <Button 
            $variant={post.published ? 'secondary' : 'success'}
            onClick={handlePublishToggle}
          >
            {post.published ? 'Unpublish' : 'Publish'}
          </Button>
          <Button 
            $variant="danger"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </ButtonGroup>
      </HeaderContainer>
      
      {post.featured_image && (
        <FeaturedImage 
          src={post.featured_image} 
          alt={post.title}
          onError={(e) => {
            e.target.src = placeholderImage;
          }}
        />
      )}
      
      <Content dangerouslySetInnerHTML={{ __html: post.content }} />
      
      {post.images && post.images.length > 0 && (
        <AdditionalImages>
          <ImagesTitle>Additional Images</ImagesTitle>
          <ImageGrid>
            {post.images.map((image, index) => (
              <AdditionalImage 
                key={index}
                src={image.image}
                alt={`Additional image ${index + 1}`}
                onClick={() => openImageModal(image.image)}
                onError={(e) => {
                  e.target.src = placeholderImage;
                }}
              />
            ))}
          </ImageGrid>
        </AdditionalImages>
      )}
      
      <CommentsSection>
        <CommentsTitle>Comments</CommentsTitle>
        
        <CommentsList>
          {comments.length === 0 && pendingComments.length === 0 ? (
            <Message>No comments yet. Be the first to comment!</Message>
          ) : (
            <>
              {comments.map(comment => (
                <Comment 
                  key={comment.id} 
                  comment={comment}
                  onApprove={() => {}}
                  onReject={() => {}}
                  showActionButtons={false}
                />
              ))}
              
              {pendingComments.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                  <h3>Your Pending Comments</h3>
                  <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    These comments are awaiting approval from the site administrator.
                  </p>
                  {pendingComments.map(comment => (
                    <Comment 
                      key={comment.id} 
                      comment={comment}
                      onApprove={() => {}}
                      onReject={() => {}}
                      showActionButtons={false}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </CommentsList>
        
        <CommentForm 
          postId={id}
          onCommentSubmitted={handleCommentSubmitted}
        />
      </CommentsSection>
      
      {selectedImage && (
        <Modal onClick={closeImageModal}>
          <CloseButton onClick={closeImageModal}>✕</CloseButton>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalImage src={selectedImage} alt="Full size image" />
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default PostDetailPage; 