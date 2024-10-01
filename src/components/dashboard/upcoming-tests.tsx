'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ErrorBoundary } from "react-error-boundary";
import TestList from "./test-list";
import LocalErrorFallback from "../errors/local-error-fallback";

export default function UpcomingTests() {

 return (
  <Card>
   <CardHeader>
    <CardTitle>Upcoming Tests</CardTitle>
    <CardDescription>Tests scheduled for the next 7 days</CardDescription>
   </CardHeader>
   <CardContent>
    <ErrorBoundary FallbackComponent={LocalErrorFallback}>
     <TestList />
    </ErrorBoundary>
   </CardContent>
  </Card>
 );
}