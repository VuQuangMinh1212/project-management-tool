import { setupServer } from "msw/node";
import { authHandlers } from "./handlers/auth";
import { taskHandlers } from "./handlers/tasks";
import { reportsHandlers } from "./handlers/reports";

// Combine all handlers
const handlers = [...authHandlers, ...taskHandlers, ...reportsHandlers];

// Setup MSW server
export const server = setupServer(...handlers);

// Server lifecycle methods
export const startServer = () => {
  server.listen({
    onUnhandledRequest: "warn",
  });
  console.log("🚀 Mock server started");
};

export const stopServer = () => {
  server.close();
  console.log("🛑 Mock server stopped");
};

export const resetServer = () => {
  server.resetHandlers();
  console.log("🔄 Mock server reset");
};

// Development helper
if (process.env.NODE_ENV === "development") {
  startServer();
}
