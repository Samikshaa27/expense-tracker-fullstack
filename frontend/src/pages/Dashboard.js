import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard, getFinancialCoach } from "../services/api";
import AddExpense from "../components/AddExpense";
import ExpenseList from "../components/ExpenseList";
import Analytics from "../components/Analytics";
import Chatbot from "../components/Chatbot";

/* ── Design tokens ── */
const G = {
    primary: "#2E7D32",
    primary2: "#43A047",
    light: "#A5D6A7",
    bg: "#F0F7F0",
    card: "#FFFFFF",
    sidebar: "#1B5E20",
    text: "#1F2937",
    muted: "#6B7280",
    border: "#E5E7EB",
};
const shadow = "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)";
const shadowMd = "0 4px 24px rgba(0,0,0,0.10)";

/* ── Stat card ─────────────────────────────────────────────────────── */
function StatCard({ icon, label, value, bgColor }) {
    return (
        <div
            style={{
                background: G.card, borderRadius: "16px", boxShadow: shadow,
                padding: "20px 22px", width: "100%",
                display: "flex", alignItems: "center", gap: "16px",
                transition: "transform 0.2s, box-shadow 0.2s", cursor: "default",
                border: `1px solid ${G.border}`, boxSizing: "border-box",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = shadowMd; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = shadow; }}
        >
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: bgColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
                {icon}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: "0.72rem", fontWeight: "700", color: G.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "4px" }}>{label}</p>
                <p style={{ fontSize: "1.35rem", fontWeight: "800", color: G.text, letterSpacing: "-0.03em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</p>
            </div>
        </div>
    );
}

/* ── Sidebar nav item ───────────────────────────────────────────────── */
function SidebarItem({ icon, label, active, onClick }) {
    return (
        <div
            onClick={onClick}
            style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "12px 16px", borderRadius: "10px", cursor: "pointer",
                background: active ? "rgba(165,214,167,0.25)" : "transparent",
                color: active ? "#A5D6A7" : "rgba(255,255,255,0.55)",
                fontWeight: active ? "600" : "400",
                fontSize: "0.9rem", transition: "background 0.18s, color 0.18s",
                marginBottom: "2px",
                borderLeft: active ? "3px solid #A5D6A7" : "3px solid transparent",
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; } }}
        >
            <span style={{ fontSize: "17px", flexShrink: 0 }}>{icon}</span>
            {label}
        </div>
    );
}

const PAGE_TITLES = {
    overview: "Overview",
    analytics: "Analytics",
    add: "Add Expense",
    list: "All Expenses",
    chat: "AI Chatbot",
};

/* ═══════════════════════════════════════════════════════════════════ */
function Dashboard() {
    const navigate = useNavigate();
    const [summary, setSummary] = useState({ totalExpenses: 0, totalTransactions: 0, topCategory: "—" });
    const [activeTab, setActiveTab] = useState("overview");
    const [refreshKey, setRefreshKey] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [advice, setAdvice] = useState("");
    const [loadingAdvice, setLoadingAdvice] = useState(false);

    /* Fetch summary */
    const fetchSummary = useCallback(async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await getDashboard(token);
            setSummary(res.data);

            setLoadingAdvice(true);
            const aiRes = await getFinancialCoach(token);
            setAdvice(aiRes.data.advice);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingAdvice(false);
        }
    }, []);

    useEffect(() => { fetchSummary(); }, [fetchSummary, refreshKey]);

    /* Close drawer whenever a tab is selected */
    const goTab = (tab) => { setActiveTab(tab); setSidebarOpen(false); };

    const handleExpenseAdded = () => setRefreshKey(k => k + 1);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        navigate("/");
    };

    const userName = localStorage.getItem("userName") || "User";

    /* ── Sidebar inner content (shared) ── */
    const sidebarContent = (
        <>
            {/* Logo row – hidden on mobile via .sidebar-logo-row CSS rule */}
            <div className="sidebar-logo-row"
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 8px 30px", cursor: "pointer" }}
                onClick={() => navigate("/")}
            >
                <div style={{ width: "38px", height: "38px", background: "rgba(165,214,167,0.25)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0, border: "1px solid rgba(165,214,167,0.35)" }}>🌿</div>
                <span style={{ fontFamily: "'Outfit', sans-serif", color: "#fff", fontWeight: "800", fontSize: "1.05rem", letterSpacing: "-0.01em" }}>ExpenseTracker</span>
            </div>

            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.67rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.12em", padding: "0 8px", marginBottom: "8px" }}>
                MENU
            </p>

            <SidebarItem icon="📊" label="Overview" active={activeTab === "overview"} onClick={() => goTab("overview")} />
            <SidebarItem icon="📈" label="Analytics" active={activeTab === "analytics"} onClick={() => goTab("analytics")} />
            <SidebarItem icon="➕" label="Add Expense" active={activeTab === "add"} onClick={() => goTab("add")} />
            <SidebarItem icon="📋" label="All Expenses" active={activeTab === "list"} onClick={() => goTab("list")} />
            <SidebarItem icon="💬" label="AI Chatbot" active={activeTab === "chat"} onClick={() => goTab("chat")} />

            <div style={{ flex: 1 }} />

            {/* User info */}
            <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", marginBottom: "8px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)" }}>Logged in as</div>
                <div style={{ fontSize: "0.88rem", color: "#fff", fontWeight: "600", marginTop: "2px" }}>
                    {userName}
                </div>
            </div>

            {/* Logout */}
            <div
                onClick={handleLogout}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 16px", borderRadius: "10px", cursor: "pointer", color: "rgba(239,68,68,0.75)", fontSize: "0.9rem", transition: "background 0.18s, color 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; e.currentTarget.style.color = "#f87171"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(239,68,68,0.75)"; }}
            >
                <span>🚪</span> Logout
            </div>
        </>
    );

    return (
        /* dashboard-shell: flex COLUMN → mobile-topbar stacks above dashboard-body */
        <div className="dashboard-shell">

            {/* ══ MOBILE TOPBAR — only visible ≤ 768px via CSS ══ */}
            <div className="mobile-topbar">
                <button
                    className="hamburger-btn"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open navigation menu"
                >
                    ☰
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "28px", height: "28px", background: "rgba(165,214,167,0.25)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", border: "1px solid rgba(165,214,167,0.35)" }}>🌿</div>
                    <span style={{ fontFamily: "'Outfit', sans-serif", color: "#fff", fontWeight: "800", fontSize: "0.95rem" }}>ExpenseTracker</span>
                </div>

                {activeTab !== "add" && (
                    <button
                        onClick={() => goTab("add")}
                        className="btn-green"
                        style={{ padding: "8px 14px", fontSize: "0.82rem", minHeight: "38px" }}
                    >
                        ＋ Add
                    </button>
                )}
            </div>

            {/* ══ BODY ROW: sidebar + main ══ */}
            <div className="dashboard-body">

                {/* Backdrop for mobile drawer */}
                <div
                    className={`sidebar-backdrop${sidebarOpen ? " open" : ""}`}
                    onClick={() => setSidebarOpen(false)}
                />

                {/* Sidebar */}
                <aside className={`dashboard-sidebar${sidebarOpen ? " open" : ""}`}>
                    {sidebarContent}
                </aside>

                {/* Main content */}
                <main className="dashboard-main">

                    {/* Desktop top-bar (title + Add Expense button) */}
                    <div className="dashboard-topbar">
                        <div>
                            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.65rem", fontWeight: "800", color: G.text, letterSpacing: "-0.02em" }}>
                                {PAGE_TITLES[activeTab]}
                            </h1>
                            <p style={{ color: G.muted, fontSize: "0.87rem", marginTop: "3px" }}>
                                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                            </p>
                        </div>
                        {activeTab !== "add" && (
                            <button
                                className="btn-green desktop-add-btn"
                                onClick={() => setActiveTab("add")}
                                style={{ padding: "10px 22px", fontSize: "0.9rem" }}
                            >
                                ＋ Add Expense
                            </button>
                        )}
                    </div>

                    {/* ════  OVERVIEW  ════ */}
                    {activeTab === "overview" && (
                        <>
                            {/* Banner */}
                            <div
                                className="overview-banner"
                                style={{
                                    background: `linear-gradient(135deg, ${G.primary} 0%, ${G.primary2} 100%)`,
                                    boxShadow: "0 8px 28px rgba(46,125,50,0.3)",
                                }}
                            >
                                <div>
                                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", fontWeight: "600", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                                        Total Expenses (All Time)
                                    </p>
                                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(1.5rem, 5vw, 2.4rem)", fontWeight: "900", color: "#fff", letterSpacing: "-0.03em" }}>
                                        ₹ {Number(summary.totalExpenses || 0).toLocaleString("en-IN")}
                                    </div>
                                    <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.85rem", marginTop: "5px" }}>
                                        Across {summary.totalTransactions ?? 0} transactions
                                    </p>
                                </div>
                                <div className="banner-emoji">💰</div>
                            </div>

                            {/* Stat cards — CSS grid handles 3 → 1 col responsively */}
                            <div className="stat-cards-row">
                                <StatCard icon="💸" label="Total Spent" value={`₹ ${Number(summary.totalExpenses || 0).toLocaleString("en-IN")}`} bgColor="#E8F5E9" />
                                <StatCard icon="🔢" label="Transactions" value={summary.totalTransactions ?? 0} bgColor="#FFF8E1" />
                                <StatCard icon="🏷️" label="Top Category" value={summary.topCategory || "—"} bgColor="#E8EAF6" />
                            </div>

                            {/* AI Financial Coach */}
                            <div style={{ marginTop: "24px", background: "#399B48", borderRadius: "16px", padding: "24px", border: `1px solid ${G.border}`, boxShadow: shadow }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                                    <div style={{ fontSize: "24px", background: "rgba(255,255,255,0.2)", width: "42px", height: "42px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>💡</div>
                                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.25rem", margin: 0, fontWeight: "800", color: "#FFFFFF" }}>AI Financial Coach</h3>
                                </div>
                                {loadingAdvice ? (
                                    <p style={{ opacity: 0.8, fontStyle: "italic", margin: 0, color: "rgba(255,255,255,0.8)" }}>Analyzing your spending patterns...</p>
                                ) : (
                                    <p
                                        style={{ margin: 0, fontSize: "0.95rem", lineHeight: "1.6", color: "#FFFFFF", whiteSpace: "pre-wrap" }}
                                        dangerouslySetInnerHTML={{ __html: advice ? advice.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #FFFFFF; font-weight: 800;">$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') : "Not enough data yet." }}
                                    />
                                )}
                            </div>

                            {/* Add form + recent expenses */}
                            <div className="overview-grid" style={{ marginTop: "24px" }}>
                                <div className="dash-card" style={{ background: G.card, borderRadius: "16px", boxShadow: shadow, padding: "28px", border: `1px solid ${G.border}` }}>
                                    <AddExpense onSuccess={handleExpenseAdded} />
                                </div>
                                <div className="dash-card" style={{ background: G.card, borderRadius: "16px", boxShadow: shadow, padding: "28px", border: `1px solid ${G.border}` }}>
                                    <ExpenseList key={refreshKey} compact />
                                </div>
                            </div>
                        </>
                    )}

                    {/* ════  ANALYTICS  ════ */}
                    {activeTab === "analytics" && (
                        <Analytics refreshKey={refreshKey} />
                    )}

                    {/* ════  ADD EXPENSE  ════ */}
                    {activeTab === "add" && (
                        <div className="add-grid">
                            <div className="dash-card" style={{ background: G.card, borderRadius: "16px", boxShadow: shadow, padding: "36px", border: `1px solid ${G.border}` }}>
                                <AddExpense onSuccess={() => { handleExpenseAdded(); setActiveTab("list"); }} />
                            </div>
                            {/* Tips panel – hidden on mobile via CSS (.tips-panel) */}
                            <div className="tips-panel" style={{ background: `linear-gradient(160deg, ${G.primary} 0%, #388E3C 100%)`, borderRadius: "16px", padding: "36px", boxShadow: "0 8px 28px rgba(46,125,50,0.25)" }}>
                                <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>📝</div>
                                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.2rem", fontWeight: "800", color: "#fff", marginBottom: "12px" }}>Quick Tips</h3>
                                {[
                                    "Always categorise expenses for better analytics.",
                                    "Use descriptive titles like 'Lunch at Cafe'.",
                                    "Add expenses right after spending for accuracy.",
                                    "Review analytics weekly to spot patterns.",
                                ].map((tip, i) => (
                                    <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "12px", alignItems: "flex-start" }}>
                                        <span style={{ color: G.light, fontWeight: "700", flexShrink: 0 }}>→</span>
                                        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem", lineHeight: "1.5" }}>{tip}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ════  ALL EXPENSES  ════ */}
                    {activeTab === "list" && (
                        <div className="dash-card" style={{ background: G.card, borderRadius: "16px", boxShadow: shadow, padding: "28px", border: `1px solid ${G.border}` }}>
                            <ExpenseList key={refreshKey} />
                        </div>
                    )}

                    {/* ════  AI CHATBOT  ════ */}
                    {activeTab === "chat" && (
                        <div className="dash-card" style={{ background: "transparent", height: "calc(100vh - 120px)" }}>
                            <Chatbot height="100%" />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default Dashboard;