"use client"

import * as React from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image"

const carouselImages = [
  {
    src: "/images/carousel/image copy.png",
    alt: "Carousel Image 2",
    title: "Innovation at Its Peak",
    description: "Cutting-edge solutions for modern challenges"
  },
  {
    src: "/images/carousel/image.png",
    alt: "Carousel Image 1",
    title: "Discover Excellence",
    description: "Experience the best of what we have to offer"
  },
  
  {
    src: "/images/carousel/image copy 2.png",
    alt: "Carousel Image 3",
    title: "Quality Assured",
    description: "Premium quality products and services"
  }
]

export function ImageCarousel() {
  const [current, setCurrent] = React.useState(0)
  const [api, setApi] = React.useState()

  React.useEffect(() => {
    if (!api) return

    const timer = setInterval(() => {
      api.scrollNext()
    }, 5000)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })

    return () => clearInterval(timer)
  }, [api])

  return (
    <div className="w-full px-4 py-8 md:px-8 md:py-12">
      <Carousel
        setApi={setApi}
        className="w-full"
      >
        <CarouselContent>
          {carouselImages.map((image, index) => (
            <CarouselItem key={index} className="relative">
              <div className="relative w-full h-96 md:h-[600px] overflow-hidden rounded-lg group">
                {/* Image */}
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                  priority={index === 0}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-70 transition-opacity" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white">
                  <h2 className="text-2xl md:text-4xl font-bold mb-2 animate-fade-in">
                    {image.title}
                  </h2>
                  <p className="text-sm md:text-lg text-gray-200 max-w-2xl animate-fade-in-delayed">
                    {image.description}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Buttons */}
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 border-0 text-white hover:text-white transition-all" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 border-0 text-white hover:text-white transition-all" />

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                current === index
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/75"
              }`}
              onClick={() => api?.scrollSnapToIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>

      {/* Slide Counter */}
      {/* <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
        Slide {current + 1} of {carouselImages.length}
      </div> */}
    </div>
  )
}
