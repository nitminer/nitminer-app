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
        className="w-full bg-white dark:bg-black text-gray-900 dark:text-white"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-3 gap-12 py-16">
            {/* Company Info */}
            <div>
              <h3 
                className="text-xl font-black mb-4 text-gray-900 dark:text-white"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                NitMiner Technologies Pvt Ltd.
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed font-medium">
                Pioneering innovation in Blockchain, AI, and Cloud Solutions. Bridging academic research with industrial applications.
              </p>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="font-bold text-gray-900 dark:text-white mb-2">NITW Incubated</p>
                <p className="font-medium">Innovation hub at NIT Warangal</p>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 
                className="text-xl font-black mb-4 text-gray-900 dark:text-white"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Get In Touch
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FiMail className="text-blue-600 dark:text-blue-400" size={20} />
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold">Email</p>
                    <a 
                      href="mailto:sanghu@nitw.ac.in"
                      className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                    >
                      sanghu@nitw.ac.in
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiPhone className="text-blue-600 dark:text-blue-400" size={20} />
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold">Phone</p>
                    <a 
                      href="tel:+917013306805"
                      className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                    >
                      +91-7013306805
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 
                className="text-xl font-black mb-4 text-gray-900 dark:text-white"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Follow Us
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium">Connect with us on social media</p>
              <div className="flex flex-wrap gap-4">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-blue-600 dark:hover:bg-blue-600 text-gray-900 dark:text-white hover:text-white rounded-lg transition-all duration-300 hover:scale-110 transform"
                    >
                      <Icon size={20} />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 dark:bg-gray-800"></div>

          {/* Bottom Footer */}
          <div className="py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 dark:text-gray-400 text-center md:text-left font-medium">
              © {currentYear} NITMiner Technologies Pvt Ltd. All rights reserved.
            </p>
            <div className="flex gap-6 text-gray-600 dark:text-gray-400 text-sm font-medium">
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms of Service</a>
              <a href="/contact" className="hover:text-gray-900 dark:hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}