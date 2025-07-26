import { IncomingMessage, ServerResponse} from 'http';
import { handleStaticFiles } from './routes/static.js';
import { handleUserRoutes } from './routes/user.js';

export async function handleRequest(req: IncomingMessage, res: ServerResponse) {
	const method = req.method || 'GET';
	const url = req.url || '/';
	const pathname = url.split('?')[0];


	if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/users')) {
		return handleUserRoutes(req, res);
	}

	return handleStaticFiles(req, res);
}