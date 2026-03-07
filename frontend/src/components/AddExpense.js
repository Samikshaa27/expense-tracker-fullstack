import React, { useState } from "react";
import { addExpense } from "../services/api";

const CATEGORIES = [
    "Food", "Travel", "Shopping", "Bills",
    "Health", "Entertainment", "Education", "Other",
];

const CATEGORY_ICONS = {
    Food: "🍽️", Travel: "✈️", Shopping: "🛍️", Bills: "📄",
    Health: "💊", Entertainment: "🎬", Education: "📚", Other: "📦",
};

const G = {
    primary: "#2E7D32",
    primary2: "#43A047",
    light: "#A5D6A7",
    text: "#1F2937",
    muted: "#6B7280",
    border: "#E5E7EB",
};

const inputStyle = {
    width: "100%", padding: "12px 15px",
    border: `1.5px solid ${G.border}`, borderRadius: "10px",
    fontSize: "0.95rem", color: G.text,
    background: "#F9FAFB", outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
};

const labelStyle = {
    display: "block", fontSize: "0.76rem", fontWeight: "700",
    color: G.muted, textTransform: "uppercase",
    letterSpacing: "0.07em", marginBottom: "7px",
};

const onFocus = (e) => {
    e.target.style.borderColor = G.primary;
    e.target.style.boxShadow = "0 0 0 3px rgba(46,125,50,0.14)";
    e.target.style.background = "#fff";
};
const onBlur = (e) => {
    e.target.style.borderColor = G.border;
    e.target.style.boxShadow = "none";
    e.target.style.background = "#F9FAFB";
};

function AddExpense({ onSuccess }) {
    const [form, setForm] = useState({ title: "", amount: "", category: "", date: new Date().toISOString().split("T")[0], notes: "" });
    const [status, setStatus] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) { window.location.href = "/login"; return; }

        setLoading(true); setStatus(null);
        try {
            await addExpense({ ...form, amount: parseFloat(form.amount) }, token);
            setStatus("success");
            setMessage("Expense added successfully!");
            setForm({ title: "", amount: "", category: "", date: new Date().toISOString().split("T")[0], notes: "" });
            if (onSuccess) onSuccess();
        } catch (error) {
            const msg = error?.response?.data?.title || error?.response?.data?.message || error?.message || "Unknown error";
            const code = error?.response?.status ? ` [${error.response.status}]` : "";
            setStatus("error");
            setMessage(`Failed to add expense.${code} ${typeof msg === "string" ? msg : ""}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div style={{ marginBottom: "24px" }}>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.15rem", fontWeight: "800", color: G.text }}>Add Expense</h2>
                <p style={{ color: G.muted, fontSize: "0.84rem", marginTop: "3px" }}>Record a new transaction quickly</p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Title */}
                <div style={{ marginBottom: "14px" }}>
                    <label style={labelStyle}>Title</label>
                    <input
                        id="add-title" type="text" name="title"
                        placeholder="e.g. Lunch at cafe"
                        value={form.title} onChange={handleChange}
                        onFocus={onFocus} onBlur={onBlur}
                        style={inputStyle} required
                    />
                </div>

                {/* Amount */}
                <div style={{ marginBottom: "14px" }}>
                    <label style={labelStyle}>Amount (₹)</label>
                    <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: G.muted, fontWeight: "700", pointerEvents: "none" }}>₹</span>
                        <input
                            id="add-amount" type="number" name="amount"
                            placeholder="0.00"
                            value={form.amount} onChange={handleChange}
                            onFocus={onFocus} onBlur={onBlur}
                            style={{ ...inputStyle, paddingLeft: "32px" }}
                            min="0.01" step="0.01" required
                        />
                    </div>
                </div>

                {/* Category */}
                <div style={{ marginBottom: "14px" }}>
                    <label style={labelStyle}>Category</label>
                    <select
                        id="add-category" name="category"
                        value={form.category} onChange={handleChange}
                        onFocus={onFocus} onBlur={onBlur}
                        style={{ ...inputStyle, cursor: "pointer", appearance: "none" }}
                        required
                    >
                        <option value="">Select a category…</option>
                        {CATEGORIES.map(c => (
                            <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                        ))}
                    </select>
                </div>

                {/* Date */}
                <div style={{ marginBottom: "14px" }}>
                    <label style={labelStyle}>Date</label>
                    <input
                        id="add-date" type="date" name="date"
                        value={form.date} onChange={handleChange}
                        onFocus={onFocus} onBlur={onBlur}
                        style={inputStyle}
                    />
                </div>

                {/* Notes */}
                <div style={{ marginBottom: "20px" }}>
                    <label style={labelStyle}>Notes (optional)</label>
                    <textarea
                        id="add-notes" name="notes"
                        placeholder="Any extra detail…"
                        value={form.notes} onChange={handleChange}
                        onFocus={onFocus} onBlur={onBlur}
                        rows={2}
                        style={{ ...inputStyle, resize: "vertical", lineHeight: "1.5" }}
                    />
                </div>

                {/* Status message */}
                {status && (
                    <div style={{
                        padding: "10px 14px", borderRadius: "8px", marginBottom: "14px",
                        fontSize: "0.87rem", fontWeight: "600",
                        background: status === "success" ? "#D1FAE5" : "#FEF2F2",
                        color: status === "success" ? "#065F46" : "#DC2626",
                        border: `1px solid ${status === "success" ? "#6EE7B7" : "#FCA5A5"}`,
                    }}>
                        {status === "success" ? "✅ " : "⚠ "}{message}
                    </div>
                )}

                <button
                    id="add-submit"
                    type="submit" disabled={loading}
                    className="btn-green"
                    style={{ width: "100%", padding: "13px", fontSize: "0.97rem", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                >
                    {loading ? "Adding…" : "＋ Add Expense"}
                </button>
            </form>
        </>
    );
}

export default AddExpense;
