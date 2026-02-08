"use client"

import { useState } from "react"
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi"
import Header from "./Header"

export function GalleryComponent() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const images = [
    {
      id: 1,
      title: "Team Collaboration",
      src: "/images/Gallery/G1.png",
    },
    {
      id: 2,
      title: "Tech Innovation",
      src: "/images/Gallery/G2.png",
    },
    {
      id: 3,
      title: "Code Development",
      src: "/images/Gallery/G3.png",
    },
    {
      id: 4,
      title: "Office Environment",
      src: "/images/Gallery/G4.png",
    },
    {
      id: 5,
      title: "Team Meeting",
      src: "/images/Gallery/G5.png",
    },
    {
      id: 6,
      title: "Workshop Session",
      src: "/images/Gallery/G6.png",
    },
    {
      id: 7,
      title: "Creative Process",
      src: "/images/Gallery/G7.png",
    },
    {
      id: 8,
      title: "Project Discussion",
      src: "/images/Gallery/G8.png",
    },
    {
      id: 9,
      title: "Coding Session",
      src: "/images/Gallery/G9.png",
    },
    {
      id: 10,
      title: "Development Lab",
      src: "/images/Gallery/G10.jpg",
    },
    {
      id: 11,
      title: "Team Building",
      src: "/images/Gallery/G11.jpg",
    },
    {
      id: 12,
      title: "Technology Stack",
      src: "/images/Gallery/G12.jpg",
    },
    {
      id: 13,
      title: "Innovation Hub",
      src: "/images/Gallery/G13.jpg",
    },
    {
      id: 14,
      title: "Brainstorming",
      src: "/images/Gallery/G14.jpg",
    },
    {
      id: 15,
      title: "Team Success",
      src: "/images/Gallery/G15.jpg",
    },
    {
      id: 16,
      title: "Digital Solutions",
      src: "/images/Gallery/G16.jpg",
    },
  ]

  const openLightbox = (index) => {
    setSelectedImage(images[index])
    setCurrentIndex(index)
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
    setSelectedImage(images[newIndex])
    setCurrentIndex(newIndex)
  }

  const goToNext = () => {
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1
    setSelectedImage(images[newIndex])
    setCurrentIndex(newIndex)
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
      `}</style>

      <section className="w-full bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-black" style={{ fontFamily: 'Inter, system-ui, sans-serif' }} suppressHydrationWarning>
        <Header/>
        
        {/* Hero Section */}
        <div className="py-16 md:py-24 bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }} suppressHydrationWarning>
              Our Gallery
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto font-medium">
              Explore our team, workspace, and the amazing projects we've accomplished together.
            </p>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {images.map((image, index) => (
              <div
                key={image.id}
                onClick={() => openLightbox(index)}
                className="group cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-gray-200 dark:bg-zinc-800"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={image.src}
                    alt={image.title}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full bg-gray-300 dark:bg-zinc-700"><span class="text-gray-500 dark:text-gray-400 font-bold">Image not available</span></div>';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white font-black text-center px-4 text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        {image.title}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lightbox Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <div
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2"
                aria-label="Close lightbox"
              >
                <FiX size={32} />
              </button>

              {/* Image */}
              <div className="relative flex-1 flex items-center justify-center overflow-hidden rounded-2xl bg-white/5 min-h-[400px]">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  className="max-w-full max-h-[70vh] object-contain"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNhYWEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
              </div>

              {/* Title */}
              <p className="text-white text-center mt-6 text-xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {selectedImage.title}
              </p>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={goToPrevious}
                  className="text-white hover:text-gray-300 transition-colors p-3 rounded-full bg-white/10 hover:bg-white/20"
                  aria-label="Previous image"
                >
                  <FiChevronLeft size={32} />
                </button>

                <span className="text-white text-sm font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {currentIndex + 1} / {images.length}
                </span>

                <button
                  onClick={goToNext}
                  className="text-white hover:text-gray-300 transition-colors p-3 rounded-full bg-white/10 hover:bg-white/20"
                  aria-label="Next image"
                >
                  <FiChevronRight size={32} />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  )
}
