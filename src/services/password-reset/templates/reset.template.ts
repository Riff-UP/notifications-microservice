export function resetTemplate(
  name: string = 'juan',
  resetLink: string = 'jaja',
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Riff - Restablecer Contrasena</title>
      </head>
      <body style="margin:0; padding:0; background:#0f1117; font-family:'Segoe UI', Arial, sans-serif; color:#f3f4f6;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#0f1117; padding:24px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:620px; border-collapse:separate; border-spacing:0; background:#1b1e26; border:1px solid #2a2e39; border-radius:16px; overflow:hidden;">
                <tr>
                  <td style="padding:18px 22px; background:linear-gradient(90deg, #131722 0%, #1d2433 100%); border-bottom:1px solid #2a2e39;">
                    <span style="font-size:22px; font-weight:800; letter-spacing:0.4px; color:#ffffff;">Riff</span>
                    <span style="display:inline-block; margin-left:10px; font-size:12px; color:#93c5fd; border:1px solid #1e4f8f; background:#10284a; padding:4px 8px; border-radius:999px; vertical-align:middle;">Seguridad</span>
                  </td>
                </tr>

                <tr>
                  <td style="padding:24px 22px 10px 22px;">
                    <p style="margin:0 0 10px 0; font-size:14px; color:#9aa3b2;">Hola ${name},</p>
                    <h2 style="margin:0; font-size:26px; line-height:1.25; color:#ffffff; font-weight:700;">Restablece tu contrasena</h2>
                  </td>
                </tr>

                <tr>
                  <td style="padding:8px 22px 0 22px; font-size:15px; line-height:1.65; color:#d1d5db;">
                    Recibimos una solicitud para restablecer la contrasena de tu cuenta en Riff.
                    Si fuiste tu, usa el siguiente boton para continuar.
                  </td>
                </tr>

                <tr>
                  <td style="padding:22px;">
                    <a
                      href="${resetLink}"
                      style="display:inline-block; background:#0b76ff; color:#ffffff; text-decoration:none; font-weight:700; font-size:15px; padding:12px 20px; border-radius:10px; border:1px solid #2f9bff;">
                      Restablecer contrasena
                    </a>
                  </td>
                </tr>

                <tr>
                  <td style="padding:0 22px 20px 22px; font-size:13px; color:#9aa3b2; line-height:1.6;">
                    Este enlace expira en 15 minutos.<br>
                    Si no solicitaste este cambio, puedes ignorar este mensaje.
                  </td>
                </tr>

                <tr>
                  <td style="padding:14px 22px 22px 22px; border-top:1px solid #2a2e39; font-size:12px; color:#7f8896; line-height:1.6;">
                    Consejo de seguridad: nunca compartas este enlace ni tu codigo de acceso.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}
