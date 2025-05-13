import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import logoImage from '../assets/logo.js';

const HeaderContainer = styled.header`
  padding: 1rem 0;
  background-color: #fff;
  border-bottom: 1px solid #eee;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  text-decoration: none;
  display: flex;
  align-items: center;
  
  img {
    height: 40px;
  }
`;

const LogoText = styled.span`
  font-weight: 700;
  color: #333;
  font-size: 1.4rem;
  margin-left: 0.5rem;
  
  span {
    color: #ffcc00;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: #333;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  transition: color 0.2s;
  padding: 0.5rem 0;
  position: relative;
  
  &:hover, &.active {
    color: #ffcc00;
  }
  
  &.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #ffcc00;
  }
`;

const DownloadButton = styled(Link)`
  background-color: #ffcc00;
  color: #333;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.9rem;
  text-transform: uppercase;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #ffd633;
  }
`;

const BlogHeader = ({ activePage = '' }) => {
  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo to="/">
          <img 
            src={logoImage} 
            alt="Driveronhire Logo" 
          />
          <LogoText>Driver<span>on</span>Hire</LogoText>
        </Logo>
        
        <Nav>
          <NavLink to="/" className={activePage === 'home' ? 'active' : ''}>
            Home
          </NavLink>
          <NavLink to="/blog" className={activePage === 'blog' ? 'active' : ''}>
            Blog
          </NavLink>
          <DownloadButton to="/download">
            Download App
          </DownloadButton>
        </Nav>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default BlogHeader; 