"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL, parseApiResponse } from "@/lib/api";
import { getSessionProviderId, setSessionProviderId } from "@/lib/session";
import type { Provider } from "@/lib/types";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import styles from "./LoginForm.module.css";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (getSessionProviderId()) {
      router.replace("/dashboard");
      return;
    }
    setChecking(false);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/providers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const provider = await parseApiResponse<Provider>(response);
      setSessionProviderId(provider.id);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className={styles.page}>
        <span className="dot-pulse"><span /><span /><span /></span>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <span className={styles.topBarBrand}>Technician Portal</span>
        <ThemeToggle />
      </header>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M1 17l2-9h18l2 9" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <circle cx="7" cy="19" r="2" stroke="currentColor" strokeWidth="2" />
              <circle cx="17" cy="19" r="2" stroke="currentColor" strokeWidth="2" />
              <path d="M3 8h18" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
          Road<span className="text-amber">Rescue</span>
        </div>

        <div>
          <h1 className={styles.title}>Technician sign in</h1>
          <p className={styles.sub}>
            Sign in with the username and password you created after your application was approved.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label" htmlFor="tech-username">Username</label>
            <input
              id="tech-username"
              className="form-input"
              type="text"
              placeholder="Your portal username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tech-password">Password</label>
            <input
              id="tech-password"
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <p className={styles.hint}>
            Haven&apos;t registered yet?{" "}
            <a href="http://localhost:3000/join" target="_blank" rel="noopener noreferrer">
              Track your application
            </a>{" "}
            to create your account after approval.
          </p>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading || !username.trim() || !password}>
            {loading ? (
              <span className="dot-pulse"><span /><span /><span /></span>
            ) : (
              "Sign In →"
            )}
          </button>
        </form>

        <p className={styles.footer}>
          New to RoadRescue?{" "}
          <a href="http://localhost:3000/join" target="_blank" rel="noopener noreferrer">
            Apply to join the fleet
          </a>
        </p>
      </div>
    </div>
  );
}
