"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getMe, login as doLogin, register as doRegister, logout as doLogout, User, Role } from "@/services/auth";

type AuthState = {
  user: User | null;
  role: Role | null;
  loading: boolean;
  login: (p: {email: string; password: string}) => Promise<void>;
  register: (p: {email: string; password: string}) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthState | null>(null);
export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("AuthContext not found");
  return ctx;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const access = typeof window !== "undefined" ? localStorage.getItem("courtly_access") : null;
    if (!access) { setLoading(false); return; }
    getMe().then((r) => {
      setUser(r.user);
      setRole(r.role);
    }).finally(() => setLoading(false));
  }, []);

  const login = async (p: { email?: string; username?: string; password: string }) => {
  const data = await doLogin(p);
  setUser(data.user);
  setRole(data.role);
  window.location.href = data.role === "manager" ? "/(manager)/dashboard" : "/(player)/home";
};

const register = async (p: {
  username: string; email: string; password: string; first_name?: string; last_name?: string; confirm?: string; accept?: boolean;
}) => {
  await doRegister(p);
  await login({ email: p.email, username: p.username, password: p.password });
};


  const logout = () => {
    doLogout();
    setUser(null);
    setRole(null);
  };

  return (
    <Ctx.Provider value={{ user, role, loading, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}
