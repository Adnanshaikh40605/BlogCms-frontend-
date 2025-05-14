# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Blog CMS Frontend

This is the frontend for the Blog CMS project, built with React.

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the frontend directory with the following contents:
   ```
   # API URL - Set this to your backend API URL
   VITE_API_URL=https://web-production-f03ff.up.railway.app
   
   # Media URL - Optional, will use API_URL/media/ if not set
   VITE_MEDIA_URL=https://web-production-f03ff.up.railway.app/media/
   
   # Set to true for production, false for development
   VITE_PRODUCTION=false
   ```
   - For local development, use `http://localhost:8000` as the API URL
   - For production, use your deployed backend URL

4. Start the development server:
   ```
   npm run dev
   ```

## API Connection

The frontend connects to the Django backend API with the following features:

- Blog posts: View, create, update, and delete
- Comments: Submit and view comments on blog posts
- CKEditor 5: Rich text editing with image upload
- Media handling: Proper display of uploaded images

## Environment Variables

- `VITE_API_URL`: The URL of the backend API
- `VITE_MEDIA_URL`: The URL for media files (optional)
- `VITE_PRODUCTION`: Set to true for production environment

## Deployment

This frontend is deployed on Vercel at [https://blog-cms-frontend-ten.vercel.app/](https://blog-cms-frontend-ten.vercel.app/).

When deploying to Vercel, make sure to set the environment variables in the Vercel dashboard.
