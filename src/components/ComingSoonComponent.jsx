"use client"

import { FiArrowRight, FiMail, FiBookOpen, FiSettings, FiSmartphone, FiLayers } from "react-icons/fi"

export function ComingSoonComponent() {
  return (
    <section className="w-full min-h-screen flex items-center justify-center  dark:from-zinc-950 dark:to-black py-16 md:py-24" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="max-w-6xl mx-auto px-0">
          <div className="text-center">
            {/* Decorative Element */}
            

            {/* Main Heading */}
            <h1 className="text-3xl md:text-5xl font-black text-black dark:text-white mb-6 leading-tight animate-fade-in-up" style={{ fontFamily: 'Space Grotesk, sans-serif', animationDelay: '0.2s' }}>
              Our Services Portfolio
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-12 leading-relaxed font-medium max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              At NITMiner Technologies, we're expanding our offerings to serve both academic institutions and industry professionals. Discover our comprehensive solutions designed to meet your development needs.
            </p>

            {/* Services Grid - Modern Card Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-16 ">
              {/* Trustinn Tools Card */}
              <div className="group bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-gray-800 hover:border-green-200 dark:hover:border-green-800 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Icon */}
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-green-500/25 transition-all duration-300 group-hover:scale-110">
                      <FiBookOpen size={36} className="text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-xs font-bold text-white">✓</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      Trustinn Tools
                    </h3>
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                      For Testing & Code Analysis
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      Comprehensive testing tools and code analysis solutions including coverage analysis, path testing, quality assurance, and automated verification for robust software development.
                    </p>
                  </div>

                  {/* Hover indicator */}
                  <div className="w-0 group-hover:w-full h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"></div>
                </div>
              </div>

              {/* Verisol Card */}
              <div className="group bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-800 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Icon */}
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300 group-hover:scale-110">
                      <FiSettings size={36} className="text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-xs font-bold text-white">✓</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      Verisol
                    </h3>
                    <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                      For Industry
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      Industrial-grade verification and security solutions for enterprise-level applications and systems. Advanced blockchain testing, smart contract automation, and comprehensive security auditing.
                    </p>
                  </div>

                  {/* Hover indicator */}
                  <div className="w-0 group-hover:w-full h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-500"></div>
                </div>
              </div>

              {/* Mobile Apps Card */}
              <div className="group bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Icon */}
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300 group-hover:scale-110">
                      <FiSmartphone size={36} className="text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-xs font-bold text-white">✓</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      Mobile Apps
                    </h3>
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      Development
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      Custom mobile applications for iOS and Android platforms, built with modern technologies and user-centric design. From concept to deployment, we deliver exceptional mobile experiences.
                    </p>
                  </div>

                  {/* Hover indicator */}
                  <div className="w-0 group-hover:w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"></div>
                </div>
              </div>

              {/* Full Stack Card */}
              <div className="group bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-gray-800 hover:border-orange-200 dark:hover:border-orange-800 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Icon */}
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-orange-500/25 transition-all duration-300 group-hover:scale-110">
                      <FiLayers size={36} className="text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-xs font-bold text-white">✓</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      Full Stack
                    </h3>
                    <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                      Development
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      End-to-end web development solutions including frontend, backend, databases, and deployment for your business. We build scalable, secure, and high-performance applications.
                    </p>
                  </div>

                  {/* Hover indicator */}
                  <div className="w-0 group-hover:w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500"></div>
                </div>
              </div>
            </div>

            {/* Professional CTA Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-8 rounded-2xl shadow-lg animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="text-center">
                <h3 className="text-2xl md:text-3xl font-bold text-black dark:text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Ready to Transform Your Business?
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed max-w-3xl mx-auto">
                  If you're interested in any of our services or need a customized solution for your specific requirements, please reach out to us for a detailed quotation. Our team of experts is ready to discuss your project and provide tailored solutions that meet your business goals.
                </p>
                <a
                  href="mailto:sanghu@nitw.ac.in"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  <FiMail size={20} />
                  Get Your Quotation
                </a>
              </div>
            </div>

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