import React, { useEffect, useState, useCallback } from "react";
import { getExpenses, deleteExpense } from "../services/api";

const G = {
    primary: "#2E7D32",
    primary2: "#43A047",
    light: "#A5D6A7",
    text: "#1F2937",
    muted: "#6B7280",
    border: "#E5E7EB",
    bg: "#F0F7F0",
};

const CATEGORY_COLORS = {
    Food: { bg: "#FEF9C3", color: "#854D0E" },
    Travel: { bg: "#DBEAFE", color: "#1E40AF" },
    Shopping: { bg: "#FCE7F3", color: "#9D174D" },
    Bills: { bg: "#FEE2E2", color: "#991B1B" },
    Health: { bg: "#D1FAE5", color: "#065F46" },
    Entertainment: { bg: "#EDE9FE", color: "#5B21B6" },
    Education: { bg: "#E0F2FE", color: "#0C4A6E" },
    Other: { bg: "#F1F5F9", color: "#475569" },
};

const CATEGORY_ICONS = {
    Food: "🍽️", Travel: "✈️", Shopping: "🛍️", Bills: "📄",
    Health: "💊", Entertainment: "🎬", Education: "📚", Other: "📦",
};

const getBadge = (cat) => CATEGORY_COLORS[cat] || { bg: "#F1F5F9", color: "#475569" };

function ExpenseList({ compact }) {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");

    const toISO = (dateStr) => dateStr ? new Date(dateStr).toISOString() : undefined;

    const fetchExpenses = useCallback(async () => {
        setLoading(true); setErrorMsg("");
        const token = localStorage.getItem("token");
        try {
            const res = await getExpenses(token, {
                startDate: toISO(startDate),
                endDate: endDate ? new Date(endDate + "T23:59:59").toISOString() : undefined,
                pageSize: compact ? 8 : 50,
            });

            // ── Debug: inspect the raw API response shape ──
            console.log("[ExpenseList] Raw API response:", res);
            console.log("[ExpenseList] res.data:", res.data);

            const data = res.data;

            // Normalise: handle all common .NET/ASP.NET response shapes
            let list = [];
            if (Array.isArray(data)) {
                // Plain array: [{...}, {...}]
                list = data;
            } else if (data?.$values && Array.isArray(data.$values)) {
                // System.Text.Json ReferenceHandler.Preserve: {"$id":"1","$values":[...]}
                list = data.$values;
            } else if (data?.expenses && Array.isArray(data.expenses)) {
                // Wrapped: { expenses: [...] }
                list = data.expenses;
            } else if (data?.items && Array.isArray(data.items)) {
                // Paginated: { items: [...], total: N }
                list = data.items;
            } else if (data?.data && Array.isArray(data.data)) {
                // Generic wrapper: { data: [...] }
                list = data.data;
            } else if (data?.result && Array.isArray(data.result)) {
                // Result wrapper: { result: [...] }
                list = data.result;
            } else if (data?.Data && Array.isArray(data.Data)) {
                // PascalCase wrapper: { Data: [...] }
                list = data.Data;
            } else {
                console.warn("[ExpenseList] Unrecognised response shape — raw data:", data);
                list = [];
            }

            console.log("[ExpenseList] Parsed expense list:", list);
            setExpenses(list);
        } catch (err) {
            console.error("[ExpenseList] Fetch error:", err);
            if (!err.response) {
                setErrorMsg("Cannot reach the server. Please check your connection or verify if the backend is live.");
            } else {
                setErrorMsg(`Failed to load expenses (${err.response.status}). Check console for details.`);
            }
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate, compact]);

    useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this expense?")) return;
        setDeletingId(id);
        const token = localStorage.getItem("token");
        try {
            await deleteExpense(id, token);
            setExpenses(prev => prev.filter(e => e.id !== id));
        } catch {
            alert("Could not delete. Please try again.");
        } finally {
            setDeletingId(null);
        }
    };

    const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                    <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.05rem", fontWeight: "800", color: G.text }}>
                        {compact ? "Recent Expenses" : "All Expenses"}
                    </h2>
                    {!loading && (
                        <p style={{ color: G.muted, fontSize: "0.8rem", marginTop: "2px" }}>
                            {expenses.length} transaction{expenses.length !== 1 ? "s" : ""}
                            {expenses.length > 0 && ` · Total ₹ ${total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                        </p>
                    )}
                </div>

                {/* Date filter – full mode */}
                {!compact && (
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", width: "100%" }}>
                        <input
                            type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                            style={{ ...dateInputStyle, flex: "1 1 120px", minWidth: 0 }}
                        />
                        <span style={{ color: G.muted, fontSize: "0.83rem" }}>to</span>
                        <input
                            type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                            style={{ ...dateInputStyle, flex: "1 1 120px", minWidth: 0 }}
                        />
                        {(startDate || endDate) && (
                            <button onClick={() => { setStartDate(""); setEndDate(""); }} style={clearBtnStyle}>
                                ✕ Clear
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Error */}
            {errorMsg && (
                <div style={{ padding: "10px 14px", borderRadius: "8px", background: "#FEF2F2", color: "#DC2626", fontSize: "0.87rem", marginBottom: "14px", border: "1px solid #FCA5A5" }}>
                    ⚠ {errorMsg}
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "40px", color: G.muted }}>
                    <div style={{ fontSize: "2rem", marginBottom: "8px" }}>⏳</div>
                    Loading expenses…
                </div>
            ) : expenses.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: G.muted }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>📭</div>
                    <p style={{ fontWeight: "600", color: G.text, marginBottom: "4px" }}>No expenses found</p>
                    <p style={{ fontSize: "0.85rem" }}>Add your first expense to get started.</p>
                </div>
            ) : (
                <>
                    {/* Expense rows — card layout works on any screen width */}
                    {expenses.map((exp) => {
                        const badge = getBadge(exp.category);
                        return (
                            <div key={exp.id} style={{
                                display: "flex", alignItems: "center", gap: "10px",
                                padding: "11px 10px", borderRadius: "10px",
                                borderBottom: `1px solid ${G.border}`,
                                transition: "background 0.15s", cursor: "default",
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = "#F0F7F0"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                                {/* Icon */}
                                <span style={{ fontSize: "20px", flexShrink: 0 }}>
                                    {CATEGORY_ICONS[exp.category] || "💸"}
                                </span>

                                {/* Title + meta */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: "600", color: G.text, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {exp.title || exp.description || "—"}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px", flexWrap: "wrap" }}>
                                        <span style={{ ...badge, padding: "2px 8px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "700" }}>
                                            {exp.category || "—"}
                                        </span>
                                        {!compact && exp.date && (
                                            <span style={{ color: G.muted, fontSize: "0.75rem" }}>
                                                {new Date(exp.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Amount */}
                                <span style={{ fontWeight: "700", color: "#DC2626", fontSize: "0.92rem", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                                    ₹ {Number(exp.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </span>

                                {/* Delete */}
                                <button
                                    onClick={() => handleDelete(exp.id)}
                                    disabled={deletingId === exp.id}
                                    style={{
                                        flexShrink: 0, padding: "5px 8px", borderRadius: "6px",
                                        border: "1.5px solid #FCA5A5",
                                        background: "transparent", color: "#DC2626",
                                        fontSize: "0.82rem", fontWeight: "600",
                                        cursor: deletingId === exp.id ? "not-allowed" : "pointer",
                                        opacity: deletingId === exp.id ? 0.5 : 1,
                                        transition: "all 0.18s", minWidth: "32px",
                                    }}
                                    onMouseEnter={e => { if (deletingId !== exp.id) e.target.style.background = "#FEE2E2"; }}
                                    onMouseLeave={e => { e.target.style.background = "transparent"; }}
                                >
                                    {deletingId === exp.id ? "…" : "🗑"}
                                </button>
                            </div>
                        );
                    })}

                    {/* Total footer */}
                    <div style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "14px 14px 0", marginTop: "6px",
                        borderTop: `1.5px solid ${G.border}`,
                    }}>
                        <span style={{ color: G.muted, fontSize: "0.84rem", fontWeight: "600" }}>
                            {expenses.length} item{expenses.length !== 1 ? "s" : ""}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ color: G.muted, fontSize: "0.88rem", fontWeight: "600" }}>Total</span>
                            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.15rem", fontWeight: "800", color: G.primary }}>
                                ₹ {total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

/* ── Shared styles ── */
const dateInputStyle = {
    padding: "8px 12px",
    border: `1.5px solid ${G.border}`,
    borderRadius: "8px", fontSize: "0.85rem",
    color: G.text, background: "#F9FAFB",
    cursor: "pointer", outline: "none",
};
const clearBtnStyle = {
    padding: "7px 14px",
    border: `1.5px solid ${G.border}`,
    borderRadius: "8px", background: "transparent",
    color: G.muted, fontSize: "0.83rem",
    cursor: "pointer", fontWeight: "600",
    transition: "all 0.18s",
};

export default ExpenseList;
