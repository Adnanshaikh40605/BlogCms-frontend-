import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import logoWhiteImage from '../assets/logo-white.js';

const FooterContainer = styled.footer`
  background-color: #222;
  color: #fff;
  padding: 4rem 0 2rem;
  margin-top: 4rem;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const FooterLogo = styled.div`
  margin-bottom: 1.5rem;
  
  img {
    height: 50px;
    margin-bottom: 1rem;
  }
`;

const FooterLogoText = styled.div`
  font-weight: 700;
  font-size: 1.8rem;
  color: #fff;
  
  span {
    color: #ffcc00;
  }
`;

const FooterSection = styled.div`
  h3 {
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
    color: #fff;
    position: relative;
    
    &:after {
      content: '';
      position: absolute;
      bottom: -0.5rem;
      left: 0;
      width: 40px;
      height: 2px;
      background-color: #ffcc00;
    }
  }
`;

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  
  li {
    margin-bottom: 0.8rem;
  }
  
  a {
    color: #ccc;
    text-decoration: none;
    transition: color 0.2s;
    
    &:hover {
      color: #ffcc00;
    }
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  
  a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #333;
    color: #fff;
    text-decoration: none;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #ffcc00;
      color: #222;
    }
  }
`;

const Copyright = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 2rem 0;
  text-align: center;
  border-top: 1px solid #333;
  margin-top: 3rem;
  font-size: 0.9rem;
  color: #999;
`;

const BlogFooter = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterLogo>
            <img src={logoWhiteImage} alt="Driveronhire Logo" />
            <FooterLogoText>Driver<span>on</span>Hire</FooterLogoText>
          </FooterLogo>
          <SocialLinks>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">f</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">i</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">in</a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">y</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">t</a>
          </SocialLinks>
        </FooterSection>
        
        <FooterSection>
          <h3>Quick Links</h3>
          <FooterLinks>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/download">Download App</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </FooterLinks>
        </FooterSection>
        
        <FooterSection>
          <h3>Popular Topics</h3>
          <FooterLinks>
            <li><Link to="/blog/category/driving-tips">Driving Tips</Link></li>
            <li><Link to="/blog/category/car-care">Car Care</Link></li>
            <li><Link to="/blog/category/travel">Travel Guides</Link></li>
            <li><Link to="/blog/category/safety">Road Safety</Link></li>
            <li><Link to="/blog/category/hiring-guide">Driver Hiring Guide</Link></li>
          </FooterLinks>
        </FooterSection>
        
        <FooterSection>
          <h3>Contact Us</h3>
          <FooterLinks>
            <li>Email: info@driveronhire.com</li>
            <li>Phone: +91 1234567890</li>
            <li>Address: 123 Driver Street, Pune, Maharashtra, India</li>
          </FooterLinks>
        </FooterSection>
      </FooterContent>
      
      <Copyright>
        © {currentYear} All Rights Reserved By | Onay Jobs Private Limited
      </Copyright>
    </FooterContainer>
  );
};

export default BlogFooter; 