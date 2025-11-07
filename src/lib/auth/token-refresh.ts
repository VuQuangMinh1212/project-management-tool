import { authService } from "@/services/api/auth";
import { enhancedTokenStorage } from "./enhanced-token-storage";

export const tokenRefreshService = {
  async getValidAccessToken(): Promise<string | null> {
    const accessToken = enhancedTokenStorage.getAccessToken();
    
    if (!accessToken) {
      return null;
    }

    if (!enhancedTokenStorage.isTokenExpired(accessToken)) {
      return accessToken;
    }

    enhancedTokenStorage.clearTokens();
    window.location.href = "/login";
    return null;
  },
};