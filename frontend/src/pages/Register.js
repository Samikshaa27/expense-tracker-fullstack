import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

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
    success: "#065F46",
    successBg: "#D1FAE5",
};

/* ── Register info popup ── */
function RegisterInfoPopup({ onClose }) {
    return (
        <>
            <div onClick={onClose} style={{
                position: "fixed", inset: 0, zIndex: 200,
                background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)",
                animation: "fadeIn 0.2s ease",
            }} />
            <div style={{
                position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 201,
                background: `linear-gradient(160deg, ${G.primary} 0%, #1B5E20 100%)`,
                borderRadius: "24px 24px 0 0",
                padding: "28px 24px 40px",
                animation: "slideUp 0.32s cubic-bezier(0.4,0,0.2,1)",
                maxHeight: "80vh", overflowY: "auto",
            }}>
                <div style={{ width: "40px", height: "4px", background: "rgba(255,255,255,0.35)", borderRadius: "2px", margin: "0 auto 24px" }} />
                <button onClick={onClose} style={{
                    position: "absolute", top: "20px", right: "20px",
                    background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%",
                    width: "34px", height: "34px", fontSize: "1.1rem", color: "#fff",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}>✕</button>
                <h2 style={{
                    fontFamily: "'Outfit', sans-serif", fontSize: "1.7rem", fontWeight: "900",
                    color: "#fff", lineHeight: "1.25", letterSpacing: "-0.02em", marginBottom: "12px",
                }}>Start your financial<br />journey today.</h2>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.95rem", lineHeight: "1.7", marginBottom: "28px" }}>
                    Create a free account and take control of your expenses — no credit card needed.
                </p>
                {[
                    { step: "1", text: "Create a free account" },
                    { step: "2", text: "Add your first expense" },
                    { step: "3", text: "Explore analytics" },
                ].map(s => (
                    <div key={s.step} style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
                        <div style={{ width: "32px", height: "32px", background: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: "0.85rem", flexShrink: 0 }}>{s.step}</div>
                        <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.92rem" }}>{s.text}</span>
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

function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const onFocus = (e) => {
        e.target.style.borderColor = G.primary;
        e.target.style.boxShadow = "0 0 0 3px rgba(46,125,50,0.15)";
    };
    const onBlur = (e) => {
        e.target.style.borderColor = G.border;
        e.target.style.boxShadow = "none";
    };

    const handleRegister = async () => {
        setError("");
        if (!form.name || !form.email || !form.password || !form.confirm) { setError("Please fill in all fields."); return; }
        if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
        if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }

        setLoading(true);
        try {
            await registerUser({ name: form.name, email: form.email, password: form.password });
            setSuccess(true);
        } catch (err) {
            const msg = err?.response?.data?.message
                || err?.response?.data?.title
                || (typeof err?.response?.data === "string" ? err.response.data : null)
                || "Registration failed. Please try again.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const onKey = (e) => { if (e.key === "Enter") handleRegister(); };

    /* ── Success state ── */
    if (success) {
        return (
            <div style={{ minHeight: "100vh", background: G.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", padding: "24px" }}>
                <div style={{ background: "#fff", borderRadius: "24px", padding: "56px 48px", maxWidth: "420px", width: "100%", textAlign: "center", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", border: `1px solid ${G.border}` }}>
                    <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>🎉</div>
                    <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.7rem", fontWeight: "800", color: G.text, marginBottom: "10px" }}>Account Created!</h2>
                    <p style={{ color: G.muted, fontSize: "0.9rem", marginBottom: "30px" }}>
                        Your account has been created successfully. You can now sign in.
                    </p>
                    <button onClick={() => navigate("/login")} className="btn-green" style={{ width: "100%", padding: "14px", fontSize: "1rem" }}>
                        Go to Sign In →
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-wrapper" style={{ background: G.bg }}>

            {/* Info popup (mobile only) */}
            {infoOpen && <RegisterInfoPopup onClose={() => setInfoOpen(false)} />}

            {/* ── LEFT PANEL ── */}
            <div className="auth-left auth-left-42" style={{ background: `linear-gradient(160deg, ${G.primary} 0%, #1B5E20 100%)` }}>
                <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "320px", height: "320px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: "-100px", left: "-60px", width: "330px", height: "330px", borderRadius: "50%", background: "rgba(165,214,167,0.13)", pointerEvents: "none" }} />

                {/* Logo row + hamburger */}
                <div className="auth-left-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "52px" }}>
                    <div
                        style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
                        onClick={() => navigate("/")}
                    >
                        <div style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.18)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>🌿</div>
                        <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: "800", fontSize: "1.2rem", color: "#fff" }}>ExpenseTracker</span>
                    </div>

                    {/* Hamburger – hidden on desktop, visible on mobile via CSS */}
                    <button
                        className="auth-info-btn"
                        onClick={() => setInfoOpen(true)}
                        style={{
                            display: "none",
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

                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "2rem", fontWeight: "900", color: "#fff", lineHeight: "1.25", letterSpacing: "-0.02em", marginBottom: "14px" }}>
                    Start your financial journey today.
                </h2>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem", lineHeight: "1.7", marginBottom: "36px" }}>
                    Create a free account and take control of your expenses — no credit card needed.
                </p>

                {/* Steps — hidden on mobile */}
                <div className="auth-left-hide">
                    {[
                        { step: "1", text: "Create a free account" },
                        { step: "2", text: "Add your first expense" },
                        { step: "3", text: "Explore analytics" },
                    ].map(s => (
                        <div key={s.step} style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
                            <div style={{ width: "32px", height: "32px", background: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: "0.85rem", flexShrink: 0 }}>
                                {s.step}
                            </div>
                            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.92rem" }}>{s.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="auth-right">
                <div style={{ width: "100%", maxWidth: "440px" }}>

                    {/* Top nav */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "36px" }}>
                        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer", color: G.muted, fontSize: "0.88rem", fontWeight: "600" }}>
                            ← Home
                        </button>
                        <button onClick={() => navigate("/login")} style={{ background: "none", border: "none", cursor: "pointer", color: G.primary, fontSize: "0.88rem", fontWeight: "700" }}>
                            Sign In
                        </button>
                    </div>

                    <div className="auth-card" style={{ background: "#fff", borderRadius: "20px", padding: "38px 34px", boxShadow: "0 4px 30px rgba(0,0,0,0.09)", border: `1px solid ${G.border}` }}>
                        {/* Header */}
                        <div style={{ textAlign: "center", marginBottom: "28px" }}>
                            <div style={{ width: "52px", height: "52px", background: `linear-gradient(135deg, ${G.primary}, ${G.primary2})`, borderRadius: "14px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "24px", marginBottom: "14px", boxShadow: "0 6px 20px rgba(46,125,50,0.3)" }}>
                                🌿
                            </div>
                            <h1 style={{ fontSize: "1.55rem", fontWeight: "800", color: G.text, letterSpacing: "-0.02em" }}>Create Account</h1>
                            <p style={{ color: G.muted, fontSize: "0.88rem", marginTop: "5px" }}>Start tracking your expenses today</p>
                        </div>

                        {/* Fields */}
                        <div style={{ marginBottom: "14px" }}>
                            <label style={labelBase}>Full Name</label>
                            <input id="reg-name" type="text" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} onKeyDown={onKey} onFocus={onFocus} onBlur={onBlur} style={inputBase} />
                        </div>
                        <div style={{ marginBottom: "14px" }}>
                            <label style={labelBase}>Email Address</label>
                            <input id="reg-email" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} onKeyDown={onKey} onFocus={onFocus} onBlur={onBlur} style={inputBase} />
                        </div>
                        <div style={{ marginBottom: "14px" }}>
                            <label style={labelBase}>Password</label>
                            <input id="reg-password" type="password" name="password" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} onKeyDown={onKey} onFocus={onFocus} onBlur={onBlur} style={inputBase} />
                        </div>
                        <div style={{ marginBottom: "22px" }}>
                            <label style={labelBase}>Confirm Password</label>
                            <input id="reg-confirm" type="password" name="confirm" placeholder="Re-enter your password" value={form.confirm} onChange={handleChange} onKeyDown={onKey} onFocus={onFocus} onBlur={onBlur} style={inputBase} />
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={{ background: G.errorBg, border: "1px solid #FCA5A5", borderRadius: "8px", padding: "10px 14px", color: G.error, fontSize: "0.87rem", marginBottom: "16px" }}>
                                ⚠ {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            id="reg-submit"
                            onClick={handleRegister} disabled={loading}
                            className="btn-green"
                            style={{ width: "100%", padding: "14px", fontSize: "0.97rem", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer", marginBottom: "18px" }}
                        >
                            {loading ? "Creating Account…" : "Create Account →"}
                        </button>

                        <p style={{ textAlign: "center", color: G.muted, fontSize: "0.88rem" }}>
                            Already have an account?{" "}
                            <span onClick={() => navigate("/login")} style={{ color: G.primary, fontWeight: "700", cursor: "pointer" }}>
                                Sign in
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
