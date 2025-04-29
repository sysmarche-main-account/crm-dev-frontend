import { NextResponse } from "next/server";

// Custom middleware function for session checking and route protection
export function middleware(request) {
  const userSessionCookie = request.cookies.get("sessionToken")?.value;

  let userSession;
  if (userSessionCookie) {
    try {
      // userSession = JSON.parse(userSessionCookie);
      userSession = userSessionCookie;
    } catch (e) {
      console.error("Invalid session cookie format", e);
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  const pages = request.cookies.get("pgperm")?.value;

  const pageNames = {
    1: "/dashboard",
    2: "/settings",
    3: "/leads",
    4: "/reports",
    5: "/apis",
    71: "/marketing",
    97: "/analytics",
  };

  const allowedRoutes = pages
    ? [
        ...pages.split(",").map((page) => {
          const route = pageNames[page] || `/page${page}`;
          // console.log(`Mapping page ${page} to route: ${route}`);
          return route;
        }),
        "/allnotifications",
      ]
    : ["/dashboard", "/allnotifications"];

  const protectedRoutes = [
    "/dashboard",
    "/leads",
    "/settings",
    "/reports",
    "/apis",
    "/allnotifications",
    "/marketing",
  ];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );
  // console.log(
  //   "midpage",
  //   // allowedRoutes,
  //   allowedRoutes.includes(request.nextUrl.pathname),
  //   request.nextUrl.pathname
  // );
  if (
    isProtectedRoute &&
    (!userSession || !allowedRoutes.includes(request.nextUrl.pathname))
  ) {
    console.log("Redirecting to unauthorized");
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/leads/:path*",
    "/settings/:path*",
    "/reports/:path*",
    "/apis/:path*",
    "/allnotifications/:path*",
    "/marketing/:path*",
  ],
};
