// Send the weekly digest via Gmail SMTP — local-only.
// Credentials NEVER live in the repo. Set in YOUR terminal:
//   $env:GMAIL_USER = "you@gmail.com"
//   $env:GMAIL_APP_PASSWORD = "xxxx xxxx xxxx xxxx"  (Google Account -> Security -> 2-Step ON -> App passwords)
// Run: node scripts/send-digest.mjs [--to someone@example.com]
// Sends data/digest.md to --to (default: yourself).
import nodemailer from "nodemailer";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const user = process.env.GMAIL_USER;
const pass = (process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "");
if (!user || !pass) {
  console.error("Missing credentials. Set $env:GMAIL_USER and $env:GMAIL_APP_PASSWORD first.");
  process.exit(1);
}
const to = process.argv.includes("--to")
  ? process.argv[process.argv.indexOf("--to") + 1]
  : user;

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const md = readFileSync(join(root, "data", "digest.md"), "utf8");
const html = md
  .replace(/&/g, "&amp;").replace(/</g, "&lt;")
  .replace(/^# (.+)$/gm, "<h1>$1</h1>")
  .replace(/^## (.+)$/gm, "<h2>$1</h2>")
  .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  .replace(/^- (.+)$/gm, "<li>$1</li>")
  .replace(/\n\n/g, "<br><br>");

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user, pass }
});

const info = await transport.sendMail({
  from: `"Crypto-AI Briefing" <${user}>`,
  to,
  subject: `Your crypto-AI weekly digest — ${new Date().toISOString().slice(0, 10)}`,
  text: md + "\n\n— News, not investment advice.",
  html: html + "<p><em>News, not investment advice.</em></p>"
});
console.log(JSON.stringify({ to, messageId: info.messageId, response: info.response }));
