"use client"

import { useState } from "react"
import { FiChevronRight, FiTool, FiPackage } from "react-icons/fi"

export function TrustInnComponent() {
  const [expandedCategory, setExpandedCategory] = useState("nitminer")

  const trustinnTools = [
    "MC/DC-CBMC",
    "SC-MCC-CBMC",
    "AV-AFL",
    "SSG-AFL",
    "UMASK-AFL",
    "SC-MCC-Fuzz",
    "SC-MCC-KLEE",
    "SC-MCC-TX",
    "VeriCombTest",
    "gMutant",
    "KLEEMA",
    "MuFuzzLEE",
    "gMCov"
  ]

  const opensourceTools = [
    "C-lang",
    "Framma-C",
    "CBMC",
    "LL-BMC",
    "AFL",
    "KLEE",
    "Tracer-X",
    "PICT"
  ]

  const ToolItem = ({ tool }) => (
    <div className="animate-fadeIn">
      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
        <span className="text-gray-700 dark:text-gray-300">{tool}</span>
      </div>
    </div>
  )

  const ToolCategory = ({ title, tools, icon: Icon, categoryId }) => (
    <div className="animate-fadeIn">
      <button
        onClick={() => setExpandedCategory(expandedCategory === categoryId ? null : categoryId)}
        className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-3">
          <Icon size={24} className="text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-black dark:text-white">
            {title}
          </h3>
          <span className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full">
            {tools.length}
          </span>
        </div>
        <FiChevronRight
          size={20}
          className={`text-gray-400 transition-transform ${
            expandedCategory === categoryId ? "rotate-90" : ""
          }`}
        />
      </button>

      {expandedCategory === categoryId && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 grid md:grid-cols-2 gap-2 animate-slideDown">
          {tools.map((tool, index) => (
            <ToolItem key={index} tool={tool} />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <section className="w-full py-16 md:py-24 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black dark:text-white">
            About TrustInn Tool
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We have developed a tool to analyse the smart contracts
          </p>
        </div>

        {/* Introduction */}
        <div className="mb-16 animate-fadeIn">
          <div className="bg-blue-50 dark:bg-gray-900 border border-blue-200 dark:border-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
              What is TrustInn?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              TrustInn is a research-oriented tool. It comprises both static and dynamic analysis such as bounded Model checking, fuzzing, dynamic symbolic execution, mutation testing etc. Currently, it supports C, Python and solidity languages. The testing tools are developed in Virtual Box. We supply licenses of our developed tools along with other open source tools to the customers.
            </p>
          </div>
        </div>

        {/* VeriSol Description */}
        <div className="mb-16 animate-fadeIn">
          <div className="bg-purple-50 dark:bg-gray-900 border border-purple-200 dark:border-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
              VeriSol - Smart Contract Verification
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              VeriSol is a tool, developed to verify the smart contract and measure condition coverage. Along with it we have developed a tool to automatically repair the smart contract by eliminating the dead conditions. Apart from it we have decided to extend the work and develop an umbrella tool containing many sub-tools which were well researched by the team. These ideas we have implemented looking at the use requirements.
            </p>
          </div>
        </div>

        {/* Tools Section */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-black dark:text-white mb-8 animate-fadeIn">
            TrustInn Tools & Technologies
          </h2>

          <div className="space-y-6">
            <ToolCategory
              title="NitMiner Developed Tools"
              tools={trustinnTools}
              icon={FiTool}
              categoryId="nitminer"
            />
            <ToolCategory
              title="Open-source Tools"
              tools={opensourceTools}
              icon={FiPackage}
              categoryId="opensource"
            />
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <div className="animate-fadeIn p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-black dark:text-white mb-3">
              Supported Languages
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-700 dark:text-gray-300">C</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-700 dark:text-gray-300">Java</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-700 dark:text-gray-300">Python</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-700 dark:text-gray-300">Solidity</span>
              </div>
            </div>
          </div>

          <div className="animate-fadeIn p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-black dark:text-white mb-3">
              Analysis Methods
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span className="text-gray-700 dark:text-gray-300">Bounded Model Checking</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span className="text-gray-700 dark:text-gray-300">Fuzzing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span className="text-gray-700 dark:text-gray-300">Dynamic Symbolic Execution</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span className="text-gray-700 dark:text-gray-300">Mutation Testing</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-blue-600 dark:bg-blue-900 rounded-lg p-8 text-center animate-fadeIn">
          <h3 className="text-2xl font-bold text-white mb-4">
            Interested in TrustInn?
          </h3>
          <p className="text-blue-100 mb-6">
            Get in touch with our team to learn more about our smart contract testing and verification tools
          </p>
          <a
            href="mailto:sanghu@nitw.ac.in"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  )
}
