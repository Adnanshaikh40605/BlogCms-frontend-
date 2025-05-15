import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { ckEditorAPI, mediaAPI } from '../api/apiService';

const EditorContainer = styled.div`
  margin-bottom: 1.5rem;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border: 1px solid #dce0e5;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  gap: 0.5rem;
`;

const ToolButton = styled.button`
  width: 36px;
  height: 36px;
  background-color: ${props => props.$active ? '#e9ecef' : 'transparent'};
  border: 1px solid ${props => props.$active ? '#ced4da' : 'transparent'};
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.$active ? 'bold' : 'normal'};
  color: #495057;
  
  &:hover {
    background-color: #e9ecef;
    border-color: #ced4da;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background-color: #dce0e5;
  margin: 0 0.25rem;
  align-self: center;
`;

const EditorContent = styled.div`
  min-height: ${props => props.$height || '400px'};
  padding: 1rem;
  border: 1px solid #dce0e5;
  border-top: none;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  outline: none;
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
  background-color: white;
  overflow-y: auto;
  
  &:focus {
    border-color: #80bdff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
  
  & p {
    margin-bottom: 1rem;
  }
  
  & h1, & h2, & h3, & h4 {
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    font-weight: 600;
  }
  
  & ul, & ol {
    margin-bottom: 1rem;
    padding-left: 2rem;
  }
  
  & blockquote {
    border-left: 3px solid #dce0e5;
    padding-left: 1rem;
    margin-left: 0;
    color: #6c757d;
  }
  
  & img {
    max-width: 100%;
    height: auto;
    margin: 1rem 0;
    border-radius: 4px;
  }
`;

const RichTextEditor = ({ value, onChange, height = 400 }) => {
  const editorRef = useRef(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  
  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && value) {
      editorRef.current.innerHTML = value;
    }
  }, []);
  
  // Update editor content when value changes externally
  useEffect(() => {
    if (editorRef.current && value !== undefined && !isEditorFocused) {
      // Only update if not currently editing (to prevent cursor jumping)
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value, isEditorFocused]);
  
  // Execute command on the content
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    
    // After executing command, update onChange
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
    
    // Refocus on editor
    editorRef.current.focus();
  };
  
  // Format buttons
  const formatOptions = [
    { command: 'formatBlock', value: '<h2>', label: 'H2', icon: 'H2' },
    { command: 'formatBlock', value: '<h3>', label: 'H3', icon: 'H3' },
    { command: 'formatBlock', value: '<p>', label: 'P', icon: 'P' },
  ];
  
  // Style buttons
  const styleOptions = [
    { command: 'bold', label: 'Bold', icon: 'B' },
    { command: 'italic', label: 'Italic', icon: 'I' },
    { command: 'underline', label: 'Underline', icon: 'U' },
  ];
  
  // List buttons
  const listOptions = [
    { command: 'insertUnorderedList', label: 'Bullet List', icon: '•' },
    { command: 'insertOrderedList', label: 'Numbered List', icon: '1.' },
  ];
  
  // Other buttons
  const otherOptions = [
    { command: 'createLink', label: 'Link', icon: '🔗', prompt: true, promptText: 'Enter URL:' },
    { command: 'formatBlock', value: '<blockquote>', label: 'Quote', icon: '"' },
  ];
  
  // Handle editor changes
  const handleInput = () => {
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };
  
  // Handle image upload
  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    
    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        try {
          // Show loading indicator or placeholder
          const tempId = 'img-loading-' + Date.now();
          execCommand('insertHTML', `<img id="${tempId}" src="data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='64' height='64'%3E%3Cpath fill='%23ccc' d='M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm4-9h-3V8a1 1 0 0 0-2 0v3H8a1 1 0 0 0 0 2h3v3a1 1 0 0 0 2 0v-3h3a1 1 0 0 0 0-2z'/%3E%3C/svg%3E" alt="Uploading..." />`);
          
          console.log('Starting image upload for file:', file.name, file.type, file.size);
          
          // Make sure file is valid
          if (file.size > 5 * 1024 * 1024) {
            throw new Error('File size exceeds 5MB limit');
          }
          
          if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
            throw new Error('File type not supported. Please use JPG, PNG, GIF or WebP');
          }
          
          // Upload the image using CKEditor API
          const response = await ckEditorAPI.uploadImage(file);
          
          // Once uploaded, replace the placeholder with the actual image
          if (response && response.url) {
            console.log('Upload successful, updating image with URL:', response.url);
            const imgUrl = mediaAPI.getImageUrl(response.url);
            const imgElement = document.getElementById(tempId);
            if (imgElement) {
              imgElement.src = imgUrl;
              imgElement.removeAttribute('id');
              imgElement.alt = file.name.split('.')[0]; // Use filename as alt
              
              // Trigger onChange to save the updated content
              handleInput();
            } else {
              console.error('Could not find placeholder image element with ID:', tempId);
            }
          } else {
            console.error('Upload response missing URL:', response);
            throw new Error('Server response missing image URL');
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          
          // Show more specific error message
          let errorMessage = 'Failed to upload image. Please try again.';
          if (error.message.includes('size exceeds')) {
            errorMessage = 'Image is too large. Maximum size is 5MB.';
          } else if (error.message.includes('type not supported')) {
            errorMessage = 'File type not supported. Please use JPG, PNG, GIF or WebP.';
          } else if (error.message.includes('status 404')) {
            errorMessage = 'Upload endpoint not found. Please check your backend configuration.';
          }
          alert(errorMessage);
          
          // Remove the placeholder on error
          const imgElement = document.getElementById(tempId);
          if (imgElement) {
            imgElement.remove();
          }
        }
      }
    };
    
    input.click();
  };
  
  // Check if a command is active
  const isCommandActive = (command, value = null) => {
    return document.queryCommandState(command);
  };
  
  return (
    <EditorContainer>
      <Toolbar>
        {formatOptions.map((option, index) => (
          <ToolButton
            key={index}
            title={option.label}
            onClick={() => execCommand(option.command, option.value)}
            $active={document.queryCommandValue('formatBlock') === option.value}
          >
            {option.icon}
          </ToolButton>
        ))}
        
        <Divider />
        
        {styleOptions.map((option, index) => (
          <ToolButton
            key={index}
            title={option.label}
            onClick={() => execCommand(option.command)}
            $active={isCommandActive(option.command)}
          >
            {option.icon}
          </ToolButton>
        ))}
        
        <Divider />
        
        {listOptions.map((option, index) => (
          <ToolButton
            key={index}
            title={option.label}
            onClick={() => execCommand(option.command)}
            $active={isCommandActive(option.command)}
          >
            {option.icon}
          </ToolButton>
        ))}
        
        <Divider />
        
        {otherOptions.map((option, index) => (
          <ToolButton
            key={index}
            title={option.label}
            onClick={() => {
              if (option.prompt) {
                const url = prompt(option.promptText);
                if (url) {
                  execCommand(option.command, url);
                }
              } else {
                execCommand(option.command, option.value);
              }
            }}
            $active={
              option.command === 'formatBlock' 
                ? document.queryCommandValue('formatBlock') === option.value 
                : isCommandActive(option.command)
            }
          >
            {option.icon}
          </ToolButton>
        ))}
        
        <ToolButton
          title="Insert Image"
          onClick={handleImageUpload}
        >
          🖼️
        </ToolButton>
      </Toolbar>
      
      <EditorContent
        ref={editorRef}
        contentEditable
        $height={height}
        onInput={handleInput}
        onFocus={() => setIsEditorFocused(true)}
        onBlur={() => setIsEditorFocused(false)}
        dangerouslySetInnerHTML={{ __html: value || '<p><br></p>' }}
      />
    </EditorContainer>
  );
};

export default RichTextEditor; 