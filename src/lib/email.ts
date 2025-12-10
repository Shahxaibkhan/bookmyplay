import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

const resend = resendApiKey ? new Resend(resendApiKey) : null;

const getBaseUrl = () => {
  const defaultUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_BASE_URL;
  if (defaultUrl) return defaultUrl.replace(/\/$/, '');

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
  }

  return 'http://localhost:3000';
};

export async function sendEmailVerification({
  email,
  name,
  token,
}: {
  email: string;
  name: string;
  token: string;
}) {
  if (!resend) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const verifyUrl = `${getBaseUrl()}/verify-email?token=${token}`;
  const fromAddress = process.env.EMAIL_FROM || 'BookMyPlay <no-reply@bookmyplay.com>';

  await resend.emails.send({
    from: fromAddress,
    to: email,
    subject: 'Verify your BookMyPlay email',
    html: `<!doctype html>
<html>
  <body style="font-family:Inter,Arial,sans-serif;background:#f6f9fc;padding:24px;color:#0f172a;">
    <table role="presentation" width="100%" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;border:1px solid #d1fae5;">
      <tr>
        <td>
          <p style="font-size:14px;color:#10b981;font-weight:600;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">BookMyPlay</p>
          <h1 style="font-size:24px;margin:0 0 16px;color:#0f172a;">Verify your email</h1>
          <p style="font-size:16px;margin:0 0 16px;color:#334155;">Hi ${
            name.split(' ')[0]
          }, thanks for creating your owner workspace. Please confirm this email so you can access the dashboard.</p>
          <p style="margin:24px 0;">
            <a href="${verifyUrl}" style="background:#10b981;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:600;">Verify email</a>
          </p>
          <p style="font-size:14px;color:#64748b;margin:0 0 8px;">Or paste this link in your browser:</p>
          <p style="font-size:13px;color:#0f172a;background:#f1f5f9;padding:12px;border-radius:12px;word-break:break-all;">${verifyUrl}</p>
          <p style="font-size:12px;color:#94a3b8;margin-top:24px;">This link will expire in 24 hours.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  });
}
