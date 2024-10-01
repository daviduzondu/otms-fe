'use client'

import { Suspense, useContext, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ErrorBoundary } from "react-error-boundary";
import TestList from "./test-list";
import LocalErrorFallback from "../errors/local-error-fallback";

export default function UpcomingTests() {

 return (
  <Card>
   <CardHeader>
    <CardTitle>Recent Tests</CardTitle>
    <CardDescription>Last 5 tests created or administered</CardDescription>
   </CardHeader>
   <CardContent>
    <Suspense fallback={<div>Loading...</div>}>
     <ErrorBoundary FallbackComponent={LocalErrorFallback}>
      <TestList />
     </ErrorBoundary>
    </Suspense>
   </CardContent>
  </Card>
 );
}
