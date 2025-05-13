import styled from 'styled-components';
import { getYear } from 'date-fns';

const FooterContainer = styled.footer`
  background-color: #f8f9fa;
  padding: 2rem;
  margin-top: auto;
  border-top: 1px solid #e9ecef;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const Copyright = styled.p`
  color: #6c757d;
  margin: 0;
`;

const Footer = () => {
  // Use date-fns to get current year safely
  const year = getYear(new Date());
  
  return (
    <FooterContainer>
      <FooterContent>
        <Copyright>
          &copy; {year} Blog CMS. All rights reserved.
        </Copyright>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer; 