import styled, { css } from 'styled-components';

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.size === 'small' ? '0.4rem 0.75rem' : '0.6rem 1.25rem'};
  font-size: ${props => props.size === 'small' ? '0.875rem' : '1rem'};
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 1px solid transparent;
  line-height: 1.5;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  
  &:focus {
    outline: none;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
  
  ${props => props.$variant === 'primary' || !props.$variant && css`
    background-color: #0d6efd;
    color: white;
    
    &:hover, &:focus {
      background-color: #0b5ed7;
    }
    
    &:disabled {
      background-color: #8bb9fe;
      cursor: not-allowed;
      box-shadow: none;
    }
  `}
  
  ${props => props.$variant === 'secondary' && css`
    background-color: #6c757d;
    color: white;
    
    &:hover, &:focus {
      background-color: #5c636a;
    }
    
    &:disabled {
      background-color: #b6babe;
      cursor: not-allowed;
      box-shadow: none;
    }
  `}
  
  ${props => props.$variant === 'danger' && css`
    background-color: #dc3545;
    color: white;
    
    &:hover, &:focus {
      background-color: #bb2d3b;
    }
    
    &:disabled {
      background-color: #f1aeb5;
      cursor: not-allowed;
      box-shadow: none;
    }
  `}
  
  ${props => props.$variant === 'success' && css`
    background-color: #198754;
    color: white;
    
    &:hover, &:focus {
      background-color: #157347;
    }
    
    &:disabled {
      background-color: #a3cfbb;
      cursor: not-allowed;
      box-shadow: none;
    }
  `}
  
  ${props => props.$variant === 'outline' && css`
    background-color: transparent;
    color: #0d6efd;
    border-color: #0d6efd;
    
    &:hover, &:focus {
      background-color: #f1f8ff;
    }
    
    &:disabled {
      color: #8bb9fe;
      border-color: #8bb9fe;
      cursor: not-allowed;
      box-shadow: none;
    }
  `}
`;

export default Button; 