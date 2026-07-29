"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/auth/access";
import { signOutAction } from "@/app/auth-actions";
import { navFor } from "./dashboard-nav";
import styles from "./dashboard.module.css";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

const logoutIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
);

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

  const sections = navFor(user.role);
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
    (href.split("/").length > 3 ? pathname.startsWith(href + "/") : false);

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <Link href="/" className={styles.brand}>
          <span className={styles.mark}>J</span>
          JoslaLink
        </Link>

        <nav className={styles.nav}>
          {sections.map((section) => (
            <div key={section.title}>
              <div className={styles.navSection}>{section.title}</div>
              {section.items.map((item) =>
                item.soon ? (
                  <span key={item.label} className={`${styles.navItem} ${styles.navItemSoon}`}>
                    <span className={styles.navIcon}>{item.icon}</span>
                    {item.label}
                    <span className={styles.soonTag}>Soon</span>
                  </span>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={closeAll}
                    className={`${styles.navItem} ${isActive(item.href) ? styles.navItemActive : ""}`}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    {item.label}
                  </Link>
                ),
              )}
            </div>
          ))}
        </nav>

        <a href="mailto:support@joslalink.com" className={styles.sidebarFoot}>
          Need help? Contact support
        </a>
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
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className={`${styles.menuItem} ${styles.menuItemDanger}`}
                      role="menuitem"
                    >
                      <span className={styles.navIcon}>{logoutIcon}</span>
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
