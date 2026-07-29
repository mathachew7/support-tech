"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type LoginState } from "./actions";
import styles from "@/app/_components/auth.module.css";

const initial: LoginState = {};

export default function LoginForm({
  callbackUrl,
  registered,
}: {
  callbackUrl: string;
  registered: boolean;
}) {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <>
      <div className={styles.formHead}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>
          Sign in to your JoslaLink account to keep learning.
        </p>
      </div>

      {registered && (
        <p className={`${styles.notice} ${styles.noticeSuccess}`}>
          Account created. Sign in to continue.
        </p>
      )}
      {state.error && (
        <p className={`${styles.notice} ${styles.noticeError}`}>{state.error}</p>
      )}

      <form action={action} className={styles.form}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            required
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
        </div>
        <button className={styles.submit} type="submit" disabled={pending}>
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className={styles.altText}>
        No account yet?{" "}
        <Link href="/signup" className={styles.altLink}>
          Create one
        </Link>
      </p>
    </>
  );
}
