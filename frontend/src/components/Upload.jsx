import { useState } from "react"

const mono = "'JetBrains Mono', monospace"
const sans = "'Inter', sans-serif"

export default function Upload({ onUpload, onSample, loading }) {
    const [dragging, setDragging] = useState(false)

    function handleFile(file) {
        if (file && file.name.endsWith(".csv")) onUpload(file)
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "32px" }}>
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "var(--accent)", fontFamily: mono, letterSpacing: "0.1em", marginBottom: "8px" }}>// PROCESS INTELLIGENCE ENGINE</div>
                <h1 style={{ fontSize: "28px", fontWeight: "700", color: "var(--text)", letterSpacing: "-0.03em", marginBottom: "8px" }}>ProcessIQ</h1>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", maxWidth: "400px", lineHeight: 1.6 }}>
                    Upload a business process event log and get AI-powered insights on bottlenecks, rework, and dropped cases.
                </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%", maxWidth: "480px" }}>
                <label
                    onDragOver={e => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
                    style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
                        padding: "36px 24px",
                        border: `1px dashed ${dragging ? "var(--accent)" : "var(--border)"}`,
                        borderRadius: "12px", cursor: "pointer",
                        background: dragging ? "var(--bg-hover)" : "var(--bg-card)",
                        transition: "all 0.2s"
                    }}>
                    <div style={{ fontSize: "28px" }}>📊</div>
                    <div style={{ fontSize: "14px", color: "var(--text-muted)", textAlign: "center" }}>
                        {loading ? "Analyzing..." : "Drop your CSV event log here"}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-dim)", fontFamily: mono }}>or click to browse</div>
                    <input type="file" accept=".csv" onChange={e => handleFile(e.target.files[0])} style={{ display: "none" }} />
                </label>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                    <span style={{ fontSize: "11px", color: "var(--text-dim)", fontFamily: mono }}>or</span>
                    <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                </div>

                <button onClick={onSample} disabled={loading}
                    style={{
                        background: loading ? "var(--bg-hover)" : "var(--accent)",
                        border: "none", borderRadius: "10px", padding: "14px",
                        color: loading ? "var(--text-muted)" : "#000",
                        fontSize: "14px", fontWeight: "600", cursor: "pointer",
                        fontFamily: sans, transition: "all 0.2s"
                    }}>
                    {loading ? "Analyzing..." : "Load Sample Order-to-Cash Data →"}
                </button>

                <div style={{ fontSize: "11px", color: "var(--text-dim)", textAlign: "center", fontFamily: sans }}>
                    Sample: 500 cases · Order Created → Credit Check → Goods Issued → Invoice Sent → Payment Received
                </div>
            </div>
        </div>
    )
}