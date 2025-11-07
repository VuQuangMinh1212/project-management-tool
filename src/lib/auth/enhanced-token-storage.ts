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

    const { rememberMe = false } = options;

    const tokenExpiry = new Date();
    if (rememberMe) {
      tokenExpiry.setDate(tokenExpiry.getDate() + 30);
    } else {
      tokenExpiry.setDate(tokenExpiry.getDate() + 7);
    }

    localStorage.setItem("auth_token", accessToken);
    localStorage.setItem("auth_token_expiry", tokenExpiry.toISOString());
    localStorage.setItem("user_info", JSON.stringify(user));

    localStorage.setItem("remember_me_token", rememberMe.toString());

    const isSecure = window.location.protocol === "https:";
    const maxAge = rememberMe ? 2592000 : 604800;
    document.cookie = `auth_token=${accessToken}; path=/; max-age=${maxAge}; SameSite=Lax; ${
      isSecure ? "Secure" : ""
    }`;
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

  isTokenValid: () => {
    if (typeof window === "undefined") return false;

    const token = localStorage.getItem("auth_token");
    const expiry = localStorage.getItem("auth_token_expiry");

    if (!token || !expiry) return false;

    try {
      const expiryDate = new Date(expiry);
      return expiryDate > new Date();
    } catch {
      return false;
    }
  },

  clearTokens: () => {
    if (typeof window === "undefined") return;

    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_token_expiry");
    localStorage.removeItem("user_info");
    localStorage.removeItem("remember_me_token");
    document.cookie = "auth_token=; path=/; max-age=0;";
  },

  getRememberMeStatus: (): boolean => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("remember_me_token") === "true";
  },
};
