import http, { IncomingMessage, ServerResponse } from 'node:http';
import { handleRequest } from './router.js';

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
	handleRequest(req, res)
})

server.listen(PORT, ()=> {
	console.log(`Server running on http://localhost:${PORT}`)
})
