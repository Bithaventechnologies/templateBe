const sharedFields = ["name", "companyName", "message"];

const templates = [
  { id: "welcome", name: "Welcome Email", description: "Welcome a new customer", defaultSubject: "Welcome to {{companyName}}", fields: sharedFields, heading: "Welcome, {{name}}!", opening: "We're glad you're here at {{companyName}}." },
  { id: "business", name: "Business Email", description: "Share a professional business update", defaultSubject: "A message from {{companyName}}", fields: sharedFields, heading: "Hello, {{name}}", opening: "A note from {{companyName}}." },
  { id: "congratulations", name: "Congratulations Email", description: "Celebrate an achievement", defaultSubject: "Congratulations, {{name}}!", fields: sharedFields, heading: "Congratulations, {{name}}!", opening: "Everyone at {{companyName}} is celebrating with you." },
  { id: "promotional", name: "Promotional Email", description: "Share an offer or promotion", defaultSubject: "A special offer from {{companyName}}", fields: sharedFields, heading: "Something special for you, {{name}}", opening: "A special update from {{companyName}}." },
  { id: "announcement", name: "Announcement Email", description: "Share an important announcement", defaultSubject: "An update from {{companyName}}", fields: sharedFields, heading: "An announcement for you, {{name}}", opening: "News from {{companyName}}." },
  { id: "custom", name: "Custom Email", description: "Create a simple message", defaultSubject: "A message from {{companyName}}", fields: sharedFields, heading: "Hello, {{name}}", opening: "A message from {{companyName}}." },
];

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);

function interpolate(text, values) {
  return text.replace(/{{\s*([a-zA-Z][a-zA-Z0-9]*)\s*}}/g, (_match, key) => escapeHtml(values[key]));
}

function interpolateSubject(text, values) {
  return text.replace(/{{\s*([a-zA-Z][a-zA-Z0-9]*)\s*}}/g, (_match, key) => String(values[key]).replace(/[\r\n]/g, " "));
}

export function listEmailTemplates() {
  return templates.map(({ id, name, description, defaultSubject, fields }) => ({ id, name, description, defaultSubject, fields: [...fields] }));
}

export function renderEmailTemplate(id, subject, values) {
  const template = templates.find((item) => item.id === id);
  if (!template) return null;
  const renderedSubject = interpolateSubject(subject || template.defaultSubject, values);
  const heading = interpolate(template.heading, values);
  const opening = interpolate(template.opening, values);
  const message = escapeHtml(values.message).replace(/\r?\n/g, "<br>");
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f6f8;font-family:Arial,sans-serif;color:#202124"><main style="max-width:600px;margin:auto;padding:32px;background:#fff;border-radius:8px"><h1 style="font-size:24px">${heading}</h1><p>${opening}</p><p style="white-space:normal">${message}</p></main></body></html>`;
  return { subject: renderedSubject, html };
}

export function validateTemplateValues(id, values) {
  const template = templates.find((item) => item.id === id);
  if (!template) return { error: "Choose a valid email template." };
  const unknown = Object.keys(values).filter((key) => !template.fields.includes(key));
  if (unknown.length) return { error: `Unsupported template field: ${unknown[0]}.` };
  const missing = template.fields.filter((field) => !values[field]?.trim());
  if (missing.length) return { error: `Missing required fields: ${missing.join(", ")}.` };
  return null;
}
