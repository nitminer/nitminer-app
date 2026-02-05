"use client"

import { FiExternalLink, FiBook } from "react-icons/fi"

export function PublicationsComponent() {
  const publications = [
    {
      authors: "Sangharatna Godboley, P Radha Krishna, Sunkara Sri Harika, Pooja Varnam",
      title: "Validation Framework for E-Contract and Smart Contract",
      conference: "29th International Conference on Evaluation and Assessment in Software Engineering (EASE), ACM, Istanbul, Turkey, June 2025",
      category: "Core A",
      year: 2025,
      link: "#"
    },
    {
      authors: "Monika Rani Golla, Sangharatna Godboley",
      title: "Poster: Empirical Evaluation of SC-MCC Meta Program Efficiency using Dynamic Symbolic Execution Engine",
      conference: "18th IEEE Conference on Software Testing, Verification and Validation (ICST 2025), Naples, Italy, 31 March-04 April 2025",
      category: "Core A",
      year: 2025,
      link: "#"
    },
    {
      authors: "Monika Rani Golla, Sangharatna Godboley, Avijit Das, P. Radha Krishna",
      title: "Poster: Reporting Unique-Cause MC/DC Score using Formal Verification",
      conference: "18th IEEE Conference on Software Testing, Verification and Validation (ICST 2025), Naples, Italy, 31 March-04 April 2025",
      category: "Core A",
      year: 2025,
      link: "#"
    },
    {
      authors: "Monika Rani Golla, Sangharatna Godboley",
      title: "Automated SC-MCC Test Case Generation using Coverage Guided Fuzzing",
      conference: "18th IEEE Conference on Software Testing, Verification and Validation (ICST 2025), Naples, Italy, Journal First Track",
      category: "Core A",
      year: 2025,
      link: "#"
    },
    {
      authors: "Sangharatna Godboley, P. Radha Krishna",
      title: "Sol-Repairer: Solidity Smart Contract Dead Code Repairer",
      conference: "In Proceedings of the 18th Innovations in Software Engineering Conference (ISEC '25), Kurukshetra, India",
      category: "Conference",
      year: 2025,
      link: "#"
    },
    {
      authors: "Wei, C., Wu, T., Sa Menezes, R., Shmarov, F., Aljaafari, F., Godboley, S., Alshmrany, K., de Freitas, R., & Cordeiro, L. C.",
      title: "ESBMC v7.7: Automating Branch Coverage Analysis Using CFG-Based Instrumentation and SMT Solving (Competition Contribution)",
      conference: "In 28th International Conference on Fundamental Approaches to Software Engineering",
      category: "Core B",
      year: 2024,
      link: "#"
    },
    {
      authors: "Sangharatna Godboley, P. Radha Krishna",
      title: "VeriSol-MCE: Verification-Based Condition Coverage Analysis of Smart Contracts Using Model Checker Engines",
      conference: "17th IEEE Conference on Software Testing, Verification and Validation (ICST 2024) Pages 434-438, Toronto, Canada 27-31 May 2024",
      category: "Core A",
      year: 2024,
      link: "#"
    },
    {
      authors: "Darshan Lohiya, Monika Rani Golla, Sangharatna Godboley, P. Radha Krishna",
      title: "gptCombFuzz: Combinatorial Oriented LLM Seed Generation for Effective Fuzzing",
      conference: "17th IEEE Conference on Software Testing, Verification and Validation (ICST 2024) Pages 438-442, Toronto, Canada 27-31 May 2024",
      category: "Core A",
      year: 2024,
      link: "#"
    },
    {
      authors: "Golla Monika Rani, Sangharatna Godboley, Joxan Jaffar, Rasool Maghareh",
      title: "Poster: SC-MCC Test Case Generation using Dynamic Symbolic Execution Engines",
      conference: "4th KLEE Workshop, 46th International Conference on Software Engineering (ICSE 2024), 14-20 April 2024, Lisbon, Portugal",
      category: "Core A*",
      year: 2024,
      link: "#"
    },
    {
      authors: "Kanika Gupta, Sangharatna Godboley",
      title: "Poster: Towards Complete Fuzzing with KLEE",
      conference: "4th KLEE Workshop, 46th International Conference on Software Engineering (ICSE 2024), 14-20 April 2024, Lisbon, Portugal",
      category: "Core A*",
      year: 2024,
      link: "#"
    }
  ]

  const getCategoryColor = (category) => {
    switch (category) {
      case "Core A*":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
      case "Core A":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
      case "Core B":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200"
      case "Conference":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
    }
  }

  const PublicationCard = ({ pub }) => (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 hover:shadow-xl transition-shadow">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
          <FiBook className="text-blue-600 dark:text-blue-400" size={20} />
        </div>
        <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${getCategoryColor(pub.category)}`}>
          {pub.category}
        </span>
      </div>

      <h3 className="text-xl font-black text-black dark:text-white mb-3 leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        {pub.title}
      </h3>

      <p className="text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
        <span className="font-bold text-gray-600 dark:text-gray-400">Authors:</span> {pub.authors}
      </p>

      <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm font-medium">
        {pub.conference}
      </p>

      <div className="flex items-center justify-between pt-4">
        <span className="text-gray-500 dark:text-gray-500 text-sm font-bold">
          {pub.year}
        </span>
        <a
          href={pub.link}
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold transition-colors"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          View Publication
          <FiExternalLink size={16} />
        </a>
      </div>
    </div>
  )

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
      `}</style>
      
      <section className="w-full py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-black" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black mb-4 text-black dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Our <span className="text-blue-600 dark:text-blue-400">Publications</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-medium">
              Peer-reviewed publications and research contributions
            </p>
          </div>

          {/* Publications Grid */}
          <div className="space-y-6 mb-16">
            {publications.map((pub, index) => (
              <PublicationCard key={index} pub={pub} />
            ))}
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-2xl hover:shadow-lg transition-shadow">
              <p className="text-5xl font-black text-blue-600 dark:text-blue-400 mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                10+
              </p>
              <p className="text-gray-700 dark:text-gray-300 font-bold">
                Publications
              </p>
            </div>
            <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-2xl hover:shadow-lg transition-shadow">
              <p className="text-5xl font-black text-blue-600 dark:text-blue-400 mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                2024-25
              </p>
              <p className="text-gray-700 dark:text-gray-300 font-bold">
                Recent Years
              </p>
            </div>
            <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-2xl hover:shadow-lg transition-shadow">
              <p className="text-5xl font-black text-blue-600 dark:text-blue-400 mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Core A+
              </p>
              <p className="text-gray-700 dark:text-gray-300 font-bold">
                Top Tier Venues
              </p>
            </div>
            <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-2xl hover:shadow-lg transition-shadow">
              <p className="text-5xl font-black text-blue-600 dark:text-blue-400 mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                50+
              </p>
              <p className="text-gray-700 dark:text-gray-300 font-bold">
                Researchers Involved
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}