# Gateway → Notifications-MS: Flujos, Message Patterns y Payloads

Este documento describe los flujos relevantes, los nombres de eventos (RabbitMQ / EventPattern) que consume `Notifications-MS`, los MessagePattern RPC que expone el microservicio, los payloads esperados y una lista de verificación para el Gateway (qué debe poder hacer) para integrarlo correctamente.

**Resumen rápido**

- Notifications-MS consume eventos de tipo `follow.*`, `post.created`, `event.*` y `send.resetPassword` vía RabbitMQ (`riff_queue`).
- Notifications-MS expone RPC MessagePatterns para CRUD de notificaciones.

---

## 1) Eventos (EventPattern) que recibe Notifications-MS

Estos eventos deben publicarse en la cola `riff_queue` con el nombre exacto (routing key). Cada evento incluye el payload JSON indicado.

1. follow.created

- Origen: Users-MS
- Propósito: Mantener réplica local `follow_refs` (ECST Fase 1)
- Payload (JSON):

```
{
  "follower_id": "string",        // id del seguidor en Users (SQL)
  "follower_email": "string",
  "follower_name": "string",
  "followed_id": "string"         // id del artista seguido
}
```

Ejemplo:

```
{
  "follower_id": "user-123",
  "follower_email": "fan@example.com",
  "follower_name": "Fan Nombre",
  "followed_id": "artist-456"
}
```

2. follow.removed

- Origen: Users-MS
- Propósito: Borrar réplica local
- Payload:

```
{
  "follower_id": "string",
  "followed_id": "string"
}
```

3. post.created

- Origen: Content-MS
- Propósito: Notificar a followers del autor (ECST Fase 2→3)
- Payload:

```
{
  "type": "new_post",
  "message": "New post: {title}",
  "userId": "string",   // id del autor (SQL id usado en follow refs)
  "postId": "string"    // id del post (mongo id)
}
```

4. event.created

- Origen: Content-MS
- Propósito: Igual que post.created pero para eventos
- Payload:

```
{
  "type": "new_event",
  "message": "New event: {title}",
  "userId": "string",
  "eventId": "string"
}
```

5. event.updated

- Origen: Content-MS
- Propósito: Notificar actualización de evento
- Payload:

```
{
  "type": "event_update",
  "message": "Event updated: {title}",
  "userId": "string",
  "eventId": "string"
}
```

6. event.cancelled

- Origen: Content-MS
- Propósito: Notificar cancelación de evento
- Payload:

```
{
  "type": "event_cancelled",
  "message": "Event cancelled: {title}",
  "userId": "string",
  "eventId": "string"
}
```

7. send.resetPassword

- Origen: Auth / Front (vía Gateway) — flujo existente
- Propósito: Enviar email de recuperación de contraseña
- Payload:

```
{
  "mail": "user@example.com",
  "userId": "string",
  "userName": "string",
  "token": "string"
}
```

---

## 2) MessagePattern (RPC) que expone Notifications-MS

Estas rutas son `MessagePattern` (RPC) y no eventos; el Gateway puede usar RPC para consultas o acciones administrativas.

- `createNotification` — payload: `CreateNotificationDto`
  - `{ userIdReceiver: string, type: string, message: string }`
- `findAllNotifications` — no payload
- `findOneNotification` — payload: `id: string`
- `updateNotification` — payload: `{ id: string, ...fields }`
- `removeNotification` — payload: `id: string`

Uso típico desde API Gateway: usar RPC para lecturas (obtener notificaciones del usuario) y para crear pruebas/seed de notificaciones si fuera necesario.

---

## 3) Propuesta de endpoints HTTP que el Gateway debería exponer (mapeo a eventos)

NOTA: Estos son endpoints sugeridos para que el Gateway reciba requests desde el frontend o desde otros MS y los convierta en eventos publicados a RabbitMQ.

1. Seguimiento (normalmente Users-MS emite esto; incluir solo si Gateway centraliza eventos)

- POST /events/follow/created
  - Body: payload de `follow.created` (ver sección 1)
  - Acción Gateway: publicar evento `follow.created` en `riff_queue`
- POST /events/follow/removed
  - Body: payload de `follow.removed`
  - Acción: publicar `follow.removed`

2. Contenido (Content-MS normalmente emite esto; Gateway puede exponer si centraliza)

- POST /events/post/created
  - Body: payload de `post.created`
  - Acción: publicar `post.created`
- POST /events/event/created
- POST /events/event/updated
- POST /events/event/cancelled
  - Bodies: payloads correspondientes (ver sección 1)

3. Reset password request (frontend → Gateway → Notifications-MS)

- POST /events/reset-password/send
  - Body: payload de `send.resetPassword`
  - Acción: publicar `send.resetPassword` en `riff_queue`

4. RPC (si Gateway implementa RPC to microservices via RabbitMQ)

- GET /api/notifications -> RPC `findAllNotifications`
- GET /api/notifications/:id -> RPC `findOneNotification` (payload id)
- POST /api/notifications -> RPC `createNotification`
- PATCH /api/notifications/:id -> RPC `updateNotification`
- DELETE /api/notifications/:id -> RPC `removeNotification`

---

## 4) Checklist: ¿Está el Gateway preparado para integrar con Notifications-MS?

El Gateway debe soportar lo siguiente para integrarse correctamente:

- [ ] Publicar mensajes en RabbitMQ (exchange/queue) `riff_queue` con el nombre de routing key igual al EventPattern: `follow.created`, `post.created`, etc.
- [ ] Usar colas/confirmations durables si se desea fiabilidad (colocar `persistent` flag y `durable` queue)
- [ ] Convertir las solicitudes HTTP entrantes en el JSON exacto esperado (validar campos requeridos).
- [ ] Para RPC (MessagePattern), el Gateway debe estar configurado para usar el cliente RPC de NestJS o publicar/consumir usando el patrón `replyTo` si no usa Nest.
- [ ] Manejar reintentos y dead-lettering cuando la publicación falle.
- [ ] Log y métricas de eventos publicados (para operar ECST con confianza).

Si el Gateway ya publica en `riff_queue` usando las mismas routing keys y puede hacer RPC a través de RabbitMQ, entonces está listo para enviar los payloads descritos.

---

## 5) Notas operativas y recomendaciones

- Consistencia eventual: Notifications-MS depende de que `follow.*` llegue antes de los eventos de contenido. Asegurar ordering relativo cuando sea crítico (o tolerar la eventualidad). Opciones: delayed retry, idempotent upserts.
- Idempotencia: Todos los `follow.created` deben ser upsert; `follow.removed` debe ser idempotente.
- Tamaño del payload: mantener los eventos pequeños (ids + required fields). No enviar lista de followers desde Content-MS (ECST evita ese acoplamiento).
- Seguridad: el Gateway debe validar y autenticar llamadas que causan eventos (por ejemplo, solo Users-MS o servicios internos pueden publicar `follow.*` si no se quiere que un cliente lo haga directamente).

---

## 6) Resumen y pasos siguientes

- Enviar este archivo al equipo del Gateway para que implemente los endpoints y/o publicación de eventos.
- Probar con mensajes reales: publicar un `follow.created` y luego un `post.created` y verificar que Notifications-MS crea entradas en `notifications` y envía emails.

---

Archivo generado automáticamente para integradores — si quieres, puedo también generar ejemplos de clientes (curl / node) para publicar cada evento desde el Gateway y scripts de prueba.
