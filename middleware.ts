import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const { pathname } = req.nextUrl;

  console.log(pathname, "userid --", userId ? "Exists" : "Null");

  //Check if the authenticated user is trying to access the auth page
  if (
    userId &&
    (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up"))
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  //Allow public routes
  if (pathname === "/" || pathname.startsWith("/about")) {
    return NextResponse.next();
  }

  // Allow auth routes for non authenticated users
  if (!userId && pathname.startsWith("/sign-")) {
    return NextResponse.next();
  }

  // Require the login for the protected routes
  if (!userId) {
    return (await auth()).redirectToSignIn();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
