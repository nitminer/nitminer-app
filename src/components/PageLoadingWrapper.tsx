'use client';

import React, { Suspense } from 'react';
import { PageSkeleton, DashboardSkeleton, GallerySkeleton } from './LoadingSkeletons';

export function PageLoadingWrapper({ children, variant = 'page' }) {
  const skeletons = {
    page: <PageSkeleton />,
    dashboard: <DashboardSkeleton />,
    gallery: <GallerySkeleton />,
  };

  return (
    <Suspense fallback={skeletons[variant] || <PageSkeleton />}>
      {children}
    </Suspense>
  );
}

export function withPageLoading(Component, variant = 'page') {
  return function LoadingComponent(props) {
    return (
      <PageLoadingWrapper variant={variant}>
        <Component {...props} />
      </PageLoadingWrapper>
    );
  };
}
