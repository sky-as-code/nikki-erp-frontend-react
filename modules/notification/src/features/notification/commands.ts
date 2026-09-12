import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';
import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import {
	NOTIFICATION_DELIVERY_SCHEMA_NAME, NOTIFICATION_MODULE,
	NOTIFICATION_RECIPIENT_SCHEMA_NAME, NOTIFICATION_SCHEMA_NAME,
} from '../../constants';
import { notificationStore } from '../../store';

import type { ICommandBus } from '@nikkierp/common/commandBus';


/**
 * Command names for the three resources, all from the schema-driven generic path
 * (`core.resource.notification_*.*`) served by the Shell's single prefix subscription.
 *
 * Read-only in practice: the backend seeds no create, update or delete action for these resources,
 * because every write goes through SendNotification or MarkRead. A create command issued here
 * would be refused by the server, not by this file.
 */
export const NotificationCommands = Object.freeze(resourceCommands(NOTIFICATION_SCHEMA_NAME));
export const NotificationRecipientCommands = Object.freeze(resourceCommands(NOTIFICATION_RECIPIENT_SCHEMA_NAME));
export const NotificationDeliveryCommands = Object.freeze(resourceCommands(NOTIFICATION_DELIVERY_SCHEMA_NAME));

/** CRUD over `notification_notification`. */
@storeService('NotificationService', notificationStore)
export class NotificationService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: NOTIFICATION_MODULE, schemaName: NOTIFICATION_SCHEMA_NAME });
	}
}

/** CRUD over `notification_recipient`. */
@storeService('NotificationRecipientService', notificationStore)
export class NotificationRecipientService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: NOTIFICATION_MODULE, schemaName: NOTIFICATION_RECIPIENT_SCHEMA_NAME });
	}
}

/** CRUD over `notification_delivery`. */
@storeService('NotificationDeliveryService', notificationStore)
export class NotificationDeliveryService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: NOTIFICATION_MODULE, schemaName: NOTIFICATION_DELIVERY_SCHEMA_NAME });
	}
}

export const notificationService = new NotificationService();
export const notificationRecipientService = new NotificationRecipientService();
export const notificationDeliveryService = new NotificationDeliveryService();

/**
 * Registers the notification services. Called synchronously during the micro-app `init` so they
 * are in place before any generic command is served.
 */
export function registerNotificationCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(NOTIFICATION_SCHEMA_NAME, NOTIFICATION_MODULE);
	registerCrudService(NOTIFICATION_SCHEMA_NAME, notificationService);

	registerSchemaModule(NOTIFICATION_RECIPIENT_SCHEMA_NAME, NOTIFICATION_MODULE);
	registerCrudService(NOTIFICATION_RECIPIENT_SCHEMA_NAME, notificationRecipientService);

	registerSchemaModule(NOTIFICATION_DELIVERY_SCHEMA_NAME, NOTIFICATION_MODULE);
	registerCrudService(NOTIFICATION_DELIVERY_SCHEMA_NAME, notificationDeliveryService);

	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
