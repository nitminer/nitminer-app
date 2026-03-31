"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// React Icons
import {
  SiEthereum, SiSolidity, SiPython, SiReact, SiNodedotjs,
  SiDocker, SiFlutter, SiTensorflow,
  SiSolana, SiIpfs,
} from "react-icons/si";
import { FaCommentDots, FaComment } from "react-icons/fa6";
import {
  FaShieldAlt, FaBrain, FaMobileAlt, FaLayerGroup,
  FaCheckCircle, FaStar, FaBolt, FaGlobe, FaLock,
  FaChartLine, FaLinkedin, FaTwitter, FaGithub,
  FaBars, FaTimes, FaEnvelope, FaMapMarkerAlt,
} from "react-icons/fa";
import {
  MdAutoFixHigh, MdSecurity, MdSpeed,
} from "react-icons/md";
import { HiSparkles, HiCode } from "react-icons/hi";
import { BiNetworkChart } from "react-icons/bi";
import { RiRobot2Line } from "react-icons/ri";
import { TbBrandNextjs } from "react-icons/tb";
import VideoDemo from "./VideoDemo";

// ─── Particle Canvas ───────────────────────────────────────────────────────────
const ParticleField = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 1.8 + 0.4,
      a: Math.random() * 0.7 + 0.2,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 232, 255, ${p.a * 0.6})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${(1 - dist / 120) * 0.25})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
    />
  );
};

// ─── Animated Counter ─────────────────────────────────────────────────────────
const Counter = ({ end, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const triggered = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          let start = 0;
          const step = Math.ceil(end / 60);
          const timer = setInterval(() => {
            start += step;
            if (start >= end) { setCount(end); clearInterval(timer); }
            else setCount(start);
          }, 25);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return <span ref={ref}>{count}{suffix}</span>;
};

// ─── Glow Card ────────────────────────────────────────────────────────────────
const GlowCard = ({ children, className = "", glowColor = "rgba(99,102,241,0.3)", isLight = false }) => (
  <div
    className={`relative transition-all duration-500 hover:-translate-y-2 group ${className}`}
    style={{
      background: isLight ? "white" : "rgba(255,255,255,0.04)",
      border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.09)",
      borderRadius: "1rem",
      "--glow": glowColor
    }}
  >
    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{ boxShadow: `0 0 40px ${glowColor}`, border: `1px solid ${glowColor}` }} />
    <div className="relative z-10">{children}</div>
  </div>
);

// ─── Data ─────────────────────────────────────────────────────────────────────
const NAV_LINKS = ["About", "Services", "Pricing", "Team", "Contact"];

const SERVICES = [
  {
    Icon: BiNetworkChart,
    title: "Blockchain Development",
    desc: "Smart contract development, auto-repair engine, DeFi protocols, NFT platforms & Web3 dApps.",
    tag: "Core",
    glow: "rgba(34,211,238,0.3)",
    gradient: "from-cyan-500/20 to-transparent",
    iconColor: "text-cyan-400",
  },
  {
    Icon: RiRobot2Line,
    title: "AI & Machine Learning",
    desc: "Intelligent vulnerability detection, predictive analytics & NLP pipelines for blockchain.",
    tag: "Intelligence",
    glow: "rgba(167,139,250,0.3)",
    gradient: "from-violet-500/20 to-transparent",
    iconColor: "text-violet-400",
  },
  {
    Icon: FaMobileAlt,
    title: "Mobile App Development",
    desc: "Cross-platform iOS & Android with Web3 wallet integration, DeFi dashboards & real-time blockchain sync.",
    tag: "Mobile",
    glow: "rgba(99,102,241,0.3)",
    gradient: "from-indigo-500/20 to-transparent",
    iconColor: "text-indigo-400",
  },
  {
    Icon: FaLayerGroup,
    title: "Full Stack Development",
    desc: "Scalable platforms, REST/GraphQL APIs & microservices from React/Next.js to Node.js/Python.",
    tag: "Full Stack",
    glow: "rgba(251,191,36,0.3)",
    gradient: "from-amber-500/20 to-transparent",
    iconColor: "text-amber-400",
  },
];

const TECHS = [
  { Icon: SiEthereum, name: "Ethereum", color: "#627EEA" },
  { Icon: SiSolidity, name: "Solidity", color: "#363636" },
  { Icon: SiPython, name: "Python", color: "#3776AB" },
  { Icon: SiReact, name: "React", color: "#61DAFB" },
  { Icon: TbBrandNextjs, name: "Next.js", color: "#ffffff" },
  { Icon: SiNodedotjs, name: "Node.js", color: "#339933" },
  { Icon: SiFlutter, name: "Flutter", color: "#02569B" },
  { Icon: SiTensorflow, name: "TensorFlow", color: "#FF6F00" },
  { Icon: SiDocker, name: "Docker", color: "#2496ED" },
  { Icon: SiDocker, name: "AWS", color: "#FF9900" },
  { Icon: SiIpfs, name: "IPFS", color: "#65C2CB" },
  { Icon: SiSolana, name: "Solana", color: "#9945FF" },
];

const PRICING = [
  {
    tier: "Starter",
    name: "Build",
    price: "₹24,999",
    period: "/mo",
    desc: "Perfect for early-stage Web3 startups and solo developers.",
    features: [
      "Smart Contract Audit (3/mo)",
      "Vulnerability Scanner",
      "1 dApp Development Sprint",
      "AI Code Review",
      "Email Support",
    ],
    featured: false,
    cta: "Get Started",
    glow: "rgba(34,211,238,0.2)",
    accent: "text-cyan-400",
  },
  {
    tier: "Growth",
    name: "Scale",
    price: "₹74,999",
    period: "/mo",
    desc: "For growing teams that need full-stack blockchain + AI firepower.",
    features: [
      "Unlimited Contract Repairs",
      "Auto-Patch AI Engine",
      "Full Stack Development",
      "iOS + Android App",
      "24/7 Priority Support",
      "Dedicated Project Manager",
    ],
    featured: true,
    cta: "Most Popular",
    glow: "rgba(167,139,250,0.35)",
    accent: "text-violet-400",
  },
  {
    tier: "Enterprise",
    name: "Command",
    price: "Custom",
    period: "",
    desc: "Bespoke solutions for enterprises deploying at scale in blockchain.",
    features: [
      "Everything in Scale",
      "White-label Solutions",
      "Private Blockchain Deployment",
      "AI Model Fine-tuning",
      "Dedicated Dev Team",
      "SLA & Legal Support",
    ],
    featured: false,
    cta: "Contact Us",
    glow: "rgba(251,191,36,0.2)",
    accent: "text-amber-400",
  },
];

const TEAM = [
  { initials: "AR", name: "Arjun Rao", role: "Co-Founder & CEO", desc: "Blockchain architect, 8+ yrs DeFi", from: "#6366f1", to: "#22d3ee" },
  { initials: "PS", name: "Priya Sharma", role: "Co-Founder & CTO", desc: "Smart contract security & AI researcher", from: "#a78bfa", to: "#6366f1" },
  { initials: "RK", name: "Rahul Kumar", role: "Lead Blockchain Dev", desc: "Solidity & Rust, Ethereum expert", from: "#22d3ee", to: "#0ea5e9" },
  { initials: "NP", name: "Neha Patel", role: "AI/ML Engineer", desc: "ML pipelines & vulnerability detection", from: "#f59e0b", to: "#ef4444" },
  { initials: "VR", name: "Vikram Reddy", role: "Full Stack Dev", desc: "React, Node.js & cloud infra", from: "#10b981", to: "#22d3ee" },
  { initials: "SM", name: "Sneha Mishra", role: "Mobile Dev Lead", desc: "Flutter & React Native, Web3 wallets", from: "#ec4899", to: "#a78bfa" },
  { initials: "AK", name: "Amit Kaur", role: "DevOps Engineer", desc: "CI/CD, Docker, K8s & AWS", from: "#8b5cf6", to: "#ec4899" },
  { initials: "DG", name: "Deepak Gupta", role: "Security Analyst", desc: "Contract audits & threat modeling", from: "#0ea5e9", to: "#6366f1" },
  { initials: "LN", name: "Lakshmi Naidu", role: "Product Manager", desc: "Web3 strategy & roadmap execution", from: "#f59e0b", to: "#10b981" },
];

const ABOUT_FEATURES = [
  { Icon: MdAutoFixHigh, title: "Auto-Repair Engine", desc: "AI-powered patch generation for smart contracts in real-time", color: "text-cyan-400", glow: "rgba(34,211,238,0.25)" },
  { Icon: MdSecurity, title: "Real-time Monitoring", desc: "24/7 vulnerability scanning across major blockchain networks", color: "text-violet-400", glow: "rgba(167,139,250,0.25)" },
  { Icon: FaGlobe, title: "Multi-chain Support", desc: "Ethereum, Solana, BSC, Polygon and more", color: "text-indigo-400", glow: "rgba(99,102,241,0.25)" },
  { Icon: MdSpeed, title: "Sub-second Response", desc: "Lightning-fast detection and mitigation pipeline", color: "text-amber-400", glow: "rgba(251,191,36,0.25)" },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [billingCycle, setBillingCycle] = useState("1year");

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = true; // Force light theme only

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${isLight ? "bg-slate-100 text-slate-900" : "bg-[#040410] text-white"}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;600;700;800;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=JetBrains+Mono:wght@400;600&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(36px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes floatY { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-14px); } }
        @keyframes orbitSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes orbitSpinRev { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(99,232,255,0.4); } 70% { box-shadow: 0 0 0 14px rgba(99,232,255,0); } 100% { box-shadow: 0 0 0 0 rgba(99,232,255,0); } }
        .fadeup-1 { animation: fadeUp 0.7s 0.1s ease both; }
        .fadeup-2 { animation: fadeUp 0.7s 0.25s ease both; }
        .fadeup-3 { animation: fadeUp 0.7s 0.4s ease both; }
        .fadeup-4 { animation: fadeUp 0.7s 0.55s ease both; }
        .float-anim { animation: floatY 4s ease-in-out infinite; }
        .orbit1 { animation: orbitSpin 22s linear infinite; }
        .orbit2 { animation: orbitSpinRev 16s linear infinite; }
        .pulse-dot { animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f5f5f5; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(#6366f1, #22d3ee); border-radius: 99px; }
        .exo { font-family: 'Exo 2', sans-serif; }
        .mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      {/* Particles - disabled for light theme */}

      {/* ── NAVBAR ── */}
    

      {/* ── HERO ── */}
      <section id="home" className="relative min-h-screen flex items-center justify-center  pb-20 overflow-hidden">
        {/* BG blobs - disabled for light theme only */}

        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              {/* Badge */}
              <div className={`fadeup-1 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border text-xs mono mb-8 ${isLight ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-white/[0.04] border-white/[0.09] text-cyan-300"}`}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
                Est. 2022 · Blockchain Innovation
              </div>

              {/* Headline */}
              <h1 className="fadeup-2 exo font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-5xl leading-[0.95] tracking-tight mb-6">
                <span className={isLight ? "text-slate-900" : "text-white"}>Automatic</span>
                <br />
                <span style={{ background: "linear-gradient(135deg,#6366f1 0%,#22d3ee 50%,#a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Smart Contract
                </span>
                <br />
                <span className={isLight ? "text-slate-700" : "text-white/80"}>Repair Engine</span>
              </h1>

              <p className={`fadeup-3 text-sm sm:text-base md:text-lg lg:text-xl 2xl:text-lg leading-relaxed mb-10 max-w-lg ${isLight ? "text-slate-500" : "text-white/50"}`}>
                Nitminer Technologies mitigates blockchain application malfunctions through intelligent, automated smart contract repair — protecting your Web3 business 24/7.
              </p>

              {/* CTAs */}
              <div className="fadeup-4 flex flex-wrap gap-3 sm:gap-4 mb-12">
                <Link href="/services"
                  className="flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-semibold text-white text-xs sm:text-sm lg:text-base 2xl:text-sm transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(99,102,241,0.5)]"
                  style={{ background: "linear-gradient(135deg,#6366f1,#22d3ee)" }}>
                  <FaLayerGroup />
                  Explore Services
                </Link>
                <Link href="/about-us"
                  className={`flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-semibold text-xs sm:text-sm lg:text-base 2xl:text-sm border transition-all duration-300 ${isLight ? "border-slate-300 text-slate-700 hover:border-indigo-400 hover:text-indigo-600" : "border-white/15 text-white/80 hover:border-white/40"}`}>
                  <FaChartLine />
                  Learn More
                </Link>
              </div>

              {/* Stats */}
              <div className="fadeup-4 flex gap-6 sm:gap-10">
                {[{ val: 3, suf: "+", label: "Years Active" }, { val: 9, suf: "", label: "Team Members" }, { val: 50, suf: "+", label: "Projects Done" }].map(s => (
                  <div key={s.label}>
                    <div className="exo font-black text-2xl sm:text-3xl lg:text-4xl 2xl:text-3xl text-cyan-400">
                      <Counter end={s.val} suffix={s.suf} />
                    </div>
                    <div className={`text-xs sm:text-sm mt-1 ${isLight ? "text-slate-400" : "text-white/35"}`}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — floating code card */}
            <div className="float-anim hidden lg:block">
              <div className={`rounded-2xl p-6 border transition-all duration-300 ${isLight ? "bg-white border-slate-200 shadow-[0_30px_80px_rgba(99,102,241,0.12)]" : "bg-white/[0.04] border-cyan-400/20 shadow-[0_30px_80px_rgba(34,211,238,0.08)]"}`}>
                {/* Window bar */}
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className={`ml-3 mono text-xs ${isLight ? "text-slate-400" : "text-white/30"}`}>nitminer-repair.ts</span>
                  <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                </div>

                {/* Code */}
                <pre className={`mono text-sm leading-7 overflow-x-auto ${isLight ? "text-slate-600" : "text-white/70"}`}>
                  <span style={{ color: "#6b7280" }}>{`// Auto Smart Contract Repair\n`}</span>
                  <span style={{ color: "#818cf8" }}>async function </span>
                  <span style={{ color: "#22d3ee" }}>repairContract</span>
                  <span>(addr: string) {"{\n"}</span>
                  <span>{"  "}</span><span style={{ color: "#818cf8" }}>const </span>
                  <span style={{ color: "#a78bfa" }}>scan </span>
                  <span>= </span><span style={{ color: "#818cf8" }}>await </span>
                  <span style={{ color: "#22d3ee" }}>detectVulns</span><span>(addr){";\n"}</span>
                  <span>{"  "}</span><span style={{ color: "#818cf8" }}>if </span>
                  <span>(scan.critical) {"{\n"}</span>
                  <span>{"    "}</span><span style={{ color: "#818cf8" }}>await </span>
                  <span style={{ color: "#22d3ee" }}>applyPatch</span>
                  <span>(scan, </span><span style={{ color: "#f59e0b" }}>'auto'</span><span>{");\n"}</span>
                  <span>{"  }\n"}</span>
                  <span>{"  "}</span><span style={{ color: "#818cf8" }}>return </span>
                  <span>{"{ status: "}</span><span style={{ color: "#34d399" }}>'secured'</span><span>{" };\n"}</span>
                  <span>{"}"}</span>
                </pre>

                {/* Status bar */}
                <div className={`mt-5 pt-4 border-t flex items-center justify-between ${isLight ? "border-slate-200" : "border-white/[0.07]"}`}>
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <FaShieldAlt />
                    <span>Contract Secured ✓</span>
                  </div>
                  <div className={`mono text-xs flex items-center gap-1.5 ${isLight ? "text-slate-400" : "text-white/30"}`}>
                    <MdSpeed />
                    0.3s
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className={`absolute -bottom-4 -left-6 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold ${isLight ? "bg-white border-slate-200 text-slate-700 shadow-lg" : "bg-[#0d0d1f] border-white/10 text-white/80"}`}>
                <FaBolt className="text-amber-400" />
                Auto-Patch Deployed
              </div>
              <div className={`absolute -top-4 -right-4 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold ${isLight ? "bg-white border-slate-200 text-slate-700 shadow-lg" : "bg-[#0d0d1f] border-white/10 text-white/80"}`}>
                <BiNetworkChart className="text-cyan-400" />
                Web3 Ready
              </div>
            </div>
          </div>
        </div>
      </section>

      <VideoDemo/>

      {/* ── ABOUT ── */}
      <section id="about" className={`relative z-10 py-20 sm:py-28 lg:py-32 px-4 sm:px-6 ${isLight ? "bg-white" : "bg-white/[0.015]"}`}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div>
            {/* <p className="mono text-xs tracking-[4px] uppercase text-cyan-400 mb-5">// About Us</p> */}
            <h2 className="exo font-black text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-5xl tracking-tight leading-[1.05] mb-6" style={{ color: isLight ? "#0f172a" : "white" }}>
              Built to Fix
              <br />
              <span style={{ background: "linear-gradient(135deg,#6366f1,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Blockchain's
              </span>
              <br />
              Biggest Flaw
            </h2>
            <p className={`leading-relaxed mb-5 text-sm sm:text-base lg:text-lg 2xl:text-base ${isLight ? "text-slate-500" : "text-white/55"}`}>
              Founded in <strong className={isLight ? "text-indigo-600" : "text-white"}>2022</strong>, Nitminer Technologies Pvt. Ltd. was built around one critical insight: smart contract bugs cost billions, yet repair remained entirely manual and reactive.
            </p>
            <p className={`leading-relaxed mb-8 text-sm sm:text-base lg:text-lg 2xl:text-base ${isLight ? "text-slate-500" : "text-white/55"}`}>
              We engineered an automated repair system that detects, diagnoses, and patches vulnerabilities in real time — giving blockchain businesses a proactive, always-on security shield.
            </p>
            <div className="flex gap-3 sm:gap-4">
              <Link href="/services"
                className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm lg:text-base 2xl:text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg,#6366f1,#22d3ee)" }}>
                <FaLayerGroup /> Our Services
              </Link>
              <Link href="/contact"
                className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm lg:text-base 2xl:text-sm font-semibold border transition-colors ${isLight ? "border-slate-300 text-slate-600 hover:border-indigo-400" : "border-white/15 text-white/70 hover:border-white/30"}`}>
                <FaEnvelope /> Contact Us
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {ABOUT_FEATURES.map(({ Icon, title, desc, color, glow }) => (
              <GlowCard key={title} glowColor={glow} isLight={isLight} className="p-4 sm:p-5 cursor-default">
                <div className={`text-2xl mb-3 ${color}`}><Icon /></div>
                <h4 className={`exo font-bold text-xs sm:text-sm mb-1.5 ${isLight ? "text-slate-800" : "text-white"}`}>{title}</h4>
                <p className={`text-xs leading-relaxed ${isLight ? "text-slate-500" : "text-white/45"}`}>{desc}</p>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
     <section id="services" className={`relative z-10 py-28 sm:py-36 lg:py-40 px-4 sm:px-6 lg:px-8 ${isLight ? "bg-slate-50" : ""}`}>
  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-16 sm:mb-20">
      <h2 className="exo font-black text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-5xl tracking-tight mb-4 sm:mb-6" style={{ color: isLight ? "#0f172a" : "white" }}>
        What We{" "}
        <span style={{ background: "linear-gradient(135deg,#6366f1,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Build
        </span>
      </h2>
      <p className={`max-w-xl mx-auto text-sm sm:text-base lg:text-lg 2xl:text-base leading-relaxed ${isLight ? "text-slate-500" : "text-white/45"}`}>
        End-to-end solutions across blockchain, AI, mobile, and full-stack development.
      </p>
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-7">
      {SERVICES.map(({ Icon, title, desc, tag, glow, gradient, iconColor }) => (
        <GlowCard key={title} glowColor={glow} isLight={isLight} className="p-6 sm:p-7 lg:p-8 cursor-pointer h-full">
          <span className={`mono text-xs tracking-widest uppercase px-3 py-1.5 rounded-full mb-6 inline-block ${isLight ? "bg-indigo-50 text-indigo-500 border border-indigo-100" : "bg-white/[0.06] text-cyan-400 border border-white/[0.08]"}`}>
            {tag}
          </span>
          <div className={`text-4xl sm:text-5xl mb-6 ${iconColor}`}><Icon /></div>
          <h3 className={`exo font-bold text-lg sm:text-xl mb-3 sm:mb-4 group-hover:text-cyan-400 transition-colors ${isLight ? "text-slate-900" : "text-white"}`}>{title}</h3>
          <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? "text-slate-500" : "text-white/45"}`}>{desc}</p>
        </GlowCard>
      ))}
    </div>
  </div>
</section>

      {/* ── TECH STACK ── */}
   <section className={`py-20 sm:py-24 lg:py-28 px-4 sm:px-6 overflow-hidden ${isLight ? "bg-white" : ""}`}>
  <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-4xl font-bold text-center mb-12 sm:mb-16" style={{ color: isLight ? "#0f172a" : "white" }}>Technologies We Master</h2>

  <div className="relative">
    {/* Fade edges */}
    <div className="absolute left-0 top-0 h-full w-32 z-10 pointer-events-none"
      style={{ background: isLight ? "linear-gradient(to right, #ffffff 0%, transparent 100%)" : "linear-gradient(to right, #000 0%, transparent 100%)" }} />
    <div className="absolute right-0 top-0 h-full w-32 z-10 pointer-events-none"
      style={{ background: isLight ? "linear-gradient(to left, #ffffff 0%, transparent 100%)" : "linear-gradient(to left, #000 0%, transparent 100%)" }} />

    {/* Scrolling track */}
    <div
      className="flex w-max"
      style={{
        gap: "3rem",
        animation: "marquee 35s linear infinite",
      }}
      onMouseEnter={e => e.currentTarget.style.animationPlayState = "paused"}
      onMouseLeave={e => e.currentTarget.style.animationPlayState = "running"}
    >
      {[...TECHS, ...TECHS].map(({ Icon, name, color }, i) => (
        <div
          key={`${name}-${i}`}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            minWidth: "130px",
            cursor: "pointer",
            transition: "transform 0.3s ease",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.15)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          <div
            style={{
              padding: "1.25rem",
              borderRadius: "1rem",
              border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.1)",
              background: isLight ? "#f8fafc" : "rgba(255,255,255,0.05)",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.border = `1px solid ${color}55`;
              e.currentTarget.style.background = isLight ? "#f1f5f9" : "rgba(255,255,255,0.1)";
              e.currentTarget.style.boxShadow = `0 0 20px ${color}33`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.border = isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.1)";
              e.currentTarget.style.background = isLight ? "#f8fafc" : "rgba(255,255,255,0.05)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <Icon size={72} color={color} />
          </div>
          <span
            style={{
              fontSize: "1.1rem",
              fontWeight: "600",
              color: isLight ? "#475569" : "rgba(255,255,255,0.65)",
              whiteSpace: "nowrap",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.color = isLight ? "#0f172a" : "white"}
            onMouseLeave={e => e.currentTarget.style.color = isLight ? "#475569" : "rgba(255,255,255,0.65)"}
          >
            {name}
          </span>
        </div>
      ))}
    </div>
  </div>

  <style>{`
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
  `}</style>
</section>

      {/* ── PRICING ── */}
    <section id="pricing" className={`relative z-10 py-32 px-6 overflow-hidden ${isLight ? "bg-slate-50" : ""}`}>
  {/* Dark background blob disabled for light theme only */}

  <div className="relative max-w-6xl mx-auto">
    {/* Header */}
    <div className="text-center mb-12">
      <h2 className="exo font-black text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-5xl tracking-tight mb-4"
        style={{ color: isLight ? "#0f172a" : "white" }}>
        Simple, Honest{" "}
        <span style={{ background: "linear-gradient(135deg,#a78bfa,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Plans
        </span>
      </h2>
      <p className={`max-w-lg mx-auto text-sm sm:text-base lg:text-lg 2xl:text-base leading-relaxed ${isLight ? "text-slate-500" : "text-white/45"}`}>
        Flexible pricing for every stage of your blockchain journey. No hidden fees.
      </p>
    </div>

    {/* Toggle */}
    <div className="flex justify-center mb-12">
      <div className={`flex rounded-xl p-1 gap-2 ${isLight ? "bg-slate-200" : "bg-white/10"}`}>
        <button
          onClick={() => setBillingCycle("1year")}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
          style={billingCycle === "1year"
            ? { background: "linear-gradient(135deg,#6366f1,#22d3ee)", color: "white" }
            : { color: isLight ? "#64748b" : "rgba(255,255,255,0.5)" }}>
          1 Year - ₹5,000
          {billingCycle === "1year" && (
            <span className="px-2 py-0.5 rounded-md text-xs font-bold"
              style={{ background: "rgba(255,255,255,0.25)" }}>Popular</span>
          )}
        </button>
        <button
          onClick={() => setBillingCycle("2year")}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
          style={billingCycle === "2year"
            ? { background: "linear-gradient(135deg,#6366f1,#22d3ee)", color: "white" }
            : { color: isLight ? "#64748b" : "rgba(255,255,255,0.5)" }}>
          2 Years - ₹10,000
          {billingCycle === "2year" && (
            <span className="px-2 py-0.5 rounded-md text-xs font-bold"
              style={{ background: "rgba(255,255,255,0.25)" }}>Best Value</span>
          )}
          {billingCycle !== "2year" && (
            <span className={`text-xs font-bold ${isLight ? "text-violet-500" : "text-violet-400"}`}>Best Value</span>
          )}
        </button>
      </div>
    </div>

    {/* Cards */}
    <div className="grid md:grid-cols-3 gap-6">

  {/* Card 1 - Free Trial */}
  <div className="relative rounded-2xl border transition-all duration-500 hover:-translate-y-2"
    style={{
      padding: "2rem",
      background: isLight ? "white" : "rgba(255,255,255,0.04)",
      border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.1)",
    }}>

    <p className="mono text-xs tracking-[3px] uppercase font-bold mb-3" style={{ color: isLight ? "#64748b" : "rgba(255,255,255,0.45)" }}>Free Trial</p>
    <h3 className="exo font-black text-lg sm:text-xl lg:text-2xl 2xl:text-xl mb-2" style={{ color: isLight ? "#0f172a" : "white" }}>5 Free Trials</h3>
    <p className="text-xs sm:text-sm leading-relaxed mb-6" style={{ color: isLight ? "#64748b" : "rgba(255,255,255,0.45)" }}>
      5 free trial executions for all 10 analysis tools
    </p>

    <div className="mb-1">
      <span className="exo font-black text-3xl sm:text-4xl lg:text-5xl 2xl:text-4xl" style={{ color: isLight ? "#0f172a" : "white" }}>₹0</span>
      <span className="text-xs sm:text-sm ml-1" style={{ color: isLight ? "#94a3b8" : "rgba(255,255,255,0.35)" }}></span>
    </div>
    <p className="text-xs mb-6" style={{ color: isLight ? "#94a3b8" : "rgba(255,255,255,0.3)" }}></p>

    <Link href="/pricing"
      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs sm:text-sm font-bold mb-3 transition-all duration-200 hover:scale-105 hover:opacity-90"
      style={{ background: isLight ? "#475569" : "rgba(255,255,255,0.15)", color: "white" }}>
      Upgrade Now
    </Link>
    <Link href="/pricing"
      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105"
      style={{ border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.15)", color: isLight ? "#475569" : "rgba(255,255,255,0.7)", background: "transparent" }}>
      <FaComment /> Request Quotation
    </Link>

    <div className="my-6" style={{ height: "1px", background: isLight ? "#f1f5f9" : "rgba(255,255,255,0.07)" }} />

    <div className="grid grid-cols-2 gap-4 mb-6">
      <div>
        <p className="mono text-[10px] tracking-widest uppercase mb-1" style={{ color: isLight ? "#94a3b8" : "rgba(255,255,255,0.35)" }}>Executions</p>
        <p className="font-black text-sm sm:text-base" style={{ color: isLight ? "#0f172a" : "white" }}>5 trials</p>
      </div>
      <div>
        <p className="mono text-[10px] tracking-widest uppercase mb-1" style={{ color: isLight ? "#94a3b8" : "rgba(255,255,255,0.35)" }}>Support</p>
        <p className="font-black text-sm sm:text-base" style={{ color: isLight ? "#0f172a" : "white" }}>Basic</p>
      </div>
    </div>

    <ul className="space-y-3">
      {["Access to all 10 tools", "5 Free Trial Executions", "Python Analyzer"].map(f => (
        <li key={f} className="flex items-center gap-2.5 text-xs sm:text-sm" style={{ color: isLight ? "#475569" : "rgba(255,255,255,0.6)" }}>
          <FaCheckCircle style={{ color: "#34d399", flexShrink: 0, fontSize: "0.75rem" }} />
          {f}
        </li>
      ))}
    </ul>
  </div>

  {/* Card 2 - Standard (Featured) */}
  <div className="relative rounded-2xl border transition-all duration-500 hover:-translate-y-2"
    style={{
      padding: "2rem",
      background: isLight ? "linear-gradient(160deg,rgba(167,139,250,0.08),white)" : "linear-gradient(160deg,rgba(167,139,250,0.12),rgba(255,255,255,0.03))",
      border: "1px solid rgba(139,92,246,0.5)",
      boxShadow: "0 0 60px rgba(167,139,250,0.15)",
    }}>

    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg"
      style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)" }}>
      <FaStar className="text-[10px]" /> Most Popular
    </div>

    <p className="mono text-xs tracking-[3px] uppercase font-bold mb-3 text-violet-400">Standard</p>
    <h3 className="exo font-black text-lg sm:text-xl lg:text-2xl 2xl:text-xl mb-2" style={{ color: isLight ? "#0f172a" : "white" }}>Standard Plan</h3>
    <p className="text-xs sm:text-sm leading-relaxed mb-6" style={{ color: isLight ? "#64748b" : "rgba(255,255,255,0.45)" }}>
      Access to all 10 advanced analysis tools for comprehensive code testing and verification.
    </p>

    <div className="mb-1">
      <span className="exo font-black text-3xl sm:text-4xl lg:text-5xl 2xl:text-4xl" style={{ color: isLight ? "#0f172a" : "white" }}>₹5,000</span>
      <span className="text-xs sm:text-sm ml-1" style={{ color: isLight ? "#94a3b8" : "rgba(255,255,255,0.35)" }}>/year</span>
    </div>
    <p className="text-xs mb-6" style={{ color: isLight ? "#94a3b8" : "rgba(255,255,255,0.3)" }}>One-time payment for 1 year</p>

    <Link href="#contact"
      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs sm:text-sm font-bold mb-3 transition-all duration-200 hover:scale-105 hover:opacity-90"
      style={{ background: "linear-gradient(135deg,#6366f1,#22d3ee)", color: "white" }}>
      Upgrade Now
    </Link>
    <Link href="/pricing"
      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105"
      style={{ border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.15)", color: isLight ? "#475569" : "rgba(255,255,255,0.7)", background: "transparent" }}>
      <FaComment /> Request Quotation
    </Link>

    <div className="my-6" style={{ height: "1px", background: isLight ? "#f1f5f9" : "rgba(255,255,255,0.07)" }} />

    <div className="grid grid-cols-2 gap-4 mb-6">
      <div>
        <p className="mono text-[10px] tracking-widest uppercase mb-1" style={{ color: isLight ? "#94a3b8" : "rgba(255,255,255,0.35)" }}>Executions</p>
        <p className="font-black text-sm sm:text-base" style={{ color: isLight ? "#0f172a" : "white" }}>Unlimited</p>
      </div>
      <div>
        <p className="mono text-[10px] tracking-widest uppercase mb-1" style={{ color: isLight ? "#94a3b8" : "rgba(255,255,255,0.35)" }}>Support</p>
        <p className="font-black text-sm sm:text-base" style={{ color: isLight ? "#0f172a" : "white" }}>Priority</p>
      </div>
    </div>

    <ul className="space-y-3">
      {["All 10 Analysis Tools", "C Tools (6)", "Java Tools (1)", "Python Tools (1)"].map(f => (
        <li key={f} className="flex items-center gap-2.5 text-xs sm:text-sm" style={{ color: isLight ? "#475569" : "rgba(255,255,255,0.6)" }}>
          <FaCheckCircle style={{ color: "#34d399", flexShrink: 0, fontSize: "0.75rem" }} />
          {f}
        </li>
      ))}
    </ul>
  </div>

  {/* Card 3 - Premium */}
  <div className="relative rounded-2xl border transition-all duration-500 hover:-translate-y-2"
    style={{
      padding: "2rem",
      background: isLight ? "linear-gradient(160deg,rgba(167,139,250,0.05),white)" : "linear-gradient(160deg,rgba(167,139,250,0.08),rgba(255,255,255,0.03))",
      border: "1px solid rgba(139,92,246,0.3)",
    }}>

    <p className="mono text-xs tracking-[3px] uppercase font-bold mb-3 text-violet-400">Premium</p>
    <h3 className="exo font-black text-lg sm:text-xl lg:text-2xl 2xl:text-xl mb-2" style={{ color: isLight ? "#0f172a" : "white" }}>Premium Single User</h3>
    <p className="text-xs sm:text-sm leading-relaxed mb-6" style={{ color: isLight ? "#64748b" : "rgba(255,255,255,0.45)" }}>
      Exclusive premium access for individual users only. Not shareable with others.
    </p>

    <div className="mb-1">
      <span className="exo font-black text-3xl sm:text-4xl lg:text-5xl 2xl:text-4xl" style={{ color: isLight ? "#0f172a" : "white" }}>₹10,000</span>
      <span className="text-xs sm:text-sm ml-1" style={{ color: isLight ? "#94a3b8" : "rgba(255,255,255,0.35)" }}>/2 years</span>
    </div>
    <p className="text-xs mb-6" style={{ color: isLight ? "#94a3b8" : "rgba(255,255,255,0.3)" }}>One-time payment for 2 years</p>

    <Link href="#contact"
      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs sm:text-sm font-bold mb-3 transition-all duration-200 hover:scale-105 hover:opacity-90"
      style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "white" }}>
      Upgrade Now
    </Link>
    <Link href="#contact"
      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105"
      style={{ border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.15)", color: isLight ? "#475569" : "rgba(255,255,255,0.7)", background: "transparent" }}>
      <FaComment /> Request Quotation
    </Link>

    <div className="my-6" style={{ height: "1px", background: isLight ? "#f1f5f9" : "rgba(255,255,255,0.07)" }} />

    <div className="grid grid-cols-2 gap-4 mb-6">
      <div>
        <p className="mono text-[10px] tracking-widest uppercase mb-1" style={{ color: isLight ? "#94a3b8" : "rgba(255,255,255,0.35)" }}>Executions</p>
        <p className="font-black text-sm sm:text-base" style={{ color: isLight ? "#0f172a" : "white" }}>Unlimited</p>
      </div>
      <div>
        <p className="mono text-[10px] tracking-widest uppercase mb-1" style={{ color: isLight ? "#94a3b8" : "rgba(255,255,255,0.35)" }}>Support</p>
        <p className="font-black text-sm sm:text-base" style={{ color: isLight ? "#0f172a" : "white" }}>Dedicated</p>
      </div>
    </div>

    <ul className="space-y-3">
      {["All 10 Analysis Tools", "Exclusive Personal Access", "Not Shareable", "Dedicated Support"].map(f => (
        <li key={f} className="flex items-center gap-2.5 text-xs sm:text-sm" style={{ color: isLight ? "#475569" : "rgba(255,255,255,0.6)" }}>
          <FaCheckCircle style={{ color: "#34d399", flexShrink: 0, fontSize: "0.75rem" }} />
          {f}
        </li>
      ))}
    </ul>
  </div>

</div>
  </div>
</section>

      {/* ── TEAM ── */}
     

      {/* ── CONTACT ── */}
      <section id="contact" className={`relative z-10 py-32 px-6 overflow-hidden ${isLight ? "bg-slate-50" : ""}`}>
        {/* Dark background blob disabled for light theme only */}
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="mono text-xs tracking-[4px] uppercase text-cyan-400 mb-5">Let's Build Together</p>
          <h2 className="exo font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-6xl tracking-tight mb-6" style={{ color: isLight ? "#0f172a" : "white" }}>
            Ready to Secure<br />
            <span style={{ background: "linear-gradient(135deg,#6366f1,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Your Contracts?
            </span>
          </h2>
          <p className={`text-sm sm:text-base md:text-lg lg:text-lg 2xl:text-base leading-relaxed mb-10 max-w-xl mx-auto ${isLight ? "text-slate-500" : "text-white/50"}`}>
            Whether you need a smart contract audit, an AI-powered solution, or a full-stack blockchain platform — Nitminer is your partner.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a href="mailto:nitminer@nitw.ac.in"
              className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-semibold text-white text-xs sm:text-sm lg:text-base 2xl:text-sm transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(99,102,241,0.5)]"
              style={{ background: "linear-gradient(135deg,#6366f1,#22d3ee)" }}>
              <FaEnvelope />
              nitminer@nitw.ac.in
            </a>
            <Link href="/pricing"
              className={`flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-semibold text-xs sm:text-sm lg:text-base 2xl:text-sm border transition-all duration-300 hover:scale-105 ${isLight ? "border-slate-300 text-slate-700 hover:border-indigo-400" : "border-white/15 text-white hover:border-white/40"}`}>
              <FaStar />
              View Pricing
            </Link>
          </div>
          {/* <p className={`text-sm flex items-center justify-center gap-2 ${isLight ? "text-slate-400" : "text-white/30"}`}>
            <FaMapMarkerAlt className="text-cyan-400" />
            India · Est. 2022 · Nitminer Technologies Pvt. Ltd.
          </p> */}
        </div>
      </section>

      {/* ── FOOTER ── */}
     
    </div>
  );
}