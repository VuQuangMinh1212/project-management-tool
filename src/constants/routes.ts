export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  STAFF: {
    DASHBOARD: "/staff/dashboard",
    TASKS: "/staff/tasks",
    PROFILE: "/staff/profile",
  },
  MANAGER: {
    DASHBOARD: "/manager/dashboard",
    TEAM: "/manager/team",
    APPROVALS: "/manager/approvals",
  },
} as const;

export const PUBLIC_ROUTES = [ROUTES.HOME, ROUTES.LOGIN, ROUTES.REGISTER];

export const STAFF_ROUTES = [
  ROUTES.STAFF.DASHBOARD,
  ROUTES.STAFF.TASKS,
  ROUTES.STAFF.PROFILE,
];

export const MANAGER_ROUTES = [
  ROUTES.MANAGER.DASHBOARD,
  ROUTES.MANAGER.TEAM,
  ROUTES.MANAGER.APPROVALS,
];

export const PROTECTED_ROUTES = [
  ...STAFF_ROUTES,
  ...MANAGER_ROUTES,
  ROUTES.DASHBOARD,
];
