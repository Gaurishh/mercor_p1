# Mercor Time Tracker - System Architecture Diagram

## Overview

The Mercor Time Tracker is a comprehensive employee time tracking and monitoring system with three main applications: a web admin panel, a desktop Electron app, and a Node.js backend API.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                    CLIENT LAYER                                              │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                             │
│  ┌─────────────────────────────────┐                    ┌─────────────────────────────────────────────────┐ │
│  │        WEB ADMIN PANEL          │                    │           DESKTOP APP (Electron)               │ │
│  │      (React + React Router)     │                    │        (React + Redux + Electron)              │ │
│  │                                 │                    │                                                 │ │
│  │  ┌─────────────────────────┐    │                    │  ┌─────────────────────────────────────────┐   │ │
│  │  │    Authentication       │    │                    │  │         Authentication                 │   │ │
│  │  │   - Sign In/Out         │    │                    │  │        - Employee Login                │   │ │
│  │  │   - Email Verification  │    │                    │  │        - IP/MAC Tracking               │   │ │
│  │  │   - Password Reset      │    │                    │  │        - Auto Clock-out                │   │ │
│  │  └─────────────────────────┘    │                    │  └─────────────────────────────────────────┘   │ │
│  │                                 │                    │                                                 │ │
│  │  ┌─────────────────────────┐    │                    │  ┌─────────────────────────────────────────┐   │ │
│  │  │    Admin Dashboard      │    │                    │  │         Time Tracking                  │   │ │
│  │  │   - Employee Management │    │                    │  │        - Clock In/Out                  │   │ │
│  │  │   - Project Management  │    │                    │  │        - Task Assignment               │   │ │
│  │  │   - Real-time Monitoring│    │                    │  │        - Screenshot Capture            │   │ │
│  │  │   - Screenshot Requests │    │                    │  │        - Local File Storage            │   │ │
│  │  └─────────────────────────┘    │                    │  └─────────────────────────────────────────┘   │ │
│  │                                 │                    │                                                 │ │
│  │  ┌─────────────────────────┐    │                    │  ┌─────────────────────────────────────────┐   │ │
│  │  │    Employee Details     │    │                    │  │         HTTP Server                    │   │ │
│  │  │   - Individual Views    │    │                    │  │        - Remote Screenshot API         │   │ │
│  │  │   - Task Assignments    │    │                    │  │        - Health Check Endpoint         │   │ │
│  │  │   - Time Logs           │    │                    │  │        - Employee ID Management        │   │ │
│  │  │   - Screenshot History  │    │                    │  └─────────────────────────────────────────┘   │ │
│  │  └─────────────────────────┘    │                    │                                                 │ │
│  │                                 │                    │  ┌─────────────────────────────────────────┐   │ │
│  │  ┌─────────────────────────┐    │                    │  │         IPC Communication              │   │ │
│  │  │    Client Ready Page    │    │                    │  │        - Screenshot Capture            │   │ │
│  │  │   - Non-admin Interface │    │                    │  │        - MAC Address Detection         │   │ │
│  │  │   - Basic Information   │    │                    │  │        - External URL Opening          │   │ │
│  │  └─────────────────────────┘    │                    │  └─────────────────────────────────────────┘   │ │
│  └─────────────────────────────────┘                    └─────────────────────────────────────────────────┘ │
│                                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                   API LAYER                                                  │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                                    NODE.JS BACKEND API                                                 │ │
│  │                                  (Express + MongoDB)                                                   │ │
│  │                                                                                                         │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                                    ROUTES                                                           │ │ │
│  │  │                                                                                                     │ │ │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │ │
│  │  │  │    AUTH     │  │  EMPLOYEES  │  │   PROJECTS  │  │    TASKS    │  │ TIMELOGS    │  │ SCREENSHOTS │ │ │ │
│  │  │  │             │  │             │  │             │  │             │  │             │  │             │ │ │ │
│  │  │  │ • Signup    │  │ • CRUD      │  │ • CRUD      │  │ • CRUD      │  │ • Clock In  │  │ • Upload    │ │ │ │
│  │  │  │ • Signin    │  │ • Status    │  │ • Tasks     │  │ • Assign    │  │ • Clock Out │  │ • Remote    │ │ │ │
│  │  │  │ • Verify    │  │ • IP/MAC    │  │ • Delete    │  │ • Complete  │  │ • History   │  │ • Metadata  │ │ │ │
│  │  │  │ • Reset     │  │ • Tasks     │  │             │  │ • Uncomplete│  │             │  │ • Cloud     │ │ │ │
│  │  │  │ • Activate  │  │ • Screenshots│ │             │  │             │  │             │  │             │ │ │ │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │ │ │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                                                         │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                                  MIDDLEWARE                                                         │ │ │
│  │  │                                                                                                     │ │ │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │ │ │
│  │  │  │   CORS      │  │   JSON      │  │  MULTER     │  │ VALIDATION  │  │  ERROR      │                │ │ │
│  │  │  │             │  │  PARSER     │  │             │  │             │  │  HANDLING   │                │ │ │
│  │  │  │ • Cross-    │  │ • Request   │  │ • File      │  │ • Input     │  │ • Global    │                │ │ │
│  │  │  │   Origin    │  │   Body      │  │   Upload    │  │   Validation│  │   Error     │                │ │ │
│  │  │  │ • Headers   │  │ • Parsing   │  │ • Limits    │  │ • Sanitize  │  │   Handler   │                │ │ │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘                │ │ │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                                                         │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                                  UTILITIES                                                          │ │ │
│  │  │                                                                                                     │ │ │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │ │ │
│  │  │  │  CLOUDINARY │  │   MAILER    │  │   EMAIL     │  │ EMPLOYEE    │  │  CRYPTO     │                │ │ │
│  │  │  │             │  │             │  │ TEMPLATES   │  │ SCREENSHOT  │  │             │                │ │ │
│  │  │  │ • Image     │  │ • SMTP      │  │             │  │ SERVICE     │  │ • Token     │                │ │ │
│  │  │  │   Upload    │  │ • Email     │  │ • Welcome   │  │             │  │   Generation│                │ │ │
│  │  │  │ • Optimize  │  │   Sending   │  │ • Reset     │  │ • Remote    │  │ • Hashing   │                │ │ │
│  │  │  │ • Metadata  │  │ • Templates │  │ • Activation│  │   Capture   │  │ • Security  │                │ │ │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘                │ │ │
│  │  └─────────────────────────────────────────────────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                 DATA LAYER                                                  │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                                    MONGODB DATABASE                                                     │ │
│  │                                                                                                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │  EMPLOYEES  │  │   PROJECTS  │  │    TASKS    │  │  TIMELOGS   │  │ SCREENSHOTS │  │    TOKENS   │ │ │
│  │  │             │  │             │  │             │  │             │  │             │  │             │ │ │
│  │  │ • _id       │  │ • _id       │  │ • _id       │  │ • _id       │  │ • _id       │  │ • _id       │ │ │
│  │  │ • firstName │  │ • name      │  │ • name      │  │ • employeeId│  │ • employeeId│  │ • employeeId│ │ │
│  │  │ • lastName  │  │ • description│ │ • description│ │ • taskIds   │  │ • filename  │  │ • token     │ │ │
│  │  │ • email     │  │ • taskIds   │  │ • projectId │  │ • clockIn   │  │ • cloudUrl  │  │ • expiresAt │ │ │
│  │  │ • password- │  │ • createdAt │  │ • employeeIds│ │ • clockOut  │  │ • metadata  │  │ • type      │ │ │
│  │  │   Hash      │  │ • updatedAt │  │ • isCompleted│ │ • screenshot│  │ • timeLogId │  │             │ │ │
│  │  │ • gender    │  │             │  │ • workedOnBy│ │   Ids        │  │ • createdAt │  │             │ │ │
│  │  │ • isAdmin   │  │             │  │ • completedAt│ │ • createdAt │  │ • updatedAt │  │             │ │ │
│  │  │ • isActive  │  │             │  │ • completedBy│ │ • updatedAt │  │             │  │             │ │ │
│  │  │ • emailVer- │  │             │  │ • createdAt │  │             │  │             │  │             │ │ │
│  │  │   ified     │  │             │  │ • updatedAt │  │             │  │             │  │             │ │ │
│  │  │ • ipAddress │  │             │  │             │  │             │  │             │  │             │ │ │
│  │  │ • macAddress│  │             │  │             │  │             │  │             │  │             │ │ │
│  │  │ • taskIds   │  │             │  │             │  │             │  │             │  │             │ │ │
│  │  │ • lastLogin │  │             │  │             │  │             │  │             │  │             │ │ │
│  │  │ • createdAt │  │             │  │             │  │             │  │             │  │             │ │ │
│  │  │ • updatedAt │  │             │  │             │  │             │  │             │  │             │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                EXTERNAL SERVICES                                            │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                             │
│  ┌─────────────────────────────────┐                    ┌─────────────────────────────────────────────────┐ │
│  │         CLOUDINARY              │                    │              SMTP SERVER                        │ │
│  │                                 │                    │                                                 │ │
│  │  • Image Storage                │                    │  • Email Delivery                              │ │
│  │  • Image Optimization           │                    │  • Template Rendering                          │ │
│  │  • CDN Distribution             │                    │  • Authentication Emails                        │ │
│  │  • Metadata Management          │                    │  • Password Reset Emails                        │ │
│  │  • Public URLs                  │                    │  • Account Activation Emails                    │ │
│  └─────────────────────────────────┘                    └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                           DATA FLOW DIAGRAM                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │
│  │   DESKTOP   │    │    WEB      │    │   BACKEND   │    │  DATABASE   │    │  EXTERNAL   │              │
│  │    APP      │    │   ADMIN     │    │     API     │    │  (MongoDB)  │    │  SERVICES   │              │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘              │
│         │                   │                   │                   │                   │                  │
│         │                   │                   │                   │                   │                  │
│         │ 1. Employee Login │                   │                   │                   │                  │
│         │───────────────────┼───────────────────▶│                   │                   │                  │
│         │                   │                   │                   │                   │                  │
│         │                   │ 2. Auth Request   │                   │                   │                  │
│         │                   │───────────────────▶│                   │                   │                  │
│         │                   │                   │                   │                   │                  │
│         │                   │                   │ 3. Validate User  │                   │                  │
│         │                   │                   │───────────────────▶│                   │                  │
│         │                   │                   │                   │                   │                  │
│         │                   │                   │ 4. User Data      │                   │                  │
│         │                   │                   │◀──────────────────│                   │                  │
│         │                   │                   │                   │                   │                  │
│         │ 5. Auth Response  │                   │                   │                   │                  │
│         │◀──────────────────┼───────────────────│                   │                   │                  │
│         │                   │                   │                   │                   │                  │
│         │                   │ 6. Auth Response  │                   │                   │                  │
│         │                   │◀──────────────────│                   │                   │                  │
│         │                   │                   │                   │                   │                  │
│         │ 7. Update IP/MAC  │                   │                   │                   │                  │
│         │───────────────────┼───────────────────▶│                   │                   │                  │
│         │                   │                   │                   │                   │                  │
│         │                   │                   │ 8. Store IP/MAC   │                   │                  │
│         │                   │                   │───────────────────▶│                   │                  │
│         │                   │                   │                   │                   │                  │
│         │ 9. Clock In       │                   │                   │                   │                  │
│         │───────────────────┼───────────────────▶│                   │                   │                  │
│         │                   │                   │                   │                   │                  │
│         │                   │                   │ 10. Create TimeLog│                   │                  │
│         │                   │                   │───────────────────▶│                   │                  │
│         │                   │                   │                   │                   │                  │
│         │ 11. Screenshot    │                   │                   │                   │                  │
│         │    Capture       │                   │                   │                   │                  │
│         │───────────────────┼───────────────────▶│                   │                   │                  │
│         │                   │                   │                   │                   │                  │
│         │                   │                   │ 12. Upload Image  │                   │                  │
│         │                   │                   │───────────────────┼───────────────────▶│                  │
│         │                   │                   │                   │                   │                  │
│         │                   │                   │ 13. Image URL     │                   │                  │
│         │                   │                   │◀──────────────────┼───────────────────│                  │
│         │                   │                   │                   │                   │                  │
│         │                   │                   │ 14. Save Metadata │                   │                  │
│         │                   │                   │───────────────────▶│                   │                  │
│         │                   │                   │                   │                   │                  │
│         │ 15. Remote        │                   │                   │                   │                  │
│         │    Screenshot     │                   │                   │                   │                  │
│         │    Request        │                   │                   │                   │                  │
│         │───────────────────┼───────────────────▶│                   │                   │                  │
│         │                   │                   │                   │                   │                  │
│         │                   │                   │ 16. HTTP Request  │                   │                  │
│         │                   │                   │    to Desktop     │                   │                  │
│         │                   │                   │───────────────────▶│                   │                  │
│         │                   │                   │                   │                   │                  │
│         │ 17. Screenshot    │                   │                   │                   │                  │
│         │    Response       │                   │                   │                   │                  │
│         │◀──────────────────┼───────────────────│                   │                   │                  │
│         │                   │                   │                   │                   │                  │
│         │                   │                   │ 18. Upload & Save │                   │                  │
│         │                   │                   │───────────────────┼───────────────────▶│                  │
│         │                   │                   │                   │                   │                  │
│         │                   │                   │ 19. Email         │                   │                  │
│         │                   │                   │    Notification   │                   │                  │
│         │                   │                   │───────────────────┼───────────────────▶│                  │
│         │                   │                   │                   │                   │                  │
│         │ 20. Clock Out     │                   │                   │                   │                  │
│         │    (Auto/Manual)  │                   │                   │                   │                  │
│         │───────────────────┼───────────────────▶│                   │                   │                  │
│         │                   │                   │                   │                   │                  │
│         │                   │                   │ 21. Update TimeLog│                   │                  │
│         │                   │                   │───────────────────▶│                   │                  │
│         │                   │                   │                   │                   │                  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend Technologies

- **React 18** - UI framework for both web and desktop apps
- **React Router** - Client-side routing for web admin
- **Redux Toolkit** - State management for desktop app
- **Electron** - Desktop application framework
- **Axios** - HTTP client for API communication

### Backend Technologies

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **bcryptjs** - Password hashing
- **multer** - File upload handling
- **cors** - Cross-origin resource sharing

### External Services

- **Cloudinary** - Cloud image storage and optimization
- **SMTP Server** - Email delivery service
- **MongoDB Atlas** - Cloud database hosting (optional)

### Development Tools

- **Webpack** - Module bundling
- **Babel** - JavaScript transpilation
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Security Features

### Authentication & Authorization

- **Password Hashing** - bcryptjs with salt rounds
- **Email Verification** - Token-based verification system
- **Password Reset** - Secure token generation and validation
- **Session Management** - Local storage with employee ID tracking
- **Role-based Access** - Admin vs regular employee permissions

### Data Protection

- **Input Validation** - Server-side validation for all inputs
- **CORS Configuration** - Controlled cross-origin requests
- **Error Handling** - Generic error messages to prevent information leakage
- **File Upload Security** - File size limits and type validation

### Network Security

- **HTTPS** - Secure communication (in production)
- **IP/MAC Tracking** - Device identification for security
- **Request Rate Limiting** - Protection against abuse

## Scalability Considerations

### Database Design

- **Indexed Fields** - Optimized queries on frequently accessed fields
- **Document Relationships** - Efficient references between collections
- **Data Archiving** - Historical data management strategy

### Application Architecture

- **Modular Design** - Separated concerns for easy maintenance
- **API Versioning** - Backward compatibility support
- **Stateless Design** - No server-side session storage
- **Microservices Ready** - Can be split into separate services

### Performance Optimization

- **Image Compression** - Cloudinary optimization for screenshots
- **Lazy Loading** - On-demand data fetching
- **Caching Strategy** - Browser and CDN caching
- **Database Indexing** - Optimized query performance

## Deployment Architecture

### Development Environment

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Desktop   │    │    Web      │    │   Backend   │
│    App      │    │   Admin     │    │     API     │
│  (Port 3000)│    │ (Port 3001) │    │ (Port 4000) │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                    ┌─────────────┐
                    │  MongoDB    │
                    │ (Port 27017)│
                    └─────────────┘
```

### Production Environment

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Desktop   │    │    Web      │    │   Backend   │    │  MongoDB    │
│    App      │    │   Admin     │    │     API     │    │   Atlas     │
│  (Distributed)│   │ (CDN/Cloud) │    │ (Cloud/VPS) │    │ (Cloud DB)  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       └───────────────────┼───────────────────┼───────────────────┘
                           │                   │
                    ┌─────────────┐    ┌─────────────┐
                    │ Cloudinary  │    │   SMTP      │
                    │ (CDN)       │    │  Service    │
                    └─────────────┘    └─────────────┘
```

## Key Features by Component

### Desktop App Features

- **Real-time Time Tracking** - Clock in/out functionality
- **Screenshot Capture** - Automatic and manual screenshot taking
- **Task Management** - View and update assigned tasks
- **Offline Capability** - Local data storage and sync
- **Auto Clock-out** - Automatic time tracking on app close
- **IP/MAC Tracking** - Device identification for security

### Web Admin Features

- **Employee Management** - CRUD operations for employees
- **Project Management** - Create and manage projects
- **Task Assignment** - Assign tasks to employees
- **Real-time Monitoring** - Live status of all employees
- **Screenshot Management** - View and manage employee screenshots
- **Time Log Analysis** - Detailed time tracking reports
- **Remote Screenshot** - Take screenshots remotely

### Backend API Features

- **RESTful API** - Standard HTTP endpoints
- **Authentication System** - Complete auth flow with email verification
- **File Upload** - Secure image upload to cloud storage
- **Email Notifications** - Automated email sending
- **Data Validation** - Comprehensive input validation
- **Error Handling** - Robust error management
- **Security Middleware** - CORS, rate limiting, etc.

This architecture provides a robust, scalable, and secure foundation for the Mercor Time Tracker system, supporting both desktop and web-based workflows with comprehensive monitoring and management capabilities.
