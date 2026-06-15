"use client";

import { useState, useEffect, useCallback } from "react";
import { getMe, logout as doLogout } from "@/lib/auth";
import { getToken } from "@/lib/auth";
import type { User } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(() => {
    setUser(null);
    doLogout();
  }, []);

  return { user, loading, logout, refetch: fetchUser };
}
