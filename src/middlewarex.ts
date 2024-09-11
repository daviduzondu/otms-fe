import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the current route
  const route = request.nextUrl.pathname;
  console.log(request.headers.get('authorization'))
  // Log the route (you can use any logging method here)
  console.log(`Visited route: ${route}`);

  // Optionally, you can perform additional operations or transformations
  // before sending the response
  return NextResponse.next();
}

export const config = {
 matcher: '/auth/register',
}