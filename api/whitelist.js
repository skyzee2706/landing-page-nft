const { google } = require("googleapis");

// ── CONFIG ───────────────────────────────────
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME || "Whitelist";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

// ── WALLET REGEX ─────────────────────────────
const WALLET_REGEX = /^0x[a-fA-F0-9]{40}$/;

// ── GET GOOGLE AUTH CLIENT ───────────────────
async function getAuthClient() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return auth.getClient();
}

// ── MAIN HANDLER ─────────────────────────────
module.exports = async function handler(req, res) {
  // CORS — only allow your own domain in production
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── PARSE BODY ───────────────────────────────
  const { xUsername, wallet, deviceId } = req.body || {};

  // ── SERVER-SIDE VALIDATION ───────────────────
  if (!xUsername || typeof xUsername !== "string" || xUsername.trim().length < 1) {
    return res.status(400).json({ error: "invalid_input", message: "X username is required." });
  }
  if (!wallet || !WALLET_REGEX.test(wallet.trim())) {
    return res.status(400).json({ error: "invalid_wallet", message: "Invalid wallet address." });
  }
  if (!deviceId || typeof deviceId !== "string" || deviceId.length < 8) {
    return res.status(400).json({ error: "invalid_input", message: "Device ID is required." });
  }

  const cleanUsername = xUsername.trim().replace(/^@/, "").toLowerCase();
  const cleanWallet   = wallet.trim().toLowerCase();
  const cleanDeviceId = deviceId.trim();

  // ── GET CLIENT IP ────────────────────────────
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  try {
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    // ── READ EXISTING ROWS ───────────────────────
    // Columns: A=Timestamp B=X_Username C=Wallet D=IP E=DeviceID
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:E`,
    });

    const rows = existing.data.values || [];

    for (const row of rows) {
      const [, , rowWallet, rowIp, rowDeviceId] = row.map((v) =>
        typeof v === "string" ? v.toLowerCase() : ""
      );

      if (rowWallet === cleanWallet) {
        return res.status(409).json({
          error: "wallet_duplicate",
          message: "This wallet is already registered! 👽",
        });
      }
      if (rowIp && rowIp === ip.toLowerCase() && rowIp !== "unknown") {
        return res.status(429).json({
          error: "ip_limit",
          message: "This IP address has already submitted a whitelist entry.",
        });
      }
      if (rowDeviceId === cleanDeviceId.toLowerCase()) {
        return res.status(429).json({
          error: "device_limit",
          message: "This device has already submitted a whitelist entry.",
        });
      }
    }

    // ── APPEND ROW ───────────────────────────────
    const timestamp = new Date().toLocaleString("en-GB", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:E`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            timestamp,          // A — Timestamp (visible)
            cleanUsername,      // B — X Username (visible)
            wallet.trim(),      // C — Wallet Address (visible, original case)
            ip,                 // D — IP Address (can hide column)
            cleanDeviceId,      // E — Device ID (can hide column)
          ],
        ],
      },
    });

    return res.status(201).json({
      success: true,
      message: "You're in the Chilliens whitelist! 🛸💚",
    });

  } catch (err) {
    console.error("[WL API Error]", err.message);
    return res.status(500).json({
      error: "server_error",
      message: "Something went wrong on our end. Please try again.",
    });
  }
};
