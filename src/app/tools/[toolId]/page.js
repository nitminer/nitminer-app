import Header from "@/components/Header";
import { ToolsSidebar } from "@/components/ToolsSidebar";
import { ToolDetailComponent } from "@/components/ToolDetailComponent";
import { Footer } from "@/components/Footer";
import { getToolById, getAllToolIds } from "@/data/toolsData";

export async function generateStaticParams() {
  return getAllToolIds().map((id) => ({
    toolId: id,
  }))
}

export async function generateMetadata({ params }) {
  const { toolId } = await params
  const tool = getToolById(toolId)
  return {
    title: tool ? tool.name : "Tool Not Found",
    description: tool ? tool.description : "Tool details",
  }
}

export default async function ToolPage({ params }) {
  const { toolId } = await params
  const tool = getToolById(toolId)

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black font-sans">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="fixed left-0 top-0 h-screen pt-20 w-full md:w-64 overflow-y-auto z-40 md:relative md:pt-0 hidden md:block">
          <ToolsSidebar activeToolId={toolId} />
        </div>
        <main className="flex-1 overflow-y-auto md:ml-0">
          <ToolDetailComponent tool={tool} />
        </main>
      </div>
    </div>
  )
}
