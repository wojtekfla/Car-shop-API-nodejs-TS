import { IncomingMessage, ServerResponse } from "node:http";


const clients: ServerResponse[] = []

export function handleSSE (req: IncomingMessage, res: ServerResponse) {
	res.writeHead (200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		Connection: 'keep-alive',
	})
	res.write('\n')
	clients.push(res)

	req.on('close', () => {
		const index = clients.indexOf(res)
		if (index !== -1) clients.splice(index, 1)
	})
}

export function sendSSE(data: object) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach((client) => client.write(payload));
}