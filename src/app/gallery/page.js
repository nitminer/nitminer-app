import { Suspense } from "react"
import { GalleryComponent } from "@/components/GalleryComponent"
import { GallerySkeleton } from "@/components/LoadingSkeletons"

export const metadata = {
  title: "Gallery - NITMiner Technologies",
  description: "Explore our gallery showcasing our team, workspace, and amazing projects.",
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<GallerySkeleton />}>
      <GalleryComponent />
    </Suspense>
  )
}
