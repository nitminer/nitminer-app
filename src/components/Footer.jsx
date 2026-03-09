"use client"

import { useState, useEffect } from "react"
import { FiMail, FiPhone, FiGithub, FiLinkedin, FiTwitter, FiFacebook, FiInstagram } from "react-icons/fi"

export function Footer() {
  const [mounted, setMounted] = useState(false)
  const currentYear = new Date().getFullYear()
  const isLight = true // Force light theme only

  useEffect(() => {
    setMounted(true)
  }, [])

  const socialLinks = [
    {
      icon: FiGithub,
      href: "https://github.com/nitminer",
      label: "GitHub",
      color: "text-gray-800"
    },
    {
      icon: FiLinkedin,
      href: "https://www.linkedin.com/company/nitminer-technologies-private-limited/",
      label: "LinkedIn",
      color: "text-blue-600"
    },
    {
      icon: FiTwitter,
      href: "https://twitter.com/nitminer",
      label: "Twitter",
      color: "text-blue-500"
    },
    {
      icon: FiFacebook,
      href: "https://www.facebook.com/people/NITMiner-Technologies-Private-Limited/61580007262758/?rdid=Ms0hjbRLTt0U3Kze&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1DBwaWoBbi%2F",
      label: "Facebook",
      color: "text-blue-700"
    },
    {
      icon: FiInstagram,
      href: "https://www.instagram.com/nitminer_technologies_pvt_ltd",
      label: "Instagram",
      color: "text-pink-600"
    }
  ]

  return (
    <>
      
      <footer 
        className={`w-full overflow-x-hidden transition-colors duration-500 ${isLight ? 'bg-white text-gray-900' : 'bg-black text-white'}`}
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-6 lg:gap-12 py-12 sm:py-16 lg:py-20">
            {/* Company Info */}
            <div className="text-center sm:text-left">
              <h3 
                className={`text-lg sm:text-xl font-black mb-3 sm:mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                NitMiner Technologies
              </h3>
              <p className={`text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed font-medium max-w-xs mx-auto sm:mx-0 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                Pioneering innovation in Blockchain, AI, and Cloud Solutions. Bridging academic research with industrial applications.
              </p>
              <div className={`text-xs sm:text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                <p className={`font-bold mb-1 ${isLight ? 'text-gray-900' : 'text-white'}`}>NITW Incubated</p>
                <p className="font-medium">Innovation hub at NIT Warangal</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="text-center sm:text-left">
              <h3 
                className={`text-lg sm:text-xl font-black mb-3 sm:mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Get In Touch
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className={`flex items-center gap-2 sm:gap-3 justify-center sm:justify-start text-xs sm:text-base ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  <FiMail className={`flex-shrink-0 ${isLight ? 'text-indigo-600' : 'text-blue-400'}`} size={18} />
                  <div className="min-w-0">
                    <p className={`text-xs sm:text-sm font-semibold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Email</p>
                    <a 
                      href="mailto:sanghu@nitw.ac.in"
                      className={`transition-colors font-medium text-xs sm:text-sm truncate ${isLight ? 'text-gray-900 hover:text-indigo-600' : 'text-white hover:text-blue-400'}`}
                    >
                      sanghu@nitw.ac.in
                    </a>
                  </div>
                </div>
                <div className={`flex items-center gap-2 sm:gap-3 justify-center sm:justify-start text-xs sm:text-base ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  <FiPhone className={`flex-shrink-0 ${isLight ? 'text-indigo-600' : 'text-blue-400'}`} size={18} />
                  <div className="min-w-0">
                    <p className={`text-xs sm:text-sm font-semibold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Phone</p>
                    <a 
                      href="tel:+917013306805"
                      className={`transition-colors font-medium text-xs sm:text-sm ${isLight ? 'text-gray-900 hover:text-indigo-600' : 'text-white hover:text-blue-400'}`}
                    >
                      +91-7013306805
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="text-center sm:text-left col-span-1 sm:col-span-2 lg:col-span-1">
              <h3 
                className={`text-lg sm:text-xl font-black mb-3 sm:mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Follow Us
              </h3>
              <p className={`text-xs sm:text-sm mb-4 sm:mb-6 font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Connect on social media</p>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className={`p-2.5 sm:p-3 rounded-lg transition-all duration-300 hover:scale-110 transform flex-shrink-0 ${isLight ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-800 hover:bg-gray-700'}`}
                    >
                      <Icon size={18} className={social.color} />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className={`h-px ${isLight ? 'bg-gray-300' : 'bg-gray-800'}`}></div>

          {/* Bottom Footer */}
          <div className={`py-6 sm:py-8 lg:py-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            <p className="text-xs sm:text-sm font-medium order-2 sm:order-1">
              © {currentYear} NITMiner Technologies Pvt Ltd. All rights reserved.
            </p>
            <div className={`flex gap-4 sm:gap-6 text-xs sm:text-sm font-medium order-1 sm:order-2 flex-wrap justify-center sm:justify-start ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              <a href="/" className={`transition-colors ${isLight ? 'hover:text-gray-900' : 'hover:text-white'}`}>Privacy Policy</a>
              <a href="/" className={`transition-colors ${isLight ? 'hover:text-gray-900' : 'hover:text-white'}`}>Terms</a>
              <a href="/contact" className={`transition-colors ${isLight ? 'hover:text-gray-900' : 'hover:text-white'}`}>Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}