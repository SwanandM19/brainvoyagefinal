import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_SERVER_HOST!,
  port:   Number(process.env.EMAIL_SERVER_PORT!),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER!,
    pass: process.env.EMAIL_SERVER_PASSWORD!,
  },
});

export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  await transporter.sendMail({
    from:    `"VidyaSangrah" <${process.env.EMAIL_FROM}>`,
    to:      email,
    subject: `${otp} — Your VidyaSangrah Login Code`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #fff;">
        <div style="text-align:center; margin-bottom: 32px;">
          <img src="${process.env.NEXTAUTH_URL}/mainlogo.png" alt="VidyaSangrah" style="height: 400px; width: 200px; object-fit: contain; margin: 0 auto; display: block;" />
        </div>
        <h2 style="font-size:20px; font-weight:700; color:#111827; margin-bottom:8px;">Your Login Code</h2>
        <p style="color:#6B7280; font-size:14px; margin-bottom:24px;">
          Use the code below to sign in. It expires in <strong>10 minutes</strong>.
        </p>
        <div style="background:#F8F9FA; border:2px dashed #E5E7EB; border-radius:12px; padding:24px; text-align:center; margin-bottom:24px;">
          <span style="font-size:40px; font-weight:900; letter-spacing:12px; color:#f97316;">${otp}</span>
        </div>
        <p style="color:#9CA3AF; font-size:12px; text-align:center;">
          If you didn't request this code, please ignore this email.<br/>
          Never share this code with anyone.
        </p>
      </div>
    `,
  });
}
