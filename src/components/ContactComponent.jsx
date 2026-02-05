"use client"

import { FiMapPin, FiPhone, FiMail, FiArrowRight } from "react-icons/fi"
import { useState } from "react"
import Header from "./Header"

export function ContactComponent() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    setSubmitted(true)
    setFormData({ name: "", email: "", message: "" })
    
    setTimeout(() => setSubmitted(false), 3000)
  }

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
              Get In Touch
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto font-medium">
              Have questions about our solutions? Let's connect and discuss how we can help.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form Section */}
            <div>
              <h2 className="text-3xl font-black text-black dark:text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                We Want to Hear From You!
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-8 font-medium leading-relaxed">
                Would you like to learn more about what we do? Do you have a project you'd like to discuss? Please submit your response and we'll contact you shortly.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-black dark:text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-black dark:text-white placeholder-gray-500"
                    placeholder="Your name"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-black dark:text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-black dark:text-white placeholder-gray-500"
                    placeholder="your.email@example.com"
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-black dark:text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-black dark:text-white placeholder-gray-500 resize-none"
                    placeholder="Tell us about your project or inquiry..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Send Message
                  <FiArrowRight size={20} />
                </button>

                {/* Success Message */}
                {submitted && (
                  <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-800 dark:text-green-200 font-medium">
                    ✓ Thank you! We've received your message and will contact you soon.
                  </div>
                )}
              </form>
            </div>

            {/* Contact Information Section */}
            <div>
              <h2 className="text-3xl font-black text-black dark:text-white mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Contact Information
              </h2>

              {/* Branch Address */}
              <div className="mb-6 p-6 bg-gray-50 dark:bg-zinc-900 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex-shrink-0">
                    <FiMapPin size={24} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-black dark:text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      Branch Address
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                      NITMINER TECHNOLOGIES PRIVATE LIMITED
                      <br />
                      NIT Campus, Hanamkonda
                      <br />
                      Telangana 506004, India
                    </p>
                  </div>
                </div>
              </div>

              {/* Registered Address */}
              <div className="mb-6 p-6 bg-gray-50 dark:bg-zinc-900 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex-shrink-0">
                    <FiMapPin size={24} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-black dark:text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      Registered Address
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                      NITMINER TECHNOLOGIES PRIVATE LIMITED
                      <br />
                      B-201, IBITF Office IIT Bhilal GEC Campus
                      <br />
                      Sejhbahar, Raipur
                      <br />
                      Chattisgarh, India - 492015
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="mb-6 p-6 bg-gray-50 dark:bg-zinc-900 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex-shrink-0">
                    <FiPhone size={24} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-black dark:text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      Phone
                    </h3>
                    <a
                      href="tel:+917013306805"
                      className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                    >
                      +91 7013306805
                    </a>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="p-6 bg-gray-50 dark:bg-zinc-900 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex-shrink-0">
                    <FiMail size={24} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-black dark:text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      Email
                    </h3>
                    <a
                      href="mailto:sanghu@nitw.ac.in"
                      className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                    >
                      sanghu@nitw.ac.in
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details Section */}
          <div className="mt-20 mb-20">
            <h2 className="text-3xl font-black text-black dark:text-white mb-12 text-center" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Bank Details
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Bank Information */}
              <div className="p-8 bg-blue-50 dark:bg-zinc-900 rounded-2xl">
                <h3 className="text-xl font-black text-black dark:text-white mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Bank Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">Bank Name</p>
                    <p className="text-lg font-bold text-black dark:text-white">State Bank of India (SBI)</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">Branch</p>
                    <p className="text-black dark:text-white font-medium">NIT Campus, Warangal, Telangana – 506003</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">Branch Code</p>
                    <p className="text-black dark:text-white font-mono font-bold">20149</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">IFSC Code</p>
                    <p className="text-black dark:text-white font-mono font-bold">SBIN0020149</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">MICR Code</p>
                    <p className="text-black dark:text-white font-mono font-bold">506002030</p>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="p-8 bg-purple-50 dark:bg-zinc-900 rounded-2xl">
                <h3 className="text-xl font-black text-black dark:text-white mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Account Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">Account Type</p>
                    <p className="text-black dark:text-white font-medium">CA-Regular-Pub-Oth-All-INR</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">Currency</p>
                    <p className="text-black dark:text-white font-bold">INR</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">Account Status</p>
                    <p className="text-green-600 dark:text-green-400 font-bold text-lg">✓ Open</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">CIF Number</p>
                    <p className="text-black dark:text-white font-mono font-bold">91001198843</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">Account Number</p>
                    <p className="text-black dark:text-white font-mono font-bold">41151567404</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Contact */}
            <div className="mt-8 p-6 bg-gray-50 dark:bg-zinc-900 rounded-2xl">
              <h3 className="text-lg font-black text-black dark:text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Bank Contact
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-2">Branch Email</p>
                  <a
                    href="mailto:SBI.20149@SBI.CO.IN"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-bold break-all"
                  >
                    SBI.20149@SBI.CO.IN
                  </a>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-2">Contact Person Email</p>
                  <a
                    href="mailto:sanghu@nitw.ac.in"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                  >
                    sanghu@nitw.ac.in
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Our Location Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-black text-black dark:text-white mb-12 text-center" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Our Location
            </h2>
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d60718.35386415014!2d79.530839!3d17.983523!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a334fbb37aee6c3%3A0xf1b2c37fcb8fefce!2sNIT%20Warangal!5e0!3m2!1sen!2sus!4v1769363731906!5m2!1sen!2sus"
                width="100%"
                height="600"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}