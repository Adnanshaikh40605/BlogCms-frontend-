import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import RichTextEditor from '../components/RichTextEditor';
import Button from '../components/Button';
import { postAPI } from '../api/apiService';

const Container = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 0;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: #0066cc;
  text-decoration: none;
  margin-bottom: 1.5rem;
  font-weight: 500;
  transition: color 0.2s;
  
  &:hover {
    text-decoration: underline;
    color: #004c99;
  }
`;

const Title = styled.h1`
  font-size: 2.25rem;
  color: #333;
  margin-bottom: 2.5rem;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
    margin-bottom: 2rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    gap: 2rem;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #333;
  font-size: 1rem;
`;

const Input = styled.input`
  padding: 0.9rem;
  border: 1px solid #dce0e5;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
  
  &[type="file"] {
    padding: 0.7rem;
    background-color: #f8f9fa;
    cursor: pointer;
    border: 1px dashed #dce0e5;
    
    &:hover {
      background-color: #f1f3f5;
    }
  }
  
  &[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 6px;
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

const ImagePreviewContainer = styled.div`
  margin-top: 1.25rem;
`;

const ImagePreview = styled.div`
  width: 100%;
  max-width: 300px;
  background-color: #f8f9fa;
  border: 1px solid #dce0e5;
  border-radius: 6px;
  padding: 0.5rem;
  position: relative;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const PreviewImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 4px;
  display: block;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: -10px;
  right: -10px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: #dc3545;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #c82333;
  }
`;

const AdditionalImagesContainer = styled.div`
  margin-top: 1.25rem;
`;

const AdditionalImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.25rem;
  margin-top: 1rem;
`;

const ImageContainer = styled.div`
  position: relative;
`;

const ErrorMessage = styled.p`
  color: #dc3545;
  font-size: 0.875rem;
  margin: 0.5rem 0 0 0;
  font-weight: 500;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1.25rem;
  margin-top: 1rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const StyledButton = styled(Button)`
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 6px;
  transition: transform 0.2s;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const ImageUploadLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  .upload-hint {
    font-size: 0.875rem;
    color: #6c757d;
    margin-top: 0.25rem;
  }
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 46px;
  height: 24px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.3s;
    border-radius: 24px;
  }
  
  .slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }
  
  input:checked + .slider {
    background-color: #0d6efd;
  }
  
  input:focus + .slider {
    box-shadow: 0 0 1px #0d6efd;
  }
  
  input:checked + .slider:before {
    transform: translateX(22px);
  }
`;

const PublishOption = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SectionDivider = styled.hr`
  border: 0;
  height: 1px;
  background-color: #e9ecef;
  margin: 0;
`;

const PostFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    slug: '',
    published: false,
    featured_image: null,
    additional_images: []
  });
  
  const [preview, setPreview] = useState({
    featured_image: null,
    additional_images: []
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (isEditMode) {
      fetchPost();
    }
  }, [id]);
  
  const fetchPost = async () => {
    try {
      setLoading(true);
      const data = await postAPI.getById(id);
      
      // Keep track of the original image paths for submission
      let originalFeaturedImage = null;
      if (data.featured_image) {
        originalFeaturedImage = data.featured_image;
      }
      
      setFormData({
        title: data.title || '',
        content: data.content || '',
        slug: data.slug || '',
        published: Boolean(data.published),
        featured_image: null, // We'll keep the image in preview state
        additional_images: []
      });
      
      if (data.featured_image) {
        setPreview(prev => ({
          ...prev,
          featured_image: data.featured_image
        }));
      }
      
      if (data.additional_images && data.additional_images.length > 0) {
        setPreview(prev => ({
          ...prev,
          additional_images: data.additional_images
        }));
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    
    // Clear errors when field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };
  
  const handleEditorChange = (content) => {
    setFormData({
      ...formData,
      content,
    });
    
    if (errors.content) {
      setErrors({
        ...errors,
        content: '',
      });
    }
  };
  
  const handleFeaturedImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        featured_image: file,
      });
      
      setPreview({
        ...preview,
        featured_image: file
      });
      
      if (errors.featured_image) {
        setErrors({
          ...errors,
          featured_image: '',
        });
      }
    }
  };
  
  const handleRemoveFeaturedImage = () => {
    setFormData({
      ...formData,
      featured_image: null,
    });
    
    setPreview({
      ...preview,
      featured_image: null
    });
  };
  
  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 0) {
      setFormData({
        ...formData,
        additional_images: [...formData.additional_images, ...files],
      });
      
      if (errors.additional_images) {
        setErrors({
          ...errors,
          additional_images: '',
        });
      }
    }
  };
  
  const handleRemoveAdditionalImage = (index) => {
    const newImages = [...formData.additional_images];
    newImages.splice(index, 1);
    setFormData({
      ...formData,
      additional_images: newImages,
    });
  };
  
  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    if (!formData.featured_image && !preview.featured_image) {
      newErrors.featured_image = 'Featured image is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Create a copy of formData that includes the featured_image from preview if needed
      const submissionData = { ...formData };
      
      // If formData doesn't have featured_image but preview does, use a placeholder value
      // This is for edit mode when keeping the existing image
      if (!submissionData.featured_image && preview.featured_image) {
        // Send the URL/path string in edit mode
        if (typeof preview.featured_image === 'string') {
          // Extract just the filename from the URL path
          const urlParts = preview.featured_image.split('/');
          const filename = urlParts[urlParts.length - 1];
          submissionData.featured_image = filename;
        } else {
          submissionData.featured_image = preview.featured_image;
        }
      }
      
      if (isEditMode) {
        await postAPI.update(id, submissionData);
        navigate(`/posts`);
      } else {
        const newPost = await postAPI.create(submissionData);
        navigate(`/posts`);
      }
    } catch (error) {
      console.error('Error saving post:', error);
      setErrors(prev => ({
        ...prev,
        form: 'Failed to save post. Please try again.'
      }));
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <p>Loading post data...</p>;
  }
  
  return (
    <Container>
      <BackLink to="/posts">
        ← Back to Posts
      </BackLink>
      
      <Title>{isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}</Title>
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="title">Title</Label>
          <Input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter post title"
          />
          {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="post-url-slug"
          />
          <p className="hint">Leave blank to auto-generate from title</p>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="content">Content</Label>
          <RichTextEditor
            value={formData.content}
            onChange={handleEditorChange}
          />
          {errors.content && <ErrorMessage>{errors.content}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="featured_image">Featured Image</Label>
          <Input
            type="file"
            id="featured_image"
            name="featured_image"
            onChange={handleFeaturedImageChange}
            accept="image/*"
          />
          {errors.featured_image && <ErrorMessage>{errors.featured_image}</ErrorMessage>}
          
          {preview.featured_image && (
            <ImagePreviewContainer>
              <ImagePreview>
                <PreviewImage 
                  src={
                    typeof preview.featured_image === 'string' 
                      ? preview.featured_image 
                      : URL.createObjectURL(preview.featured_image)
                  } 
                  alt="Featured preview" 
                />
                <RemoveButton onClick={handleRemoveFeaturedImage}>×</RemoveButton>
              </ImagePreview>
            </ImagePreviewContainer>
          )}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="additional_images">Additional Images</Label>
          <Input
            type="file"
            id="additional_images"
            name="additional_images"
            onChange={handleAdditionalImagesChange}
            accept="image/*"
            multiple
          />
          
          {preview.additional_images && preview.additional_images.length > 0 && (
            <AdditionalImagesContainer>
              <Label>Preview</Label>
              <AdditionalImagesGrid>
                {preview.additional_images.map((image, index) => (
                  <ImageContainer key={index}>
                    <ImagePreview>
                      <PreviewImage 
                        src={
                          typeof image === 'string' 
                            ? image 
                            : URL.createObjectURL(image)
                        } 
                        alt={`Preview ${index + 1}`} 
                      />
                      <RemoveButton onClick={() => handleRemoveAdditionalImage(index)}>×</RemoveButton>
                    </ImagePreview>
                  </ImageContainer>
                ))}
              </AdditionalImagesGrid>
            </AdditionalImagesContainer>
          )}
        </FormGroup>
        
        <FormGroup>
          <Checkbox>
            <Input
              type="checkbox"
              id="published"
              name="published"
              checked={formData.published}
              onChange={handleChange}
            />
            <Label htmlFor="published" style={{ marginBottom: 0 }}>Publish immediately</Label>
          </Checkbox>
        </FormGroup>
        
        {errors.form && <ErrorMessage>{errors.form}</ErrorMessage>}
        
        <ButtonContainer>
          <StyledButton 
            type="submit" 
            disabled={loading}
            color="primary"
          >
            {loading ? 'Saving...' : (isEditMode ? 'Update Post' : 'Create Post')}
          </StyledButton>
          
          <StyledButton 
            type="button" 
            onClick={() => navigate('/posts')}
            color="secondary"
          >
            Cancel
          </StyledButton>
        </ButtonContainer>
      </Form>
    </Container>
  );
};

export default PostFormPage; 