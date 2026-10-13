
const COMPANY_NAME = "Pantera Capital";

// Replace this with your actual publicly accessible logo URL.
const LOGO_URL =  "https://res.cloudinary.com/brkfv9ks/image/upload/f_auto,q_auto/pantera";

 

const sharedFields = ["name", "companyName", "message"];

const templates = [
  {
    id: "welcome",
    name: "Welcome Email",
    description: "Welcome a new customer",
    defaultSubject: `Welcome to ${COMPANY_NAME}`,
    fields: sharedFields,
    heading: "Welcome, {{name}}!",
    opening: `We're glad you're here at ${COMPANY_NAME}.`,
    theme: {
      primary: "#176B52",
      accent: "#D9F3E8",
      background: "#F1F8F5",
    },
  },
  {
    id: "business",
    name: "Business Email",
    description: "Send a professional business letter",
    defaultSubject: `A message from ${COMPANY_NAME}`,
    fields: sharedFields,
    heading: "Business Correspondence",
    opening: `Dear {{name}},`,
    theme: {
      primary: "#233876",
      accent: "#E8EDFA",
      background: "#F3F5FA",
    },
  },
  {
    id: "congratulations",
    name: "Congratulations Email",
    description: "Celebrate an achievement",
    defaultSubject: `Congratulations from ${COMPANY_NAME}`,
    fields: sharedFields,
    heading: "Congratulations, {{name}}!",
    opening: `Everyone at ${COMPANY_NAME} is celebrating with you.`,
    theme: {
      primary: "#986414",
      accent: "#FFF0C7",
      background: "#FFFAEF",
    },
  },
  {
    id: "promotional",
    name: "Promotional Email",
    description: "Share an offer or promotion",
    defaultSubject: `A special offer from ${COMPANY_NAME}`,
    fields: sharedFields,
    heading: "Something Special for You",
    opening: `Hello {{name}}, here's a special update from ${COMPANY_NAME}.`,
    theme: {
      primary: "#9D315D",
      accent: "#FCE5EF",
      background: "#FFF5F8",
    },
  },
  {
    id: "announcement",
    name: "Announcement Email",
    description: "Share an important announcement",
    defaultSubject: `An update from ${COMPANY_NAME}`,
    fields: sharedFields,
    heading: "Important Announcement",
    opening: `Dear {{name}}, here's the latest news from ${COMPANY_NAME}.`,
    theme: {
      primary: "#175D91",
      accent: "#DDF1FF",
      background: "#F1F8FD",
    },
  },
  {
    id: "custom",
    name: "Custom Email",
    description: "Create a personalized message",
    defaultSubject: `A message from ${COMPANY_NAME}`,
    fields: sharedFields,
    heading: "A Message for You",
    opening: `Hello {{name}},`,
    theme: {
      primary: "#55418C",
      accent: "#EAE3FA",
      background: "#F7F4FC",
    },
  },
];

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function interpolate(text, values) {
  return String(text ?? "").replace(
    /{{\s*([a-zA-Z][a-zA-Z0-9]*)\s*}}/g,
    (_match, key) => escapeHtml(values[key] ?? "")
  );
}

function interpolateSubject(text, values) {
  return String(text ?? "").replace(
    /{{\s*([a-zA-Z][a-zA-Z0-9]*)\s*}}/g,
    (_match, key) =>
      String(values[key] ?? "").replace(/[\r\n]/g, " ")
  );
}

function listEmailTemplates() {
  return templates.map(
    ({ id, name, description, defaultSubject, fields, theme }) => ({
      id,
      name,
      description,
      defaultSubject,
      fields: [...fields],
      theme: { ...theme },
    })
  );
}

function renderEmailTemplate(id, subject, values = {}) {
  const template = templates.find((item) => item.id === id);

  if (!template) return null;

  const emailValues = {
    ...values,
    companyName: COMPANY_NAME,
  };

  const renderedSubject = interpolateSubject(
    subject || template.defaultSubject,
    emailValues
  );

  const { primary, accent, background } = template.theme;
  const name = escapeHtml(emailValues.name);
  const company = escapeHtml(COMPANY_NAME);

  const heading = interpolate(template.heading, emailValues);
  const opening = interpolate(template.opening, emailValues);

  const message = escapeHtml(emailValues.message)
    .replace(/\r\n/g, "\n")
    .replace(/\n/g, "<br>");

  const logo = LOGO_URL
    ? `<img
         src="${escapeHtml(LOGO_URL)}"
         alt="${company}"
         width="180"
         style="display:block;width:180px;max-width:100%;height:auto;border:0;margin:auto;"
       >`
    : `<div style="font-size:23px;font-weight:bold;color:${primary};">
         ${company}
       </div>`;

  const businessLetter = id === "business";

  const bodyContent = businessLetter
    ? `
      <div style="margin-bottom:24px;color:#444;font-size:14px;">
        <div style="font-weight:bold;color:#222;">${company}</div>
        <div style="margin-top:4px;color:#777;">Business Correspondence</div>
      </div>

      <h1 style="font-size:25px;line-height:1.4;color:#202A44;margin:0 0 28px;">
        ${heading}
      </h1>

      <p style="margin:0 0 22px;color:#555;font-size:14px;">
        ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "UTC",
        })}
      </p>

      <p style="font-size:15px;line-height:1.8;margin:0 0 18px;">
        ${opening}
      </p>

      <div style="font-size:15px;line-height:1.9;color:#404756;overflow-wrap:anywhere;">
        ${message}
      </div>

      <p style="font-size:15px;line-height:1.8;margin-top:30px;">
        Kind regards,<br>
        <strong>${company}</strong>
      </p>
    `
    : `
      <div style="background:${accent};border-radius:12px;padding:24px;margin-bottom:26px;">
        <div style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:${primary};font-weight:bold;margin-bottom:12px;">
          ${company}
        </div>

        <h1 style="font-size:27px;line-height:1.35;color:${primary};margin:0;">
          ${heading}
        </h1>
      </div>

      <p style="font-size:16px;line-height:1.8;color:#343A46;margin:0 0 20px;">
        ${opening}
      </p>

      <div style="font-size:15px;line-height:1.9;color:#4B5563;overflow-wrap:anywhere;">
        ${message}
      </div>

      <div style="margin-top:30px;border-left:4px solid ${primary};padding:14px 18px;background:${background};">
        <p style="font-size:14px;line-height:1.8;color:#454B57;margin:0;">
          Thank you for being part of ${company}.
        </p>
      </div>

      <p style="font-size:15px;line-height:1.8;margin-top:28px;color:#343A46;">
        Warm regards,<br>
        <strong>${company}</strong>
      </p>
    `;

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${escapeHtml(renderedSubject)}</title>
</head>

<body style="margin:0;padding:0;background:${background};font-family:Arial,Helvetica,sans-serif;color:#252A34;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
    style="background:${background};width:100%;">
    <tr>
      <td align="center" style="padding:32px 12px;">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
          style="max-width:640px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">

          <tr>
            <td align="center" style="padding:30px 24px 22px;background:#ffffff;">
              ${logo}
              <p style="margin:12px 0 0;font-size:16px;font-weight:bold;letter-spacing:.4px;color:${primary};">
                ${company}
              </p>
            </td>
          </tr>

          <tr>
            <td style="height:4px;background:${primary};font-size:0;line-height:0;">
              &nbsp;
            </td>
          </tr>

          <tr>
            <td style="padding:${businessLetter ? "34px 36px" : "30px 28px"};">
              ${bodyContent}
            </td>
          </tr>

          <tr>
            <td style="padding:24px;background:#F8F9FB;border-top:1px solid #E7E9EE;text-align:center;">
              <p style="font-size:13px;color:#525866;margin:0 0 8px;">
                Thank you for choosing ${company}.
              </p>
              <p style="font-size:11px;line-height:1.7;color:#858B98;margin:0;">
                © ${new Date().getFullYear()} ${company}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;

  return {
    subject: renderedSubject,
    html,
  };
}

function validateTemplateValues(id, values = {}) {
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
    return {
      error: `Unsupported template field: ${unknown[0]}.`,
    };
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

export {
  listEmailTemplates,
  renderEmailTemplate,
  validateTemplateValues,
};


