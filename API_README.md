# Blog CMS Frontend API Guide

## API Configuration

This frontend application is designed to connect to a Django REST API backend. There are two ways the frontend connects to the backend:

1. **Development Mode**: Using Vite's proxy feature
2. **Production Mode**: Using environment variables

## Setup Instructions

### 1. Development Mode Setup

In development mode, the frontend makes requests to relative URLs like `/api/posts/`, and Vite's development server proxies these requests to the Django backend.

1. Make sure your Django backend is running (typically on port 8000)
2. Create a `.env.development` file in the frontend root with:
   ```
   VITE_API_BASE_URL=""
   VITE_MEDIA_URL="/media/"
   ```
3. Run the frontend development server: `npm run dev`

The proxy is configured in `vite.config.js` to forward requests:
- `/api/*` → `http://localhost:8000/api/*`
- `/media/*` → `http://localhost:8000/media/*`
- `/ckeditor/*` → `http://localhost:8000/ckeditor/*`

### 2. Production Mode Setup

For production deployment:

1. Create a `.env.production` file with:
   ```
   VITE_API_BASE_URL="https://your-api-domain.com"
   VITE_MEDIA_URL="https://your-api-domain.com/media/"
   ```
2. Build the frontend: `npm run build`

## Troubleshooting API Connections

If your API requests are failing, check:

1. **Browser Console**: Look for any CORS or network errors
2. **Request URLs**: Make sure the URLs match the expected format
   - Development: `/api/posts/` (proxied to backend)
   - Production: `https://your-api-domain.com/api/posts/`
3. **Django Server**: Ensure it's running and accessible
4. **Environment Variables**: Check that they're properly set

## Common Issues

### "Comments not showing up"

This can happen when:
- The API request is going to the wrong URL (e.g., `/comments/` instead of `/api/comments/`)
- The proxy isn't correctly configured in development
- There's a CORS issue in production mode

### "404 Not Found" errors

Check that:
- The API endpoint path is correct
- The Django server is running
- The proxy settings in vite.config.js are correct

### "Network Error" in console

This typically indicates:
- The Django server is not running
- There's a CORS configuration issue
- The API endpoint doesn't exist

## Available API Endpoints

All API endpoints are defined in `src/api/apiEndpoints.js` for consistency.

### Blog Posts

- **Get all posts**: `GET /api/posts/`
  - Query parameters:
    - `published=true` or `published=false` to filter by publication status

- **Get specific post**: `GET /api/posts/{post_id}/`
- **Create post**: `POST /api/posts/`
- **Update post**: `PUT /api/posts/{post_id}/`
- **Partially update post**: `PATCH /api/posts/{post_id}/`
- **Delete post**: `DELETE /api/posts/{post_id}/`
- **Upload images to post**: `POST /api/posts/{post_id}/upload_images/`

### Comments

- **Get all comments**: `GET /api/comments/`
  - Query parameters:
    - `post={post_id}` to filter by post
    - `approved=true` or `approved=false` to filter by approval status

- **Get a comment**: `GET /api/comments/{comment_id}/`
- **Create comment**: `POST /api/comments/`
- **Update comment**: `PUT /api/comments/{comment_id}/`
- **Partially update comment**: `PATCH /api/comments/{comment_id}/`
- **Delete comment**: `DELETE /api/comments/{comment_id}/`
- **Get pending comments count**: `GET /api/comments/pending-count/`
- **Approve comment**: `POST /api/comments/{comment_id}/approve/`
- **Reject comment**: `POST /api/comments/{comment_id}/reject/`
- **Bulk approve comments**: `POST /api/comments/bulk_approve/`
- **Bulk reject comments**: `POST /api/comments/bulk_reject/`
- **Get all comments for post**: `GET /api/comments/all/?post={post_id}` 