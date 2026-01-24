export const MAX_CREDIT_LIMIT = 24;
export const OTP_EXPIRATION_MINUTES = 5;
export const MIN_COURSE_CREDITS = 1;
export const MAX_COURSE_CREDITS = 4;

export const USER_ROLES = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  FACULTY_ADVISOR: 'faculty_advisor',
  ADMIN: 'admin'
};

export const ENROLLMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const ROUTES = {
  HOME: '/',
  STUDENT_DASHBOARD: '/student/dashboard',
  INSTRUCTOR_DASHBOARD: '/instructor/dashboard',
  ADVISOR_DASHBOARD: '/advisor/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  LOGOUT: '/logout'
};

export const ADMIN_ROUTES = {
  DASHBOARD: '/admin/dashboard',
  USERS: '/admin/dashboard/users',
  ROLES: '/admin/dashboard/roles',
  LOGS: '/admin/dashboard/logs'
};