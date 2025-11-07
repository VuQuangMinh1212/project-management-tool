import { authService } from "@/services/api/auth";
import { enhancedTokenStorage } from "./enhanced-token-storage";

export const tokenRefreshService = {
  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = enhancedTokenStorage.getRefreshToken();
    
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await authService.refreshToken(refreshToken);
      
      const user = enhancedTokenStorage.getStoredUser();
      const rememberMe = enhancedTokenStorage.getRememberMeStatus();
      
      enhancedTokenStorage.saveTokens(
        response.access_token,
        response.refresh_token,
        user,
        { rememberMe }
      );
      
      return response.access_token;
    } catch (error) {
      enhancedTokenStorage.clearTokens();
      return null;
    }
  },

  async getValidAccessToken(): Promise<string | null> {
    const accessToken = enhancedTokenStorage.getAccessToken();
    
    if (!accessToken) {
      return null;
    }

    if (!enhancedTokenStorage.isTokenExpired(accessToken)) {
      return accessToken;
    }

    return await this.refreshAccessToken();
  },
};