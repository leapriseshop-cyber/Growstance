const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const nodemailer = require("nodemailer");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = ROOT;
const SUBMISSIONS_FILE = path.join(DATA_DIR, "submissions.ndjson");
const EMAIL_USER = process.env.EMAIL_USER || "growstancedigital@gmail.com";
const EMAIL_PASS = process.env.EMAIL_PASS || "";
const EMAIL_TO = process.env.EMAIL_TO || "growstancedigital@gmail.com";
const MAX_BODY_BYTES = 12_000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 5;
const hits = new Map();

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

const PUBLIC_FILES = new Set([
  "blog-template.html",
  "branding-hero.png",
  "branding-website-design-india.html",
  "clean-design-trust-signal.html",
  "dashboard-graphic-transparent.png",
  "emotional-resonance.html",
  "founder-branding-india.html",
  "founder-hero.png",
  "hospitality-growth-india.html",
  "hospitality-hero.png",
  "growstance-4.png",
  "growstance-favicon-32.png",
  "growstance-favicon.png",
  "growstance-seo-growth-strategy.md",
  "humans.txt",
  "index.html",
  "llms.txt",
  "logo-icon.jpg",
  "logo-light.png",
  "posts.json",
  "project-shiva-helios-portfolio.jpg",
  "project-truecare-portfolio.jpg",
  "project-yatalika-portfolio.jpg",
  "robots.txt",
  "script.js",
  "seo-aeo-content-systems.html",
  "seo-hero.png",
  "sitemap.xml",
  "style.css",
  "submissions-legacy.txt",
  "template.html",
  "visible-vs-trusted.html"
]);

const PUBLIC_DIRS = [];

const transporter = EMAIL_PASS
  ? nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    })
  : null;

fs.mkdirSync(DATA_DIR, { recursive: true });

const send = (res, status, body, headers = {}) => {
  res.writeHead(status, {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy": "default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline' https://api.fontshare.com; font-src https://api.fontshare.com https://cdn.fontshare.com; script-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'self'; form-action 'self'; base-uri 'self'",
    ...headers,
  });
  res.end(body);
};

const json = (res, status, payload) => {
  send(res, status, JSON.stringify(payload), { "Content-Type": "application/json; charset=utf-8" });
};

const clean = (value, max = 800) => String(value || "").trim().replace(/\s+/g, " ").slice(0, max);
const escapeHtml = (value) =>
  String(value || "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[ch]);

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const rateLimited = (ip) => {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((time) => now - time < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
};

const readBody = (req) => new Promise((resolve, reject) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
      reject(new Error("Payload too large"));
      req.destroy();
    }
  });
  req.on("end", () => resolve(body));
  req.on("error", reject);
});

const handleContact = async (req, res) => {
  const ip = req.socket.remoteAddress || "unknown";
  if (rateLimited(ip)) {
    json(res, 429, { error: "Too many requests. Please try again later." });
    return;
  }

  try {
    const body = await readBody(req);
    const data = JSON.parse(body);
    const submission = {
      createdAt: new Date().toISOString(),
      name: clean(data.name, 120),
      email: clean(data.email, 180).toLowerCase(),
      phone: clean(data.phone, 40),
      service: clean(data.service, 120),
      message: clean(data.message, 1800),
    };

    if (!submission.name || !isEmail(submission.email) || !submission.message) {
      json(res, 400, { error: "Please provide a valid name, email, and message." });
      return;
    }

    fs.appendFileSync(SUBMISSIONS_FILE, `${JSON.stringify(submission)}\n`, "utf8");

    if (transporter) {
      const safe = Object.fromEntries(Object.entries(submission).map(([key, value]) => [key, escapeHtml(value)]));
      await transporter.sendMail({
        from: `"Growstance Website" <${EMAIL_USER}>`,
        to: EMAIL_TO,
        replyTo: submission.email,
        subject: `New Growstance inquiry from ${submission.name}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:8px;color:#111827;">
            <h2 style="margin:0 0 20px;">New Website Inquiry</h2>
            <p><strong>Name:</strong> ${safe.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${safe.email}">${safe.email}</a></p>
            <p><strong>Phone:</strong> ${safe.phone || "Not provided"}</p>
            <p><strong>Growth Need:</strong> ${safe.service || "Not selected"}</p>
            <p><strong>Message:</strong><br>${safe.message}</p>
          </div>
        `,
      });
    }

    json(res, 200, { ok: true });
  } catch (error) {
    json(res, 400, { error: "Invalid request data." });
  }
};

const resolvePublicPath = (pathname) => {
  let requested;
  try {
    requested = decodeURIComponent(pathname === "/" ? "/index.html" : pathname);
  } catch {
    return null;
  }

  const cleanPath = requested.replace(/^\/+/, "");
  const firstSegment = cleanPath.split(/[\\/]/)[0];
  if (!PUBLIC_FILES.has(cleanPath)) return null;

  const fullPath = path.resolve(ROOT, cleanPath);
  if (!fullPath.startsWith(ROOT)) return null;
  return fullPath;
};

const serveStatic = (req, res, pathname) => {
  const filePath = resolvePublicPath(pathname);
  if (!filePath) {
    send(res, 404, "Not found", { "Content-Type": "text/plain; charset=utf-8" });
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      send(res, 404, "Not found", { "Content-Type": "text/plain; charset=utf-8" });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const isHtml = ext === ".html";
    const contentType = MIME[ext] || "application/octet-stream";
    
    const headers = {
      "Content-Type": contentType,
      "Cache-Control": isHtml ? "no-cache" : "public, max-age=31536000, immutable",
    };

    // Gzip compression for text-based assets to optimize page speed
    const isCompressible = ext === ".html" || ext === ".css" || ext === ".js" || ext === ".json" || ext === ".svg" || ext === ".xml" || ext === ".txt";
    const acceptEncoding = req.headers["accept-encoding"] || "";

    if (isCompressible && acceptEncoding.includes("gzip")) {
      zlib.gzip(data, (zErr, compressed) => {
        if (zErr) {
          send(res, 200, data, headers);
          return;
        }
        headers["Content-Encoding"] = "gzip";
        send(res, 200, compressed, headers);
      });
    } else {
      send(res, 200, data, headers);
    }
  });
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (req.method === "POST" && url.pathname === "/api/contact") {
    await handleContact(req, res);
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    send(res, 405, "Method not allowed", { "Content-Type": "text/plain; charset=utf-8" });
    return;
  }

  serveStatic(req, res, url.pathname);
});

server.listen(PORT, () => {
  console.log(`Growstance running at http://localhost:${PORT}`);
  if (!EMAIL_PASS) {
    console.log("Email sending is disabled. Set EMAIL_USER, EMAIL_PASS, and EMAIL_TO to enable SMTP.");
  }
});
