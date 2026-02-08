"use client"

import { FiMail, FiPhone, FiGithub, FiLinkedin, FiTwitter, FiFacebook, FiInstagram } from "react-icons/fi"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    {
      icon: FiGithub,
      href: "https://github.com/nitminer",
      label: "GitHub"
    },
    {
      icon: FiLinkedin,
      href: "https://www.linkedin.com/company/nitminer-technologies-private-limited/",
      label: "LinkedIn"
    },
    {
      icon: FiTwitter,
      href: "https://twitter.com/nitminer",
      label: "Twitter"
    },
    {
      icon: FiFacebook,
      href: "https://www.facebook.com/people/NITMiner-Technologies-Private-Limited/61580007262758/?rdid=Ms0hjbRLTt0U3Kze&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1DBwaWoBbi%2F",
      label: "Facebook"
    },
    {
      icon: FiInstagram,
      href: "https://www.instagram.com/nitminer_technologies_pvt_ltd",
      label: "Instagram"
    }
  ]

  return (
    <>
      
      <footer 
        className="w-full bg-white dark:bg-black text-gray-900 dark:text-white overflow-x-hidden"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-6 lg:gap-12 py-12 sm:py-16 lg:py-20">
            {/* Company Info */}
            <div className="text-center sm:text-left">
              <h3 
                className="text-lg sm:text-xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                NitMiner Technologies
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 leading-relaxed font-medium max-w-xs mx-auto sm:mx-0">
                Pioneering innovation in Blockchain, AI, and Cloud Solutions. Bridging academic research with industrial applications.
              </p>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <p className="font-bold text-gray-900 dark:text-white mb-1">NITW Incubated</p>
                <p className="font-medium">Innovation hub at NIT Warangal</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="text-center sm:text-left">
              <h3 
                className="text-lg sm:text-xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Get In Touch
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 sm:gap-3 justify-center sm:justify-start text-xs sm:text-base">
                  <FiMail className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={18} />
                  <div className="min-w-0">
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-semibold">Email</p>
                    <a 
                      href="mailto:sanghu@nitw.ac.in"
                      className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-xs sm:text-sm truncate"
                    >
                      sanghu@nitw.ac.in
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 justify-center sm:justify-start text-xs sm:text-base">
                  <FiPhone className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={18} />
                  <div className="min-w-0">
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-semibold">Phone</p>
                    <a 
                      href="tel:+917013306805"
                      className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-xs sm:text-sm"
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
                className="text-lg sm:text-xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Follow Us
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 font-medium">Connect on social media</p>
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
                      className="p-2.5 sm:p-3 bg-gray-100 dark:bg-gray-800 hover:bg-blue-600 dark:hover:bg-blue-600 text-gray-900 dark:text-white hover:text-white rounded-lg transition-all duration-300 hover:scale-110 transform flex-shrink-0"
                    >
                      <Icon size={18} />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 dark:bg-gray-800"></div>

          {/* Bottom Footer */}
          <div className="py-6 sm:py-8 lg:py-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium order-2 sm:order-1">
              © {currentYear} NITMiner Technologies Pvt Ltd. All rights reserved.
            </p>
            <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium order-1 sm:order-2 flex-wrap justify-center sm:justify-start">
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms</a>
              <a href="/contact" className="hover:text-gray-900 dark:hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}