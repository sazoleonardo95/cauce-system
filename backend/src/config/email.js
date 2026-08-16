const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  console.log('[EMAIL] Attempting to send email to:', to);
  try {
    const result = await resend.emails.send({
      from: 'CauCE <onboarding@resend.dev>',
      to,
      subject,
      html,
    });
    console.log('[EMAIL] Email sent successfully:', result.id);
    return true;
  } catch (error) {
    console.error('[EMAIL] Email send error:', error.message);
    return false;
  }
};

const sendInvitationEmail = async (email, companyName, invitedByName, inviteUrl) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f7fa; margin: 0; padding: 40px 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #2563EB, #1E40AF); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
        .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }
        .body { padding: 35px 30px; }
        .body h2 { color: #1E293B; font-size: 20px; margin: 0 0 15px; }
        .body p { color: #64748B; line-height: 1.6; font-size: 15px; }
        .company-badge { background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 12px 16px; margin: 20px 0; text-align: center; }
        .company-badge strong { color: #2563EB; font-size: 16px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #2563EB, #1E40AF); color: white; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 20px 0; }
        .footer { padding: 20px 30px; background: #F8FAFC; text-align: center; border-top: 1px solid #E2E8F0; }
        .footer p { color: #94A3B8; font-size: 12px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>CauCE</h1>
          <p>Invitacion para unirse al equipo</p>
        </div>
        <div class="body">
          <h2>Has sido invitado a un equipo!</h2>
          <p><strong>${invitedByName}</strong> te ha invitado a formar parte del equipo de ventas en <strong>${companyName}</strong>.</p>
          <div class="company-badge">
            <strong>${companyName}</strong>
          </div>
          <p>Haz clic en el boton de abajo para aceptar la invitacion y crear tu cuenta:</p>
          <div style="text-align: center;">
            <a href="${inviteUrl}" class="btn">Aceptar Invitacion</a>
          </div>
          <p style="font-size: 13px; color: #94A3B8; margin-top: 25px;">Este enlace expira en 7 dias. Si no solicitaste esta invitacion, puedes ignorar este mensaje.</p>
        </div>
        <div class="footer">
          <p>Este es un correo automatico de CauCE. No respondas a este mensaje.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Invitacion para unirte a ${companyName} en CauCE`,
    html,
  });
};

module.exports = { sendEmail, sendInvitationEmail };
