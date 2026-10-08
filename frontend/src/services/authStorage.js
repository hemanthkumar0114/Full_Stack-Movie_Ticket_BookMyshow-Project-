const TOKEN_KEY = "bms_auth_token";
const USER_KEY = "bms_auth_user";

function safeRead(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export const authStorage = {
  getToken() {
    return safeRead(TOKEN_KEY);
  },

  getUser() {
    const raw = safeRead(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  save(token, user) {
    try {
      window.localStorage.setItem(TOKEN_KEY, token);
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      return;
    }
  },

  clear() {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
    } catch {
      return;
    }
  }
};
