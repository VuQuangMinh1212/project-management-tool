import type { User, UserWithStats } from "@/types/database";

export const mockUsers: User[] = [
  {
    id: "user1",
    name: "John Doe",
    email: "john.doe@company.com",
    role: "employee",
    created_at: "2025-07-01T00:00:00Z",
  },
  {
    id: "user2",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    role: "employee",
    created_at: "2025-07-01T00:00:00Z",
  },
  {
    id: "user3",
    name: "Bob Johnson",
    email: "bob.johnson@company.com",
    role: "employee",
    created_at: "2025-07-01T00:00:00Z",
  },
  {
    id: "manager1",
    name: "Sarah Wilson",
    email: "sarah.wilson@company.com",
    role: "manager",
    created_at: "2025-07-01T00:00:00Z",
  },
];

// Extended users with UI stats (computed from tasks/plans)
export const mockUsersWithStats: UserWithStats[] = mockUsers.map((user) => ({
  ...user,
  avatar: "/placeholder.svg",
  lastActive: "2025-07-04T10:30:00Z",
  stats:
    user.role === "employee"
      ? {
          totalTasks: user.id === "user1" ? 8 : user.id === "user2" ? 5 : 6,
          completedTasks: user.id === "user1" ? 6 : user.id === "user2" ? 4 : 3,
          inProgressTasks:
            user.id === "user1" ? 2 : user.id === "user2" ? 1 : 2,
          todoTasks: user.id === "user1" ? 0 : user.id === "user2" ? 0 : 1,
          averageProgress:
            user.id === "user1" ? 75 : user.id === "user2" ? 80 : 50,
          completionRate:
            user.id === "user1" ? 75 : user.id === "user2" ? 80 : 50,
        }
      : undefined,
}));

// Demo accounts for authentication
export const demoAccounts = {
  employee: {
    email: "staff",
    password: "123",
    user: mockUsers.find((u) => u.id === "user1")!,
  },
  manager: {
    email: "manager",
    password: "123",
    user: mockUsers.find((u) => u.id === "manager1")!,
  },
};
