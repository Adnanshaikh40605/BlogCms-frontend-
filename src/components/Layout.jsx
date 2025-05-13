import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Header from './Header';
import Footer from './Footer';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
`;

const Main = styled.main`
  flex: 1;
  padding: 2rem 3rem;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 1.5rem 2rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem 1.5rem;
  }
`;

const Layout = () => {
  return (
    <LayoutContainer>
      <Header />
      <Main>
        <Outlet />
      </Main>
      <Footer />
    </LayoutContainer>
  );
};

export default Layout; 