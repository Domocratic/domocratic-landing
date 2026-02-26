// api/send-email.js (CommonJS for Vercel Node runtime)
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email } = req.body || {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    // Basic honeypot (optional): if you add a hidden field 'website', ensure it's empty
    // if (req.body.website) return res.status(200).json({ ok: true });

    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_SECURE,
      SMTP_USER,
      SMTP_PASS,
      TO_EMAIL,
      FROM_EMAIL
    } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !TO_EMAIL || !FROM_EMAIL) {
      return res.status(500).json({ error: 'Server not configured for email' });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: String(SMTP_SECURE).toLowerCase() === 'true', // true for 465, false for 587
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });

    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    const time = new Date().toISOString();

    const subject = `New Domocratic registration: ${email}`;
    const text = [
      `A new user requested to be notified:`,
      ``,
      `Email: ${email}`,
      `Time:  ${time}`,
      `IP:    ${ip}`,
      `Agent: ${ua}`
    ].join('\n');

    const html = `
      <p>A new user requested to be notified:</p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Time:</strong> ${time}</li>
        <li><strong>IP:</strong> ${ip}</li>
        <li><strong>Agent:</strong> ${ua}</li>
      </ul>
    `;

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject,
      text,
      html
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('send-email error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
};