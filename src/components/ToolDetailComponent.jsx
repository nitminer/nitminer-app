"use client"

import { FiCheck, FiCode, FiTarget } from "react-icons/fi"

export function ToolDetailComponent({ tool }) {
  if (!tool) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 dark:text-gray-400">Tool not found</p>
      </div>
    )
  }

  return (
    <section className="w-full py-8 md:py-16 bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4">
            {tool.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            {tool.description}
          </p>
        </div>

        {/* Image */}
        {tool.image && (
          <div className="mb-12 animate-fadeIn">
            <img
              src={tool.image}
              alt={tool.name}
              className="w-full h-96 object-contain rounded-lg border border-gray-200 dark:border-gray-800 shadow-lg"
            />
          </div>
        )}

        {/* Detailed Description */}
        {tool.detailedDescription && (
          <div className="mb-12 animate-fadeIn p-6 bg-blue-50 dark:bg-gray-900 border border-blue-200 dark:border-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
              About {tool.name}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {tool.detailedDescription}
            </p>
          </div>
        )}

        {/* Quick Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="animate-fadeIn p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h3 className="flex items-center gap-2 text-lg font-bold text-black dark:text-white mb-4">
              <FiCode size={20} />
              Supported Languages
            </h3>
            <div className="space-y-2">
              {tool.languages.map((lang, index) => (
                <div key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {lang}
                </div>
              ))}
            </div>
          </div>

          <div className="animate-fadeIn p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h3 className="flex items-center gap-2 text-lg font-bold text-black dark:text-white mb-4">
              <FiTarget size={20} />
              Analysis Methods
            </h3>
            <div className="space-y-2">
              {tool.methods.map((method, index) => (
                <div key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  {method}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-12 animate-fadeIn">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {tool.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
              >
                <FiCheck className="text-green-500 flex-shrink-0 mt-1" size={20} />
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-12 animate-fadeIn">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
            Use Cases
          </h2>
          <div className="space-y-4">
            {tool.useCases.map((useCase, index) => (
              <div
                key={index}
                className="p-4 bg-blue-50 dark:bg-gray-900 border-l-4 border-blue-600 dark:border-blue-400 rounded"
              >
                <p className="text-gray-700 dark:text-gray-300">
                  {useCase}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="animate-fadeIn bg-blue-600 dark:bg-blue-900 rounded-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Use {tool.name}?
          </h3>
          <p className="mb-6 text-blue-100">
            Get in touch with our team to request a license or demo
          </p>
          <a
            href="mailto:sanghu@nitw.ac.in"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            Request Access
          </a>
        </div>
      </div>
    </section>
  )
}
