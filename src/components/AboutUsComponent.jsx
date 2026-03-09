"use client"
import { useState } from "react"
import { FiTarget, FiZap, FiGlobe, FiArrowRight, FiAward, FiUsers, FiTrendingUp, FiBriefcase, FiBook, FiLock, FiCompass, FiMail, FiChevronRight } from "react-icons/fi"
import { ImGoogle, ImLinkedin, ImEnvelope2 } from "react-icons/im"
import { SiOrcid } from "react-icons/si"
import Image from "next/image"
import Link from "next/link"

export default function AboutUsComponent() {
  const [activeTab, setActiveTab] = useState('mission');
  const [imageLoadError, setImageLoadError] = useState({});
  const [hoveredCard, setHoveredCard] = useState(null);

  const leadershipTeam = [
    { name: "Prof. P Radha Krishna", position: "CEO & Director", image: "/images/team/radhakrisha.png", bio: "Visionary leader driving innovation in mining technology" },
    { name: "Dr. Sangharatna Godboley", position: "Chairman & Director", image: "/images/team/sangarthana.png", bio: "Expert in sustainable mining solutions" }
  ];

  const milestones = [
    { number: "50+", label: "Projects", icon: FiBriefcase },
    { number: "100+", label: "Research Papers", icon: FiBook },
    { number: "30+", label: "Patents", icon: FiLock },
    { number: "50+", label: "Trainees", icon: FiUsers }
  ];

  const values = [
    {
      title: "Innovation",
      description: "Pushing boundaries with cutting-edge technology and forward-thinking solutions",
      icon: FiZap,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200"
    },
    {
      title: "Excellence",
      description: "Commitment to highest standards in every aspect of our work",
      icon: FiAward,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      borderColor: "border-amber-200"
    },
    {
      title: "Sustainability",
      description: "Responsible practices that protect our environment and communities",
      icon: FiGlobe,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      borderColor: "border-emerald-200"
    },
    {
      title: "Collaboration",
      description: "Working together with partners, clients, and team members for shared success",
      icon: FiUsers,
      bgColor: "bg-rose-50",
      iconColor: "text-rose-600",
      borderColor: "border-rose-200"
    }
  ];

  const visionPoints = [
    { title: "Global Impact", icon: FiGlobe, color: "text-purple-600" },
    { title: "Digital Future", icon: FiCompass, color: "text-purple-600" },
    { title: "Continuous Innovation", icon: FiZap, color: "text-purple-600" }
  ];

  return (
    <div className="w-full bg-white">
      {/* HERO SECTION */}
      <section className="relative py-16 sm:py-24 lg:py-32 xl:py-36 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-slate-50 overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Dynamic animated shapes */}
          <div className="absolute top-10 right-10 w-40 h-40 bg-blue-100 rounded-full opacity-20 blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-56 h-56 bg-slate-100 rounded-full opacity-30 blur-3xl animate-slow-drift"></div>
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-slate-200 rounded-full opacity-15 blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-block mb-4 sm:mb-6 px-4 py-2 bg-white border border-slate-200 rounded-full backdrop-blur-sm hover:border-blue-300 transition-colors duration-300">
            <p className="text-blue-600 text-xs sm:text-sm font-bold uppercase tracking-wide">Our Journey</p>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-5xl font-black text-slate-900 mb-4 sm:mb-6 leading-tight tracking-tight">
            Transforming <span className="relative inline-block">
              <span className="relative z-10 text-blue-600">Mining</span>
                <span className="absolute inset-x-0 bottom-1 h-3 bg-blue-200 opacity-40 rounded z-0"></span>
            </span> Through Innovation
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Driving sustainable technology solutions and groundbreaking research to revolutionize the mining industry
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/services" className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 text-sm sm:text-base bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300 transform hover:scale-105 active:scale-95">
              Explore Services
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/contact" className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 text-sm sm:text-base border-2 border-slate-300 text-slate-700 font-bold rounded-full hover:border-blue-600 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 active:scale-95">
              Get in Touch
              <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* MISSION, VISION, VALUES TABS SECTION */}
      <section className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 sm:mb-16 lg:mb-20 text-center">
            <div className="inline-block mb-3 sm:mb-4 px-4 py-2 bg-slate-100 rounded-full">
              <p className="text-slate-600 text-xs sm:text-sm font-bold uppercase tracking-wider">Foundation</p>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-4xl font-black text-slate-900">Our Core Principles</h2>
            <p className="mt-3 sm:mt-4 text-slate-600 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg">The values that guide our decisions and shape our culture</p>
          </div>
          
          {/* Tab buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16">
            {[
              { id: 'mission', label: 'Mission', icon: FiTarget, color: 'blue' },
              { id: 'vision', label: 'Vision', icon: FiZap, color: 'emerald' },
              { id: 'values', label: 'Values', icon: FiGlobe, color: 'purple' }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-all duration-300 w-full sm:w-auto transform hover:scale-105 active:scale-95 ${
                    activeTab === tab.id
                      ? `bg-${tab.color}-600 text-white shadow-lg shadow-${tab.color}-600/30`
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            {activeTab === 'mission' && (
              <div className="animate-fadeIn">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-5 sm:mb-6 lg:mb-8 flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center shrink-0 group">
                    <FiTarget className="w-7 h-7 text-blue-600 group-hover:scale-110 transition-transform" />
                  </div>
                  Our Mission
                </h3>
                <p className="text-sm sm:text-base lg:text-lg text-slate-700 leading-relaxed mb-6 sm:mb-8 font-medium">
                  To revolutionize the mining industry through cutting-edge research, technological innovation, and sustainable practices. We are committed to developing solutions that maximize efficiency, minimize environmental impact, and create value for all stakeholders.
                </p>
                <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 hover:border-blue-300 transition-all group cursor-pointer hover:shadow-md transform hover:scale-105">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-300 transition-colors">
                        <FiZap className="w-5 h-5 text-blue-700" />
                      </div>
                      <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors pt-1 text-lg">Research-Driven</h4>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">High-end research and development at the core of everything we do</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100 hover:border-emerald-300 transition-all group cursor-pointer hover:shadow-md transform hover:scale-105">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-emerald-200 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-emerald-300 transition-colors">
                        <FiGlobe className="w-5 h-5 text-emerald-700" />
                      </div>
                      <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors pt-1 text-lg">Sustainable Growth</h4>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">Balancing profitability with environmental and social responsibility</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'vision' && (
              <div className="animate-fadeIn">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-5 sm:mb-6 lg:mb-8 flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0 group">
                    <FiZap className="w-7 h-7 text-emerald-600 group-hover:scale-110 transition-transform" />
                  </div>
                  Our Vision
                </h3>
                <p className="text-sm sm:text-base lg:text-lg text-slate-700 leading-relaxed mb-6 sm:mb-8 font-medium">
                  To be the global leader in mining innovation and digital transformation. We envision a future where mining is smarter, cleaner, and more efficient through the integration of AI, blockchain, and advanced technologies.
                </p>
                <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
                  {visionPoints.map((point, idx) => {
                    const Icon = point.icon;
                    return (
                      <div key={idx} className="bg-emerald-50 rounded-xl p-6 border border-emerald-100 hover:border-emerald-300 transition-all group cursor-pointer hover:shadow-md transform hover:scale-105">
                        <div className="mb-4 inline-block p-3 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                          <Icon className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                        </div>
                        <p className="text-slate-700 font-bold text-base leading-tight">{point.title}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'values' && (
              <div className="animate-fadeIn">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-5 sm:mb-6 lg:mb-8 flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center shrink-0 group">
                    <FiGlobe className="w-7 h-7 text-purple-600 group-hover:scale-110 transition-transform" />
                  </div>
                  Our Core Values
                </h3>
                <p className="text-sm sm:text-base lg:text-lg text-slate-700 leading-relaxed mb-6 sm:mb-8 font-medium">
                  Our values guide every decision we make and shape our organizational culture
                </p>
                <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                  {values.map((value, idx) => {
                    const Icon = value.icon;
                    return (
                      <div key={idx} className={`${value.bgColor} rounded-xl p-8 border ${value.borderColor} hover:shadow-lg transition-all group cursor-pointer hover:scale-105 transform`}>
                        <div className={`w-12 h-12 ${value.iconColor} bg-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-slate-900 mb-3 text-lg group-hover:text-slate-600 transition-colors">{value.title}</h4>
                        <p className="text-slate-700 text-sm leading-relaxed">{value.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* LEADERSHIP SECTION */}
      <section className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-12 sm:mb-16 text-left">
          <h2 className="text-slate-500 uppercase tracking-widest text-xs sm:text-sm font-bold mb-2">Leadership Team</h2>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-4xl font-black text-slate-900">Meet Our Visionaries</h1>
          <div className="w-16 h-1 bg-blue-600 mt-4 rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
          {/* Dr. Sangharatna Godboley Card */}
          <div 
            className="group bg-white border border-slate-200 rounded-2xl p-9 hover:border-blue-400 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 animate-fadeIn overflow-hidden relative"
            onMouseEnter={() => setHoveredCard(0)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ animationDelay: '0.1s' }}
          >
            <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
            <Image 
              src="/images/team/sangarthana.png" 
              alt="Dr. Sangharatna Godboley" 
              width={240}
              height={280}
              className="float-left w-64 mr-6 mb-4 rounded-2xl object-cover border-2 border-slate-300 group-hover:border-blue-400 transition-colors group-hover:scale-105 group-hover:shadow-lg"
              onError={() => setImageLoadError(prev => ({ ...prev, [0]: true }))}
            />
            {imageLoadError[0] && (
              <div className="float-left w-64 h-72 mr-6 mb-4 rounded-2xl bg-blue-100 border-2 border-slate-300 flex items-center justify-center">
                <FiUsers className="w-16 h-16 text-blue-400" />
              </div>
            )}
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">Dr. Sangharatna Godboley</h3>
            <div className="flex items-center gap-2 mt-2 mb-4">
              <span className="text-blue-600 font-bold">•</span>
              <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">Founder</span>
            </div>
            <p className="text-slate-700 leading-relaxed mt-3 text-justify">
              A distinguished researcher in Software Security and Blockchain with over a decade of experience at NUS and NIT Rourkela. As the Founder of NITMINER Technologies, he specializes in transforming automated bug detection research into industry-grade solutions. His work is widely published in reputed international journals like IEEE, Elsevier, and Springer.
            </p>
            <p className="text-slate-700 leading-relaxed mt-4 text-justify">
              A "Best Paper" award winner and developer of tools like Tracer-X, Dr. Godboley blends academic insight with industrial vision to lead software security innovation. His research contributions continue to influence the next generation of secure software engineering practices across academia and industry.
            </p>
            <div className="flex items-center space-x-6 mt-6 pt-6 border-t border-slate-200 clear-both">
              <a title="Google Scholar" href="https://scholar.google.com/citations?user=_HlGuXAAAAAJ" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition-all transform hover:scale-110"><ImGoogle className="text-lg" /></a>
              <a title="LinkedIn" href="https://www.linkedin.com/in/dr-sangharatna-godboley-a503b453" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition-all transform hover:scale-110"><ImLinkedin className="text-lg" /></a>
              <a title="ORCID ID" href="https://orcid.org/0000-0002-6169-6334" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition-all transform hover:scale-110"><SiOrcid className="text-lg" /></a>
              <a title="Email" href="mailto:sanghu@nitw.ac.in" className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition-all transform hover:scale-110"><FiMail className="text-lg" /></a>
            </div>
          </div>

          {/* Dr. P. Radha Krishna Card */}
          <div 
            className="group bg-white border border-slate-200 rounded-2xl p-9 hover:border-emerald-400 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 animate-fadeIn overflow-hidden relative"
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ animationDelay: '0.2s' }}
          >
            <div className="absolute inset-0 bg-emerald-50 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
            <Image 
              src="/images/team/radhakrisha.png" 
              alt="Dr. P. Radha Krishna" 
              width={240}
              height={280}
              className="float-left w-64 mr-6 mb-4 rounded-2xl object-cover border-2 border-slate-300 group-hover:border-emerald-400 transition-colors group-hover:scale-105 group-hover:shadow-lg"
              onError={() => setImageLoadError(prev => ({ ...prev, [1]: true }))}
            />
            {imageLoadError[1] && (
              <div className="float-left w-64 h-72 mr-6 mb-4 rounded-2xl bg-emerald-100 border-2 border-slate-300 flex items-center justify-center">
                <FiUsers className="w-16 h-16 text-emerald-400" />
              </div>
            )}
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">Dr. P. Radha Krishna</h3>
            <div className="flex items-center gap-2 mt-2 mb-4">
              <span className="text-emerald-600 font-bold">•</span>
              <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Co-Founder</span>
            </div>
            <p className="text-slate-700 leading-relaxed mt-3 text-justify">
              A distinguished expert in Data Science and AI with over 30 years of leadership across government research, the global IT industry, and academia. Currently a Professor and Dean at NIT Warangal, his career includes an 11-year tenure as a Principal Research Scientist at Infosys.
            </p>
            <p className="text-slate-700 leading-relaxed mt-4 text-justify">
              An inventor with over 20 US and Indian patents, he has authored authoritative textbooks on Data Mining and Databases for Oxford and CRC Press. At NITMINER, Dr. Krishna provides the strategic and architectural vision to transform deep research into scalable, market-ready industrial products.
            </p>
            <div className="flex items-center space-x-6 mt-6 pt-6 border-t border-slate-200 clear-both">
              <a title="Google Scholar" href="https://scholar.google.com/citations?user=JFzGHMIAAAAJ" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-600 transition-all transform hover:scale-110"><ImGoogle className="text-lg" /></a>
              <a title="LinkedIn" href="https://www.linkedin.com/in/radha-krishna-pisip" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-600 transition-all transform hover:scale-110"><ImLinkedin className="text-lg" /></a>
              <a title="ORCID ID" href="https://orcid.org/0000-0001-8298-7571" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-600 transition-all transform hover:scale-110"><SiOrcid className="text-lg" /></a>
              <a title="Email" href="mailto:prkrishna@nitw.ac.in" className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-600 transition-all transform hover:scale-110"><FiMail className="text-lg" /></a>
            </div>
          </div>
        </div>
      </section>

      {/* MILESTONES SECTION */}
      <section className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 sm:mb-16 lg:mb-20 text-center">
            <div className="inline-block mb-3 sm:mb-4 px-4 py-2 bg-white border border-slate-200 rounded-full">
              <p className="text-slate-600 text-xs sm:text-sm font-bold uppercase tracking-wider">Highlights</p>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-4xl font-black text-slate-900">Our Achievements</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-20">
            {milestones.map((milestone, idx) => {
              const Icon = milestone.icon;
              return (
                <div 
                  key={idx} 
                  className="bg-white rounded-2xl p-8 sm:p-10 text-center border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 group cursor-pointer hover:scale-105 transform"
                >
                  <div className="flex justify-center mb-5 group-hover:scale-125 transition-transform duration-400">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full">
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 group-hover:rotate-12 transition-transform" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-3xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{milestone.number}</p>
                  <p className="font-bold text-slate-700 text-xs sm:text-sm uppercase tracking-wide leading-tight">{milestone.label}</p>
                </div>
              );
            })}
          </div>

          {/* Additional stats - without gradients */}
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <div className="relative group overflow-hidden rounded-2xl border border-blue-200 bg-blue-50 text-slate-900 p-8 sm:p-10 text-center transform hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-full mb-5 group-hover:bg-blue-100 transition-colors">
                  <FiTrendingUp className="w-7 h-7 text-blue-600 group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="text-lg sm:text-xl lg:text-2xl 2xl:text-xl font-bold mb-2 sm:mb-3 text-slate-900">10+ Years</h4>
                <p className="text-xs sm:text-sm lg:text-base text-slate-700 font-medium">Of excellence in mining innovation</p>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 text-slate-900 p-8 sm:p-10 text-center transform hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-emerald-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-full mb-5 group-hover:bg-emerald-100 transition-colors">
                  <FiUsers className="w-7 h-7 text-emerald-600 group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="text-lg sm:text-xl lg:text-2xl 2xl:text-xl font-bold mb-2 sm:mb-3 text-slate-900">500+</h4>
                <p className="text-xs sm:text-sm lg:text-base text-slate-700 font-medium">Skilled professionals and experts</p>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 text-slate-900 p-8 sm:p-10 text-center transform hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-amber-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-full mb-5 group-hover:bg-amber-100 transition-colors">
                  <FiAward className="w-7 h-7 text-amber-600 group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="text-lg sm:text-xl lg:text-2xl 2xl:text-xl font-bold mb-2 sm:mb-3 text-slate-900">Multiple</h4>
                <p className="text-xs sm:text-sm lg:text-base text-slate-700 font-medium">International awards and recognitions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION SECTION */}
      <section className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 bg-blue-600 text-white overflow-hidden border-t-4 border-blue-700">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white rounded-full blur-3xl opacity-30 animate-slow-drift"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white rounded-full blur-3xl opacity-30 animate-slow-drift" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-4xl font-black mb-4 sm:mb-6 leading-tight">Ready to Transform Mining?</h2>
          <p className="text-sm sm:text-base lg:text-lg mb-8 sm:mb-10 lg:mb-14 text-blue-100 font-medium max-w-2xl mx-auto leading-relaxed">
            Be part of the innovation in mining technology. Whether you're looking for solutions or career opportunities, we're excited to connect with you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/contact" className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 text-sm sm:text-base bg-white text-blue-600 font-bold rounded-full hover:bg-slate-100 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 transform hover:scale-105 active:scale-95">
              Contact Us Today
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/careers" className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 text-sm sm:text-base border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 active:scale-95">
              View Careers
              <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slowDrift {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(20px);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        .animate-slow-drift {
          animation: slowDrift 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}