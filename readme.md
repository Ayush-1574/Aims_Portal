# AIMS Portal - Academic Information Management System

A comprehensive web-based platform for managing academic operations at IIT Ropar, designed to streamline course enrollments, user management, and academic record tracking.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [User Roles](#user-roles)
- [Workflows](#workflows)
- [Database Models](#database-models)
- [Contributing](#contributing)

## ✨ Features

### Core Features
- **Role-Based Access Control**: Student, Instructor, Faculty Advisor, Admin
- **Course Management**: Offer, enroll, and manage courses with approval workflows
- **User Management**: Create and manage users with different roles
- **Global Data Management**: Centralized management of departments, sessions, courses, and grade scales
- **Enrollment Workflow**: Multi-stage approval process (Student → Instructor → Advisor)
- **Feedback System**: Toggle feedback collection and manage feedback settings
- **Grade Management**: Update grades and attendance for enrolled students
- **Bulk Operations**: Bulk grade import functionality

### Admin Features
- User management and role assignment
- Course approval workflow
- Global data configuration (departments, sessions, grade scales, courses)
- Feedback settings management
- System overview and analytics

### Instructor Features
- Offer new courses
- View and approve enrollment requests
- Manage enrolled students
- Update grades and attendance
- Submit and view course feedback

### Student Features
- Browse and search available courses
- Request course enrollment
- View enrollment status
- Track academic record
- Submit course feedback

### Faculty Advisor Features
- Review student enrollments
- Approve/reject enrollment requests
- Monitor student academic progress

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Component library built on Radix UI
- **Axios** - HTTP client with interceptors
- **React Router** - Client-side routing
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **Nodemailer** - Email sending (OTP)

### Development Tools
- **ESLint** - Code linting
- **Vite Config** - Frontend build configuration

## 📁 Project Structure

```
Aims-main/
├── aims/                          # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx               # Main app router
│   │   ├── App.css               # Global styles
│   │   ├── main.jsx              # Entry point
│   │   ├── index.css             # Base styles
│   │   ├── assets/               # Images and static files
│   │   ├── components/
│   │   │   ├── BulkGradeImport.jsx
│   │   │   ├── UserDetailsCard.jsx
│   │   │   └── ui/               # Shadcn UI components
│   │   ├── config/
│   │   │   └── constants.js
│   │   ├── core/
│   │   │   ├── api/
│   │   │   │   ├── client.js     # Axios client setup
│   │   │   │   └── index.js
│   │   │   ├── context/
│   │   │   │   └── AuthContext.jsx
│   │   │   └── routes/
│   │   │       └── ProtectedRoute.jsx
│   │   ├── features/
│   │   │   ├── admin/
│   │   │   │   ├── api.js        # Admin API calls
│   │   │   │   └── pages/        # Admin pages
│   │   │   ├── auth/             # Authentication
│   │   │   ├── instructor/       # Instructor features
│   │   │   ├── student/          # Student features
│   │   │   └── advisor/          # Advisor features
│   │   ├── layout/
│   │   │   └── DashboardLayout.jsx
│   │   └── lib/
│   │       └── utils.js
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── server/                        # Backend (Node + Express)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js             # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── adminController.js
│   │   │   ├── authController.js
│   │   │   ├── courseController.js
│   │   │   ├── enrollmentController.js
│   │   │   ├── feedbackController.js
│   │   │   └── systemController.js
│   │   ├── middleware/
│   │   │   ├── auth.js           # JWT verification
│   │   │   ├── admin.js          # Admin role check
│   │   │   └── role.js           # Role-based middleware
│   │   ├── models/
│   │   │   ├── CourseModel.js
│   │   │   ├── EnrollmentModel.js
│   │   │   ├── FeedbackModel.js
│   │   │   ├── GlobalData.js
│   │   │   ├── SystemSettingsModel.js
│   │   │   └── Auth/
│   │   │       ├── UserModel.js
│   │   │       └── OtpModel.js
│   │   ├── routes/
│   │   │   ├── adminRoute.js
│   │   │   ├── authRoute.js
│   │   │   ├── courseRoute.js
│   │   │   ├── enrollmentRoute.js
│   │   │   ├── feedbackRoutes.js
│   │   │   ├── globalDataRoute.js
│   │   │   └── systemRoutes.js
│   │   ├── utils/
│   │   │   └── email.js          # OTP email sending
│   │   └── server.js             # Express app setup
│   ├── package.json
│   └── README.md
│
├── ADMIN_LOGIN_GUIDE.txt
├── CREATE_USER_FEATURE.md
├── FIXES_APPLIED.md
└── README.md                      # This file
```

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in server root:
```
MONGO_URI=mongodb://localhost:27017/aims-portal
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
PORT=5000
```

4. Start MongoDB service (if local):
```bash
mongod
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd aims
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in aims root (if needed):
```
VITE_API_URL=http://localhost:5000
```

## ⚙️ Configuration

### Database Configuration
- Backend connects to MongoDB via Mongoose in `server/src/config/db.js`
- Models are defined in `server/src/models/`

### Authentication
- JWT tokens stored in localStorage
- Token verified via middleware on protected routes
- Role-based access control enforced at route level

### Global Data
- Centralized storage of system reference data
- Types: DEPARTMENT, SESSION, GRADE_SCALE, COURSE_CODE
- Managed through `/admin/global-data` endpoint

## 🏃 Running the Application

### Start Backend
```bash
cd server
npm start
```
Backend runs on `http://localhost:5000`

### Start Frontend (in new terminal)
```bash
cd aims
npm run dev
```
Frontend runs on `http://localhost:5173`

### Access the Application
- Open browser to `http://localhost:5173`
- Login with admin/instructor/student/advisor credentials

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/verify-otp` - OTP verification

### Global Data (Public Read)
- `GET /global-data/:type` - Fetch departments, sessions, courses, grade scales

### Global Data (Admin Only)
- `GET /admin/global-data/:type` - Get all items of type
- `POST /admin/global-data` - Create new global data item
- `PUT /admin/global-data/:type/:itemId` - Update item
- `DELETE /admin/global-data/:type/:itemId` - Delete item

### Users (Admin Only)
- `GET /admin/users` - Get all users with filters
- `POST /admin/users` - Create new user
- `PUT /admin/users/:userId` - Update user
- `DELETE /admin/users/:userId` - Delete user

### Courses
- `POST /courses` - Create course (Instructor)
- `GET /courses` - Get available courses
- `GET /courses/pending` - Get pending approvals (Admin)
- `POST /courses/approve/:courseId` - Approve course
- `POST /courses/reject/:courseId` - Reject course

### Enrollments
- `POST /enrollments/request` - Student requests enrollment
- `GET /enrollments/instructor/requests` - Get enrollment requests (Instructor)
- `POST /enrollments/:id/approve-instructor` - Instructor approves
- `GET /enrollments/advisor/requests` - Get advisor requests
- `POST /enrollments/:id/approve-advisor` - Advisor approves
- `GET /enrollments/student` - Get student's enrollments
- `GET /enrollments/course/:courseId/students` - Get enrolled students

### Feedback
- `POST /feedback` - Submit feedback
- `GET /feedback/course/:courseId` - Get course feedback
- `GET /system/feedback-status` - Check if feedback is active
- `POST /system/feedback-toggle` - Toggle feedback (Admin)

## 👥 User Roles

### Admin
- Full system access
- User management
- Course approvals
- Global data configuration
- Feedback settings

### Instructor
- Create and manage courses
- Approve student enrollments
- Update student grades and attendance
- View feedback

### Faculty Advisor
- Review and approve student enrollments
- Monitor student progress

### Student
- Browse and enroll in courses
- View academic record
- Submit feedback

## 🔄 Workflows

### Course Enrollment Workflow
```
Student Request 
    ↓
Instructor Review & Approval (PENDING_INSTRUCTOR → PENDING_ADVISOR)
    ↓
Faculty Advisor Review & Approval (PENDING_ADVISOR → ENROLLED/REJECTED)
    ↓
Student Enrolled / Rejected Notification
```

### Course Offering Workflow
```
Instructor Offers Course
    ↓
Admin Approves/Rejects
    ↓
Course Available for Student Enrollment
```

### Global Data Management
```
Admin Manages Data (Departments, Sessions, Courses, Grade Scales)
    ↓
Data Stored in Centralized MongoDB Collection
    ↓
Available to All Users via Public Endpoints
    ↓
Dynamic UI Population (Dropdowns, Selections)
```

## 📊 Database Models

### User
- name, email, role, isActive
- Role-specific fields: entry_no, department, year, semester (Student), advisor_department, advisor_year (Advisor)

### Course
- courseCode, title, description, ltp, instructor, session, status
- Timestamps and approval tracking

### Enrollment
- student, course, session, faculty_advisor, status
- Grade, attendance, category tracking

### GlobalData
- type (DEPARTMENT, SESSION, GRADE_SCALE, COURSE_CODE)
- items array with key, value, isActive

### Feedback
- student, course, rating, comments, timestamp

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Create Pull Request

## 📝 Notes

- All passwords are hashed using bcrypt
- JWT tokens expire based on configuration
- OTP verification required for account creation
- Role-based middleware enforces access control
- All user actions are logged for audit purposes

## 📧 Support

For issues or questions, please refer to:
- `ADMIN_LOGIN_GUIDE.txt` - Admin login and setup instructions
- `CREATE_USER_FEATURE.md` - User creation feature documentation
- `FIXES_APPLIED.md` - Recent bug fixes and updates

---

**Last Updated**: January 26, 2026
**Version**: 1.0.0
