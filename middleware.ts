import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// This exports the default middleware provided by NextAuth.js
// It will protect all routes defined in the config
export default withAuth(
  function middleware(req) {
    // We can add custom logic here, like role-based redirection
    return NextResponse.next();
  },
  {
    callbacks: {
      // This ensures the user is authenticated for the matched routes
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login', // Redirect here if not authenticated
    },
  }
);

export const config = {
  // Define which routes to protect
  matcher: [
    "/dashboard/:path*", 
    "/api/dashboard/:path*",
    "/api/reports/:path*",
    "/api/submissions/:path*"
  ],
};