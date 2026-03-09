import React from 'react';

export const PageSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="col-span-2 h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    </div>
  </div>
);

export const GallerySkeleton = () => (
  <div className="animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      ))}
    </div>
  </div>
);

export const ChatSkeleton = () => (
  <div className="animate-pulse space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2"></div>
      </div>
    ))}
  </div>
);
