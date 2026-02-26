export enum NotificationType {
  NEW_FOLLOWER = 'NEW_FOLLOWER',
  NEW_EVENT = 'NEW_EVENT',
  EVENT_REMINDER = 'EVENT_REMINDER',
  EVENT_UPDATE = 'EVENT_UPDATE',
  EVENT_CANCELLED = 'EVENT_CANCELLED',
}

export const NotificationTypeList = Object.values(NotificationType);