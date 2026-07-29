import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { getSkillCatalog } from "@/lib/services/providers";
import styles from "./page.module.css";

// Map a catalog category to a spot icon + colored tile, HubSpot-style.
function categoryVisual(category: string): { icon: string; tint: string } {
  const c = category.toLowerCase();
  if (c.includes("front")) return { icon: "🎨", tint: styles.tintPink };
  if (c.includes("back")) return { icon: "⚙️", tint: styles.tintOrange };
  if (c.includes("cloud") || c.includes("infra")) return { icon: "☁️", tint: styles.tintBlue };
  if (c.includes("data")) return { icon: "🗄️", tint: styles.tintPurple };
  if (c.includes("lang")) return { icon: "💻", tint: styles.tintTeal };
  if (c.includes("practice") || c.includes("devops") || c.includes("ci"))
    return { icon: "🔧", tint: styles.tintGreen };
  if (c.includes("engineer") || c.includes("system") || c.includes("architect"))
    return { icon: "🧩", tint: styles.tintIndigo };
  if (c.includes("secur")) return { icon: "🛡️", tint: styles.tintRed };
  if (c.includes("mobile")) return { icon: "📱", tint: styles.tintCyan };
  return { icon: "✦", tint: styles.tintSlate };
}

export default async function Home() {
  const [catalog, session] = await Promise.all([getSkillCatalog(), auth()]);
  const loggedIn = !!session?.user;

  // Group the live catalog by category for the skills section.
  const byCategory = new Map<string, string[]>();
  for (const s of catalog) {
    const list = byCategory.get(s.category) ?? [];
    list.push(s.name);
    byCategory.set(s.category, list);
  }
  const categories = [...byCategory.entries()].sort((a, b) => b[1].length - a[1].length);
  const totalSkills = catalog.length;

  return (
    <div className={styles.wrap}>
      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.brand}>
            <span className={styles.mark}>J</span>
            JoslaLink
          </Link>
          <div className={styles.navLinks}>
            <a href="#how" className={styles.navLink}>How it works</a>
            <a href="#seekers" className={styles.navLink}>For seekers</a>
            <a href="#providers" className={styles.navLink}>For providers</a>
            <a href="#skills" className={styles.navLink}>Skills</a>
          </div>
          <div className={styles.navRight}>
            {loggedIn ? (
              <Link href="/dashboard" className={styles.btnPrimary}>
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className={styles.navSignin}>
                  Sign in
                </Link>
                <Link href="/signup" className={styles.btnPrimary}>
                  Get started free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>
              <span className={styles.dot} />
              Every provider is human-reviewed
            </span>
            <h1 className={styles.title}>
              Master the skill your career needs, from someone who&apos;s{" "}
              <span className={styles.underlined}>actually done it</span>.
            </h1>
            <p className={styles.subtitle}>
              JoslaLink matches working professionals with vetted mentors for
              real, one-to-one help. No course backlog, no guesswork. Tell us
              what you&apos;re stuck on and we&apos;ll pair you with the right
              person.
            </p>
            <div className={styles.ctaRow}>
              <Link href="/signup" className={`${styles.btnPrimary} ${styles.btnLg}`}>
                Find a mentor
              </Link>
              <Link href="/signup" className={`${styles.btnSecondary} ${styles.btnLg}`}>
                Become a provider
              </Link>
            </div>
            <p className={styles.reassure}>
              Flat monthly fee for seekers. No surprise charges. Cancel anytime.
            </p>
          </div>

          {/* Product mock */}
          <div className={styles.heroArt}>
            <div className={styles.floatBadge}>
              <span className={styles.floatIcon}>✓</span>
              <div>
                <div className={styles.floatTitle}>Match approved</div>
                <div className={styles.floatMeta}>by your admin</div>
              </div>
            </div>
            <div className={styles.mock}>
              <div className={styles.mockHead}>
                <span>Suggested match</span>
                <span className={styles.mockTag}>Kubernetes</span>
              </div>
              <div className={styles.mockRow}>
                <span className={styles.avatar}>MA</span>
                <div className={styles.mockInfo}>
                  <div className={styles.mockName}>Maya A.</div>
                  <div className={styles.mockMeta}>Senior SRE · 8 yrs</div>
                  <div className={styles.mockChips}>
                    <span className={styles.miniChip}>Kubernetes</span>
                    <span className={styles.miniChip}>AWS</span>
                    <span className={styles.miniChip}>Terraform</span>
                  </div>
                </div>
                <span className={styles.mockScore}>98%</span>
              </div>
              <div className={styles.mockRow}>
                <span
                  className={styles.avatar}
                  style={{ background: "linear-gradient(140deg,#00bda5,#0091ae)" }}
                >
                  JT
                </span>
                <div className={styles.mockInfo}>
                  <div className={styles.mockName}>Jordan T.</div>
                  <div className={styles.mockMeta}>Platform Eng · 5 yrs</div>
                  <div className={styles.mockChips}>
                    <span className={styles.miniChip}>Kubernetes</span>
                    <span className={styles.miniChip}>Go</span>
                  </div>
                </div>
                <span className={styles.mockScore}>91%</span>
              </div>
              <div className={styles.mockBtn}>Assign to seeker</div>
            </div>
          </div>
        </div>
      </header>

      {/* Trust / value strip */}
      <section className={styles.trust}>
        <div className={styles.trustInner}>
          <div className={styles.trustItem}>
            <span className={styles.trustNum}>1:1</span>
            <span className={styles.trustLabel}>Live sessions, never a video backlog</span>
          </div>
          <div className={styles.trustDivider} />
          <div className={styles.trustItem}>
            <span className={styles.trustNum}>100%</span>
            <span className={styles.trustLabel}>Providers human-reviewed before booking</span>
          </div>
          <div className={styles.trustDivider} />
          <div className={styles.trustItem}>
            <span className={styles.trustNum}>Flat</span>
            <span className={styles.trustLabel}>One monthly fee for seekers, no surprises</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.kicker}>How it works</span>
          <h2 className={styles.sectionTitle}>From stuck to unstuck in three steps.</h2>
          <p className={styles.sectionLead}>
            No sprawling course library. Just the right person for the exact
            thing you&apos;re trying to figure out.
          </p>
        </div>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNum}>1</div>
            <div className={styles.stepTitle}>Tell us what you need</div>
            <p className={styles.stepBody}>
              Pick the skill you want help with and when you&apos;re free. Takes
              a minute.
            </p>
          </div>
          <div className={styles.stepArrow}>→</div>
          <div className={styles.step}>
            <div className={styles.stepNum}>2</div>
            <div className={styles.stepTitle}>Get matched to a mentor</div>
            <p className={styles.stepBody}>
              We suggest vetted providers by skill and availability. A human
              approves every match.
            </p>
          </div>
          <div className={styles.stepArrow}>→</div>
          <div className={styles.step}>
            <div className={styles.stepNum}>3</div>
            <div className={styles.stepTitle}>Book sessions and learn</div>
            <p className={styles.stepBody}>
              Meet one-to-one, work through your real problems, and track your
              hours as you go.
            </p>
          </div>
        </div>
      </section>

      {/* Two-sided */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <span className={styles.kicker}>Built for both sides</span>
            <h2 className={styles.sectionTitle}>One platform. Two sides. Matched by a human.</h2>
            <p className={styles.sectionLead}>
              Seekers bring a problem. Providers bring the experience. JoslaLink
              sits in the middle and makes the introduction, so nobody has to
              cold-message a stranger on WhatsApp again.
            </p>
          </div>

          <div className={styles.joined}>
            <div id="seekers" className={`${styles.audienceCard} ${styles.accent}`}>
              <div className={styles.audienceIcon} aria-hidden>🙋</div>
              <span className={styles.audienceTag}>For seekers</span>
              <h3 className={styles.audienceTitle}>Get real help, fast.</h3>
              <ul className={styles.list}>
                <li><span className={styles.check}>✓</span> Matched to mentors who&apos;ve done the job</li>
                <li><span className={styles.check}>✓</span> One flat monthly fee, no per-session surprises</li>
                <li><span className={styles.check}>✓</span> Book around your schedule</li>
                <li><span className={styles.check}>✓</span> Ask for custom help when you&apos;re stuck</li>
              </ul>
              <Link href="/signup" className={styles.btnPrimary}>
                Find a mentor
              </Link>
            </div>

            {/* Match hub — the "joined system" */}
            <div className={styles.matchHub} aria-hidden>
              <div className={styles.matchRings}>
                <span className={styles.ring} />
                <span className={styles.ring} />
                <span className={styles.matchCore}>
                  <span className={styles.matchMark}>J</span>
                </span>
              </div>
              <div className={styles.matchLabel}>Matched by a human</div>
              <div className={styles.matchSub}>admin-reviewed · no bots</div>
            </div>

            <div id="providers" className={styles.audienceCard}>
              <div className={styles.audienceIcon} aria-hidden>🧑‍🏫</div>
              <span className={styles.audienceTagTeal}>For providers</span>
              <h3 className={styles.audienceTitle}>Share what you know.</h3>
              <ul className={styles.list}>
                <li><span className={styles.checkTeal}>✓</span> List your skills and weekly availability</li>
                <li><span className={styles.checkTeal}>✓</span> Get matched with seekers who need you</li>
                <li><span className={styles.checkTeal}>✓</span> Admin-approved profile builds trust</li>
                <li><span className={styles.checkTeal}>✓</span> Teach on your own terms</li>
              </ul>
              <Link href="/signup" className={styles.btnOutline}>
                Become a provider
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Skills (live catalog) */}
      {categories.length > 0 && (
        <section id="skills" className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.kicker}>The catalog</span>
            <h2 className={styles.sectionTitle}>Mentorship across the modern stack.</h2>
            <p className={styles.sectionLead}>
              {totalSkills} skills across {categories.length} domains, every one
              taught by a vetted provider who ships it for a living. Growing every week.
            </p>
          </div>
          <div className={styles.catalogGrid}>
            {categories.map(([cat, names]) => {
              const v = categoryVisual(cat);
              return (
                <div key={cat} className={styles.catCard}>
                  <div className={styles.catHead}>
                    <span className={`${styles.catIcon} ${v.tint}`}>{v.icon}</span>
                    <div className={styles.catHeadText}>
                      <div className={styles.catName}>{cat}</div>
                      <div className={styles.catCount}>
                        {names.length} skill{names.length === 1 ? "" : "s"}
                      </div>
                    </div>
                  </div>
                  <div className={styles.chips}>
                    {names.map((n) => (
                      <span key={n} className={styles.chip}>
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <p className={styles.catalogNote}>
            Don&apos;t see your skill? <Link href="/signup" className={styles.inlineLink}>Tell us what you need</Link> and we&apos;ll find the right provider.
          </p>
        </section>
      )}

      {/* CTA band — full bleed */}
      <section className={styles.ctaBand}>
        <div className={styles.ctaBandInner}>
          <span className={styles.ctaKicker}>Your next skill is one match away</span>
          <h2 className={styles.ctaTitle}>Stop Googling. Start shipping.</h2>
          <p className={styles.ctaText}>
            Join JoslaLink and get paired with a mentor who&apos;s solved your
            exact problem before. First match in days, not weeks.
          </p>
          <div className={styles.ctaBandBtns}>
            {loggedIn ? (
              <Link href="/dashboard" className={`${styles.btnWhite} ${styles.btnLg}`}>
                Go to your dashboard
              </Link>
            ) : (
              <>
                <Link href="/signup" className={`${styles.btnWhite} ${styles.btnLg}`}>
                  Get started free
                </Link>
                <Link href="/login" className={`${styles.btnGhost} ${styles.btnLg}`}>
                  Sign in
                </Link>
              </>
            )}
          </div>
          <div className={styles.ctaReassure}>
            <span>✓ Human-reviewed mentors</span>
            <span>✓ Flat monthly fee</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrandCol}>
            <Link href="/" className={styles.brand}>
              <span className={styles.mark}>J</span>
              JoslaLink
            </Link>
            <p className={styles.footerTagline}>
              Tech mentorship, matched by humans. Learn the skill your job needs
              from people who&apos;ve actually done it.
            </p>
            <div className={styles.social}>
              <a href="#" aria-label="LinkedIn" className={styles.socialLink}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M4.98 3.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.76-1.95 4.02 0 4.76 2.5 4.76 5.76V21H18.6v-5.3c0-1.26-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.8V21H10z" />
                </svg>
              </a>
              <a href="#" aria-label="X" className={styles.socialLink}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M18.9 2H22l-7.5 8.6L23 22h-6.8l-5.3-6.9L4.8 22H1.7l8-9.2L1 2h7l4.8 6.3zm-2.4 18h1.9L7.6 4H5.6z" />
                </svg>
              </a>
              <a href="#" aria-label="GitHub" className={styles.socialLink}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.8 9.6.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.4-3.4-1.4-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.3 9.3 0 015 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5 3.9-1.3 6.8-5.1 6.8-9.6C22 6.6 17.5 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>
          <div className={styles.footerCols}>
            <div className={styles.footerCol}>
              <div className={styles.footerColTitle}>Product</div>
              <a href="#how" className={styles.footerLink}>How it works</a>
              <a href="#skills" className={styles.footerLink}>Skills catalog</a>
              <Link href="/signup" className={styles.footerLink}>Get started</Link>
            </div>
            <div className={styles.footerCol}>
              <div className={styles.footerColTitle}>For you</div>
              <a href="#seekers" className={styles.footerLink}>For seekers</a>
              <a href="#providers" className={styles.footerLink}>For providers</a>
              <Link href="/login" className={styles.footerLink}>Sign in</Link>
            </div>
            <div className={styles.footerCol}>
              <div className={styles.footerColTitle}>Company</div>
              <a href="#" className={styles.footerLink}>About</a>
              <a href="#" className={styles.footerLink}>Contact</a>
              <a href="#" className={styles.footerLink}>Privacy</a>
            </div>
          </div>
        </div>
        <div className={styles.footerBar}>
          <span>© {new Date().getFullYear()} JoslaLink. All rights reserved.</span>
          <span>Built for working professionals who want to grow.</span>
        </div>
      </footer>
    </div>
  );
}
