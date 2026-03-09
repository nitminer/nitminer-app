'use client';

export default function HeroVideo() {
  return (
    <div className="relative w-full max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl">
      {/* Decorative elements - Responsive sizes */}
      <div className="absolute -top-3 sm:-top-4 -left-3 sm:-left-4 w-36 sm:w-48 md:w-56 lg:w-72 h-36 sm:h-48 md:h-56 lg:h-72 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute -bottom-6 sm:-bottom-8 -right-3 sm:-right-4 w-36 sm:w-48 md:w-56 lg:w-72 h-36 sm:h-48 md:h-56 lg:h-72 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2"></div>
      
      <div className="relative z-10">
        <video
          width={600}
          height={600}
          className="w-full h-auto rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl"
          controls
          autoPlay
          muted
          loop
          poster="/images/hero/hero.png"
        >
          <source src="/video/demovideo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
