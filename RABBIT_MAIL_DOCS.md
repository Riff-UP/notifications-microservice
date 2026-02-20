# Documentación: Consumo de RabbitMQ y Envío de Correos

## Arquitectura General

```
┌──────────────────────┐        RabbitMQ         ┌──────────────────────────┐
│   Users Microservice │  ──── riff_queue ────►  │ Notifications Microserv. │
│      (Producer)      │   send.resetPassword    │       (Consumer)         │
└──────────────────────┘                         └────────────┬─────────────┘
                                                              │
                                                              ▼
                                                      ┌──────────────┐
                                                      │    Resend    │
                                                      │  (Email API) │
                                                      └──────────────┘
```

El microservicio de **Users** (producer) emite eventos a través de RabbitMQ en la cola `riff_queue`. El microservicio de **Notifications** (consumer) escucha esos eventos y ejecuta la lógica correspondiente, como enviar un correo de reseteo de contraseña usando **Resend**.

---

## 1. Variables de Entorno (`.env`)

```dotenv
PORT = 3002
DATABASE_URL="postgresql://postgres:anona29050XD@localhost:5432/riff_notifications"
RABBIT_URL = 'amqp://localhost:5672'
RESEND_KEY = 're_RyXkFXX7_...'
```

| Variable       | Descripción                                     |
| -------------- | ----------------------------------------------- |
| `PORT`         | Puerto HTTP del microservicio de notificaciones |
| `DATABASE_URL` | Conexión a PostgreSQL (BD propia del micro)     |
| `RABBIT_URL`   | URL de conexión a RabbitMQ                      |
| `RESEND_KEY`   | API Key de Resend para enviar correos           |

Las variables se validan con **Joi** en `src/config/envs.ts`:

```typescript
const envSchema = joi
  .object({
    PORT: joi.number().required(),
    RABBIT_URL: joi.string(),
    RESEND_KEY: joi.string(),
  })
  .unknown(true);
```

Y se exportan como:

```typescript
export const envs = {
  port: envVars.PORT,
  rabbit_url: envVars.RABBIT_URL,
  resed_key: envVars.RESEND_KEY,
};
```

---

## 2. Configuración de RabbitMQ en `main.ts`

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Conectar RabbitMQ como microservicio híbrido
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [envs.rabbit_url], // amqp://localhost:5672
      queue: 'riff_queue', // ⚠️ DEBE coincidir con el producer
      queueOptions: {
        durable: true, // La cola persiste si RabbitMQ se reinicia
      },
    },
  });

  await app.startAllMicroservices(); // Inicia el consumer de RabbitMQ
  await app.listen(envs.port); // Inicia el servidor HTTP
}
```

### Puntos clave:

- Se usa una **aplicación híbrida**: HTTP + Microservicio RabbitMQ.
- `app.connectMicroservice()` registra el transporte RabbitMQ.
- `app.startAllMicroservices()` activa la escucha de eventos.
- La cola `riff_queue` **debe ser la misma** tanto en el producer como en el consumer.

---

## 3. Registro de Módulos en `app.module.ts`

```typescript
@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [NotificationConsumerController],
  providers: [resetPassword, MailService],
})
export class AppModule {}
```

### ¿Por qué se registran así?

- **`NotificationConsumerController`**: Es el controller que escucha los eventos de RabbitMQ con `@EventPattern`.
- **`resetPassword`**: Servicio que orquesta el envío del correo. Está decorado con `@Injectable()`.
- **`MailService`**: Servicio que interactúa con la API de Resend. También `@Injectable()`.

> **Importante:** Todo servicio que se inyecte en un constructor debe estar registrado como `provider` en el módulo correspondiente. Si no, NestJS lanza `UnknownDependenciesException`.

---

## 4. Consumer Controller (`notification-consumer.controller.ts`)

```typescript
@Controller('notification-consumer')
export class NotificationConsumerController {
  constructor(
    @Inject(resetPassword)
    private readonly resetPssw: resetPassword,
  ) {}

  @EventPattern('send.resetPassword')
  async handleFollowEvent(data: any) {
    console.log('Evento recibido en consumer:', data);
    await this.resetPssw.sendPassWordResetEmail(data);
  }
}
```

### ¿Cómo funciona?

1. **`@EventPattern('send.resetPassword')`**: Escucha eventos con ese nombre exacto de RabbitMQ.
2. Cuando llega un evento, `data` contiene el payload enviado por el producer.
3. Se delega al servicio `resetPassword` para procesar el envío del correo.

### Datos que recibe (`data`):

```json
{
  "mail": "usuario@ejemplo.com",
  "userId": "u1",
  "userName": "Juan",
  "token": "82ac9385c203fab7..."
}
```

---

## 5. Servicio de Reseteo (`resetPassword.service.ts`)

```typescript
@Injectable()
export class resetPassword {
  private readonly logger = new Logger(resetPassword.name);
  constructor(private readonly mailService: MailService) {}

  async sendPassWordResetEmail(data: any) {
    this.logger.log('Intentando enviar email de reseteo', data);
    try {
      const result = await this.mailService.sendPasswordReset({
        to: data.mail, // ← mapeo: mail → to
        name: data.userName, // ← mapeo: userName → name
        token: data.token, // ← se pasa directo
      });
      this.logger.log('Email de reseteo enviado correctamente', result);
    } catch (err) {
      this.logger.error('Error enviando email de reseteo', err);
    }
  }
}
```

### Mapeo de datos (Producer → Consumer):

| Campo del Producer | Campo que espera `MailService` |
| ------------------ | ------------------------------ |
| `data.mail`        | `options.to`                   |
| `data.userName`    | `options.name`                 |
| `data.token`       | `options.token`                |

> **Este mapeo fue clave.** Si los nombres de campos no coinciden, el correo se envía con datos `undefined`.

---

## 6. Servicio de Mail (`mail.service.ts`)

```typescript
@Injectable()
export class MailService {
  private resend = new Resend(envs.resed_key);

  async sendPasswordReset(options: {
    to: string;
    name: string;
    token: string;
  }) {
    const resetLink = `${process.env.FRONT_URL}/reset-password?token=${options.token}`;

    const result = await this.resend.emails.send({
      from: 'Riff <onboarding@resend.dev>', // Dominio de prueba de Resend
      to: options.to,
      subject: 'Recuperación de contraseña - Riff',
      html: resetTemplate(options.name, resetLink),
    });

    return result;
  }
}
```

### Configuración de Resend:

- **API Key**: Se obtiene de `envs.resed_key` (variable `RESEND_KEY` del `.env`).
- **`from`**: Usa `onboarding@resend.dev` (dominio de prueba). Para producción, hay que verificar un dominio propio en el dashboard de Resend.
- **`to`**: Email del destinatario.
- **`html`**: Template HTML generado por `resetTemplate()`.

### Template (`resetTemplate.ts`):

```typescript
export function resetTemplate(name: string, resetLink: string) {
  return `
    <div style="font-family: Arial; padding:20px;">
      <h2>Hola ${name}</h2>
      <p>Recibimos una solicitud para restablecer tu contraseña en Riff.</p>
      <a href="${resetLink}" style="background-color:#000; color:#fff; padding:10px 15px; text-decoration:none; border-radius:5px;">
        Restablecer contraseña
      </a>
      <p>Este enlace expira en 15 minutos.</p>
    </div>
  `;
}
```

---

## 7. Flujo Completo (Paso a Paso)

```
1. Usuario solicita reseteo de contraseña
         │
         ▼
2. Users-MS genera token, lo hashea y lo guarda en BD
         │
         ▼
3. Users-MS emite evento a RabbitMQ:
   this.client.emit('send.resetPassword', {
     mail: user.email,
     userId: user.id,
     userName: user.name,
     token: hashedToken,
   });
         │
         ▼
4. RabbitMQ enruta el mensaje a la cola 'riff_queue'
         │
         ▼
5. Notifications-MS recibe el evento via @EventPattern('send.resetPassword')
         │
         ▼
6. NotificationConsumerController → resetPassword.sendPassWordResetEmail()
         │
         ▼
7. Se mapean los campos: mail→to, userName→name, token→token
         │
         ▼
8. MailService.sendPasswordReset() envía el correo via Resend API
         │
         ▼
9. Usuario recibe el correo con el enlace de reseteo
```

---

## 8. Errores Comunes y Soluciones

| Error                          | Causa                                  | Solución                                           |
| ------------------------------ | -------------------------------------- | -------------------------------------------------- |
| `EADDRINUSE`                   | Puerto ya en uso                       | Matar el proceso anterior: `taskkill /PID <id> /F` |
| `UnknownDependenciesException` | Servicio no registrado como provider   | Agregar el servicio en `providers` del módulo      |
| Evento no llega al consumer    | Cola diferente entre producer/consumer | Verificar que ambos usen `riff_queue`              |
| Correo no se envía             | Campos `undefined` en el DTO           | Mapear correctamente los nombres de campos         |
| Correo rechazado por Resend    | Dominio no verificado                  | Usar `onboarding@resend.dev` para desarrollo       |

---

## 9. Nota sobre Resend en Producción

Con `onboarding@resend.dev` **solo puedes enviar correos a la dirección asociada a tu cuenta de Resend**. Para enviar a cualquier destinatario:

1. Ve al [dashboard de Resend](https://resend.com/domains)
2. Agrega y verifica tu dominio propio
3. Cambia el `from` a: `'Riff <no-reply@tudominio.com>'`
