const clients = [];
export function handleSSE(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
    });
    res.write('\n');
    clients.push(res);
    req.on('close', () => {
        const index = clients.indexOf(res);
        if (index !== -1)
            clients.splice(index, 1);
    });
}
export function sendSSE(data) {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    clients.forEach((client) => client.write(payload));
}
