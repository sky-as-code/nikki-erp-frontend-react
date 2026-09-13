export const NOTIFICATION_MODULE = 'notification';

// These must match the backend Go constants verbatim — `SchemaRegistry` rejects a schema whose
// response name differs, which leaves the page loading forever. See
// backend .../modules/notification/domain/models/{notification,recipient,delivery}.go.
export const NOTIFICATION_SCHEMA_NAME = 'notification_notification';
export const NOTIFICATION_RECIPIENT_SCHEMA_NAME = 'notification_recipient';
export const NOTIFICATION_DELIVERY_SCHEMA_NAME = 'notification_delivery';

// The resource paths the dynamic-model REST endpoints are served under.
export const NOTIFICATION_RESOURCE_PATH = `v1/notification/${NOTIFICATION_SCHEMA_NAME}`;
export const NOTIFICATION_RECIPIENT_RESOURCE_PATH = `v1/notification/${NOTIFICATION_RECIPIENT_SCHEMA_NAME}`;
export const NOTIFICATION_DELIVERY_RESOURCE_PATH = `v1/notification/${NOTIFICATION_DELIVERY_SCHEMA_NAME}`;

// The inbox endpoints. They are not dynamic-model CRUD: none of them is addressed by a record id,
// and the server decides whose notifications they answer from the request context rather than from
// anything the client sends.
export const INBOX_PATH = 'v1/notification/notifications';
export const UNREAD_COUNT_PATH = 'v1/notification/notifications/unread-count';
export const MARK_READ_PATH = 'v1/notification/notifications/mark-read';
export const STREAM_PATH = 'v1/notification/notifications/stream';

// How many notifications the header dropdown shows. Deliberately small: the dropdown is a glance,
// and the full page is one click away.
export const BELL_PAGE_SIZE = 10;

export const INBOX_PAGE_SIZE = 20;
