# Notifications Microservice — Payloads Reference

Documentación de todos los payloads de entrada y salida del microservicio de notificaciones.

---

## Tabla de contenidos

- [CRUD — MessagePattern (Request/Response)](#crud--messagepattern-requestresponse)
  - [createNotification](#createnotification)
  - [findAllNotifications](#findallnotifications)
  - [findNotificationsByUser](#findnotificationsbyuser)
  - [findOneNotification](#findonenotification)
  - [updateNotification](#updatenotification)
  - [removeNotification](#removenotification)
- [Eventos — EventPattern (Fire & Forget)](#eventos--eventpattern-fire--forget)
  - [send.resetPassword](#sendresetpassword)
  - [follow.created](#followcreated)
  - [follow.removed](#followremoved)
  - [post.created](#postcreated)
  - [event.created](#eventcreated)
  - [event.updated](#eventupdated)
  - [event.cancelled](#eventcancelled)
- [Formato de respuestas](#formato-de-respuestas)
  - [Respuesta exitosa (sin paginación)](#respuesta-exitosa-sin-paginación)
  - [Respuesta exitosa (con paginación)](#respuesta-exitosa-con-paginación)
  - [Respuesta de error](#respuesta-de-error)

---

## CRUD — MessagePattern (Request/Response)

Operaciones CRUD vía RabbitMQ usando `@MessagePattern`. El Gateway envía un mensaje y espera respuesta.

---

### `createNotification`

**Payload de entrada:**

```json
{
  "userIdReceiver": "string (requerido)",
  "type": "string (requerido)",
  "message": "string (requerido)"
}
```

**Respuesta exitosa:**

```json
{
  "statusCode": 201,
  "message": "Notification created successfully",
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "userIdReceiver": "user-uuid-123",
    "type": "post_created",
    "message": "Un artista que sigues publicó algo nuevo",
    "createdAt": "2026-03-01T12:00:00.000Z",
    "updatedAt": "2026-03-01T12:00:00.000Z"
  }
}
```

---

### `findAllNotifications`

**Payload de entrada:**

```json
{
  "page": 1,
  "limit": 20
}
```

> Ambos campos son opcionales. Por defecto: `page = 1`, `limit = 20`.

**Respuesta exitosa:**

```json
{
  "statusCode": 200,
  "message": "Notifications retrieved successfully",
  "data": [
    {
      "_id": "665f1a2b3c4d5e6f7a8b9c0d",
      "userIdReceiver": "user-uuid-123",
      "type": "post_created",
      "message": "Un artista que sigues publicó algo nuevo",
      "createdAt": "2026-03-01T12:00:00.000Z",
      "updatedAt": "2026-03-01T12:00:00.000Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### `findNotificationsByUser`

**Payload de entrada:**

```json
{
  "userIdReceiver": "string (requerido)",
  "pagination": {
    "page": 1,
    "limit": 20
  }
}
```

> `pagination` es opcional. Si se omite, usa valores por defecto.

**Respuesta exitosa:** Mismo formato que [`findAllNotifications`](#findallnotifications), filtrado por usuario.

---

### `findOneNotification`

**Payload de entrada:**

```json
"665f1a2b3c4d5e6f7a8b9c0d"
```

> Se envía directamente el `id` (string MongoId).

**Respuesta exitosa:**

```json
{
  "statusCode": 200,
  "message": "Notification retrieved successfully",
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "userIdReceiver": "user-uuid-123",
    "type": "post_created",
    "message": "Un artista que sigues publicó algo nuevo",
    "createdAt": "2026-03-01T12:00:00.000Z",
    "updatedAt": "2026-03-01T12:00:00.000Z"
  }
}
```

---

### `updateNotification`

**Payload de entrada:**

```json
{
  "id": "665f1a2b3c4d5e6f7a8b9c0d (requerido, MongoId)",
  "userIdReceiver": "string (opcional)",
  "type": "string (opcional)",
  "message": "string (opcional)"
}
```

> Solo `id` es obligatorio. Los demás campos son opcionales (partial update).

**Respuesta exitosa:**

```json
{
  "statusCode": 200,
  "message": "Notification updated successfully",
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "userIdReceiver": "user-uuid-123",
    "type": "event_updated",
    "message": "Mensaje actualizado",
    "createdAt": "2026-03-01T12:00:00.000Z",
    "updatedAt": "2026-03-01T12:30:00.000Z"
  }
}
```

---

### `removeNotification`

**Payload de entrada:**

```json
"665f1a2b3c4d5e6f7a8b9c0d"
```

> Se envía directamente el `id` (string MongoId).

**Respuesta exitosa:**

```json
{
  "statusCode": 200,
  "message": "Notification deleted successfully"
}
```

---

## Eventos — EventPattern (Fire & Forget)

Eventos recibidos vía RabbitMQ usando `@EventPattern`. No devuelven respuesta al emisor.

---

### `send.resetPassword`

**Emisor:** Users Microservice

**Payload de entrada:**

```json
{
  "mail": "usuario@email.com (requerido, email válido)",
  "userName": "string (requerido)",
  "token": "string (requerido)"
}
```

**Acción:** Envía un email de recuperación de contraseña usando Resend.

---

### `follow.created`

**Emisor:** Users Microservice

**Payload de entrada:**

```json
{
  "follower_id": "string (requerido)",
  "follower_email": "string (requerido, email válido)",
  "follower_name": "string (requerido)",
  "followed_id": "string (requerido)"
}
```

**Acción:** Crea/actualiza una réplica local del follow en MongoDB (upsert).

---

### `follow.removed`

**Emisor:** Users Microservice

**Payload de entrada:**

```json
{
  "follower_id": "string (requerido)",
  "followed_id": "string (requerido)"
}
```

**Acción:** Elimina la réplica local del follow en MongoDB.

---

### `post.created`

**Emisor:** Content Microservice

**Payload de entrada:**

```json
{
  "type": "string (requerido)",
  "message": "string (requerido)",
  "userId": "string (requerido)",
  "postId": "string (opcional)"
}
```

**Acción:** Busca los followers del autor, crea una notificación por cada uno y les envía un email.

---

### `event.created`

**Emisor:** Content Microservice

**Payload de entrada:**

```json
{
  "type": "string (requerido)",
  "message": "string (requerido)",
  "userId": "string (requerido)",
  "eventId": "string (opcional)"
}
```

**Acción:** Igual que `post.created` — notifica a todos los followers del artista.

---

### `event.updated`

**Emisor:** Content Microservice

**Payload de entrada:**

```json
{
  "type": "string (requerido)",
  "message": "string (requerido)",
  "userId": "string (requerido)",
  "eventId": "string (opcional)"
}
```

**Acción:** Notifica a los followers sobre la actualización del evento.

---

### `event.cancelled`

**Emisor:** Content Microservice

**Payload de entrada:**

```json
{
  "type": "string (requerido)",
  "message": "string (requerido)",
  "userId": "string (requerido)",
  "eventId": "string (opcional)"
}
```

**Acción:** Notifica a los followers sobre la cancelación del evento.

---

## Formato de respuestas

### Respuesta exitosa (sin paginación)

```json
{
  "statusCode": 200,
  "message": "Descripción de la operación",
  "data": { ... }
}
```

### Respuesta exitosa (con paginación)

```json
{
  "statusCode": 200,
  "message": "Descripción de la operación",
  "data": [ ... ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### Respuesta de error

Todas las excepciones RPC siguen este formato:

```json
{
  "statusCode": 404,
  "code": "NOT_FOUND",
  "message": "Notification with id 665f1a2b... not found"
}
```

**Códigos de error disponibles:**

| statusCode | code                    | Descripción                          |
| ---------- | ----------------------- | ------------------------------------ |
| 400        | `BAD_REQUEST`           | Payload inválido o datos incorrectos |
| 401        | `UNAUTHORIZED`          | No autenticado                       |
| 404        | `NOT_FOUND`             | Recurso no encontrado                |
| 409        | `CONFLICT`              | Conflicto (recurso duplicado, etc.)  |
| 500        | `INTERNAL_SERVER_ERROR` | Error interno del servidor           |
