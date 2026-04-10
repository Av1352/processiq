import { useState } from "react"

const mono = "'JetBrains Mono', monospace"
const sans = "'Inter', sans-serif"

function BarChart({ data, title, colorFn }) {
    const max = Math.max(...Object.values(data), 0.1)
    return (
        <div>
            <div style={{ fontSize: "10px", color: "var(--blue-bright)", fontFamily: mono, letterSpacing: "0.1em", marginBottom: "16px" }}>{title}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {Object.entries(data).sort((a, b) => b[1] - a[1]).map(([act, val]) => (
                    <div key={act} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "140px", fontSize: "11px", color: "var(--text-muted)", fontFamily: sans, textAlign: "right", flexShrink: 0 }}>{act}</div>
                        <div style={{ flex: 1, height: "20px", background: "var(--bg-hover)", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{
                                width: `${(val / max) * 100}%`, height: "100%",
                                background: colorFn ? colorFn(val, max) : "var(--blue-bright)",
                                borderRadius: "4px", transition: "width 0.6s ease"
                            }} />
                        </div>
                        <div style={{ width: "40px", fontSize: "11px", color: "var(--text-muted)", fontFamily: mono }}>{val}d</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function LineChart({ data }) {
    if (!data || data.length === 0) return null
    const max = Math.max(...data.map(d => d.cases), 1)
    const points = data.map((d, i) => ({
        x: (i / (data.length - 1)) * 100,
        y: 100 - (d.cases / max) * 80,
        ...d
    }))
    const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")

    return (
        <div>
            <div style={{ fontSize: "10px", color: "var(--blue-bright)", fontFamily: mono, letterSpacing: "0.1em", marginBottom: "16px" }}>// WEEKLY CASE VOLUME</div>
            <svg viewBox="0 0 100 100" style={{ width: "100%", height: "120px" }} preserveAspectRatio="none">
                <path d={pathD} fill="none" stroke="#60a5fa" strokeWidth="0.8" />
                {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="1.2" fill="#60a5fa" />
                ))}
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "var(--text-dim)", fontFamily: mono, marginTop: "4px" }}>
                <span>{data[0]?.week}</span>
                <span>{data[data.length - 1]?.week}</span>
            </div>
        </div>
    )
}

export default function Charts({ data }) {
    const [tab, setTab] = useState("overview")

    const colorFn = (val, max) => {
        const ratio = val / max
        if (ratio > 0.7) return "var(--red)"
        if (ratio > 0.4) return "var(--accent)"
        return "var(--blue-bright)"
    }

    return (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
                {["overview", "deep-dive"].map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        style={{
                            padding: "14px 20px", fontSize: "12px", fontFamily: mono,
                            color: tab === t ? "var(--accent)" : "var(--text-dim)",
                            background: "transparent", border: "none", cursor: "pointer",
                            borderBottom: tab === t ? "2px solid var(--accent)" : "2px solid transparent",
                            transition: "all 0.15s"
                        }}>
                        {t === "overview" ? "// PROCESS OVERVIEW" : "// DEEP DIVE"}
                    </button>
                ))}
            </div>

            <div style={{ padding: "24px" }}>
                {tab === "overview" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
                        <BarChart data={data.avg_activity_duration} title="// AVG WAIT TIME PER ACTIVITY (DAYS)" colorFn={colorFn} />
                        <LineChart data={data.weekly_volume} />
                    </div>
                )}

                {tab === "deep-dive" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        <div>
                            <div style={{ fontSize: "10px", color: "var(--blue-bright)", fontFamily: mono, letterSpacing: "0.1em", marginBottom: "12px" }}>// TOP 10 SLOWEST CASES</div>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                                <thead>
                                    <tr>
                                        {["Case ID", "Days", "Amount", "Resource"].map(h => (
                                            <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "var(--text-dim)", fontFamily: mono, fontSize: "10px", borderBottom: "1px solid var(--border)" }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.slowest_cases.map((c, i) => (
                                        <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                                            <td style={{ padding: "8px 12px", fontFamily: mono, color: "var(--accent)" }}>{c.case_id}</td>
                                            <td style={{ padding: "8px 12px", color: c.throughput_days > 10 ? "var(--red)" : "var(--text)", fontFamily: mono }}>{c.throughput_days}d</td>
                                            <td style={{ padding: "8px 12px", color: "var(--text-muted)" }}>${c.amount.toLocaleString()}</td>
                                            <td style={{ padding: "8px 12px", color: "var(--text-muted)" }}>{c.resource}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {data.rework_cases.length > 0 && (
                            <div>
                                <div style={{ fontSize: "10px", color: "var(--red)", fontFamily: mono, letterSpacing: "0.1em", marginBottom: "12px" }}>// REWORK CASES</div>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                                    <thead>
                                        <tr>
                                            {["Case ID", "Activity", "Count"].map(h => (
                                                <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "var(--text-dim)", fontFamily: mono, fontSize: "10px", borderBottom: "1px solid var(--border)" }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.rework_cases.slice(0, 10).map((c, i) => (
                                            <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                                                <td style={{ padding: "8px 12px", fontFamily: mono, color: "var(--accent)" }}>{c.case_id}</td>
                                                <td style={{ padding: "8px 12px", color: "var(--text-muted)" }}>{c.activity}</td>
                                                <td style={{ padding: "8px 12px", color: "var(--red)", fontFamily: mono }}>{c.count}x</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}