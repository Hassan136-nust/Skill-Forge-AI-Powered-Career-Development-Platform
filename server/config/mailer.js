import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

// Create Nodemailer Transporter using Gmail SMTP
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
})

// Send 6-Digit OTP Email Template
export const sendOtpEmail = async (toEmail, otpCode, userName = 'Student') => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #02040A; color: #FFF7E8; margin: 0; padding: 20px; }
        .container { max-width: 540px; margin: 0 auto; background: #070910; border: 1px solid #FFD166; border-radius: 16px; padding: 35px 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.8); }
        .logo { font-size: 24px; font-weight: 800; color: #FFD166; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; text-align: center; }
        .title { font-size: 20px; font-weight: 700; color: #FFF7E8; margin-bottom: 12px; }
        .text { font-size: 14px; line-height: 1.6; color: #B8B3C7; margin-bottom: 25px; }
        .otp-box { background: #0D101A; border: 2px dashed #FFD166; border-radius: 12px; padding: 18px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #FFD166; margin-bottom: 25px; }
        .footer { font-size: 11px; color: #64748B; border-top: 1px solid #1C2030; padding-top: 15px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🪐 SKILLFORGE</div>
        <div class="title">Security Verification Code</div>
        <p class="text">Hello <strong>${userName}</strong>,<br>Use the following 6-digit cryptographic verification code to authenticate your SkillForge account. This code is valid for <strong>10 minutes</strong>.</p>
        <div class="otp-box">${otpCode}</div>
        <p class="text" style="font-size: 12px; color: #8C879B;">If you did not request this code, you can safely ignore this email. Do not share this code with anyone.</p>
        <div class="footer">
          SkillForge — LoopLearn Hackathon 2026 (PS-03)<br>Democratizing AI-Grounded Career Acceleration
        </div>
      </div>
    </body>
    </html>
  `

  const mailOptions = {
    from: process.env.SMTP_FROM || `"SkillForge" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `🔐 Your SkillForge Security Code: ${otpCode}`,
    html: htmlContent,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log(`[Nodemailer] OTP email dispatched to ${toEmail}: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error(`[Nodemailer] Failed to dispatch OTP to ${toEmail}:`, error.message)
    return { success: false, error: error.message }
  }
}
