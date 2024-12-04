import { NextResponse } from 'next/server';

export function middleware(request: Request) {

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-pathname', new URL(request.url).pathname);

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        }
    });
}