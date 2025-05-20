# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tenantli is a property management system that helps tenants and landlords document property conditions, manage lease agreements, and create detailed reports with photo evidence. It's particularly useful for move-in and move-out documentation.

## Architecture

The application follows a client-server architecture:

- **Backend**: Node.js/Express.js REST API with MySQL database
- **Frontend**: Next.js React application with Tailwind CSS

## Tech Stack

### Backend
- Express.js (web framework)
- MySQL (database via mysql2)
- JWT (authentication)
- Bcrypt (password hashing)
- Multer (file uploads)
- Nodemailer (email functionality)

### Frontend
- Next.js (React framework)
- Tailwind CSS (styling)
- Axios (API calls)
- JWT Decode (token handling)
- React Toastify (notifications)
- Next-PWA (Progressive Web App support)
- jsPDF (PDF generation)

## Key Features

1. **Property Management**: Create, view, update, delete properties; track property details, addresses, and lease information; manage rooms within properties; upload and store lease documents
   
2. **Report System**: Create property reports (move-in, move-out, general); upload photos for reports; share reports via unique UUIDs; approve/reject reports; archive reports
   
3. **Photo Management**: Upload and associate photos with properties, rooms, and reports; add notes and tags to photos
   
4. **User Authentication**: Registration with email verification; secure login; password reset functionality
   
5. **PWA Capabilities**: Works offline; installable on mobile devices; service worker for caching

## Development Commands

### Backend Commands
```bash
# Install dependencies
cd backend
npm install

# Start development server with hot reloading
npm run dev

# Start production server
npm start
```

### Frontend Commands
```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Environment Setup

The backend requires a `.env` file with the following variables:
- `PORT`: Server port (default: 5050)
- `DB_HOST`: MySQL database host
- `DB_USER`: MySQL database user
- `DB_PASSWORD`: MySQL database password
- `DB_NAME`: MySQL database name
- `JWT_SECRET`: Secret for JWT token generation
- `EMAIL_USER`: SMTP email user for sending emails
- `EMAIL_PASS`: SMTP email password
- `EMAIL_HOST`: SMTP email host
- `EMAIL_PORT`: SMTP email port
- `CLIENT_URL`: Frontend URL (for email links)

## API Endpoints

The backend provides several RESTful API endpoints:

- `/api/auth`: Authentication routes (login, register, verify email)
- `/api/users`: User management routes
- `/api/properties`: Property management routes
- `/api/reports`: Report management routes
- `/api/photos`: Photo management routes
- `/api/files`: File upload/download routes

## Database Schema

The main database tables include:
- `users`: User information
- `properties`: Property details
- `property_rooms`: Rooms within properties
- `reports`: Property reports
- `photos`: Photos associated with properties or reports

## Authentication Flow

1. User registers with email and password
2. Email verification is sent
3. User verifies email
4. User can log in to get JWT token
5. Token is stored in localStorage
6. API requests include the token in Authorization header
7. Protected routes check token validity

## Deployment

The application is deployed as follows:
- Backend: API server at `https://api.tenantli.ai`
- Frontend: Next.js application at `https://mobile.tenantli.ai`