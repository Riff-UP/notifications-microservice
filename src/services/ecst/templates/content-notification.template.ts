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

export function contentNotificationTemplate(
  followerName: string,
  type: string,
  message: string,
): string {
  const label = typeLabels[type] ?? type;

  return `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Hola ${followerName} 🎵</h2>
        <p style="font-size: 16px; color: #333;">
          <strong>${label}</strong>
        </p>
        <p style="font-size: 14px; color: #555;">${message}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">
          Recibiste este email porque sigues a este artista en Riff.
        </p>
      </body>
    </html>
  `;
}
