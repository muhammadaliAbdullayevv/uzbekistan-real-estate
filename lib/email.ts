import { getAbsoluteUrl } from "@/lib/site";
import nodemailer from "nodemailer";
import { getTranslations, type Locale } from "@/lib/i18n";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildEmailLayout(input: {
  eyebrow: string;
  title: string;
  intro: string;
  actionLabel: string;
  actionUrl: string;
  note: string;
  footer: string;
  fallbackTitle: string;
  fallbackCopy: string;
}) {
  const actionUrl = escapeHtml(input.actionUrl);

  return `
    <div style="margin:0;padding:32px 16px;background:#f4f8f8;font-family:Arial,sans-serif;color:#12202f;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #d9e6e5;border-radius:28px;overflow:hidden;box-shadow:0 24px 60px -36px rgba(15,118,110,0.35);">
        <div style="padding:28px 32px;background:linear-gradient(155deg,#12202f 0%,#0f766e 100%);color:#ffffff;">
          <div style="display:inline-block;padding:8px 14px;border:1px solid rgba(255,255,255,0.2);border-radius:999px;background:rgba(255,255,255,0.08);font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;">
            ${escapeHtml(input.eyebrow)}
          </div>
          <h1 style="margin:18px 0 0;font-size:30px;line-height:1.15;font-weight:700;">
            ${escapeHtml(input.title)}
          </h1>
          <p style="margin:14px 0 0;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.82);">
            ${escapeHtml(input.intro)}
          </p>
        </div>

        <div style="padding:30px 32px 34px;">
          <a
            href="${actionUrl}"
            style="display:inline-block;padding:15px 24px;border-radius:999px;background:linear-gradient(135deg,#12202f 0%,#0f766e 100%);color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;"
          >
            ${escapeHtml(input.actionLabel)}
          </a>

          <div style="margin-top:24px;padding:18px 20px;border:1px solid #d9e6e5;border-radius:20px;background:#f9fcfc;">
            <p style="margin:0;font-size:14px;line-height:1.7;color:#39535f;">
              ${escapeHtml(input.note)}
            </p>
          </div>

          <div style="margin-top:22px;">
            <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#39535f;">
              ${escapeHtml(input.fallbackTitle)}
            </p>
            <p style="margin:0;font-size:13px;line-height:1.7;color:#39535f;word-break:break-word;">
              ${escapeHtml(input.fallbackCopy)}<br />
              <a href="${actionUrl}" style="color:#0f766e;text-decoration:none;">${actionUrl}</a>
            </p>
          </div>
        </div>
      </div>

      <p style="max-width:620px;margin:16px auto 0;padding:0 6px;font-size:12px;line-height:1.7;color:#5f7780;text-align:center;">
        ${escapeHtml(input.footer)}
      </p>
    </div>
  `;
}

function hasResendConfig() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

function hasSmtpConfig() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.EMAIL_FROM
  );
}

function getSmtpSecure() {
  if (process.env.SMTP_SECURE) {
    return process.env.SMTP_SECURE === "true";
  }

  return Number(process.env.SMTP_PORT) === 465;
}

async function sendWithSmtp(input: SendEmailInput) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: getSmtpSecure(),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text
  });
}

async function sendWithResend(input: SendEmailInput) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Unable to send email: ${body}`);
  }
}

export async function sendEmail(input: SendEmailInput) {
  if (hasSmtpConfig()) {
    await sendWithSmtp(input);
    return;
  }

  if (hasResendConfig()) {
    await sendWithResend(input);
    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Email provider is not configured.");
  }

  console.warn("Email provider is not configured. Email content preview:");
  console.warn({
    to: input.to,
    subject: input.subject,
    text: input.text
  });
}

export async function sendPasswordResetEmail(email: string, token: string, locale: Locale) {
  const t = getTranslations(locale).auth;
  const resetUrl = getAbsoluteUrl(
    `/reset-password?token=${encodeURIComponent(token)}&locale=${encodeURIComponent(locale)}`
  );
  const subject = t.passwordResetEmailSubject;
  const text = [
    t.passwordResetEmailIntro,
    "",
    t.passwordResetEmailAction + ":",
    resetUrl,
    "",
    t.passwordResetEmailNote
  ].join("\n");

  await sendEmail({
    to: email,
    subject,
    html: buildEmailLayout({
      eyebrow: t.passwordResetEmailEyebrow,
      title: t.passwordResetEmailTitle,
      intro: t.passwordResetEmailIntro,
      actionLabel: t.passwordResetEmailAction,
      actionUrl: resetUrl,
      note: t.passwordResetEmailNote,
      footer: t.passwordResetEmailFooter,
      fallbackTitle: t.emailFallbackTitle,
      fallbackCopy: t.emailFallbackCopy
    }),
    text
  });
}
