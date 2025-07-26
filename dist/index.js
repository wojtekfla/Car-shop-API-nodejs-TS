import http from 'node:http';
import { handleRequest } from './router.js';
const PORT = process.env.PORT || 3000;
const server = http.createServer(async (req, res) => {
    handleRequest(req, res);
});
// const server = http.createServer(handleRequest)
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
