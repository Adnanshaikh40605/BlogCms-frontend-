import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 3rem;
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 0.75rem 2rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem 1.5rem;
  }
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  text-decoration: none;
  
  &:hover {
    color: #0066cc;
  }
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'flex' : 'none'};
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: white;
    padding: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-top: 1px solid #f1f1f1;
    z-index: 200;
  }
`;

const NavLink = styled(Link)`
  color: #555;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s, border-bottom 0.2s;
  padding: 0.5rem 0;
  border-bottom: 2px solid transparent;
  
  &:hover {
    color: #0066cc;
  }
  
  &.active {
    color: #0066cc;
    border-bottom: 2px solid #0066cc;
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem 0;
    width: 100%;
    border-bottom: 1px solid #f1f1f1;
    
    &.active {
      border-bottom: 1px solid #f1f1f1;
      color: #0066cc;
    }
    
    &:last-child {
      border-bottom: none;
    }
  }
`;

const NavLinkGroup = styled.div`
  display: flex;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0;
    width: 100%;
  }
`;

const Divider = styled.div`
  width: 1px;
  background-color: #e0e0e0;
  margin: 0 1rem;
  
  @media (max-width: 768px) {
    width: 100%;
    height: 1px;
    margin: 0.5rem 0;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #333;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  return (
    <HeaderContainer>
      <Nav>
        <Logo to="/">Blog CMS</Logo>
        
        <MobileMenuButton onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? '✕' : '☰'}
        </MobileMenuButton>
        
        <NavLinks $isOpen={isMenuOpen}>
          <NavLink 
            to="/blog" 
            className={location.pathname.startsWith('/blog') ? 'active' : ''}
            onClick={closeMenu}
          >
            View Blog
          </NavLink>
          
          <Divider />
          
          <NavLinkGroup>
            <NavLink to="/" className={location.pathname === '/' ? 'active' : ''} onClick={closeMenu}>
              Dashboard
            </NavLink>
            <NavLink 
              to="/posts" 
              className={location.pathname === '/posts' ? 'active' : ''}
              onClick={closeMenu}
            >
              All Posts
            </NavLink>
            <NavLink 
              to="/posts/new" 
              className={location.pathname === '/posts/new' ? 'active' : ''}
              onClick={closeMenu}
            >
              Create Post
            </NavLink>
            <NavLink 
              to="/comments" 
              className={location.pathname === '/comments' ? 'active' : ''}
              onClick={closeMenu}
            >
              Comments
            </NavLink>
          </NavLinkGroup>
        </NavLinks>
      </Nav>
    </HeaderContainer>
  );
};

export default Header; 