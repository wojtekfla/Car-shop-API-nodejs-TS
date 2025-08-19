// import { IncomingMessage, ServerResponse } from "http";
// import { handleStaticFiles } from "./routes/static.js";
// import { handleUserRoutes } from "./routes/users.js";
// import { handleCarsRoutes } from "./routes/cars.js";
// import { handleSSE } from "./sse.js";
export async function handleRequest() {
    /*
    const method = req.method || "GET";
    const url = req.url || "/";
    const pathname = url.split("?")[0];

    // SSE service
    if (method === "GET" && pathname === "/sse") {
        return handleSSE(req, res);
    }

    // Login & Register
    if (pathname === "/login" || pathname === "/register") {
        return handleUserRoutes(req, res);
    }

    // Users routes
    if (
        pathname === "/users" ||
        pathname === "/me" ||
        pathname === "/users/delete" ||
        pathname.match(/^\/users\/[\w-]+$/) ||
        pathname.startsWith("/fund/")
    ) {
        return handleUserRoutes(req, res);
    }

    // Cars routes
    if (
        pathname === "/cars" ||
        pathname.match(/^\?cars\?[\w-]+$/) ||
        pathname.match(/^\/cars\/[\w-]+\/buy$/) ||
        pathname.match(/^\/cars\/[^\/]+$/) ||
        pathname.match(/^\/cars\/[^\/]+\/delete$/)
    ) {
        return handleCarsRoutes(req, res);
    }

    return handleStaticFiles(req, res);
    */
}
// export async function handleRequest(req: IncomingMessage, res: ServerResponse) {
// 	const method = req.method || "GET";
// 	const url = req.url || "/";
// 	const pathname = url.split("?")[0];
// 	// SSE service
// 	if (method === "GET" && pathname === "/sse") {
// 		return handleSSE(req, res);
// 	}
// 	// Login & Register
// 	if (pathname === "/login" || pathname === "/register") {
// 		return handleUserRoutes(req, res);
// 	}
// 	// Users routes
// 	if (
// 		pathname === "/users" ||
// 		pathname === "/me" ||
// 		pathname === "/users/delete" ||
// 		pathname.match(/^\/users\/[\w-]+$/) ||
// 		pathname.startsWith("/fund/")
// 	) {
// 		return handleUserRoutes(req, res);
// 	}
// 	// Cars routes
// 	if (
// 		pathname === "/cars" ||
// 		pathname.match(/^\?cars\?[\w-]+$/) ||
// 		pathname.match(/^\/cars\/[\w-]+\/buy$/) ||
// 		pathname.match(/^\/cars\/[^\/]+$/) ||
// 		pathname.match(/^\/cars\/[^\/]+\/delete$/)
// 	) {
// 		return handleCarsRoutes(req, res);
// 	}
// 	return handleStaticFiles(req, res);
// }
