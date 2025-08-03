import { handleStaticFiles } from './routes/static.js';
import { handleUserRoutes } from './routes/user.js';
import { handleCarsRoutes } from './routes/car.js';
export async function handleRequest(req, res) {
    const method = req.method || 'GET';
    const url = req.url || '/';
    const pathname = url.split('?')[0];
    // Login & Register
    if (pathname === '/login' || pathname === '/register') {
        return handleUserRoutes(req, res);
    }
    // Users routes
    if (pathname === '/users' ||
        pathname === '/users/delete' ||
        pathname.match(/^\/users\/[\w-]+$/)) {
        return handleUserRoutes(req, res);
    }
    // Cars routes
    if (pathname === '/cars' ||
        pathname.match(/^\?cars\?[\w-]+$/) ||
        pathname.match(/^\/cars\/[\w-]+\/buy$/) ||
        pathname.match(/^\/cars\/[^\/]+$/) ||
        pathname.match(/^\/cars\/[^\/]+\/delete$/)) {
        return handleCarsRoutes(req, res);
    }
    return handleStaticFiles(req, res);
}
