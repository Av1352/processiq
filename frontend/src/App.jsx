import { useState } from "react"
import Upload from "./components/Upload"
import Metrics from "./components/Metrics"
import Charts from "./components/Charts"
import Insights from "./components/Insights"

const API = import.meta.env.VITE_API_URL
const mono = "'JetBrains Mono', monospace"
const sans = "'Inter', sans-serif"

export default function App() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    async function handleUpload(file) {
        setLoading(true)
        setError(null)
        try {
            const fd = new FormData()
            fd.append("file", file)
            const res = await fetch(`${API}/analyze`, { method: "POST", body: fd })
            const json = await res.json()
            if (!res.ok) throw new Error(json.detail || "Analysis failed")
            setData(json)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleSample() {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`${API}/analyze-sample`)
            const json = await res.json()
            if (!res.ok) throw new Error(json.detail || "Analysis failed")
            setData(json)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
            <header style={{
                borderBottom: "1px solid var(--border)", padding: "0 40px", height: "60px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "var(--bg)", position: "sticky", top: 0, zIndex: 10
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                        width: "28px", height: "28px", borderRadius: "6px",
                        background: "var(--accent)", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "#000"
                    }}>P</div>
                    <span style={{ fontSize: "15px", fontWeight: "600", letterSpacing: "-0.02em", color: "var(--text)" }}>
                        ProcessIQ
                    </span>
                    <span style={{
                        fontSize: "10px", color: "var(--text-dim)", fontFamily: mono,
                        letterSpacing: "0.1em", textTransform: "uppercase", marginLeft: "4px"
                    }}>/ AI Process Intelligence</span>
                </div>
                <div style={{
                    fontSize: "11px", fontFamily: mono, color: "var(--text-dim)",
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: "6px", padding: "5px 12px"
                }}>
                    Powered by Claude
                </div>
            </header>

            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 40px" }}>
                {error && (
                    <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "14px 16px", color: "var(--red)", fontSize: "13px", fontFamily: sans, marginBottom: "24px" }}>
                        ⚠ {error}
                    </div>
                )}

                {!data && (
                    <Upload onUpload={handleUpload} onSample={handleSample} loading={loading} />
                )}

                {data && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <div style={{ fontSize: "10px", color: "var(--accent)", fontFamily: mono, letterSpacing: "0.1em", marginBottom: "4px" }}>// PROCESS ANALYSIS COMPLETE</div>
                                <h1 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text)", letterSpacing: "-0.03em" }}>Order-to-Cash Intelligence</h1>
                            </div>
                            <button onClick={() => setData(null)}
                                style={{
                                    fontSize: "12px", color: "var(--text-muted)", background: "var(--bg-card)",
                                    border: "1px solid var(--border)", borderRadius: "8px", padding: "8px 16px",
                                    cursor: "pointer", fontFamily: sans
                                }}>
                                ← New Analysis
                            </button>
                        </div>
                        <Metrics data={data} />
                        <Charts data={data} />
                        <Insights data={data} />
                    </div>
                )}
            </div>
        </div>
    )
}