// apps/web/lib/email.ts

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, code: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: email,
      subject: '📧 Подтверждение почты в LifeOS',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Подтверждение почты</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
              background: #0a0a0a; 
              color: #ffffff;
              padding: 40px 20px;
              line-height: 1.6;
            }
            .container { 
              max-width: 520px; 
              margin: 0 auto; 
              background: #141414; 
              padding: 48px 40px; 
              border-radius: 24px; 
              border: 1px solid rgba(255,255,255,0.06);
              box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            }
            .logo { 
              font-size: 28px; 
              font-weight: 700; 
              background: linear-gradient(135deg, #3b82f6, #8b5cf6); 
              -webkit-background-clip: text; 
              -webkit-text-fill-color: transparent; 
              margin-bottom: 8px;
              display: inline-block;
            }
            .subtitle {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 24px;
            }
            .divider {
              height: 1px;
              background: rgba(255,255,255,0.06);
              margin: 24px 0;
            }
            h2 { 
              font-size: 22px; 
              font-weight: 600; 
              color: #ffffff;
              margin: 0 0 4px;
            }
            .text { 
              color: #9ca3af; 
              font-size: 15px;
              margin: 8px 0 16px;
            }
            .code-container {
              background: rgba(59,130,246,0.05);
              border: 1px solid rgba(59,130,246,0.15);
              border-radius: 16px;
              padding: 24px;
              margin: 20px 0;
              text-align: center;
            }
            .code { 
              font-size: 48px; 
              font-weight: 700; 
              letter-spacing: 12px; 
              color: #3b82f6;
              font-family: 'Courier New', monospace;
              user-select: all;
            }
            .hint {
              font-size: 13px;
              color: #6b7280;
              margin-top: 8px;
            }
            .info {
              font-size: 13px;
              color: #6b7280;
              margin: 16px 0 0;
              padding: 12px 16px;
              background: rgba(255,255,255,0.02);
              border-radius: 8px;
              border: 1px solid rgba(255,255,255,0.03);
            }
            .info strong { color: #d1d5db; }
            .footer { 
              margin-top: 32px; 
              padding-top: 20px; 
              border-top: 1px solid rgba(255,255,255,0.04);
              font-size: 12px; 
              color: #4b5563; 
              text-align: center;
            }
            .footer a {
              color: #3b82f6;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div>
              <span class="logo">⚡ LifeOS</span>
              <div class="subtitle">Твоя жизнь. Твоя система.</div>
            </div>
            
            <div class="divider"></div>
            
            <h2>Подтверждение почты</h2>
            <p class="text">
              Введите этот код в приложении, чтобы подтвердить свой email:
            </p>
            
            <div class="code-container">
              <div class="code">${code}</div>
              <div class="hint">Код действителен 15 минут</div>
            </div>
            
            <div class="info">
              💡 <strong>Не запрашивали код?</strong><br>
              Если вы не пытались подтвердить почту, просто проигнорируйте это письмо.
            </div>
            
            <div class="footer">
              © 2024 LifeOS · Все права защищены<br>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}">${process.env.NEXT_PUBLIC_APP_URL || 'localhost:3000'}</a>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      throw new Error(error.message);
    }

    console.log(`✅ Email sent to ${email}, id: ${data?.id}`);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error('❌ Send email error:', error);
    throw error;
  }
}