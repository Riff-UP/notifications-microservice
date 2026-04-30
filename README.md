# Notifications Microservice

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/rabbitmq-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![MongoDB](https://img.shields.io/badge/mongodb-%2347A248.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Resend](https://img.shields.io/badge/Resend-000000?style=for-the-badge&logo=sendgrid&logoColor=white)

## 📌 Descripción

Microservicio encargado de consumir eventos de negocio en Riff y enviar notificaciones por email a través de Resend API. Actúa como consumidor puro de eventos, sin endpoints HTTP públicos, escuchando cambios en usuarios, contenido y eventos para notificar a los afectados de forma asincrónica y desacoplada.

## Problema que resuelve

En una arquitectura de microservicios orientada por eventos, las notificaciones no deben sincronizar con la latencia de las operaciones principales. notifications-ms desvincula completamente el envío de emails del flujo de creación de usuarios, publicaciones o eventos, permitiendo que el sistema escale sin que fallos en notificaciones afecten operaciones críticas.

## Responsabilidades principales

- Consumir eventos de RabbitMQ en tiempo real desde el exchange `riff_events`.
- Enviar emails de verificación para restablecimiento de contraseña.
- Notificar a usuarios sobre interacciones en sus publicaciones (likes, comentarios, compartidos).
- Notificar cuando usuarios son seguidos o dejados de seguir.
- Notificar sobre eventos musicales nuevos y cambios de asistencia.
- Mantener réplica local de relaciones de seguimiento para decisiones eficientes de notificación.
- Procesar eventos sin estado persistente para escalar horizontalmente.

## Flujo general

```text
users-ms -> RabbitMQ
  - auth.tokenGenerated
  - follow.created
  - follow.removed

content-ms -> RabbitMQ
  - post.created
  - event.created
  - event.attendeeJoined
  - reaction.created

notifications-ms (Event Listener)
  - FollowRef (MongoDB replica)
  - Resend API
    - 📧 User Email
```

Los eventos llegan a través de RabbitMQ de forma asincrónica, se procesan de forma stateless, y se envían emails sin bloquear operaciones en otros servicios.

## Modelo de datos

notifications-ms mantiene una única colección en MongoDB:

- `FollowRef`: Réplica local de relaciones de seguimiento desde users-ms. Permite que el servicio decida instantáneamente si debe notificar al usuario X que fue seguido, sin hacer consultas síncronas costosas a users-ms. Se sincroniza automáticamente al consumir eventos `follow.created` y `follow.removed`.

## Comunicación con otros servicios

notifications-ms es un **consumidor puro de eventos**. No expone endpoints HTTP públicos (solo `/health` para monitoreo) y reacciona únicamente a eventos en RabbitMQ. Esta separación total permite que:

- users-ms emita `auth.tokenGenerated`, `follow.created`, `follow.removed` sin conocer que notifications-ms existe.
- content-ms emita `post.created`, `event.created`, `event.attendeeJoined` sin acoplamiento.
- Si Resend API falla, RabbitMQ reintenta automáticamente sin afectar otros servicios.
- Múltiples instancias de notifications-ms pueden procesar el mismo evento de forma distribuida.

## Decisiones técnicas

- **Event-Driven**: No expone endpoints HTTP, solo reacciona a eventos. Esto evita latencia síncrona en operaciones críticas.
- **MongoDB para FollowRef**: La réplica de follows es una copia de lectura rápida, no la fuente de verdad (esa está en users-ms).
- **Resend para emails**: API moderna, confiable y con buena documentación. Simplifica gestión de plantillas y entregas.
- **Stateless**: Cada instancia es intercambiable. No hay sesiones ni colas en memoria. Permite escalar horizontalmente.
- **RabbitMQ Durable Queues**: Los eventos persisten si el servicio está caído. Garantiza entrega eventual.

## Desarrollo local

```bash
npm install
npm run start:dev
```

## Pruebas

```bash
npm run test
npm run test:e2e
```

## Relación con el sistema

Este microservicio es la capa de notificación desacoplada de Riff. Su valor no está en la lógica de negocio, sino en garantizar que los usuarios reciban información relevante sin que los procesos principales tengan que esperar por emails. Demuestra el patrón de **Event Sourcing + CQRS** donde lecturas de notificación son derivadas de eventos de dominio.
