import fs from "fs/promises";
import url from "url";
import path from "path";
// get current path
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// typy MIME - do ustawienia Content-Type
const mimeTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
};
// funkcja obsługi plików statycznych
export async function handleStaticFiles(req, res) {
    const method = req.method || "GET";
    const rawUrl = req.url || "/";
    const pathname = rawUrl.split("?")[0];
    console.log("url", pathname, "| method: ", method);
    let filePath;
    if (method === "GET") {
        if (pathname === "/") {
            filePath = path.join(__dirname, "../../frontend/index.html");
        }
        else {
            filePath = path.join(__dirname, "../../frontend", pathname);
        }
        const ext = path.extname(filePath);
        const contentType = mimeTypes[ext] || "application/octet-stream";
        try {
            const content = await fs.readFile(filePath);
            res.statusCode = 200;
            res.setHeader("Content-Type", contentType);
            res.end(content);
        }
        catch (error) {
            res.statusCode = 404;
            res.setHeader("Content-Type", "text/plain");
            res.end("404 Not Found");
        }
        return;
    }
}
