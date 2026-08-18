import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT) || 587,
  secure: process.env.EMAIL_SERVER_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

export async function sendPasswordResetCode(email: string, code: string) {
  const html = `
    <div style="
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      max-width: 480px;
      margin: 0 auto;
      background: #0B0B0B;
      border-radius: 16px;
      padding: 40px 32px;
      color: #F5F5F5;
    ">
      <div style="text-align: center; margin-bottom: 32px;">
        <span style="
          font-size: 24px;
          font-weight: 900;
          background: linear-gradient(135deg, #EF2020, #FF5A00, #FFB800);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 2px;
        ">VIDEOMAX</span>
      </div>

      <h2 style="
        font-size: 20px;
        font-weight: 700;
        color: #F5F5F5;
        text-align: center;
        margin: 0 0 8px 0;
      ">Redefinição de senha</h2>

      <p style="
        font-size: 14px;
        color: #8A8A8A;
        text-align: center;
        margin: 0 0 32px 0;
        line-height: 1.5;
      ">
        Use o código abaixo para redefinir sua senha.<br/>
        Ele expira em <strong style="color: #FF5A00;">10 minutos</strong>.
      </p>

      <div style="
        background: #111111;
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        margin-bottom: 32px;
      ">
        <span style="
          font-family: 'JetBrains Mono', 'Courier New', monospace;
          font-size: 36px;
          font-weight: 700;
          letter-spacing: 8px;
          color: #FF5A00;
        ">${code}</span>
      </div>

      <p style="
        font-size: 12px;
        color: #5F5F5F;
        text-align: center;
        margin: 0;
        line-height: 1.5;
      ">
        Se você não solicitou esta redefinição, ignore este e-mail.
      </p>
    </div>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'VideoMax <noreply@videomax.app>',
    to: email,
    subject: 'VideoMax — Código de redefinição de senha',
    html,
  })
}
