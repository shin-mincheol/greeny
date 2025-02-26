import { NextRequest, NextResponse } from 'next/server';
import { auth } from './auth';

export default async function middlware(request: NextRequest) {
  const session = await auth();

  if (request.nextUrl.pathname.startsWith('/login') && session?.user) {
    return NextResponse.redirect(`${request.nextUrl.origin}`);
  }

  if ((request.nextUrl.pathname.startsWith('/profile') || request.nextUrl.pathname.startsWith('/plant')) && !session?.user) {
    return NextResponse.redirect(`${request.nextUrl.origin}/login`);
  }
}

export const config = {
  matcher: ['/profile', '/plant', '/login'],
};
