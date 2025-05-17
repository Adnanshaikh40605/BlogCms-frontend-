import { 
  BrowserRouter as Router, 
  Routes, 
  Route,
  createRoutesFromElements,
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom';
import { createGlobalStyle, styled } from 'styled-components';

// Context Providers
import { BlogProvider } from './context/BlogContext';
import { CommentProvider } from './context/CommentContext';

// Layouts
import Layout from './components/Layout';

// Import pages directly instead of using lazy loading
import HomePage from './pages/HomePage';
import PostListPage from './pages/PostListPage';
import PostDetailPage from './pages/PostDetailPage';
import PostFormPage from './pages/PostFormPage';
import CommentsPage from './pages/CommentsPage';
import BlogListPage from './pages/BlogListPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';

// Global styles
const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html, body {
    width: 100%;
    overflow-x: hidden;
    scroll-behavior: smooth;
  }
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f9f9f9;
  }
  
  a {
    color: #0066cc;
    text-decoration: none;
    transition: color 0.2s ease;
  }
  
  #root {
    width: 100%;
    min-height: 100vh;
    overflow-x: hidden;
  }

  img {
    max-width: 100%;
    height: auto;
    display: block; /* Prevent layout shifts */
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.3;
  }

  p {
    margin-bottom: 1rem;
  }
  
  .page-transition {
    animation: fadeIn 0.3s ease-in-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Prevent multiple renders visible at the same time */
  .route-container {
    position: relative;
  }

  .route-container > * {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }
`;

const App = () => {
  return (
    <BlogProvider>
      <CommentProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <GlobalStyle />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              
              {/* Admin routes */}
              <Route path="posts">
                <Route index element={<PostListPage />} />
                <Route path="new" element={<PostFormPage />} />
                <Route path="edit/:id" element={<PostFormPage />} />
              </Route>
              <Route path="comments" element={<CommentsPage />} />
              
              {/* Public blog routes */}
              <Route path="blog" element={<BlogListPage />} />
              <Route path="blog/:id" element={<BlogPostPage />} />
            </Route>
          </Routes>
        </Router>
      </CommentProvider>
    </BlogProvider>
  );
};

export default App;
