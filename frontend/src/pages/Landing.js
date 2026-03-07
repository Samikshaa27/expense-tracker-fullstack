import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ── Design tokens (unchanged) ───────────────────────────────────── */
const G = {
    primary: "#2E7D32",
    primary2: "#43A047",
    light: "#A5D6A7",
    bg: "#FFFFFF",
    bgSoft: "#F1F8F1",
    border: "#E5E7EB",
    text: "#1F2937",
    muted: "#6B7280",
    card: "#FFFFFF",
};

/* ── Feature cards ─────────────────────────────────────────────────── */
const features = [
    {
        icon: "💸",
        title: "Expense Tracking",
        desc: "Log every transaction in seconds — amount, category, date and notes all in one place.",
        bg: "#E8F5E9",
    },
    {
        icon: "📊",
        title: "Smart Analytics",
        desc: "Visual charts and category breakdowns that reveal exactly where your money goes.",
        bg: "#F0FDF4",
    },
    {
        icon: "🏷️",
        title: "Category Management",
        desc: "Organise spending across Food, Travel, Bills, Health, Entertainment and more.",
        bg: "#ECFDF5",
    },
    {
        icon: "🔒",
        title: "Secure Account",
        desc: "Your data is protected with JWT authentication and encrypted storage.",
        bg: "#E8F5E9",
    },
];

/* ── How It Works steps ────────────────────────────────────────────── */
const steps = [
    {
        num: "01",
        icon: "✏️",
        title: "Add Your Expenses",
        desc: "Quickly enter the amount, pick a category and add a short note after every purchase.",
    },
    {
        num: "02",
        icon: "🗂️",
        title: "Categorise Transactions",
        desc: "Group your spending into meaningful categories so patterns become instantly visible.",
    },
    {
        num: "03",
        icon: "📈",
        title: "View Analytics & Insights",
        desc: "Review interactive charts and summaries to make smarter financial decisions every day.",
    },
];

/* ── Helper: scroll-reveal via IntersectionObserver ─────────────────── */
function useReveal(...refs) {
    useEffect(() => {
        const obs = new IntersectionObserver(
            (entries) =>
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.style.opacity = "1";
                        e.target.style.transform = "translateY(0)";
                    }
                }),
            { threshold: 0.12 }
        );
        refs.forEach((r) => {
            if (r.current) {
                r.current.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
            }
        });
        return () => obs.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}

/* ═══════════════════════════════════════════════════════════════════ */
function Landing() {
    const nav = useNavigate();
    const heroRef = useRef(null);
    const featRef = useRef(null);
    const howRef = useRef(null);
    const ctaRef = useRef(null);

    useReveal(heroRef, featRef, howRef, ctaRef);

    const scrollTo = (ref) =>
        ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    return (
        <div style={{ fontFamily: "'Inter', sans-serif", background: G.bg, color: G.text }}>

            {/* ══════════════════  NAVBAR  ══════════════════ */}
            <nav className="landing-nav">
                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
                    onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); nav("/"); }}>
                    <div style={{
                        width: "38px", height: "38px",
                        background: `linear-gradient(135deg, ${G.primary}, ${G.primary2})`,
                        borderRadius: "10px", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "20px",
                        boxShadow: "0 4px 12px rgba(46,125,50,0.30)",
                    }}>🌿</div>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: "800", fontSize: "1.2rem", color: G.primary }}>
                        ExpenseTracker
                    </span>
                </div>

                {/* Links */}
                <div className="landing-nav-links">
                    <NavLink className="nav-hide-mobile" onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); nav("/"); }}>Home</NavLink>
                    <NavLink className="nav-hide-mobile" onClick={() => scrollTo(featRef)}>Features</NavLink>
                    <NavLink onClick={() => nav("/login")}>Login</NavLink>
                    <button
                        onClick={() => nav("/register")}
                        className="btn-green"
                        style={{ padding: "9px 22px", fontSize: "0.9rem", marginLeft: "6px" }}
                    >
                        Sign Up
                    </button>
                </div>
            </nav>

            {/* ══════════════════  HERO  ══════════════════ */}
            <section ref={heroRef} className="landing-hero" style={{
                background: `linear-gradient(160deg, #E8F5E9 0%, #F1F8F1 40%, #fff 100%)`,
                position: "relative", overflow: "hidden",
            }}>
                {/* Decorative blobs */}
                <div style={{ position: "absolute", top: "-120px", right: "-120px", width: "440px", height: "440px", borderRadius: "50%", background: "radial-gradient(circle, rgba(165,214,167,0.35), transparent 70%)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: "-80px", left: "-80px", width: "360px", height: "360px", borderRadius: "50%", background: "radial-gradient(circle, rgba(76,175,80,0.18),  transparent 70%)", pointerEvents: "none" }} />

                <div className="reveal" style={{ opacity: 0, transform: "translateY(30px)", transition: "all 0.7s ease", maxWidth: "720px", margin: "0 auto", textAlign: "center" }}>
                    {/* Badge */}
                    <span style={{
                        display: "inline-block", padding: "5px 16px",
                        background: G.light + "55", border: `1px solid ${G.light}`,
                        borderRadius: "100px", color: G.primary,
                        fontSize: "0.82rem", fontWeight: "700", letterSpacing: "0.06em",
                        textTransform: "uppercase", marginBottom: "24px",
                    }}>
                        🌱 Smart Finance Tracking
                    </span>

                    <h1 className="hero-title" style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: "clamp(2.4rem, 6vw, 3.8rem)",
                        fontWeight: "900", lineHeight: "1.12", letterSpacing: "-0.03em",
                        color: G.text, marginBottom: "22px",
                    }}>
                        Track Your Expenses{" "}
                        <span className="hero-title-break" style={{ color: G.primary }}>Smarter</span>
                    </h1>

                    <p style={{ fontSize: "1.1rem", color: G.muted, lineHeight: "1.75", maxWidth: "520px", margin: "0 auto 38px", textAlign: "center" }}>
                        A clean, minimal dashboard to log, analyse, and manage all your daily spending —
                        with real-time insights at a glance.
                    </p>

                    <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
                        <button onClick={() => nav("/register")} className="btn-green" style={{ padding: "15px 38px", fontSize: "1rem" }}>
                            Get Started →
                        </button>
                        <button onClick={() => nav("/login")} className="btn-outline" style={{ padding: "14px 32px", fontSize: "1rem" }}>
                            Login
                        </button>
                    </div>
                </div>

                {/* Hero illustration */}
                <div className="reveal" style={{
                    opacity: 0, transform: "translateY(40px)", transition: "all 0.9s ease 0.2s",
                    marginTop: "70px", maxWidth: "780px", margin: "70px auto 0",
                }}>
                    <HeroDashboardPreview />
                </div>
            </section>

            {/* ══════════════════  FEATURES  ══════════════════ */}
            <section ref={featRef} id="features" className="landing-section" style={{ background: G.bgSoft }}>
                <div className="reveal" style={{ opacity: 0, transform: "translateY(24px)", transition: "all 0.6s ease", textAlign: "center", marginBottom: "56px" }}>
                    <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: "800", color: G.text, letterSpacing: "-0.02em" }}>
                        Everything you need to{" "}
                        <span style={{ color: G.primary }}>manage money</span>
                    </h2>
                    <p style={{ color: G.muted, fontSize: "1.05rem", marginTop: "12px" }}>
                        Powerful features, zero complexity.
                    </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", maxWidth: "1080px", margin: "0 auto" }}>
                    {features.map((f, i) => (
                        <div key={i} className="card reveal" style={{
                            opacity: 0, transform: "translateY(28px)",
                            transition: `all 0.6s ease ${i * 0.1}s`,
                            padding: "30px 28px", border: `1px solid ${G.border}`,
                        }}>
                            <div style={{ width: "52px", height: "52px", background: f.bg, borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", marginBottom: "18px" }}>
                                {f.icon}
                            </div>
                            <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: G.text, marginBottom: "8px" }}>{f.title}</h3>
                            <p style={{ color: G.muted, fontSize: "0.9rem", lineHeight: "1.65" }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════  HOW IT WORKS  ══════════════════ */}
            <section ref={howRef} className="landing-section" style={{ background: G.bg }}>
                <div className="reveal" style={{ opacity: 0, transform: "translateY(24px)", transition: "all 0.6s ease", textAlign: "center", marginBottom: "60px" }}>
                    <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: "800", color: G.text, letterSpacing: "-0.02em" }}>
                        How It <span style={{ color: G.primary }}>Works</span>
                    </h2>
                    <p style={{ color: G.muted, fontSize: "1.05rem", marginTop: "12px" }}>
                        Up and running in three simple steps.
                    </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "32px", maxWidth: "960px", margin: "0 auto", position: "relative" }}>
                    {/* Connector line (desktop only) */}
                    <div style={{
                        position: "absolute", top: "40px", left: "calc(16% + 20px)", right: "calc(16% + 20px)",
                        height: "2px", background: `linear-gradient(90deg, ${G.light}, ${G.primary2}, ${G.light})`,
                        pointerEvents: "none",
                    }} />

                    {steps.map((s, i) => (
                        <div key={i} className="reveal" style={{
                            opacity: 0, transform: "translateY(28px)",
                            transition: `all 0.65s ease ${i * 0.15}s`,
                            textAlign: "center", padding: "0 16px",
                        }}>
                            {/* Step circle */}
                            <div style={{
                                width: "72px", height: "72px", margin: "0 auto 22px",
                                background: `linear-gradient(135deg, ${G.primary}, ${G.primary2})`,
                                borderRadius: "50%", display: "flex", alignItems: "center",
                                justifyContent: "center", fontSize: "26px",
                                boxShadow: "0 8px 24px rgba(46,125,50,0.30)",
                                border: "4px solid #fff",
                                position: "relative", zIndex: 1,
                            }}>
                                {s.icon}
                            </div>
                            <span style={{ display: "inline-block", background: G.light + "66", color: G.primary, fontSize: "0.72rem", fontWeight: "800", letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 12px", borderRadius: "100px", marginBottom: "10px" }}>
                                Step {s.num}
                            </span>
                            <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: G.text, marginBottom: "10px" }}>{s.title}</h3>
                            <p style={{ color: G.muted, fontSize: "0.9rem", lineHeight: "1.65" }}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════  CTA  ══════════════════ */}
            <section ref={ctaRef} className="landing-cta" style={{
                background: `linear-gradient(135deg, ${G.primary} 0%, #388E3C 50%, ${G.primary2} 100%)`,
            }}>
                <div className="reveal" style={{ opacity: 0, transform: "translateY(24px)", transition: "all 0.6s ease", maxWidth: "600px", margin: "0 auto" }}>
                    <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: "800", color: "#fff", letterSpacing: "-0.02em", marginBottom: "16px" }}>
                        Start Tracking Expenses Today
                    </h2>
                    <p style={{ color: "rgba(255,255,255,0.78)", fontSize: "1.05rem", marginBottom: "36px" }}>
                        Join users who already manage their finances smarter — completely free to use.
                    </p>
                    <button
                        onClick={() => nav("/register")}
                        style={{
                            padding: "16px 44px", background: "#fff", border: "none",
                            borderRadius: "12px", color: G.primary, fontSize: "1.02rem",
                            fontWeight: "800", cursor: "pointer",
                            boxShadow: "0 8px 28px rgba(0,0,0,0.22)",
                            transition: "transform 0.2s, box-shadow 0.2s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 14px 36px rgba(0,0,0,0.28)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.22)"; }}
                    >
                        Start Tracking Expenses →
                    </button>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem", marginTop: "14px" }}>
                        No credit card required · Free forever
                    </p>
                </div>
            </section>

            {/* ══════════════════  FOOTER  ══════════════════ */}
            <footer className="landing-footer" style={{
                background: "#1B5E20",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                flexWrap: "wrap", gap: "16px",
            }}>
                {/* Brand */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "30px", height: "30px", background: "rgba(255,255,255,0.15)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>🌿</div>
                    <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: "800", fontSize: "1rem", fontFamily: "'Outfit', sans-serif" }}>ExpenseTracker</span>
                </div>

                {/* Links */}
                <div className="footer-links" style={{ display: "flex", alignItems: "center" }}>
                    {[
                        { label: "Home", action: () => { window.scrollTo({ top: 0, behavior: "smooth" }); nav("/"); } },
                        { label: "Login", action: () => nav("/login") },
                    ].map((lnk) => (
                        <button key={lnk.label} onClick={lnk.action} style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "rgba(255,255,255,0.55)", fontSize: "0.87rem", fontWeight: "500",
                            padding: "6px 12px", borderRadius: "6px", transition: "color 0.18s",
                        }}
                            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
                            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
                        >
                            {lnk.label}
                        </button>
                    ))}
                </div>

                {/* Copyright */}
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem" }}>
                    © 2026 ExpenseTracker. All rights reserved.
                </p>
            </footer>
        </div>
    );
}

/* ── Nav link ─────────────────────────────────────────────────────── */
function NavLink({ children, onClick, className }) {
    return (
        <button
            onClick={onClick}
            className={className || ""}
            style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#374151", fontSize: "0.92rem", fontWeight: "600",
                padding: "8px 14px", borderRadius: "8px", transition: "all 0.18s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#E8F5E9"; e.currentTarget.style.color = "#2E7D32"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#374151"; }}
        >
            {children}
        </button>
    );
}

/* ── Hero dashboard mock-up (unchanged) ──────────────────────────── */
function HeroDashboardPreview() {
    return (
        <div style={{
            background: "#fff", borderRadius: "20px",
            boxShadow: "0 24px 80px rgba(46,125,50,0.18), 0 4px 20px rgba(0,0,0,0.08)",
            border: "1px solid #E5E7EB", overflow: "hidden", textAlign: "left",
        }}>
            {/* Title bar */}
            <div style={{ background: "#2E7D32", padding: "14px 20px", display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ff5f57" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ffbd2e" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#28c840" }} />
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", marginLeft: "8px" }}>ExpenseTracker · Overview</span>
            </div>
            {/* Content */}
            <div style={{ padding: "24px", display: "flex", gap: "20px" }}>
                {/* Sidebar mock */}
                <div style={{ width: "130px", flexShrink: 0 }}>
                    {["📊 Overview", "📈 Analytics", "➕ Add", "📋 List"].map((item, i) => (
                        <div key={i} style={{
                            padding: "8px 12px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: "600",
                            marginBottom: "4px", color: i === 0 ? "#2E7D32" : "#9CA3AF",
                            background: i === 0 ? "#E8F5E9" : "transparent",
                        }}>{item}</div>
                    ))}
                </div>
                {/* Main content mock */}
                <div style={{ flex: 1 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                        {[
                            { icon: "💸", label: "Spent", val: "₹12,450", bg: "#E8F5E9" },
                            { icon: "🔢", label: "Txns", val: "34", bg: "#FFF8E1" },
                            { icon: "🏷️", label: "Top", val: "Food", bg: "#F3E5F5" },
                        ].map((c, i) => (
                            <div key={i} style={{ background: c.bg, borderRadius: "10px", padding: "10px 12px" }}>
                                <div style={{ fontSize: "16px" }}>{c.icon}</div>
                                <div style={{ fontSize: "0.65rem", color: "#6B7280", fontWeight: "600", marginTop: "3px" }}>{c.label}</div>
                                <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "#1F2937" }}>{c.val}</div>
                            </div>
                        ))}
                    </div>
                    {/* Bar chart mock */}
                    <div style={{ background: "#F9FAFB", borderRadius: "10px", padding: "12px", height: "70px", display: "flex", alignItems: "flex-end", gap: "5px" }}>
                        {[40, 65, 45, 80, 55, 90, 60].map((h, i) => (
                            <div key={i} style={{ flex: 1, background: `linear-gradient(180deg, #4CAF50, #2E7D32)`, borderRadius: "4px 4px 0 0", height: `${h}%`, opacity: 0.7 + i * 0.04 }} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Landing;
