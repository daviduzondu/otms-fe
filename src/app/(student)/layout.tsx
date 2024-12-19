'use client'

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import GlobalErrorFallback from "../../components/errors/global-error-fallback";

export default function TestLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
 return <ErrorBoundary FallbackComponent={GlobalErrorFallback}>
  <Suspense fallback={<div>Loading...</div>}>
   {children}
  </Suspense>
 </ErrorBoundary>
}