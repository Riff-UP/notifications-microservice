export const passwordResetTemplate = (userName: string, resetUrl: string): string => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
  </head>
  <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Hola ${userName}</h2>
    <p>Recibimos una solicitud para restablecer tu contraseña.</p>
    <p>Haz clic en el siguiente enlace para continuar:</p>
    <a href="${resetUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
      Restablecer contraseña
    </a>
    <p>Este enlace expira en 15 minutos.</p>
    <p>Si no solicitaste esto, ignora este mensaje.</p>
  </body>
</html>
`;