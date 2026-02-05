"use client"

import { FiArrowRight, FiMail } from "react-icons/fi"

export function ComingSoonComponent() {
  return (
    <section className="w-full min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-black py-16 md:py-24" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Decorative Element */}
            <div className="mb-8">
              <div className="inline-block">
                <div className="text-6xl md:text-8xl font-black text-blue-600 dark:text-blue-400 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Coming Soon
                </div>
              </div>
            </div>

            {/* Main Heading */}
            {/* <h1 className="text-3xl md:text-5xl font-black text-black dark:text-white mb-6 leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              We're Working Hard to Bring You Something Amazing!
            </h1> */}

            {/* Description */}
            {/* <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-12 leading-relaxed font-medium max-w-2xl mx-auto">
              Our team at NITMiner Technologies is currently developing this page to provide you with the best experience. We're implementing cutting-edge blockchain testing solutions and innovative features that will revolutionize smart contract automation.
            </p> */}

            {/* CTA Buttons */}
            {/* <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Back to Home
                <FiArrowRight size={20} />
              </a>
              <a
                href="mailto:sanghu@nitw.ac.in"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-zinc-900 text-black dark:text-white font-black rounded-xl hover:shadow-xl transition-all"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                <FiMail size={20} />
                Get Notified
              </a>
            </div> */}

            {/* Contact */}
            <div className="mt-12 p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg">
              <p className="text-gray-700 dark:text-gray-300 mb-4 font-bold text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Have questions? Reach out to us!
              </p>
              <a
                href="mailto:sanghu@nitw.ac.in"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-black text-xl"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                sanghu@nitw.ac.in
              </a>
            </div>
          </div>
        </div>
      </section>
    )
  }