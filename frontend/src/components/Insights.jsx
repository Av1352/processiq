const mono = "'JetBrains Mono', monospace"
const sans = "'Inter', sans-serif"

export default function Insights({ data }) {
    const { explanation } = data
    if (!explanation) return null

    return (
        <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "12px", padding: "24px",
            borderLeft: "4px solid var(--accent)"
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <span style={{ fontSize: "20px" }}>⚡</span>
                <div style={{ fontSize: "10px", color: "var(--accent)", fontFamily: mono, letterSpacing: "0.1em" }}>// AI PROCESS ANALYSIS</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div>
                    <div style={{ fontSize: "11px", color: "var(--text-dim)", fontFamily: mono, marginBottom: "10px" }}>WHAT'S BROKEN</div>
                    <div style={{ fontSize: "14px", color: "var(--text)", lineHeight: 1.8, fontFamily: sans }}>
                        {explanation.analysis}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: "11px", color: "var(--text-dim)", fontFamily: mono, marginBottom: "10px" }}>RECOMMENDED ACTIONS</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {explanation.actions.map((action, i) => (
                            <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                <span style={{ color: "var(--accent)", fontFamily: mono, fontSize: "11px", minWidth: "20px", marginTop: "2px" }}>
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <span style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6, fontFamily: sans }}>{action}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}