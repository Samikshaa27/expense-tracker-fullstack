import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

/* ── Design tokens ── */
const G = {
    primary: "#2E7D32",
    primary2: "#43A047",
    light: "#A5D6A7",
    bg: "#F1F8F1",
    text: "#1F2937",
    muted: "#6B7280",
    border: "#D1D5DB",
    error: "#DC2626",
    errorBg: "#FEF2F2",
};

/* ── Feature info popup ── */
function InfoPopup({ onClose }) {
    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: "fixed", inset: 0, zIndex: 200,
                    background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)",
                    animation: "fadeIn 0.2s ease",
                }}
            />
            {/* Sheet */}
            <div style={{
                position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 201,
                background: `linear-gradient(160deg, ${G.primary} 0%, #1B5E20 100%)`,
                borderRadius: "24px 24px 0 0",
                padding: "28px 24px 40px",
                animation: "slideUp 0.32s cubic-bezier(0.4,0,0.2,1)",
                maxHeight: "80vh", overflowY: "auto",
            }}>
                {/* Drag handle */}
                <div style={{ width: "40px", height: "4px", background: "rgba(255,255,255,0.35)", borderRadius: "2px", margin: "0 auto 24px" }} />

                {/* Close button */}
                <button onClick={onClose} style={{
                    position: "absolute", top: "20px", right: "20px",
                    background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%",
                    width: "34px", height: "34px", fontSize: "1.1rem", color: "#fff",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}>✕</button>

                {/* Heading */}
                <h2 style={{
                    fontFamily: "'Outfit', sans-serif", fontSize: "1.7rem", fontWeight: "900",
                    color: "#fff", lineHeight: "1.25", letterSpacing: "-0.02em", marginBottom: "12px",
                }}>
                    Your finances,<br />beautifully organised.
                </h2>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.95rem", lineHeight: "1.7", marginBottom: "28px" }}>
                    Track every rupee, visualise spending patterns, and stay on top of your budget — all in one place.
                </p>

                {/* Feature list */}
                {[
                    "Real-time expense tracking",
                    "Category-wise analytics",
                    "Date-filtered history",
                    "Secure & private account",
                ].map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                        <div style={{
                            width: "26px", height: "26px", background: "rgba(255,255,255,0.25)",
                            borderRadius: "50%", display: "flex", alignItems: "center",
                            justifyContent: "center", fontSize: "12px", color: "#fff", flexShrink: 0,
                        }}>✓</div>
                        <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.95rem" }}>{f}</span>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to   { transform: translateY(0); }
                }
            `}</style>
        </>
    );
}

const inputBase = {
    width: "100%", padding: "12px 16px",
    border: `1.5px solid ${G.border}`, borderRadius: "10px",
    fontSize: "0.95rem", color: G.text,
    background: "#fff", outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
};

const labelBase = {
    display: "block", fontSize: "0.78rem", fontWeight: "700",
    color: G.muted, textTransform: "uppercase",
    letterSpacing: "0.07em", marginBottom: "7px",
};

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [infoOpen, setInfoOpen] = useState(false);

    const onFocus = (e) => {
        e.target.style.borderColor = G.primary;
        e.target.style.boxShadow = "0 0 0 3px rgba(46,125,50,0.15)";
    };
    const onBlur = (e) => {
        e.target.style.borderColor = G.border;
        e.target.style.boxShadow = "none";
    };

    const handleLogin = async () => {
        if (!email || !password) { setError("Please fill in all fields."); return; }
        setLoading(true); setError("");
        try {
            const res = await loginUser({ email, password });
            localStorage.setItem("token", res.data.token);
            if (res.data.userName) localStorage.setItem("userName", res.data.userName);
            navigate("/dashboard");
        } catch (err) {
            if (!err.response) {
                // Network error – backend is down, wrong port, or CORS
                setError("Cannot reach the server. Make sure the backend is running and you are on the same Wi-Fi (http://192.168.1.7:5269).");
            } else if (err.response.status === 401 || err.response.status === 400) {
                setError("Invalid email or password. Please try again.");
            } else {
                setError(`Server error (${err.response.status}): ${err.response.data?.message || "Please try again."}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const onKey = (e) => { if (e.key === "Enter") handleLogin(); };

    return (
        <div className="auth-wrapper" style={{ background: G.bg }}>

            {/* Info popup (mobile only) */}
            {infoOpen && <InfoPopup onClose={() => setInfoOpen(false)} />}

            {/* ── LEFT PANEL ── */}
            <div className="auth-left" style={{ background: `linear-gradient(160deg, ${G.primary} 0%, #1B5E20 100%)` }}>
                {/* Decorative blobs */}
                <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "380px", height: "380px", borderRadius: "50%", background: "rgba(165,214,167,0.15)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: "-80px", left: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />

                {/* Logo row + hamburger (hamburger only shows on mobile via CSS) */}
                <div className="auth-left-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "56px" }}>
                    <div
                        style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
                        onClick={() => navigate("/")}
                    >
                        <div style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.2)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>🌿</div>
                        <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: "800", fontSize: "1.2rem", color: "#fff" }}>ExpenseTracker</span>
                    </div>

                    {/* Hamburger – hidden on desktop via CSS, visible on mobile */}
                    <button
                        className="auth-info-btn"
                        onClick={() => setInfoOpen(true)}
                        style={{
                            display: "none",           /* overridden to flex on mobile by CSS */
                            flexDirection: "column", alignItems: "center", justifyContent: "center",
                            gap: "5px", background: "rgba(255,255,255,0.18)",
                            border: "none", borderRadius: "10px",
                            width: "40px", height: "40px", cursor: "pointer", padding: "0", flexShrink: 0,
                        }}
                        aria-label="Show app info"
                    >
                        <span style={{ display: "block", width: "18px", height: "2px", background: "#fff", borderRadius: "2px" }} />
                        <span style={{ display: "block", width: "18px", height: "2px", background: "#fff", borderRadius: "2px" }} />
                        <span style={{ display: "block", width: "18px", height: "2px", background: "#fff", borderRadius: "2px" }} />
                    </button>
                </div>

                {/* Verbose content — hidden on mobile via .auth-left-hide */}
                <div className="auth-left-hide">
                    <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "2.2rem", fontWeight: "900", color: "#fff", lineHeight: "1.2", letterSpacing: "-0.02em", marginBottom: "16px" }}>
                        Your finances,<br />beautifully organised.
                    </h2>
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem", lineHeight: "1.7", marginBottom: "40px" }}>
                        Track every rupee, visualise spending patterns, and stay on top of your budget — all in one place.
                    </p>
                    {[
                        "Real-time expense tracking",
                        "Category-wise analytics",
                        "Date-filtered history",
                        "Secure & private account",
                    ].map((f, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                            <div style={{ width: "22px", height: "22px", background: "rgba(255,255,255,0.25)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#fff", flexShrink: 0 }}>✓</div>
                            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9rem" }}>{f}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── RIGHT PANEL – Auth card ── */}
            <div className="auth-right">
                <div style={{ width: "100%", maxWidth: "420px" }}>

                    {/* Top nav */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
                        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer", color: G.muted, fontSize: "0.88rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "5px", padding: "0" }}>
                            ← Home
                        </button>
                        <button onClick={() => navigate("/register")} style={{ background: "none", border: "none", cursor: "pointer", color: G.primary, fontSize: "0.88rem", fontWeight: "700", padding: "0" }}>
                            Sign Up
                        </button>
                    </div>

                    <div className="auth-card" style={{ background: "#fff", borderRadius: "20px", padding: "40px 36px", boxShadow: "0 4px 30px rgba(0,0,0,0.09)", border: `1px solid ${G.border}` }}>
                        {/* Header */}
                        <div style={{ textAlign: "center", marginBottom: "32px" }}>
                            <div style={{ width: "56px", height: "56px", background: `linear-gradient(135deg, ${G.primary}, ${G.primary2})`, borderRadius: "16px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "26px", marginBottom: "16px", boxShadow: "0 6px 20px rgba(46,125,50,0.3)" }}>
                                🌿
                            </div>
                            <h1 style={{ fontSize: "1.65rem", fontWeight: "800", color: G.text, letterSpacing: "-0.02em" }}>Welcome back</h1>
                            <p style={{ color: G.muted, fontSize: "0.9rem", marginTop: "5px" }}>Sign in to your account</p>
                        </div>

                        {/* Email */}
                        <div style={{ marginBottom: "16px" }}>
                            <label style={labelBase}>Email Address</label>
                            <input
                                id="login-email" type="email" placeholder="you@example.com"
                                value={email} onChange={e => setEmail(e.target.value)}
                                onKeyDown={onKey} onFocus={onFocus} onBlur={onBlur}
                                style={inputBase}
                            />
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: "24px" }}>
                            <label style={labelBase}>Password</label>
                            <input
                                id="login-password" type="password" placeholder="••••••••"
                                value={password} onChange={e => setPassword(e.target.value)}
                                onKeyDown={onKey} onFocus={onFocus} onBlur={onBlur}
                                style={inputBase}
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={{ background: G.errorBg, border: `1px solid #FCA5A5`, borderRadius: "8px", padding: "10px 14px", color: G.error, fontSize: "0.87rem", marginBottom: "16px" }}>
                                ⚠ {error}
                            </div>
                        )}

                        {/* Sign In button */}
                        <button
                            id="login-submit"
                            onClick={handleLogin} disabled={loading}
                            className="btn-green"
                            style={{ width: "100%", padding: "14px", fontSize: "1rem", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                        >
                            {loading ? "Signing in…" : "Sign In →"}
                        </button>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
                            <div style={{ flex: 1, height: "1px", background: G.border }} />
                            <span style={{ color: G.muted, fontSize: "0.78rem" }}>OR</span>
                            <div style={{ flex: 1, height: "1px", background: G.border }} />
                        </div>

                        {/* Register */}
                        <button
                            id="login-register"
                            onClick={() => navigate("/register")}
                            className="btn-outline"
                            style={{ width: "100%", padding: "13px", fontSize: "0.95rem" }}
                        >
                            Create New Account
                        </button>

                        <p style={{ textAlign: "center", color: G.muted, fontSize: "0.8rem", marginTop: "16px" }}>
                            Free to use · No credit card required
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;