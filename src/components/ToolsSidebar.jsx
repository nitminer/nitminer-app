"use client"

import Link from "next/link"
import { toolsData } from "@/data/toolsData"
import { FiChevronRight } from "react-icons/fi"

export function ToolsSidebar({ activeToolId = null }) {
  return (
    <aside className="w-full md:w-64 bg-white dark:bg-gray-900 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 fixed sticky bottom-0">
      <div className="p-4 md:p-6 fixed">
        <h2 className="text-xl font-bold text-black dark:text-white mb-6">
          Our Tools
        </h2>
        <nav className="space-y-2">
          {toolsData.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.id}`}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                activeToolId === tool.id
                  ? "bg-blue-600 text-white dark:bg-blue-700"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <span className="font-medium text-sm">{tool.name}</span>
              <FiChevronRight size={16} className="opacity-75" />
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
