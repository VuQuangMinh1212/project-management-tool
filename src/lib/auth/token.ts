import Cookies from "js-cookie";

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";

// Add this function to match the import in useLogin.ts
export const setAuthToken = (token: string): void => {
  tokenStorage.setToken(token);
};

export const tokenStorage = {
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return Cookies.get(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token: string): void => {
    if (typeof window === "undefined") return;
    Cookies.set(TOKEN_KEY, token, {
      expires: 7,
      secure: true,
      sameSite: "strict",
    });
    localStorage.setItem(TOKEN_KEY, token);
  },

  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return (
      Cookies.get(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY)
    );
  },

  setRefreshToken: (token: string): void => {
    if (typeof window === "undefined") return;
    Cookies.set(REFRESH_TOKEN_KEY, token, {
      expires: 30,
      secure: true,
      sameSite: "strict",
    });
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  removeTokens: (): void => {
    if (typeof window === "undefined") return;
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },

  getUserFromToken: (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.user;
    } catch {
      return null;
    }
  },
};
