# 🏛️ Civic Flow - Municipal Issue Management System

A comprehensive web-based platform for managing civic complaints and municipal operations. Built for government departments to streamline citizen issue reporting, assignment, tracking, and resolution.

![React](https://img.shields.io/badge/React-19.1.1-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.1.2-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.13-38B2AC?logo=tailwind-css)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [API Integration](#api-integration)
- [Usage](#usage)


## ✨ Features

### 🎯 Core Functionality
- **Multi-Role Dashboard** - Role-based access for Admins, Department Heads, and Operators
- **Report Management** - Complete lifecycle management of civic complaints
- **Department Management** - Organize work by municipal departments
- **Operator Management** - Manage field operators and work assignments
- **Real-time Analytics** - Visual insights with charts and statistics
- **Assignment System** - Intelligent report assignment to appropriate personnel

### 📊 Dashboard Features
- **Statistics Overview** - Total, pending, in-progress, and resolved reports
- **Interactive Charts** - Pie charts, line graphs for trend analysis
- **Recent Activity Feed** - Latest actions and updates
- **Department Workload** - Visual representation of departmental performance

### 📝 Report Features
- **Detailed Report View** - Complete report information with timeline
- **Status Tracking** - Pending → In Progress → Resolved workflow
- **Priority Management** - High, Medium, Low priority classification
- **Media Attachments** - Photo and audio evidence support
- **Location Mapping** - GPS coordinates and address information
- **Timeline History** - Complete audit trail of report actions

### 👥 User Management
- **Role-Based Access Control** - Different permissions for different roles
- **Department Assignment** - Users assigned to specific departments
- **Operator Workload** - Track and balance operator assignments
- **Profile Management** - User settings and preferences

### 📈 Analytics & Reporting
- **Performance Metrics** - Response times, resolution rates
- **Department Analytics** - Comparative performance analysis
- **Export Functionality** - Report data export in multiple formats
- **Visual Dashboards** - Interactive charts using Recharts

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - Modern React with latest features
- **Vite 7.1.2** - Fast build tool and development server
- **React Router DOM 6.18.0** - Client-side routing
- **TailwindCSS 4.1.13** - Utility-first CSS framework

### UI Components
- **Radix UI** - Accessible, unstyled UI primitives
- **Lucide React** - Beautiful SVG icons
- **Class Variance Authority** - Component variant management
- **Recharts 2.5.0** - Data visualization library

### Form Management
- **React Hook Form 7.62.0** - Performant forms with easy validation
- **Zod 4.1.9** - TypeScript-first schema validation
- **Hookform Resolvers** - Validation resolver for React Hook Form

### Development Tools
- **ESLint 9.33.0** - Code linting and quality checks
- **Vite Plugin React** - Vite plugin for React support
- **TypeScript Types** - Type definitions for better development

## 🔧 Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher) or **yarn**
- **Git** for version control

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/vansh4117v/civic-sense.git
cd civic-flow
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Start Development Server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
# or
yarn build
```

## 📁 Project Structure

```
civic-flow/
├── public/                     # Static assets
├── src/
│   ├── components/            # Reusable components
│   │   ├── ui/               # Base UI components (buttons, cards, etc.)
│   │   ├── dashboard/        # Dashboard-specific components
│   │   ├── navigation/       # Navigation components
│   │   └── reports/          # Report-related components
│   ├── hooks/                # Custom React hooks
│   │   └── useAuth.jsx       # Authentication hook
│   ├── layouts/              # Layout components
│   │   ├── AuthLayout.jsx    # Login/auth layout
│   │   └── DashboardLayout.jsx # Main app layout
│   ├── lib/                  # Utility libraries
│   │   └── utils.js          # Helper functions
│   ├── pages/                # Page components
│   │   ├── reports/          # Report management pages
│   │   ├── Dashboard.jsx     # Main dashboard
│   │   ├── Departments.jsx   # Department management
│   │   ├── Operators.jsx     # Operator management
│   │   ├── Settings.jsx      # User settings
│   │   └── Login.jsx         # Login page
│   ├── services/             # API services
│   │   ├── api.js           # Main API service
│   │   ├── api_mock.js      # Mock data for development
│   │   └── api_test.js      # API testing utilities
│   ├── utils/               # Utility functions
│   │   ├── cn.js           # Class name utilities
│   │   └── date.js         # Date formatting utilities
│   ├── App.jsx             # Main app component
│   ├── index.css           # Global styles
│   └── main.jsx            # App entry point
├── eslint.config.js        # ESLint configuration
├── jsconfig.json          # JavaScript configuration
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind configuration
├── vite.config.js         # Vite configuration
└── README.md              # Project documentation
```

## 👤 User Roles

### 🔑 Super Admin
- **Full System Access** - Manage all departments and users
- **Department Management** - Create and configure departments
- **User Management** - Create department heads and operators
- **System Analytics** - Access to all performance metrics
- **Report Assignment** - Can assign reports across all departments

### 🏛️ Department Head
- **Department Dashboard** - Overview of department performance
- **Report Management** - Manage reports assigned to their department
- **Operator Management** - Manage operators within their department
- **Assignment Control** - Assign reports to department operators
- **Performance Metrics** - Department-specific analytics

### 👷 Operator
- **Personal Dashboard** - View assigned reports and workload
- **Report Updates** - Update status of assigned reports
- **Field Management** - Manage on-ground operations
- **Status Reporting** - Provide progress updates and resolution

## 🔗 API Integration

### Backend Integration
The application integrates with a Spring Boot backend API:
- **Base URL**: `https://civic-issue-backend-oju3.onrender.com`
- **Authentication**: JWT-based authentication
- **Role-based endpoints** for different user types

### Key API Endpoints
```javascript
// Authentication
POST /auth/admin-login
POST /auth/logout

// Dashboard
GET /admin/dashboard
GET /admin/dashboard/stats
GET /admin/dashboard/chart-data

// Reports
GET /api/complaints/assigned-reports
POST /api/complaints/assign
GET /api/complaints/{id}
PUT /api/complaints/{id}/status

// Departments
GET /admin/departments/list
GET /admin/departments/{id}
POST /admin/departments/create

// Operators
GET /admin/departments/{id}/operators
GET /admin/departments/operators/{id}
POST /department/operators/create
```

### Data Flow
1. **Authentication** - JWT tokens stored in localStorage
2. **API Calls** - Centralized through `services/api.js`
3. **Data Mapping** - Backend responses mapped to frontend format
4. **State Management** - React hooks for local state
5. **Error Handling** - Comprehensive error handling and user feedback

## 🎯 Usage

### Login Process
1. Navigate to the login page
2. Enter your phone number and password
3. System authenticates and redirects based on user role

### Report Management
1. **View Reports** - Access reports through role-specific dashboards
2. **Assign Reports** - Department heads can assign reports to operators
3. **Update Status** - Operators can update report progress
4. **View Details** - Click any report to view complete information

### Department Management
1. **View Departments** - See all departments (Admin) or your department
2. **Create Departments** - Add new municipal departments (Admin only)
3. **Manage Operators** - Add/remove operators from departments

