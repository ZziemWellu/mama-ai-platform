"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, getMe, UserProfile } from "./api";

/**
 * Every page that talks to a protected backend route needs this — the backend now 401/403s any
 * request without a valid session (see services/api-gateway/app/core/auth.py), so a page that
 * doesn't check first would just render a broken "Failed to connect to API" state instead of
 * sending the person to log in.
 */
export function useRequireAuth() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    getMe()
      .then((profile) => { if (!cancelled) setUser(profile); })
      .catch(() => { if (!cancelled) router.replace("/login"); })
      .finally(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, checking, ready: !checking && user !== null };
}
