import { Resend } from "resend";
import { env } from "../config/env.js";

const resend = new Resend(env.resendApiKey);

/** Turn generated HTML into a basic plain-text alternative. */
export function htmlToText(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<(br|\/p|\/div|\/tr|\/h[1-6])\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Send using the configured sender; the frontend cannot override MAIL_FROM. */
export async function sendMail({ fromName, to, subject, html, text }) {
  const displayName = String(fromName || "").replace(/[\r\n"<>]/g, "").trim();
  const from = displayName ? `${displayName} <${env.mailFrom}>` : env.mailFrom;
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    text: text || htmlToText(html),
  });

  if (error || !data?.id) {
    // Do not leak provider details, which may contain account or request data.
    console.error("Resend rejected an email request.");
    throw new Error("Email provider rejected the request");
  }
  return { id: data.id };
}
