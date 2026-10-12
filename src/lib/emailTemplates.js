
const COMPANY_NAME = "Pantera Capital";

const sharedFields = ["name", "companyName", "message"];

const COMPANY_LOGO_URL =
  "https://res.cloudinary.com/brkfv9ks/image/upload/f_auto,q_auto/pantera";



const templates = [
  {
    id: "welcome",
    name: "Welcome Email",
    description: "Welcome a new customer",
    defaultSubject: `Welcome to ${COMPANY_NAME}`,
    fields: sharedFields,
    heading: "Welcome, {{name}}!",
    opening: `We're glad you're here at ${COMPANY_NAME}.`,
  },
  {
    id: "business",
    name: "Business Email",
    description: "Share a professional business update",
    defaultSubject: `A message from ${COMPANY_NAME}`,
    fields: sharedFields,
    heading: "Hello, {{name}}",
    opening: `A note from ${COMPANY_NAME}.`,
  },
  {
    id: "congratulations",
    name: "Congratulations Email",
    description: "Celebrate an achievement",
    defaultSubject: `Congratulations from ${COMPANY_NAME}, {{name}}!`,
    fields: sharedFields,
    heading: "Congratulations, {{name}}!",
    opening: `Everyone at ${COMPANY_NAME} is celebrating with you.`,
  },
  {
    id: "promotional",
    name: "Promotional Email",
    description: "Share an offer or promotion",
    defaultSubject: `A special offer from ${COMPANY_NAME}`,
    fields: sharedFields,
    heading: "Something special for you, {{name}}",
    opening: `A special update from ${COMPANY_NAME}.`,
  },
  {
    id: "announcement",
    name: "Announcement Email",
    description: "Share an important announcement",
    defaultSubject: `An update from ${COMPANY_NAME}`,
    fields: sharedFields,
    heading: "An announcement for you, {{name}}",
    opening: `News from ${COMPANY_NAME}.`,
  },
  {
    id: "custom",
    name: "Custom Email",
    description: "Create a simple message",
    defaultSubject: `A message from ${COMPANY_NAME}`,
    fields: sharedFields,
    heading: "Hello, {{name}}",
    opening: `A message from ${COMPANY_NAME}.`,
  },
];

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[char]
  );
}

function interpolate(text, values) {
  return text.replace(
    /{{\s*([a-zA-Z][a-zA-Z0-9]*)\s*}}/g,
    (_match, key) => escapeHtml(values[key] ?? "")
  );
}

function interpolateSubject(text, values) {
  return text.replace(
    /{{\s*([a-zA-Z][a-zA-Z0-9]*)\s*}}/g,
    (_match, key) =>
      String(values[key] ?? "").replace(/[\r\n]/g, " ")
  );
}

export function listEmailTemplates() {
  return templates.map(
    ({ id, name, description, defaultSubject, fields }) => ({
      id,
      name,
      description,
      defaultSubject,
      fields: [...fields],
    })
  );
}

export function renderEmailTemplate(id, subject, values = {}) {
  const template = templates.find((item) => item.id === id);

  if (!template) return null;

  // Always use Pantera Capital as the default company name.
  const emailValues = {
    ...values,
    companyName: COMPANY_NAME,
  };

  const renderedSubject = interpolateSubject(
    subject || template.defaultSubject,
    emailValues
  );

  const heading = interpolate(template.heading, emailValues);
  const opening = interpolate(template.opening, emailValues);
  const message = escapeHtml(emailValues.message).replace(/\r?\n/g, "<br>");

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="margin:0;padding:24px;background:#f4f6f8;font-family:Arial,sans-serif;color:#202124">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center">
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="max-width:600px;background:#fff;border-radius:8px;overflow:hidden"
              >
                <tr>
                  <td align="center" style="padding:24px;background:#fff">
                   <img
  src="${COMPANY_LOGO_URL}"
  alt="Pantera Capital"
  width="220"
  style="
    display:block;
    width:220px;
    max-width:100%;
    height:auto;
    margin:0 auto;
    border:0;
  "
/>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px">
                    <h1 style="font-size:24px;line-height:1.3">${heading}</h1>
                    <p>${opening}</p>
                    <p style="line-height:1.7">${message}</p>
                    <p style="margin-top:28px;color:#666;font-size:13px">
                      © ${new Date().getFullYear()} Pantera Capital
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return { subject: renderedSubject, html };
}

export function validateTemplateValues(id, values = {}) {
  const template = templates.find((item) => item.id === id);

  if (!template) {
    return { error: "Choose a valid email template." };
  }

  const emailValues = {
    ...values,
    companyName: COMPANY_NAME,
  };

  const unknown = Object.keys(emailValues).filter(
    (key) => !template.fields.includes(key)
  );

  if (unknown.length) {
    return { error: `Unsupported template field: ${unknown[0]}.` };
  }

  const missing = template.fields.filter(
    (field) => !String(emailValues[field] ?? "").trim()
  );

  if (missing.length) {
    return {
      error: `Missing required fields: ${missing.join(", ")}.`,
    };
  }

  return null;
}
