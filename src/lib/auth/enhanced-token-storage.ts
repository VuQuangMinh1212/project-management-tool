export interface TokenStorageOptions {
  rememberMe?: boolean;
}

export const enhancedTokenStorage = {
  saveTokens: (
    accessToken: string,
    user: any,
    options: TokenStorageOptions = {}
  ) => {
    if (typeof window === "undefined") return;

    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("user_info", JSON.stringify(user));
    localStorage.setItem("remember_me", options.rememberMe?.toString() || "false");
  },

  getAccessToken: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  },



  getStoredUser: () => {
    if (typeof window === "undefined") return null;
    try {
      const userInfo = localStorage.getItem("user_info");
      return userInfo ? JSON.parse(userInfo) : null;
    } catch {
      return null;
    }
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },

  clearTokens: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");
    localStorage.removeItem("remember_me");
  },

  getRememberMeStatus: (): boolean => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("remember_me") === "true";
  },
};
