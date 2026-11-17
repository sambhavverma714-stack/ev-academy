const { Resend } = require('resend');

const outbox = []; // newest last; kept for local/test compatibility

function appUrl() {
  return (process.env.APP_URL || `http://localhost:${process.env.PORT || 5050}`).replace(/\/$/, '');
}

function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM_EMAIL);
}

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function formatResendError(error) {
  if (!error) return 'Unknown email provider error';
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error.message || error);
  }
}

async function sendEmail({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.MAIL_FROM_EMAIL;
  const fromName = process.env.MAIL_FROM_NAME || 'EV Academy';
  const from = `${fromName} <${fromEmail}>`;

  if (!apiKey || !fromEmail) {
    // Do not print verification codes in terminal. Callers should gate flows when email is unavailable.
    throw new Error('Email delivery is not configured. Set RESEND_API_KEY and MAIL_FROM_EMAIL.');
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject,
    html,
    text,
  });

  if (error) {
    console.error('Resend email error:', error);
    throw new Error(`Resend error: ${formatResendError(error)}`);
  }

  return { sent: true, id: data?.id || null };
}

// Backward-compatible name used across routes/tests
async function sendMail(args) {
  return sendEmail(args);
}

function verificationEmail(name, code) {
  return {
    subject: 'Your EV Academy verification code',
    text: `EV Academy\n\nHello ${name},\n\nYour verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you did not create this account, you can ignore this email.`,
    html: `<div style="margin:0;padding:32px 16px;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
        <div style="padding:24px 28px;background:#0b1220;color:#ffffff;">
          <div style="font-size:12px;letter-spacing:0.24em;text-transform:uppercase;opacity:0.85;">EV Academy</div>
          <h1 style="margin:10px 0 0;font-size:24px;line-height:1.2;font-weight:700;">Verify your email address</h1>
        </div>
        <div style="padding:28px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hello ${esc(name)},</p>
          <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#334155;">Use the verification code below to confirm the email address you registered with.</p>
          <div style="margin:24px 0;padding:22px 16px;border:1px solid #dbe4f0;border-radius:14px;background:#f8fafc;text-align:center;">
            <div style="font-size:40px;line-height:1;font-weight:700;letter-spacing:0.28em;color:#0f172a;">${esc(code)}</div>
          </div>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#475569;">This code expires in 10 minutes.</p>
          <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#64748b;">If you did not create an account, you can safely ignore this email.</p>
        </div>
      </div>
    </div>`,
  };
}

function resetEmail(name, link) {
  return {
    subject: 'Reset your EV Academy password',
    text: `EV Academy\n\nHello ${name},\n\nOpen this link to choose a new password (valid for 1 hour):\n${link}\n\nIf you did not ask for this, you can ignore this email. Your password will stay the same.`,
    html: `<div style="margin:0;padding:32px 16px;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
        <div style="padding:24px 28px;background:#0b1220;color:#ffffff;">
          <div style="font-size:12px;letter-spacing:0.24em;text-transform:uppercase;opacity:0.85;">EV Academy</div>
          <h1 style="margin:10px 0 0;font-size:24px;line-height:1.2;font-weight:700;">Reset your password</h1>
        </div>
        <div style="padding:28px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hello ${esc(name)},</p>
          <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#334155;">We received a request to reset your password.</p>
          <p style="margin:0 0 24px;">
            <a href="${esc(link)}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:14px 20px;border-radius:10px;font-weight:600;">Choose a new password</a>
          </p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#475569;">This link expires in 1 hour.</p>
          <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#64748b;">If you did not ask for this, you can safely ignore this email.</p>
        </div>
      </div>
    </div>`,
  };
}

module.exports = {
  sendEmail,
  sendMail,
  isEmailConfigured,
  verificationEmail,
  resetEmail,
  appUrl,
  outbox,
};
