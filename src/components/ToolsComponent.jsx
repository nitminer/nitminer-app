'use client';

import { useState, useRef, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const CHART_DATA = [
  { name: "Properties", value: 0, fill: "#3b82f6" },
  { name: "Violations", value: 0, fill: "#ef4444" },
  { name: "Conditions", value: 0, fill: "#f59e0b" },
];

const COVERAGE_DATA = [
  { name: "Covered", value: 0, fill: "#6366f1" },
  { name: "Uncovered", value: 100, fill: "#e5e7eb" },
];

const TABS = [
  { id: "bmc", label: "BMC", icon: "⚙" },
  { id: "chc", label: "CHC", icon: "◆" },
];

const TOOLS = {
  bmc: ["BMC (Bounded Model Checking)"],
  chc: ["CHC (Constrained Horn Clause)"],
};

const TERMINAL_LINES = [
  { t: "10:21:13", msg: "Ready to execute VeriSol analysis.", type: "info" },
  { t: "10:21:15", msg: "Uploading file: contract.sol", type: "info" },
  { t: "10:21:16", msg: "Running VeriSol static analysis...", type: "warn" },
  { t: "10:21:28", msg: "Checking for vulnerabilities...", type: "info" },
  { t: "10:21:33", msg: "Properties inserted : 0", type: "info" },
  { t: "10:21:35", msg: "Properties violation detected (dynamic) : 0", type: "info" },
  { t: "10:21:38", msg: "Properties violation detected (unique) : 0", type: "info" },
  { t: "10:21:39", msg: "Total atomic condition : 0", type: "info" },
  { t: "10:21:41", msg: "Condition Coverage % : 0%", type: "success" },
];

// ─── Metric Card (Light) ──────────────────────────────────────────────────────
function MetricCard({ label, value, sub, color, bg }) {
  return (
    <div style={{
      background: bg || "#f8fafc",
      border: "1.5px solid #e5e7eb",
      borderRadius: 14,
      padding: "14px 18px",
      display: "flex",
      flexDirection: "column",
      gap: 4,
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <span style={{ fontSize: 10, color: "#9ca3af", letterSpacing: "0.09em", textTransform: "uppercase", fontWeight: 700 }}>{label}</span>
      <span style={{ fontSize: 28, fontWeight: 800, color: color || "#111827", lineHeight: 1.1 }}>{value}</span>
      {sub && <span style={{ fontSize: 11, color: "#6b7280" }}>{sub}</span>}
    </div>
  );
}

// ─── Analytics Drawer (Light) ─────────────────────────────────────────────────
function AnalyticsDrawer({ open, onClose, activeTab, chartData }) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(15,23,42,0.35)",
          backdropFilter: "blur(3px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Drawer Panel */}
      <div style={{
        position: "fixed",
        top: 0, right: 0, bottom: 0,
        width: "min(42%, 560px)",
        zIndex: 51,
        background: "#ffffff",
        borderLeft: "1.5px solid #e5e7eb",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.38s cubic-bezier(0.16,1,0.3,1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Drawer Header */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: "1.5px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          background: "linear-gradient(135deg, #f8fafc 0%, #f0f4ff 100%)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16,
              boxShadow: "0 2px 12px rgba(99,102,241,0.3)",
            }}>📊</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>Analysis Results</div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{activeTab.toUpperCase()} · VeriSol</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8,
            background: "#f1f5f9",
            border: "1.5px solid #e5e7eb",
            color: "#6b7280", fontSize: 18, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 400,
            transition: "all 0.15s",
          }}>×</button>
        </div>

        {/* Scrollable Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18, background: "#fafbff" }}>

          {/* Metric Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <MetricCard label="Properties" value={chartData?.properties || "0"} sub="Inserted" color="#3b82f6" bg="#eff6ff" />
            <MetricCard label="Violations" value={chartData?.violations || "0"} sub="Detected" color="#ef4444" bg="#fff5f5" />
            <MetricCard label="Conditions" value={chartData?.conditions || "0"} sub="Total atomic" color="#f59e0b" bg="#fffbeb" />
            <MetricCard label="Coverage" value={(chartData?.coverage || "0") + "%"} sub="Condition coverage" color="#059669" bg="#f0fdf4" />
          </div>

          {/* Analysis Summary Pie */}
          <div style={{
            background: "#ffffff",
            border: "1.5px solid #e5e7eb",
            borderRadius: 16,
            padding: "18px 16px",
            boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 14, display: "flex", alignItems: "center", gap: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366f1", display: "inline-block" }}></span>
              Analysis Summary
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Properties", value: Math.max(1, chartData?.properties || 0), fill: "#3b82f6" },
                    { name: "Violations", value: Math.max(1, chartData?.violations || 0), fill: "#ef4444" },
                    { name: "Conditions", value: Math.max(1, chartData?.conditions || 0), fill: "#f59e0b" },
                  ].filter(d => d.value > 0)}
                  cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : null}
                  labelLine={{ stroke: "#d1d5db" }}
                >
                  {[
                    { name: "Properties", value: Math.max(1, chartData?.properties || 0), fill: "#3b82f6" },
                    { name: "Violations", value: Math.max(1, chartData?.violations || 0), fill: "#ef4444" },
                    { name: "Conditions", value: Math.max(1, chartData?.conditions || 0), fill: "#f59e0b" },
                  ].filter(d => d.value > 0).map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 12, color: "#111827", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Test Results Bar Chart */}
          <div style={{
            background: "#ffffff",
            border: "1.5px solid #e5e7eb",
            borderRadius: 16,
            padding: "18px 16px",
            boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 14, display: "flex", alignItems: "center", gap: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
              Test Results
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={[{ name: "Results", Properties: chartData?.properties || 0, Violations: chartData?.violations || 0, Conditions: chartData?.conditions || 0 }]} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 12, color: "#111827", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="Properties" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Violations" fill="#ef4444" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Conditions" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Coverage Donut */}
          <div style={{
            background: "#ffffff",
            border: "1.5px solid #e5e7eb",
            borderRadius: 16,
            padding: "18px 16px",
            boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 14, display: "flex", alignItems: "center", gap: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }}></span>
              Condition Coverage
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <ResponsiveContainer width={130} height={130}>
                <PieChart>
                  <Pie data={[
                    { name: "Covered", value: chartData?.coverage || 0, fill: "#6366f1" },
                    { name: "Uncovered", value: Math.max(0, 100 - (chartData?.coverage || 0)), fill: "#e5e7eb" }
                  ]} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" startAngle={90} endAngle={-270}>
                    {[
                      { name: "Covered", value: chartData?.coverage || 0, fill: "#6366f1" },
                      { name: "Uncovered", value: Math.max(0, 100 - (chartData?.coverage || 0)), fill: "#e5e7eb" }
                    ].map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: "#6366f1", lineHeight: 1 }}>{chartData?.coverage || "0"}%</div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>Conditions covered</div>
                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: "#6366f1", flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "#6b7280" }}>Covered: <b style={{ color: "#374151" }}>{chartData?.coverage || "0"}%</b></span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: "#e5e7eb", flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "#6b7280" }}>Uncovered: <b style={{ color: "#374151" }}>{Math.max(0, 100 - (chartData?.coverage || 0))}%</b></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <button style={{
            width: "100%",
            padding: "13px 0",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            border: "none",
            borderRadius: 12,
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            letterSpacing: "0.03em",
            boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
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
export default function ToolsComponent() {
  const [activeTab, setActiveTab] = useState("bmc");
  const [selectedTool, setSelectedTool] = useState(TOOLS.bmc[0]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inputMode, setInputMode] = useState("file");
  const [isRunning, setIsRunning] = useState(false);
  const [terminalLines, setTerminalLines] = useState(TERMINAL_LINES);
  const [chartData, setChartData] = useState({
    properties: 0,
    violations: 0,
    conditions: 0,
    coverage: 0,
  });
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

  const parseChartData = () => {
    const data = { properties: 0, violations: 0, conditions: 0, coverage: 0 };
    terminalLines.forEach(line => {
      const msg = line.msg;
      
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
    });
    return data;
  };

  useEffect(() => {
    setChartData(parseChartData());
  }, [terminalLines]);

  const handleRun = () => {
    setIsRunning(true);
    setTerminalLines([]);
    let i = 0;
    const interval = setInterval(() => {
      if (i < TERMINAL_LINES.length) {
        setTerminalLines(prev => [...prev, TERMINAL_LINES[i]]);
        i++;
      } else {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 600);
  };

  const lineColor = {
    info: "#374151",
    warn: "#b45309",
    error: "#dc2626",
    success: "#059669",
  };

  const lineBg = {
    info: "transparent",
    warn: "#fffbeb",
    error: "#fff5f5",
    success: "#f0fdf4",
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#f8fafc",
      fontFamily: "'DM Mono', 'Fira Code', 'Cascadia Code', monospace",
      color: "#111827",
      overflow: "hidden",
    }}>

      {/* ── Top Nav ── */}
      <header style={{
        height: 60,
        borderBottom: "1.5px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 22px",
        background: "#ffffff",
        boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
        flexShrink: 0,
        zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "linear-gradient(135deg,#6366f1,#3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800, color: "#fff",
            boxShadow: "0 2px 10px rgba(99,102,241,0.3)",
          }}>V</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.03em", color: "#111827" }}>VeriSol</div>
            <div style={{ fontSize: 10, color: "#9ca3af", letterSpacing: "0.02em" }}>Smart Contract Verifier</div>
          </div>
        </div>

        {/* Center Nav */}
        <nav style={{ display: "flex", gap: 2 }}>
          {["Dashboard", "Docs", "Tools"].map(n => (
            <button key={n} style={{
              padding: "6px 16px", borderRadius: 8,
              background: n === "Tools" ? "#eef2ff" : "transparent",
              border: n === "Tools" ? "1.5px solid #c7d2fe" : "1.5px solid transparent",
              color: n === "Tools" ? "#4f46e5" : "#6b7280",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              transition: "all 0.15s",
            }}>{n}</button>
          ))}
        </nav>

        {/* User */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{
            padding: "6px 14px", borderRadius: 8,
            background: "#f0f4ff",
            border: "1.5px solid #c7d2fe",
            color: "#4f46e5", fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>? Tour</button>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "5px 12px 5px 8px", borderRadius: 20,
            background: "#f8fafc",
            border: "1.5px solid #e5e7eb",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "linear-gradient(135deg,#6366f1,#3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 800, color: "#fff",
            }}>VR</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>VeriSol</div>
              <div style={{ fontSize: 10, color: "#059669", fontWeight: 600 }}>✓ Active</div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Language Tabs ── */}
      <div style={{
        display: "flex",
        gap: 6,
        padding: "10px 22px",
        borderBottom: "1.5px solid #e5e7eb",
        background: "#ffffff",
        flexShrink: 0,
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "7px 22px",
              borderRadius: 9,
              background: activeTab === tab.id
                ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                : "#f8fafc",
              border: activeTab === tab.id
                ? "1.5px solid #6366f1"
                : "1.5px solid #e5e7eb",
              color: activeTab === tab.id ? "#fff" : "#6b7280",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.2s",
              boxShadow: activeTab === tab.id ? "0 2px 12px rgba(99,102,241,0.25)" : "0 1px 3px rgba(0,0,0,0.04)",
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
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        gap: 0,
        overflow: "hidden",
        minHeight: 0,
      }}>

        {/* ─ Left Panel ─ */}
        <div style={{
          borderRight: "1.5px solid #e5e7eb",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 0" }}>

            {/* Upload Card */}
            <div style={{
              background: "#f8fafc",
              border: "1.5px solid #e5e7eb",
              borderRadius: 14,
              padding: "16px",
              marginBottom: 12,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#9ca3af", marginBottom: 12, letterSpacing: "0.09em", textTransform: "uppercase" }}>Upload & Configure</div>

              {/* Mode toggle */}
              <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 9, padding: 3, marginBottom: 12 }}>
                {["file", "code"].map(m => (
                  <button key={m} onClick={() => setInputMode(m)} style={{
                    flex: 1, padding: "6px 0", borderRadius: 7,
                    background: inputMode === m ? "#ffffff" : "transparent",
                    border: inputMode === m ? "1.5px solid #c7d2fe" : "1.5px solid transparent",
                    color: inputMode === m ? "#4f46e5" : "#9ca3af",
                    fontSize: 11, fontWeight: 700, cursor: "pointer",
                    transition: "all 0.15s",
                    boxShadow: inputMode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  }}>
                    {m === "file" ? "⬆ Upload" : "</> Code"}
                  </button>
                ))}
              </div>

              {inputMode === "file" ? (
                <div style={{
                  border: "2px dashed #c7d2fe",
                  borderRadius: 12,
                  padding: "22px 12px",
                  textAlign: "center",
                  background: "#eef2ff",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".sol"
                    style={{ display: "none" }}
                  />
                  <div style={{ fontSize: 26, marginBottom: 6 }}>☁</div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 10 }}>
                    Drag & Drop Solidity file or
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} style={{
                    padding: "7px 18px", borderRadius: 8,
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    border: "none", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer",
                    boxShadow: "0 2px 10px rgba(99,102,241,0.3)",
                  }}>Browse File</button>
                </div>
              ) : (
                <textarea style={{
                  width: "100%", height: 120,
                  background: "#f8fafc",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 10, color: "#374151", fontSize: 11,
                  fontFamily: "inherit", resize: "none", padding: 10,
                  outline: "none",
                }} placeholder="// Write your Solidity code here..." />
              )}
            </div>

            {/* Tool Selection */}
            <div style={{
              background: "#f8fafc",
              border: "1.5px solid #e5e7eb",
              borderRadius: 14,
              padding: "16px",
              marginBottom: 12,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#9ca3af", marginBottom: 10, letterSpacing: "0.09em", textTransform: "uppercase" }}>Security Tool</div>
              <select
                value={selectedTool}
                onChange={e => setSelectedTool(e.target.value)}
                style={{
                  width: "100%", padding: "9px 12px",
                  background: "#ffffff",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 9, color: "#374151",
                  fontSize: 11, outline: "none", cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                {(TOOLS[activeTab] || []).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ padding: "12px 16px 16px", flexShrink: 0, borderTop: "1.5px solid #f1f5f9", background: "#ffffff" }}>
            <button
              onClick={handleRun}
              disabled={isRunning}
              style={{
                width: "100%", padding: "12px 0",
                background: isRunning
                  ? "#d1fae5"
                  : "linear-gradient(135deg,#059669,#10b981)",
                border: "none", borderRadius: 10,
                color: isRunning ? "#059669" : "#fff",
                fontSize: 13, fontWeight: 800,
                cursor: isRunning ? "not-allowed" : "pointer",
                letterSpacing: "0.04em", marginBottom: 8,
                boxShadow: isRunning ? "none" : "0 3px 16px rgba(16,185,129,0.3)",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {isRunning ? (
                <><span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span> Running...</>
              ) : "▶ Execute"}
            </button>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{
                flex: 1, padding: "8px 0",
                background: "#f8fafc",
                border: "1.5px solid #e5e7eb",
                borderRadius: 8, color: "#6b7280", fontSize: 11, fontWeight: 700, cursor: "pointer",
              }}>View File</button>
              <button style={{
                flex: 1, padding: "8px 0",
                background: "#f8fafc",
                border: "1.5px solid #e5e7eb",
                borderRadius: 8, color: "#6b7280", fontSize: 11, fontWeight: 700, cursor: "pointer",
              }}>Load Sample</button>
            </div>
          </div>
        </div>

        {/* ─ Terminal Panel ─ */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "#f8fafc",
        }}>
          {/* Terminal Toolbar */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 18px",
            borderBottom: "1.5px solid #e5e7eb",
            flexShrink: 0,
            background: "#ffffff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {["#ef4444","#f59e0b","#10b981"].map((c, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />
              ))}
              <span style={{ fontSize: 10, color: "#9ca3af", marginLeft: 6, letterSpacing: "0.09em", fontWeight: 700 }}>TERMINAL OUTPUT</span>
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              {[
                { label: "⧉ Copy", action: null },
                { label: "✕ Clear", action: () => setTerminalLines([]) },
                { label: "⬇ ZIP", action: null },
              ].map(btn => (
                <button
                  key={btn.label}
                  onClick={btn.action}
                  style={{
                    padding: "5px 12px",
                    background: "#f8fafc",
                    border: "1.5px solid #e5e7eb",
                    borderRadius: 7, color: "#6b7280", fontSize: 11, fontWeight: 700, cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >{btn.label}</button>
              ))}

              {/* View Analytics Button */}
              <button
                onClick={() => setDrawerOpen(true)}
                style={{
                  padding: "5px 14px",
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  border: "none",
                  borderRadius: 8, color: "#fff", fontSize: 11, fontWeight: 800,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                  boxShadow: "0 2px 12px rgba(99,102,241,0.3)",
                  transition: "all 0.2s",
                  letterSpacing: "0.03em",
                }}
              >
                📊 View Analytics →
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
              lineHeight: 1.8,
              background: "#1e2433",
            }}
          >
            {terminalLines.length === 0 ? (
              <div style={{ color: "#4b5563", padding: "40px 0", textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>⬛</div>
                <div style={{ color: "#6b7280" }}>Terminal ready. Select a file and execute.</div>
              </div>
            ) : (
              terminalLines.map((line, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 14,
                    padding: "3px 8px",
                    borderRadius: 5,
                    marginBottom: 2,
                    background: lineBg[line.type] === "transparent" ? "transparent" :
                      line.type === "error" ? "rgba(239,68,68,0.08)" :
                      line.type === "warn" ? "rgba(251,191,36,0.08)" :
                      line.type === "success" ? "rgba(16,185,129,0.08)" : "transparent",
                    animation: "fadeIn 0.25s ease",
                  }}
                >
                  <span style={{ color: "#4b5563", flexShrink: 0, userSelect: "none", fontSize: 11 }}>[{line.t}]</span>
                  <span style={{ color: 
                    line.type === "error" ? "#f87171" :
                    line.type === "warn" ? "#fcd34d" :
                    line.type === "success" ? "#34d399" : "#9ca3af"
                  }}>{line.msg}</span>
                </div>
              ))
            )}
            {isRunning && (
              <div style={{ display: "flex", gap: 4, marginTop: 10, paddingLeft: 8 }}>
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

          {/* Status Bar */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "7px 20px",
            borderTop: "1.5px solid #e5e7eb",
            background: "#ffffff",
            flexShrink: 0,
            fontSize: 10,
            color: "#9ca3af",
          }}>
            <span style={{
              color: isRunning ? "#059669" : "#9ca3af",
              fontWeight: 700,
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: isRunning ? "#10b981" : "#d1d5db",
                display: "inline-block",
              }} />
              {isRunning ? "RUNNING" : "IDLE"}
            </span>
            <span style={{ fontWeight: 600 }}>{activeTab.toUpperCase()} · {selectedTool}</span>
          </div>
        </div>
      </div>

      {/* ─ Analytics Drawer ─ */}
      <AnalyticsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeTab={activeTab}
        chartData={chartData}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #c7d2fe; border-radius: 4px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(3px); }
          to { opacity: 1; transform: translateY(0); }
        }
        button:hover { opacity: 0.88; }
        select option { background: #fff; color: #374151; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.5; }
      `}</style>
    </div>
  );
}
