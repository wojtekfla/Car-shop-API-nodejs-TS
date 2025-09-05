import { Request, Response } from "express";

type SSEClient = Response;

const clients: SSEClient[] = [];


export function handleSSE(req: Request, res: Response) {
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");
	res.flushHeaders();

	const clientId = Date.now()
	clients.push(res);
	// console.log('clients', clients)

	req.on("close", () => {
		const index = clients.indexOf(res);
		if (index !== -1) {
			clients.splice(index, 1);
		}
	});
}

export function sendSSE(data: object) {
	const payload = `data: ${JSON.stringify(data)}\n\n`;
	console.log('payload', payload)
	clients.forEach((client) => client.write(payload));
}
