const mono = "'JetBrains Mono', monospace"
const sans = "'Inter', sans-serif"

export default function Metrics({ data }) {
    const cards = [
        {
            label: "TOTAL CASES",
            value: data.total_cases,
            sub: "analyzed",
            color: "var(--blue-bright)"
        },
        {
            label: "AVG THROUGHPUT",
            value: `${data.avg_throughput}d`,
            sub: "end-to-end",
            color: data.avg_throughput > 10 ? "var(--red)" : "var(--green)"
        },
        {
            label: "TOP BOTTLENECK",
            value: data.bottleneck_activity,
            sub: `${data.bottleneck_days} days avg wait`,
            color: "var(--accent)",
            small: true
        },
        {
            label: "DROPOUT RATE",
            value: `${data.dropout_rate}%`,
            sub: "never completed",
            color: data.dropout_rate > 15 ? "var(--red)" : "var(--green)"
        }
    ]

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
            {cards.map(c => (
                <div key={c.label} style={{
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: "12px", padding: "20px"
                }}>
                    <div style={{ fontSize: "10px", color: "var(--text-dim)", fontFamily: mono, letterSpacing: "0.08em", marginBottom: "10px" }}>{c.label}</div>
                    <div style={{ fontSize: c.small ? "18px" : "30px", fontWeight: "700", color: c.color, fontFamily: mono, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{c.value}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "6px", fontFamily: sans }}>{c.sub}</div>
                </div>
            ))}
        </div>
    )
}