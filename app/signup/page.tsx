"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction, type SignupState } from "./actions";
import AuthShell from "@/app/_components/AuthShell";
import styles from "@/app/_components/auth.module.css";

const initial: SignupState = {};

export default function SignupPage() {
  const [state, action, pending] = useActionState(signupAction, initial);

  return (
    <AuthShell>
      <div className={styles.formHead}>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>
          Free to start. Providers are reviewed by an admin before becoming
          bookable.
        </p>
      </div>

      {state.error && (
        <p className={`${styles.notice} ${styles.noticeError}`}>{state.error}</p>
      )}

      <form action={action} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Alex Morgan"
            required
          />
        </div>
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
            autoComplete="new-password"
            placeholder="At least 8 characters"
            minLength={8}
            required
          />
          <p className={styles.hint}>Use 8 or more characters.</p>
        </div>
        <div className={styles.field}>
          <label htmlFor="role">I want to join as</label>
          <select id="role" name="role" defaultValue="seeker">
            <option value="seeker">Seeker - I need help learning a skill</option>
            <option value="provider">Provider - I teach / mentor</option>
          </select>
        </div>
        <button className={styles.submit} type="submit" disabled={pending}>
          {pending ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className={styles.altText}>
        Already have an account?{" "}
        <Link href="/login" className={styles.altLink}>
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
