"use client"

import { FiBriefcase, FiUsers, FiBookOpen, FiZap, FiAward, FiTrendingUp, FiMail, FiArrowRight } from "react-icons/fi"
import Header from "./Header"

export function CareersComponent() {
  const benefits = [
    {
      icon: FiZap,
      title: "Innovative Projects",
      description: "Work on cutting-edge technology projects that solve real-world problems and make a difference."
    },
    {
      icon: FiUsers,
      title: "Collaborative Culture",
      description: "Join a supportive team environment where ideas are valued and collaboration is encouraged."
    },
    {
      icon: FiBookOpen,
      title: "Continuous Learning",
      description: "Access to training, workshops, and mentorship programs to help you grow professionally."
    },
    {
      icon: FiBriefcase,
      title: "Work-Life Balance",
      description: "Flexible work arrangements and policies that support your personal and professional life."
    },
    {
      icon: FiAward,
      title: "Competitive Benefits",
      description: "Comprehensive health insurance, retirement plans, and performance-based incentives."
    },
    {
      icon: FiTrendingUp,
      title: "Career Growth",
      description: "Clear career progression paths and opportunities for advancement within the company."
    }
  ]

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
      `}</style>
      
      <section className="w-full bg-gradient-to-b from-white to-slate-50 dark:from-black dark:to-zinc-950" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <Header/>
        
        {/* Hero Section */}
        <div className="py-16 md:py-24 bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Build Your Career With Us
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto font-medium">
              Join a team of innovators and problem-solvers dedicated to creating cutting-edge technology solutions.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          {/* Join Our Team Section */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-black dark:text-white mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Join Our Team
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl font-medium leading-relaxed">
              At NITMiner Technologies, we're building the future of smart contract testing and verification. We're looking for talented individuals who are passionate about innovation and want to make a real impact.
            </p>
          </div>

          {/* Why Work With Us */}
          <div className="mb-20">
            <h2 className="text-3xl font-black text-black dark:text-white mb-12" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Why Work at <span className="text-blue-600 dark:text-blue-400">NITMiner Technologies</span>?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <div
                    key={index}
                    className="p-6 bg-white dark:bg-zinc-900 rounded-2xl hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <Icon size={24} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-xl font-black text-black dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        {benefit.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                      {benefit.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Current Job Openings */}
          <div className="mb-16">
            <h2 className="text-3xl font-black text-black dark:text-white mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Current Job Openings
            </h2>
            <div className="bg-blue-50 dark:bg-zinc-900 rounded-2xl p-8 md:p-12 text-center">
              <h3 className="text-2xl font-black text-black dark:text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                No Current Vacancies
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto font-medium">
                We're not actively hiring at the moment, but we're always interested in connecting with talented individuals.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-8 font-medium">
                Feel free to submit your resume for future consideration, and we'll contact you when positions become available.
              </p>
            </div>
          </div>

          {/* Submit Resume CTA */}
          <div className="mb-16">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 md:p-12 text-center shadow-lg">
              <FiMail className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-black dark:text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Submit Your Resume
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto font-medium">
                Currently we don't have any job vacancies. Check out our page sometime later.
              </p>
              <a
                href="mailto:sanghu@nitw.ac.in?subject=Career%20Opportunity%20at%20NITMiner%20Technologies"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                <FiMail size={20} />
                Send Your Resume
              </a>
            </div>
          </div>

          {/* Dream Career Section */}
          <div className="bg-blue-600 rounded-2xl p-8 md:p-12 text-center text-white shadow-xl">
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Find the Career of Your Dreams
            </h2>
            <p className="text-xl text-blue-100 font-medium">
              We're more than just a workplace. We're a family.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}