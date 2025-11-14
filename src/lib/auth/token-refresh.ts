import axios from "axios";
import { enhancedTokenStorage } from "./enhanced-token-storage";
import { isTokenExpired } from "@/lib/utils/jwt";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    avatarUrl: string | null;
  };
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export const tokenRefreshService = {
  async getValidAccessToken(): Promise<string | null> {
    const accessToken = enhancedTokenStorage.getAccessToken();
    
    if (!accessToken) {
      return null;
    }

    if (!isTokenExpired(accessToken)) {
      return accessToken;
    }

    if (isRefreshing && refreshPromise) {
      return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = this.refreshAccessToken();

    try {
      const newToken = await refreshPromise;
      return newToken;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  },

  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = enhancedTokenStorage.getRefreshToken();
    
    if (!refreshToken) {
      this.redirectToLogin();
      return null;
    }

    try {
      const response = await axios.post<RefreshTokenResponse>(
        `${API_BASE_URL}/auth/refresh`,
        { refresh_token: refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const { access_token, refresh_token, user } = response.data;
      
      const rememberMe = enhancedTokenStorage.getRememberMeStatus();
      enhancedTokenStorage.saveTokens(access_token, refresh_token, user, { rememberMe });
      
      return access_token;
    } catch (error: any) {
      console.error('Error refreshing token:', error);
      
      if (error.response?.status === 400 || error.response?.status === 401) {
        this.redirectToLogin();
      }
      
      return null;
    }
  },

  redirectToLogin() {
    enhancedTokenStorage.clearTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },
};