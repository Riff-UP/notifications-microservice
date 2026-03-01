export function resetTemplate(
  name: string = 'juan',
  resetLink: string = 'jaja',
) {
  return `
    <div style="font-family: Arial; padding:20px;">
      <h2>Hola ${name}</h2>
      <p>Recibimos una solicitud para restablecer tu contraseña en Riff.</p>
      <a 
        href="${resetLink}" 
        style="
          background-color:#000;
          color:#fff;
          padding:10px 15px;
          text-decoration:none;
          border-radius:5px;
        ">
        Restablecer contraseña
      </a>
      <p>Este enlace expira en 15 minutos.</p>
    </div>
  `;
}
