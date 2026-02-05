"use client"

import { FiAward } from "react-icons/fi"

export function AwardsComponent() {
  const awards = [
    {
      title: "RECOGNITION award in the Research Excellence (Teaching Faculty-National) category",
      recipient: "Sangharatna Godboley",
      organization: "Institution of Engineers (India) [IEI]",
      awardName: "IEI NMLC FCRIT Excellence Awards 2023",
      year: 2023
    },
    {
      title: "Runner Up award in the Academic Excellence (Teaching Faculty-National) category",
      recipient: "Sangharatna Godboley",
      organization: "Institution of Engineers (India) [IEI]",
      awardName: "IEI NMLC FCRIT Excellence Awards 2024",
      year: 2024
    }
  ]

  const AwardCard = ({ award }) => (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 hover:shadow-xl transition-shadow">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex-shrink-0">
          <FiAward size={28} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-black text-black dark:text-white mb-3 leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {award.title}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-3 font-medium">
            <span className="font-bold text-gray-600 dark:text-gray-400">Recipient:</span>{" "}
            <span className="font-semibold">{award.recipient}</span>
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-2 font-bold">
            {award.awardName}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {award.organization} • <span className="font-bold">{award.year}</span>
          </p>
        </div>
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
              Our <span className="text-blue-600 dark:text-blue-400">Achievements</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-medium">
              Recognition and awards that celebrate our commitment to excellence
            </p>
          </div>

          <div className="space-y-6 mb-16">
            {awards.map((award, index) => (
              <AwardCard key={index} award={award} />
            ))}
          </div>

          {/* Stats Section */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-2xl hover:shadow-lg transition-shadow">
              <p className="text-5xl font-black text-blue-600 dark:text-blue-400 mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                2+
              </p>
              <p className="text-gray-700 dark:text-gray-300 font-bold">
                Major Awards Received
              </p>
            </div>
            <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-2xl hover:shadow-lg transition-shadow">
              <p className="text-5xl font-black text-blue-600 dark:text-blue-400 mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                National
              </p>
              <p className="text-gray-700 dark:text-gray-300 font-bold">
                Level Recognition
              </p>
            </div>
            <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-2xl hover:shadow-lg transition-shadow">
              <p className="text-5xl font-black text-blue-600 dark:text-blue-400 mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                IEI
              </p>
              <p className="text-gray-700 dark:text-gray-300 font-bold">
                Prestigious Organization
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}