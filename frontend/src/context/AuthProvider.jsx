import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { authStorage } from "../services/authStorage";
import { UNAUTHORIZED_EVENT } from "../services/http";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => ({
    token: authStorage.getToken(),
    user: authStorage.getUser()
  }));

  const establishSession = useCallback((authResponse) => {
    authStorage.save(authResponse.token, authResponse.user);
    setSession({ token: authResponse.token, user: authResponse.user });
    return authResponse.user;
  }, []);

  const login = useCallback(
    async (credentials) => establishSession(await api.login(credentials)),
    [establishSession]
  );

  const register = useCallback(
    async (details) => establishSession(await api.register(details)),
    [establishSession]
  );

  const logout = useCallback(() => {
    authStorage.clear();
    setSession({ token: null, user: null });
  }, []);

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout);
  }, [logout]);

  const value = useMemo(
    () => ({
      user: session.user,
      isAuthenticated: Boolean(session.token && session.user),
      login,
      register,
      logout
    }),
    [session, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
