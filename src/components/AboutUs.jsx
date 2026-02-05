"use client"

import { FiShield, FiCpu, FiCode, FiCloud } from "react-icons/fi"

const features = [
  {
    icon: FiShield,
    title: "Blockchain Excellence",
    description: "Industry-leading blockchain development and smart contract solutions for secure decentralized applications."
  },
  {
    icon: FiCpu,
    title: "AI & ML Solutions",
    description: "Advanced artificial intelligence and machine learning applications for business optimization and automation."
  },
  {
    icon: FiCloud,
    title: "Cloud Services",
    description: "Scalable and secure cloud infrastructure solutions for modern enterprise needs."
  },
  {
    icon: FiCode,
    title: "Security First",
    description: "Enterprise-grade security and compliance solutions ensuring the highest standards of protection."
  }
]

const services = [
  {
    title: "Licensing Solutions",
    description: "Complete software licensing and certification services for blockchain applications, ensuring compliance and security."
  },
  {
    title: "Blockchain Development",
    description: "End-to-end blockchain solutions including smart contracts, DApps, and decentralized systems development."
  },
  {
    title: "AI & ML Solutions",
    description: "Advanced artificial intelligence and machine learning solutions for business optimization and automation."
  }
]

const products = [
  {
    badge: "Featured",
    badgeColor: "bg-blue-600",
    title: "TrustInn Platform",
    description: "Advanced security platform for blockchain applications, providing comprehensive testing and certification for smart contracts with enterprise-grade security features.",
    tags: ["Security Testing", "Smart Contracts", "Automation", "Compliance"]
  },
  {
    badge: "New",
    badgeColor: "bg-green-600",
    title: "Smart Contract Suite",
    description: "Comprehensive suite of tools for developing, testing, and deploying secure smart contracts across multiple blockchain platforms with integrated CI/CD pipelines.",
    tags: ["Development", "Testing Tools", "Multi-Chain", "CI/CD"]
  }
]

export function AboutUs() {
  return (
    <>
      
      <section className="w-full py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-black" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full mb-6">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              <span className="text-sm font-bold text-blue-900 dark:text-blue-300 tracking-wide uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                About Us
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Leading Technology <span className="text-blue-600 dark:text-blue-400">Innovators</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed">
              <span className="font-black text-gray-900 dark:text-white">NITMINER Technologies</span> is at the forefront of blockchain and AI innovation, delivering cutting-edge solutions that transform businesses and drive digital evolution.
            </p>
          </div>

          {/* Vision & Mission */}
          <div className="mb-20 grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    OUR VISION
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                    "To revolutionize the blockchain ecosystem by becoming the leader in smart contract testing automation, ensuring security, efficiency, and trust in decentralized applications across industries in India."
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 rounded-2xl p-8 border-2 border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 bg-purple-600 dark:bg-purple-500 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    OUR MISSION
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                    "At NITMINER, we aim to empower blockchain developers and enterprises by delivering cutting-edge automated testing solutions for smart contracts. Our mission is to enhance the reliability and performance of smart contracts through seamless, scalable, and highly secure testing processes."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Company Description */}
          <div className="mb-20">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-black mb-6 text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Who We Are
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 font-medium leading-relaxed mb-4">
                Founded with a vision to revolutionize technology solutions, <span className="font-black text-gray-900 dark:text-white">NITMINER Technologies</span> combines academic excellence with industry expertise to deliver innovative solutions that solve real-world challenges.
              </p>
            </div>
          </div>

          {/* Core Services */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black mb-4 text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Our Core <span className="text-blue-600 dark:text-blue-400">Expertise</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                Comprehensive technology solutions designed to help businesses thrive
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border-2 border-gray-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div className="flex items-center justify-center w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-4">
                      <Icon size={28} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-black mb-3 text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Our Services */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black mb-4 text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Comprehensive Technology <span className="text-blue-600 dark:text-blue-400">Solutions</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                We offer a wide range of technology services
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800 p-8 rounded-2xl border-2 border-gray-200 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300">
                  <h3 className="text-xl font-black mb-4 text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {service.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Our Products */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black mb-4 text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Innovative Technology <span className="text-blue-600 dark:text-blue-400">Products</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                Discover our flagship products designed to solve complex business challenges
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {products.map((product, index) => (
                <div key={index} className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border-2 border-gray-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-2xl">
                  <div className="flex items-start gap-4 mb-4">
                    <span className={`px-3 py-1 ${product.badgeColor} text-white text-xs font-black rounded-lg uppercase tracking-wide`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {product.badge}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-black mb-4 text-gray-900 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {product.title}
                  </h3>
                  
                  <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed mb-6">
                    {product.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 text-xs font-bold rounded-lg border border-blue-200 dark:border-blue-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-10 md:p-16 text-center text-white shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Ready to Transform Your Business?
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-95 font-medium max-w-2xl mx-auto">
              Let's collaborate to build innovative solutions for your challenges with cutting-edge technology
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-black hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 border-2 border-white" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.5px' }}>
                GET STARTED TODAY
              </button>
              <button className="bg-transparent text-white px-8 py-4 rounded-xl font-bold border-2 border-white hover:bg-white/10 transition-all duration-300" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.5px' }}>
                LEARN MORE
              </button>
            </div>
          </div>
        </div>
       
      </section>
    </>
  )
}