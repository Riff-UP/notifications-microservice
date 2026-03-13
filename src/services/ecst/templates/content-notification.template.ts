/**
 * Template de email para notificaciones de contenido (posts, eventos).
 * Usada en Fase 3 del flujo ECST.
 */

const typeLabels: Record<string, string> = {
  new_post: 'Nuevo Post',
  new_event: 'Nuevo Evento',
  event_update: 'Evento Actualizado',
  event_cancelled: 'Evento Cancelado',
};

const typeColors: Record<string, string> = {
  new_post: '#2f9bff',
  new_event: '#06a6ff',
  event_update: '#3b82f6',
  event_cancelled: '#ef4444',
};

export function contentNotificationTemplate(
  followerName: string,
  type: string,
  message: string,
): string {
  const label = typeLabels[type] ?? type;
  const accent = typeColors[type] ?? '#2f9bff';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Riff Notifications</title>
      </head>
      <body style="margin:0; padding:0; background:#0f1117; font-family: 'Segoe UI', Arial, sans-serif; color:#f3f4f6;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#0f1117; padding:24px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:620px; border-collapse:separate; border-spacing:0; background:#1b1e26; border:1px solid #2a2e39; border-radius:16px; overflow:hidden;">
                <tr>
                  <td style="padding:18px 22px; background:linear-gradient(90deg, #131722 0%, #1d2433 100%); border-bottom:1px solid #2a2e39;">
                    <span style="font-size:22px; font-weight:800; letter-spacing:0.4px; color:#ffffff;">Riff</span>
                    <span style="display:inline-block; margin-left:10px; font-size:12px; color:#93c5fd; border:1px solid #1e4f8f; background:#10284a; padding:4px 8px; border-radius:999px; vertical-align:middle;">Notificacion</span>
                  </td>
                </tr>

                <tr>
                  <td style="padding:24px 22px 8px 22px;">
                    <p style="margin:0 0 10px 0; font-size:14px; color:#9aa3b2;">Hola ${followerName},</p>
                    <h2 style="margin:0; font-size:26px; line-height:1.25; color:#ffffff; font-weight:700;">Actividad nueva en Riff</h2>
                  </td>
                </tr>

                <tr>
                  <td style="padding:14px 22px 2px 22px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate; border-spacing:0; background:#171a22; border:1px solid #2a2e39; border-radius:12px;">
                      <tr>
                        <td style="padding:16px 16px 10px 16px;">
                          <span style="display:inline-block; font-size:11px; font-weight:700; letter-spacing:0.5px; text-transform:uppercase; color:${accent}; border:1px solid ${accent}; background:#121826; padding:4px 8px; border-radius:999px;">${label}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:0 16px 16px 16px; font-size:15px; line-height:1.6; color:#d1d5db;">
                          ${message}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:20px 22px 24px 22px; font-size:12px; line-height:1.6; color:#7f8896; border-top:1px solid #2a2e39;">
                    Recibiste este correo porque sigues a este artista en Riff.<br>
                    Si no reconoces esta actividad, puedes ignorar este mensaje.
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
