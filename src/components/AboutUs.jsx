"use client"
import { FiArrowUpRight, FiCode, FiZap, FiTarget, FiCommand, FiHexagon } from "react-icons/fi"
import Link from "next/link"
import { motion } from "framer-motion"

export default function AboutUs() {
  return (
    <div className="bg-[#000] text-white font-sans selection:bg-indigo-500/30">
      
      {/* --- HERO: THE MONOLITH --- */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Abstract Grid Background */}
        <div className="absolute inset-0 z-0 opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent)]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-[11px] font-medium tracking-widest uppercase text-indigo-400 mb-10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            System v2.026
          </div>
          
          <h1 className="text-7xl md:text-[120px] font-bold tracking-tight leading-[0.8] mb-12">
            WE BUILD<br />
            <span className="text-indigo-500">SYSTEMS.</span>
          </h1>
          
          <p className="text-gray-500 max-w-xl mx-auto text-lg md:text-xl font-medium leading-relaxed mb-12">
            NITMINER is a specialized engineering lab focused on high-performance blockchain infrastructure and autonomous software.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="group flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-bold transition-all hover:bg-indigo-500 hover:text-white">
              Initialize Project <FiArrowUpRight className="group-hover:rotate-45 transition-transform" />
            </Link>
            <button className="px-8 py-4 bg-zinc-900 border border-zinc-800 rounded-full font-bold hover:bg-zinc-800 transition-all">
              Documentation
            </button>
          </div>
        </motion.div>
      </section>

      {/* --- CORE: THE GRID --- */}
      <section className="py-32 px-6 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-900 border border-zinc-900">
            <FeatureCell 
              icon={<FiCommand />}
              title="Execution"
              desc="Deploying smart contracts with sub-millisecond precision."
            />
            <FeatureCell 
              icon={<FiHexagon />}
              title="Architecture"
              desc="Modular systems designed for infinite scalability."
            />
            <FeatureCell 
              icon={<FiZap />}
              title="Intelligence"
              desc="ML models that predict and prevent protocol failure."
            />
          </div>
        </div>
      </section>

      {/* --- CONTENT: THE CLEAN SPLIT --- */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-start">
          <div>
            <h2 className="text-4xl font-bold mb-8 uppercase tracking-tighter">Strategic<br />Vision.</h2>
            <div className="space-y-12">
              <VisionItem number="01" title="Security First" text="We treat code as mission-critical infrastructure. Every line is audited for edge-case vulnerabilities." />
              <VisionItem number="02" title="Speed of Thought" text="Our development cycles are optimized for rapid deployment without sacrificing system integrity." />
            </div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8">
              <FiTarget className="text-5xl text-indigo-500/20 group-hover:text-indigo-500 transition-colors" />
            </div>
            <h3 className="text-2xl font-bold mb-6">Our Mission</h3>
            <p className="text-gray-400 text-lg leading-relaxed mb-8 italic">
              "To engineer the most reliable decentralized tools that allow developers to focus on creativity rather than infrastructure maintenance."
            </p>
            <div className="flex items-center gap-4 text-sm font-bold tracking-widest text-indigo-500 uppercase">
              <span className="w-8 h-[1px] bg-indigo-500"></span>
              The Standard for 2026
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-40 text-center border-t border-zinc-900 bg-[radial-gradient(45%_40%_at_50%_50%,#4f46e510_0%,transparent_100%)]">
        <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-10">READY FOR<br />STABLE OPS?</h2>
        <Link href="/contact" className="inline-flex items-center gap-3 text-2xl font-bold hover:text-indigo-500 transition-colors">
          Connect with Engineering <FiArrowUpRight />
        </Link>
      </section>
    </div>
  )
}

function FeatureCell({ icon, title, desc }) {
  return (
    <div className="bg-black p-12 hover:bg-zinc-950 transition-colors">
      <div className="text-indigo-500 mb-6 text-2xl">{icon}</div>
      <h3 className="text-xl font-bold mb-4 uppercase tracking-widest">{title}</h3>
      <p className="text-gray-500 leading-relaxed font-medium">{desc}</p>
    </div>
  )
}

function VisionItem({ number, title, text }) {
  return (
    <div className="flex gap-8">
      <span className="text-zinc-800 font-bold text-lg">{number}</span>
      <div>
        <h4 className="text-xl font-bold mb-2 uppercase tracking-tight">{title}</h4>
        <p className="text-gray-500 leading-relaxed">{text}</p>
      </div>
    </div>
  )
}