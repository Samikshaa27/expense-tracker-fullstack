import React, { useEffect, useState, useCallback } from "react";
import {
    PieChart, Pie, Cell, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { getCategorySummary, getSummary } from "../services/api";

/* ── Green palette for charts ── */
const PALETTE = [
    "#2E7D32", "#43A047", "#66BB6A", "#A5D6A7",
    "#1B5E20", "#388E3C", "#81C784", "#C8E6C9",
];

const G = {
    primary: "#2E7D32",
    primary2: "#43A047",
    light: "#A5D6A7",
    text: "#1F2937",
    muted: "#6B7280",
    border: "#E5E7EB",
    bg: "#F0F7F0",
};

const shadow = "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)";
const shadowMd = "0 4px 24px rgba(0,0,0,0.10)";

/* ── Custom Pie tooltip ── */
const PieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const { name, value } = payload[0];
    return (
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "10px 16px", boxShadow: shadowMd, fontSize: "0.88rem" }}>
            <p style={{ fontWeight: "700", color: G.text, marginBottom: "2px" }}>{name}</p>
            <p style={{ color: G.primary, fontWeight: "600" }}>
                ₹ {Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
        </div>
    );
};

/* ── Custom Bar tooltip ── */
const BarTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "10px 16px", boxShadow: shadowMd, fontSize: "0.88rem" }}>
            <p style={{ fontWeight: "700", color: G.text, marginBottom: "2px" }}>{label}</p>
            <p style={{ color: G.primary, fontWeight: "600" }}>
                ₹ {Number(payload[0].value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
        </div>
    );
};

/* ── Custom Pie label ── */
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
            style={{ fontSize: "0.74rem", fontWeight: "700" }}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

/* ── Custom chart wrapper: calculates explicit pixel dimensions, bypassing ResponsiveContainer bugs on mobile iOS ── */
function ChartBox({ height = 280, children }) {
    const [width, setWidth] = useState(0);
    const containerRef = React.useRef(null);

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setWidth(containerRef.current.getBoundingClientRect().width);
            }
        };

        // Initial reading
        updateWidth();

        // Listen to window resizes
        window.addEventListener("resize", updateWidth);

        // Listen to container resizes specifically (solves flexbox layout delays)
        const ro = new ResizeObserver(updateWidth);
        if (containerRef.current) ro.observe(containerRef.current);

        return () => {
            window.removeEventListener("resize", updateWidth);
            ro.disconnect();
        };
    }, []);

    // We use cloneElement to inject the absolute px width/height directly into <PieChart> or <BarChart>
    return (
        <div ref={containerRef} style={{ width: "100%", height: `${height}px`, minHeight: `${height}px` }}>
            {width > 0 && React.cloneElement(React.Children.only(children), { width, height })}
        </div>
    );
}

function Analytics({ refreshKey }) {
    const [categoryData, setCategoryData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chartTab, setChartTab] = useState("pie");

    const fetchAll = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        try {
            const [catRes, sumRes] = await Promise.all([
                getCategorySummary(token),
                getSummary(token),
            ]);

            const catRaw = catRes.data;
            const catArr = Array.isArray(catRaw)
                ? catRaw
                : catRaw?.$values ?? catRaw?.data ?? [];
            setCategoryData(catArr.map(item => ({
                name: item.category || item.Category || "Other",
                value: item.total ?? item.Total ?? 0,
            })));

            setSummary(sumRes.data);
        } catch (err) {
            console.error("Analytics fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll, refreshKey]);

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "80px", color: G.muted }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>📈</div>
                <p style={{ fontWeight: "600" }}>Loading analytics…</p>
            </div>
        );
    }

    if (!categoryData.length) {
        return (
            <div style={{ textAlign: "center", padding: "80px", color: G.muted }}>
                <div style={{ fontSize: "3rem", marginBottom: "14px" }}>📊</div>
                <p style={{ fontWeight: "700", color: G.text, fontSize: "1rem", marginBottom: "6px" }}>No data yet</p>
                <p style={{ fontSize: "0.87rem" }}>Add some expenses to see your analytics.</p>
            </div>
        );
    }

    const total = categoryData.reduce((s, d) => s + d.value, 0);
    const top = [...categoryData].sort((a, b) => b.value - a.value)[0];
    const avgTx = summary?.totalTransactions
        ? (summary.totalExpenses / summary.totalTransactions).toFixed(2)
        : 0;

    const chips = [
        { label: "Total Spent", value: `₹ ${Number(total).toLocaleString("en-IN")}`, icon: "💸", bg: "#E8F5E9", color: G.primary },
        { label: "Avg per Transaction", value: `₹ ${Number(avgTx).toLocaleString("en-IN")}`, icon: "📐", bg: "#FFF8E1", color: "#92400E" },
        { label: "Top Category", value: top?.name ?? "—", icon: "🏆", bg: "#E8EAF6", color: "#3730A3" },
        { label: "Categories Used", value: categoryData.length, icon: "🗂️", bg: "#E0F2FE", color: "#0C4A6E" },
    ];

    return (
        <div>
            {/* Heading */}
            <div style={{ marginBottom: "24px" }}>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.15rem", fontWeight: "800", color: G.text }}>Spending Analytics</h2>
                <p style={{ color: G.muted, fontSize: "0.84rem", marginTop: "2px" }}>Insights from all your recorded transactions</p>
            </div>

            {/* Summary chips — wrap on mobile */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "14px", marginBottom: "28px" }}>
                {chips.map(chip => (
                    <div key={chip.label} style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        background: chip.bg, borderRadius: "14px",
                        padding: "14px 16px", border: `1px solid ${G.border}`,
                        transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = shadowMd; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                        <span style={{ fontSize: "20px", flexShrink: 0 }}>{chip.icon}</span>
                        <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: "0.68rem", fontWeight: "700", color: chip.color, textTransform: "uppercase", letterSpacing: "0.07em" }}>{chip.label}</p>
                            <p style={{ fontSize: "1.05rem", fontWeight: "800", color: G.text, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chip.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart card — explicit-height div prevents blank chart on mobile */}
            <div style={{ background: "#fff", borderRadius: "18px", boxShadow: shadow, padding: "20px 16px", marginBottom: "20px", border: `1px solid ${G.border}` }}>
                {/* Header + tab toggle */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: "700", color: G.text }}>
                        {chartTab === "pie" ? "Spending by Category" : "Amount per Category"}
                    </h3>

                    <div style={{ display: "flex", background: G.bg, borderRadius: "8px", padding: "3px", border: `1px solid ${G.border}` }}>
                        {[
                            { key: "pie", label: "🥧 Pie" },
                            { key: "bar", label: "📊 Bar" },
                        ].map(t => (
                            <button key={t.key} onClick={() => setChartTab(t.key)} style={{
                                padding: "6px 16px", borderRadius: "6px", border: "none", cursor: "pointer",
                                fontSize: "0.82rem", fontWeight: "700",
                                background: chartTab === t.key ? G.primary : "transparent",
                                color: chartTab === t.key ? "#fff" : G.muted,
                                transition: "all 0.2s",
                            }}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ← Key fix: explicit px height wrapper → chart always renders */}
                {chartTab === "pie" ? (
                    <ChartBox height={260}>
                        <PieChart>
                            <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                                paddingAngle={3} dataKey="value" labelLine={false} label={renderCustomLabel}>
                                {categoryData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                            </Pie>
                            <Tooltip content={<PieTooltip />} />
                            <Legend iconType="circle" iconSize={8}
                                formatter={(v) => <span style={{ fontSize: "0.8rem", color: G.muted }}>{v}</span>} />
                        </PieChart>
                    </ChartBox>
                ) : (
                    <ChartBox height={260}>
                        <BarChart data={categoryData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F0F7F0" />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: G.muted }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: G.muted }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} width={52} />
                            <Tooltip content={<BarTooltip />} cursor={{ fill: "#F0F7F0" }} />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                {categoryData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                            </Bar>
                        </BarChart>
                    </ChartBox>
                )}
            </div>

            {/* Category breakdown — card style on mobile, grid on desktop */}
            <div style={{ background: "#fff", borderRadius: "18px", boxShadow: shadow, padding: "20px 16px", border: `1px solid ${G.border}` }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "700", color: G.text, marginBottom: "16px" }}>Category Breakdown</h3>

                {[...categoryData].sort((a, b) => b.value - a.value).map((row, i) => {
                    const pct = total > 0 ? ((row.value / total) * 100).toFixed(1) : 0;
                    return (
                        <div key={row.name} style={{
                            display: "flex", alignItems: "center", gap: "12px",
                            padding: "11px 8px", borderRadius: "8px",
                            borderBottom: `1px solid ${G.border}`,
                            transition: "background 0.15s",
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = "#F0F7F0"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                            {/* Rank */}
                            <span style={{ fontSize: "0.75rem", fontWeight: "700", color: G.muted, width: "18px", flexShrink: 0 }}>{i + 1}</span>

                            {/* Dot + name */}
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0 }}>
                                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
                                <span style={{ fontWeight: "600", color: G.text, fontSize: "0.88rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.name}</span>
                            </div>

                            {/* Progress bar */}
                            <div style={{ width: "60px", flexShrink: 0 }}>
                                <div style={{ height: "5px", borderRadius: "4px", background: "#E8F5E9" }}>
                                    <div style={{ width: `${pct}%`, height: "100%", borderRadius: "4px", background: PALETTE[i % PALETTE.length], transition: "width 0.6s ease" }} />
                                </div>
                            </div>

                            {/* Pct */}
                            <span style={{ fontSize: "0.78rem", fontWeight: "600", color: G.muted, width: "36px", textAlign: "right", flexShrink: 0 }}>{pct}%</span>

                            {/* Amount */}
                            <span style={{ textAlign: "right", fontWeight: "700", color: G.primary, fontSize: "0.88rem", width: "90px", flexShrink: 0 }}>
                                ₹ {Number(row.value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Analytics;
