import { Command, ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { PointActionRequest, salesPointService } from './salesPointService';
import { SALES_MODULE, SALES_POINT_SCHEMA_NAME } from '../../constants';


const PREFIX = `${SALES_MODULE}.${SALES_POINT_SCHEMA_NAME}`;

export const SalesPointCommands = Object.freeze({
	...resourceCommands(SALES_POINT_SCHEMA_NAME),
	SUSPEND: `${PREFIX}.suspend`,
	ACTIVATE: `${PREFIX}.activate`,
	ARCHIVE: `${PREFIX}.archive`,
	UNARCHIVE: `${PREFIX}.unarchive`,
} as const);

export function registerSalesPointCommands(bus: ICommandBus): () => void {
	registerSchemaModule(SALES_POINT_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_POINT_SCHEMA_NAME, salesPointService);

	const unsubscribers = [
		bus.subscribe(
			SalesPointCommands.SUSPEND,
			cmd => salesPointService.suspend(actionRequest(cmd)),
		),
		bus.subscribe(
			SalesPointCommands.ACTIVATE,
			cmd => salesPointService.activate(actionRequest(cmd)),
		),
		bus.subscribe(
			SalesPointCommands.ARCHIVE,
			cmd => salesPointService.archive(actionRequest(cmd)),
		),
		bus.subscribe(
			SalesPointCommands.UNARCHIVE,
			cmd => salesPointService.unarchive(actionRequest(cmd)),
		),
	];

	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

function actionRequest(command: Command): PointActionRequest {
	const payload = command.payload as Record<string, unknown>;
	return {
		id: String(payload.id ?? ''),
		etag: payload.etag == null ? undefined : String(payload.etag),
	};
}
