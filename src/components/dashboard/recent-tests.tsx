'use client'

import { Suspense, useContext, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { ErrorBoundary } from "react-error-boundary";
import TestList from "./test-list";
import LocalErrorFallback from "../errors/local-error-fallback";
import { cn } from "../../lib/utils";

export default function RecentTests() {

 return (
  <Card className="h-full flex flex-col">
   <CardHeader>
    <CardTitle>Recent Tests</CardTitle>
    <CardDescription>Last few tests created or administered</CardDescription>
   </CardHeader>
   <CardContent className={"flex-1"}>
    <ErrorBoundary FallbackComponent={LocalErrorFallback}>
     <TestList />
    </ErrorBoundary>
   </CardContent>
  </Card >
 );
}
