/**
 * Local dev server untuk test form whitelist.
 * Jalankan: node server.js
 * Lalu buka: http://localhost:3000
 */

const fs = require("fs");
const path = require("path");

// Inject environment variables directly (bypassing .env.local issues)
process.env.SPREADSHEET_ID = "1XrwhqzSt1ZOKlWdAYcHXEg5K6LbnQt_Q86sWLhdocnQ";
process.env.SHEET_NAME = "Whitelist";
process.env.GOOGLE_SERVICE_ACCOUNT_JSON = fs.readFileSync(path.join(__dirname, "chilliens-7c9724f8bcac.json"), "utf8");

const http = require("http");
const handler = require("./api/whitelist");

const PORT = 3000;

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

const server = http.createServer(async (req, res) => {
  // ── API Route ──────────────────────────────
  if (req.url === "/api/whitelist") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        req.body = JSON.parse(body || "{}");
      } catch {
        req.body = {};
      }

      // Shim res untuk match Vercel API signature
      res.status = (code) => { res.statusCode = code; return res; };
      res.json = (data) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(data));
      };

      await handler(req, res);
    });
    return;
  }

  // ── Static Files ───────────────────────────
  let filePath = req.url.split("?")[0];
  if (filePath === "/" || filePath === "") filePath = "/index.html";

  const fullPath = path.join(__dirname, filePath);
  const ext = path.extname(fullPath);

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found: " + filePath);
      return;
    }
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n🛸 Chilliens dev server running at http://localhost:${PORT}`);
  console.log(`   API endpoint: http://localhost:${PORT}/api/whitelist`);
  console.log(`\n   Press Ctrl+C to stop.\n`);
});
