import { http, HttpResponse } from "msw";
import type { LoginCredentials, RegisterData, User } from "@/types/auth";
import { UserRole } from "@/types/auth";

// Mock users database
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@company.com",
    name: "Admin User",
    role: UserRole.MANAGER,
    avatar: "/placeholder.svg?height=40&width=40",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    email: "staff@company.com",
    name: "Staff User",
    role: UserRole.STAFF,
    avatar: "/placeholder.svg?height=40&width=40",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

export const authHandlers = [
  // Login handler
  http.post("/api/auth/login", async ({ request }) => {
    const credentials = (await request.json()) as LoginCredentials;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Handle demo account mappings
    let user: User | undefined;
    let isValidCredentials = false;

    if (credentials.email === "staff" && credentials.password === "123") {
      // Map "staff" login to the staff user
      user = mockUsers.find((u) => u.role === UserRole.STAFF);
      isValidCredentials = true;
    } else if (
      credentials.email === "manager" &&
      credentials.password === "123"
    ) {
      // Map manager demo account
      user = mockUsers.find((u) => u.role === UserRole.MANAGER);
      isValidCredentials = true;
    } else {
      // Regular email lookup
      user = mockUsers.find((u) => u.email === credentials.email);
      isValidCredentials = !!(user && credentials.password === "password123");
    }

    if (!user || !isValidCredentials) {
      return HttpResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate mock token
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;

    return HttpResponse.json({
      user,
      token,
      expiresIn: 3600,
    });
  }),

  // Register handler
  http.post("/api/auth/register", async ({ request }) => {
    const registerData = (await request.json()) as RegisterData;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === registerData.email);

    if (existingUser) {
      return HttpResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Create new user
    const newUser: User = {
      id: String(mockUsers.length + 1),
      email: registerData.email,
      name: registerData.name,
      role: registerData.role || "staff",
      avatar: "/placeholder.svg?height=40&width=40",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);

    // Generate mock token
    const token = `mock-jwt-token-${newUser.id}-${Date.now()}`;

    return HttpResponse.json({
      user: newUser,
      token,
      expiresIn: 3600,
    });
  }),

  // Get current user handler
  http.get("/api/auth/me", ({ request }) => {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract user ID from mock token
    const token = authHeader.replace("Bearer ", "");
    const userId = token.split("-")[3];

    const user = mockUsers.find((u) => u.id === userId);

    if (!user) {
      return HttpResponse.json({ error: "User not found" }, { status: 404 });
    }

    return HttpResponse.json({ user });
  }),

  // Logout handler
  http.post("/api/auth/logout", () => {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(HttpResponse.json({ message: "Logged out successfully" }));
      }, 500);
    });
  }),

  // Refresh token handler
  http.post("/api/auth/refresh", ({ request }) => {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract user ID from mock token
    const token = authHeader.replace("Bearer ", "");
    const userId = token.split("-")[3];

    const user = mockUsers.find((u) => u.id === userId);

    if (!user) {
      return HttpResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Generate new mock token
    const newToken = `mock-jwt-token-${user.id}-${Date.now()}`;

    return HttpResponse.json({
      token: newToken,
      expiresIn: 3600,
    });
  }),
];
