"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/auth/access";
import { signOutAction } from "@/app/auth-actions";
import styles from "./dashboard.module.css";

type NavItem = { href: string; label: string; icon: React.ReactNode };

// ---- Icons (inline, so the shell has no asset deps) ----
const I = {
  grid: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>
  ),
  calendar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4" /></svg>
  ),
  user: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" /></svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 21v-1A5.5 5.5 0 0 1 8 14.5h2A5.5 5.5 0 0 1 15.5 20v1" /><path d="M16 3.5a3.5 3.5 0 0 1 0 7M18 14.5a5.5 5.5 0 0 1 3.5 5.1V21" /></svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
  ),
  home: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5M5 9v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" /></svg>
  ),
};

function navFor(role: Role): NavItem[] {
  switch (role) {
    case "seeker":
      return [
        { href: "/seekers/dashboard", label: "Dashboard", icon: I.grid },
        { href: "/seekers/dashboard/request", label: "Request a session", icon: I.calendar },
      ];
    case "provider":
      return [
        { href: "/providers/dashboard", label: "Dashboard", icon: I.grid },
        { href: "/providers/dashboard", label: "My profile", icon: I.user },
      ].filter((v, i, a) => a.findIndex((x) => x.href === v.href) === i);
    case "admin":
      return [{ href: "/admin", label: "Users", icon: I.users }];
    default:
      return [];
  }
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export default function DashboardShell({
  user,
  title,
  children,
}: {
  user: { name: string; email?: string | null; role: Role };
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const nav = navFor(user.role);
  const closeAll = () => {
    setSidebarOpen(false);
    setMenuOpen(false);
  };

  // Close profile menu on outside click.
  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const isActive = (href: string) =>
    pathname === href ||
    (href !== "/admin" && href !== "/seekers/dashboard" && href !== "/providers/dashboard"
      ? pathname.startsWith(href + "/")
      : false);

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <Link href="/" className={styles.brand}>
          <span className={styles.mark}>J</span>
          JoslaLink
        </Link>
        <nav className={styles.nav}>
          <div className={styles.navSection}>Menu</div>
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={closeAll}
              className={`${styles.navItem} ${isActive(item.href) ? styles.navItemActive : ""}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <div className={styles.navSection}>General</div>
          <Link href="/" onClick={closeAll} className={styles.navItem}>
            <span className={styles.navIcon}>{I.home}</span>
            Back to site
          </Link>
        </nav>
        <div className={styles.sidebarFoot}>
          Signed in as <strong style={{ color: "rgba(255,255,255,0.7)" }}>{user.role}</strong>
        </div>
      </aside>

      {/* Mobile backdrop */}
      <div
        className={`${styles.backdrop} ${sidebarOpen ? styles.backdropShown : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden
      />

      <div className={styles.main}>
        <header className={styles.header}>
          <button
            className={styles.hamburger}
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>
          <h1 className={styles.pageTitle}>{title}</h1>

          <div className={styles.headerRight}>
            <div className={styles.profile} ref={menuRef}>
              <button
                className={styles.profileBtn}
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className={styles.avatar}>{initials(user.name)}</span>
                <span className={styles.profileMeta}>
                  <span className={styles.profileName}>{user.name}</span>
                  <span className={styles.profileRole}>{user.role}</span>
                </span>
                <span className={styles.caret}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </span>
              </button>

              {menuOpen && (
                <div className={styles.menu} role="menu">
                  <div className={styles.menuHead}>
                    <div className={styles.menuName}>{user.name}</div>
                    <div className={styles.menuEmail}>{user.email}</div>
                  </div>
                  <Link href="/" onClick={closeAll} className={styles.menuItem} role="menuitem">
                    <span className={styles.navIcon}>{I.home}</span>
                    Back to site
                  </Link>
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className={`${styles.menuItem} ${styles.menuItemDanger}`}
                      role="menuitem"
                    >
                      <span className={styles.navIcon}>{I.logout}</span>
                      Sign out
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
