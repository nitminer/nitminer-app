'use client';

import { useState, useRef, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { FiCopy, FiX, FiDownload, FiPlay, FiLoader } from "react-icons/fi";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const CHART_DATA = [
  { name: "Critical", value: 0, fill: "#ef4444" },
  { name: "High", value: 0, fill: "#f97316" },
  { name: "Medium", value: 0, fill: "#eab308" },
  { name: "Low", value: 0, fill: "#3b82f6" },
];

const COVERAGE_DATA = [
  { name: "Covered", value: 79, fill: "#10b981" },
  { name: "Uncovered", value: 21, fill: "#374151" },
];

const TABS = [
  { id: "bmc", label: "BMC", icon: "⚙" },
  { id: "chc", label: "CHC", icon: "◆" },
];

const TOOLS = {
  bmc: ["BMC (Bounded Model Checking)"],
  chc: ["CHC (Constrained Horn Clause)"],
};

// ─── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid rgba(0,0,0,0.1)",
      borderRadius: 12,
      padding: "14px 18px",
      display: "flex",
      flexDirection: "column",
      gap: 4,
    }}>
      <span style={{ fontSize: 11, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 28, fontWeight: 700, color: color || "#1f2937", lineHeight: 1.1 }}>{value}</span>
      {sub && <span style={{ fontSize: 11, color: "#6b7280" }}>{sub}</span>}
    </div>
  );
}

// ─── Analytics Drawer ─────────────────────────────────────────────────────────
function AnalyticsDrawer({ open, onClose, terminalOutput, parseChartData }) {
  const chartData = parseChartData();
  
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Drawer Panel */}
      <div style={{
        position: "fixed",
        top: 0, right: 0, bottom: 0,
        width: "40%",
        zIndex: 51,
        background: "#f8f9fa",
        borderLeft: "1px solid rgba(0,0,0,0.1)",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.38s cubic-bezier(0.16,1,0.3,1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Drawer Header */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15,
            }}>📊</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1f2937" }}>Analysis Results</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>VeriSol · Solidity</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8,
            background: "rgba(0,0,0,0.05)",
            border: "1px solid rgba(0,0,0,0.1)",
            color: "#6b7280", fontSize: 18, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}>×</button>
        </div>

        {/* Drawer Body — scrollable */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Metric Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <MetricCard label="Properties" value={chartData.properties || "0"} sub="Inserted" color="#3b82f6" />
            <MetricCard label="Violations" value={chartData.violations || "0"} sub="Detected" color="#ef4444" />
            <MetricCard label="Conditions" value={chartData.conditions || "0"} sub="Total atomic" color="#f59e0b" />
            <MetricCard label="Coverage" value={chartData.coverage + "%" || "0%"} sub="Condition coverage" color="#10b981" />
          </div>

          {/* Vulnerability Distribution */}
          <div style={{
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: 14,
            padding: "18px 16px",
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1f2937", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", display: "inline-block" }}></span>
              Analysis Summary
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={[
                  { name: "Properties", value: Math.max(1, chartData.properties), fill: "#3b82f6" },
                  { name: "Violations", value: Math.max(1, chartData.violations), fill: "#ef4444" },
                  { name: "Conditions", value: Math.max(1, chartData.conditions), fill: "#f59e0b" },
                ].filter(d => d.value > 0)} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : null}
                  labelLine={{ stroke: "rgba(0,0,0,0.1)" }}>
                  {[
                    { name: "Properties", value: Math.max(1, chartData.properties), fill: "#3b82f6" },
                    { name: "Violations", value: Math.max(1, chartData.violations), fill: "#ef4444" },
                    { name: "Conditions", value: Math.max(1, chartData.conditions), fill: "#f59e0b" },
                  ].map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, color: "#1f2937", fontSize: 12 }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, color: "#6b7280" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Severity Bar Chart */}
          <div style={{
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: 14,
            padding: "18px 16px",
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1f2937", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
              Test Results
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={[
                {
                  name: "Results",
                  Properties: chartData.properties,
                  Violations: chartData.violations,
                  Conditions: chartData.conditions,
                }
              ]} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, color: "#1f2937", fontSize: 12 }} />
                <Bar dataKey="Properties" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Violations" fill="#ef4444" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Conditions" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Coverage Donut */}
          <div style={{
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: 14,
            padding: "18px 16px",
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1f2937", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }}></span>
              Condition Coverage
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <ResponsiveContainer width={130} height={130}>
                <PieChart>
                  <Pie data={[
                    { name: "Covered", value: chartData.coverage, fill: "#10b981" },
                    { name: "Uncovered", value: Math.max(0, 100 - chartData.coverage), fill: "#e5e7eb" }
                  ]} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" startAngle={90} endAngle={-270}>
                    {[
                      { name: "Covered", value: chartData.coverage, fill: "#10b981" },
                      { name: "Uncovered", value: Math.max(0, 100 - chartData.coverage), fill: "#e5e7eb" }
                    ].map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: "#059669", lineHeight: 1 }}>{chartData.coverage}%</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Conditions covered</div>
                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: "#10b981", flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "#6b7280" }}>Covered: <b style={{ color: "#1f2937" }}>{chartData.coverage}%</b></span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: "#e5e7eb", flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "#6b7280" }}>Uncovered: <b style={{ color: "#1f2937" }}>{Math.max(0, 100 - chartData.coverage)}%</b></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <button onClick={() => {
            fetch('/api/verisol/download', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fileName: 'verisol_report', mode: 'bmc' })
            }).then(res => {
              if (!res.ok) throw new Error('Download failed');
              return res.blob();
            }).then(blob => {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `verisol_report_${Date.now()}.zip`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }).catch(err => alert('Download error: ' + err.message));
          }} style={{
            width: "100%",
            padding: "13px 0",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            border: "none",
            borderRadius: 10,
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            letterSpacing: "0.03em",
            boxShadow: "0 4px 12px rgba(99,102,241,0.2)",
            marginBottom: 8,
          }}>
            ⬇ Download Full Report
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VeriSolComponent() {
  const [activeTab, setActiveTab] = useState("bmc");
  const [selectedTool, setSelectedTool] = useState(TOOLS.bmc[0]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [inputMode, setInputMode] = useState("file");
  const [isRunning, setIsRunning] = useState(false);
  const [terminalLines, setTerminalLines] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const terminalRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setSelectedTool(TOOLS[activeTab][0]);
  }, [activeTab]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setUploadedFile(file);
    }
  };

  const handleRun = async () => {
    if (!fileName || !uploadedFile) {
      setTerminalLines([{ t: new Date().toLocaleTimeString(), msg: "Error: No file selected", type: "error" }]);
      return;
    }

    setIsRunning(true);
    setTerminalLines([]);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('mode', activeTab);

      const response = await fetch('/api/verisol/convert', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        setTerminalLines([
          { t: new Date().toLocaleTimeString(), msg: `Error: ${data.error || 'Conversion failed'}`, type: "error" }
        ]);
      } else {
        const lines = data.output.map((line, idx) => ({
          t: new Date((Date.now() + idx * 100)).toLocaleTimeString(),
          msg: line.text,
          type: line.text.includes('Error') || line.text.includes('CRITICAL') ? 'error' : 
                line.text.includes('completed') ? 'success' : 'info'
        }));
        setTerminalLines(lines);
      }
    } catch (error) {
      setTerminalLines([{ t: new Date().toLocaleTimeString(), msg: `Error: ${error.message}`, type: "error" }]);
    } finally {
      setIsRunning(false);
    }
  };

  const parseChartData = () => {
    const data = { 
      properties: 0, 
      violations: 0, 
      conditions: 0, 
      coverage: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };
    
    terminalLines.forEach(line => {
      const msg = line.msg || '';
      
      if (msg.includes('Properties inserted')) {
        const match = msg.match(/:\s*(\d+)/);
        if (match) data.properties = parseInt(match[1]);
      }
      
      if (msg.includes('Properties violation detected')) {
        const match = msg.match(/:\s*(\d+)/);
        if (match) data.violations += parseInt(match[1]);
      }
      
      if (msg.includes('Total atomic condition')) {
        const match = msg.match(/:\s*(\d+)/);
        if (match) data.conditions = parseInt(match[1]);
      }
      
      if (msg.includes('Condition Coverage')) {
        const match = msg.match(/:\s*([\d.]+)%?/);
        if (match) data.coverage = parseFloat(match[1]);
      }
      
      if (msg.includes('CRITICAL')) data.critical++;
      if (msg.includes('HIGH')) data.high++;
      if (msg.includes('MEDIUM')) data.medium++;
      if (msg.includes('LOW')) data.low++;
    });

    return data;
  };

  const copyToClipboard = () => {
    const text = terminalLines.map(l => `[${l.t}] ${l.msg}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  const clearTerminal = () => {
    setTerminalLines([]);
  };

  const downloadAsZip = async () => {
    if (!fileName || !uploadedFile) return;

    try {
      const response = await fetch('/api/verisol/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: fileName || 'verisol_report', mode: activeTab })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Download failed' }));
        throw new Error(errorData.error || 'Download failed');
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/zip')) {
        throw new Error('Invalid response format: Expected ZIP file');
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `verisol_results_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setTerminalLines([...terminalLines, { t: new Date().toLocaleTimeString(), msg: "✓ Download completed successfully!", type: "success" }]);
    } catch (error) {
      setTerminalLines([...terminalLines, { t: new Date().toLocaleTimeString(), msg: `Error downloading: ${error.message}`, type: "error" }]);
    }
  };

  const lineColor = { info: "#ffffff", warn: "#ffffff", error: "#ffffff", success: "#ffffff" };

  return (
    <div style={{
      height: "100vh",
      width: "100vw",
      display: "flex",
      flexDirection: "column",
      background: "#f8f9fa",
      fontFamily: "'DM Mono', 'Fira Code', 'Cascadia Code', monospace",
      color: "#1f2937",
      overflow: "hidden",
      boxSizing: "border-box",
      margin: 0,
      padding: 0,
    }}>

      {/* ── Top Nav ── */}
      <header style={{
        height: 58,
        borderBottom: "1px solid rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        background: "#ffffff",
        backdropFilter: "blur(12px)",
        flexShrink: 0,
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg,#6366f1,#3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 700,
          }}>V</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em", color: "#1f2937" }}>VeriSol</div>
            <div style={{ fontSize: 10, color: "#6b7280" }}>Smart Contract Verifier</div>
          </div>
        </div>

        <nav style={{ display: "flex", gap: 4 }}>
          {["Dashboard", "Docs", "Tools"].map(n => (
            <button key={n} style={{
              padding: "6px 14px", borderRadius: 8,
              background: n === "Tools" ? "rgba(99,102,241,0.1)" : "transparent",
              border: n === "Tools" ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
              color: n === "Tools" ? "#6366f1" : "#6b7280",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              transition: "all 0.15s",
            }}>{n}</button>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "5px 12px 5px 8px", borderRadius: 20,
            background: "#f3f4f6",
            border: "1px solid rgba(0,0,0,0.1)",
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%",
              background: "linear-gradient(135deg,#10b981,#3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700,
            }}>VR</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#1f2937" }}>VeriSol</div>
              <div style={{ fontSize: 10, color: "#059669" }}>✓ Active</div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Language Tabs ── */}
      <div style={{
        display: "flex",
        gap: 4,
        padding: "10px 20px",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        background: "#ffffff",
        flexShrink: 0,
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "7px 20px",
              borderRadius: 8,
              background: activeTab === tab.id
                ? "rgba(99,102,241,0.15)"
                : "transparent",
              border: activeTab === tab.id
                ? "1px solid rgba(99,102,241,0.4)"
                : "1px solid rgba(0,0,0,0.1)",
              color: activeTab === tab.id ? "#6366f1" : "#6b7280",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.2s",
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Main Layout ── */}
      <div style={{
        flex: 1,
        display: "flex",
        overflow: "hidden",
        minHeight: 0,
        width: "100%",
        boxSizing: "border-box",
      }}>

        {/* ─ Left Panel — 40% ─ */}
        <div style={{
          flex: "0 0 40%",
          width: "40%",
          borderRight: "1px solid rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxSizing: "border-box",
        }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 0" }}>

            {/* Upload Card */}
            <div style={{
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: 14,
              padding: "16px",
              marginBottom: 12,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1f2937", marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>📤 Upload & Configure</div>

              {/* Mode toggle */}
              <div style={{ display: "flex", gap: 4, background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: 3, marginBottom: 12 }}>
                {["file", "code"].map(m => (
                  <button key={m} onClick={() => setInputMode(m)} style={{
                    flex: 1, padding: "6px 0", borderRadius: 6,
                    background: inputMode === m ? "rgba(99,102,241,0.15)" : "transparent",
                    border: inputMode === m ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
                    color: inputMode === m ? "#6366f1" : "#6b7280",
                    fontSize: 11, fontWeight: 600, cursor: "pointer",
                    transition: "all 0.15s",
                  }}>
                    {m === "file" ? "⬆ Upload" : "</> Code"}
                  </button>
                ))}
              </div>

              {/* Drop zone */}
              {inputMode === "file" ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: "2px dashed #bfdbfe",
                    borderRadius: 10,
                    padding: "20px 12px",
                    textAlign: "center",
                    background: "#eff6ff",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    accept=".sol,.txt"
                    style={{ display: "none" }}
                  />
                  <div style={{ fontSize: 24, marginBottom: 6 }}>☁</div>
                  <div style={{ fontSize: 11, color: "#4b5563", marginBottom: 8 }}>
                    Drag & Drop Solidity file or
                  </div>
                  <button style={{
                    padding: "7px 16px", borderRadius: 8,
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    border: "none", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    margin: "0 auto",
                  }}>📁 Browse</button>
                  {fileName && <div style={{ marginTop: 8, fontSize: 10, color: "#059669" }}>✓ {fileName}</div>}
                </div>
              ) : (
                <textarea style={{
                  width: "100%", height: 120,
                  background: "#f9fafb",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: 10, color: "#1f2937", fontSize: 11,
                  fontFamily: "inherit", resize: "none", padding: 10,
                  outline: "none",
                  boxSizing: "border-box",
                }} placeholder="// Write your Solidity code here..." />
              )}
            </div>

            {/* Tool Selection */}
            <div style={{
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: 14,
              padding: "16px",
              marginBottom: 12,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1f2937", marginBottom: 10, letterSpacing: "0.05em", textTransform: "uppercase" }}>⚙️ Security Tool</div>
              <select
                value={selectedTool}
                onChange={e => setSelectedTool(e.target.value)}
                style={{
                  width: "100%", padding: "9px 12px",
                  background: "#f9fafb",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: 8, color: "#1f2937",
                  fontSize: 11, outline: "none", cursor: "pointer",
                }}
              >
                {(TOOLS[activeTab] || []).map(t => <option key={t} value={t} style={{ background: "#1f2937" }}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ padding: "12px 16px 16px", flexShrink: 0, borderTop: "1px solid rgba(0,0,0,0.1)" }}>
            <button
              onClick={handleRun}
              disabled={isRunning}
              style={{
                width: "100%", padding: "12px 0",
                background: isRunning
                  ? "rgba(16,185,129,0.2)"
                  : "linear-gradient(135deg,#10b981,#059669)",
                border: "none", borderRadius: 10,
                color: "#fff", fontSize: 13, fontWeight: 800,
                cursor: isRunning ? "not-allowed" : "pointer",
                letterSpacing: "0.05em", marginBottom: 8,
                boxShadow: isRunning ? "none" : "0 4px 20px rgba(16,185,129,0.35)",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {isRunning ? (
                <>
                  <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span> Running...
                </>
              ) : <>▶ Execute</>}
            </button>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{
                flex: 1, padding: "8px 0",
                background: "#f3f4f6",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: 8, color: "#6b7280", fontSize: 11, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
              }}>👁️ View</button>
              <button style={{
                flex: 1, padding: "8px 0",
                background: "#f3f4f6",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: 8, color: "#6b7280", fontSize: 11, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
              }}>📂 Sample</button>
            </div>
          </div>
        </div>

        {/* ─ Terminal Panel — 60% ─ */}
        <div style={{
          flex: "1 1 0",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "#0a0d14",
          boxSizing: "border-box",
        }}>
          {/* Terminal Toolbar */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 16px",
            borderBottom: "1px solid rgba(0,0,0,0.1)",
            flexShrink: 0,
            background: "#ffffff",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {["#ef4444","#f59e0b","#10b981"].map((c,i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />
              ))}
              <span style={{ fontSize: 11, color: "#6b7280", marginLeft: 6, letterSpacing: "0.08em" }}>TERMINAL OUTPUT</span>
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              {[
                { label: "Copy", icon: "⧉", action: copyToClipboard },
                { label: "Clear", icon: "✕", action: clearTerminal },
                { label: "ZIP", icon: "⬇", action: downloadAsZip },
              ].map(btn => (
                <button
                  key={btn.label}
                  onClick={btn.action}
                  disabled={terminalLines.length === 0}
                  style={{
                    padding: "5px 12px",
                    background: "#f3f4f6",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: 7, color: "#6b7280", fontSize: 11, fontWeight: 600, cursor: "pointer",
                    transition: "all 0.15s",
                    opacity: terminalLines.length === 0 ? 0.5 : 1,
                    display: "flex", alignItems: "center", gap: 4,
                  }}
                >
                  <span>{btn.icon}</span> {btn.label}
                </button>
              ))}

              {/* ★ View Analytics Button */}
              <button
                onClick={() => setDrawerOpen(true)}
                disabled={terminalLines.length === 0}
                style={{
                  padding: "5px 14px",
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.3)",
                  borderRadius: 7, color: "#6366f1", fontSize: 11, fontWeight: 700,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                  transition: "all 0.2s",
                  opacity: terminalLines.length === 0 ? 0.5 : 1,
                }}
              >
                📊 View Analytics
              </button>
            </div>
          </div>

          {/* Terminal Output */}
          <div
            ref={terminalRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 20px",
              fontFamily: "'DM Mono','Fira Code','Cascadia Code',monospace",
              fontSize: 12,
              lineHeight: 1.7,
              background: "transparent",
            }}
          >
            {terminalLines.length === 0 ? (
              <div style={{ color: "#9ca3af", padding: "30px 0", textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>⬛</div>
                <div>Terminal ready. Select a file and execute a tool.</div>
              </div>
            ) : (
              terminalLines.map((line, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "2px 0",
                    animation: "fadeIn 0.25s ease",
                  }}
                >
                  <span style={{ color: "#374151", flexShrink: 0, userSelect: "none" }}>[{line.t}]</span>
                  <span style={{ color: lineColor[line.type] || "#9ca3af" }}>{line.msg}</span>
                </div>
              ))
            )}
            {isRunning && (
              <div style={{ display: "flex", gap: 4, marginTop: 8, paddingLeft: 0 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "#6366f1",
                    animation: `bounce 1s ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─ Analytics Drawer ─ */}
      <AnalyticsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        terminalOutput={terminalLines}
        parseChartData={parseChartData}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
      
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 4px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(3px); }
          to { opacity: 1; transform: translateY(0); }
        }
        button:hover { opacity: 0.85; }
        select option { background: #1f2937; color: #f9fafb; }
      `}</style>
    </div>
  );
}