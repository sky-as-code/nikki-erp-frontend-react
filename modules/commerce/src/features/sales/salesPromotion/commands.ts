import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { salesPromotionService } from './salesPromotionService';
import { SALES_MODULE, SALES_PROMOTION_SCHEMA_NAME } from '../../../constants/sales';
import { recordActionRequest, scopeDeltaRequest } from '../promotionActions';


const PREFIX = `${SALES_MODULE}.${SALES_PROMOTION_SCHEMA_NAME}`;

/** The `MANAGE_*` commands take `{id, add?, remove?}` with ids of channels, points or pricelists. */
export const SalesPromotionCommands = Object.freeze({
	...resourceCommands(SALES_PROMOTION_SCHEMA_NAME),
	ACTIVATE: `${PREFIX}.activate`,
	SUSPEND: `${PREFIX}.suspend`,
	DUPLICATE: `${PREFIX}.duplicate`,
	MANAGE_CHANNELS: `${PREFIX}.manage_channels`,
	MANAGE_POINTS: `${PREFIX}.manage_points`,
	MANAGE_PRICELISTS: `${PREFIX}.manage_pricelists`,
} as const);

export function registerSalesPromotionCommands(bus: ICommandBus): () => void {
	registerSchemaModule(SALES_PROMOTION_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_PROMOTION_SCHEMA_NAME, salesPromotionService);

	const unsubscribers = [
		bus.subscribe(SalesPromotionCommands.ACTIVATE, cmd => salesPromotionService.activate(recordActionRequest(cmd))),
		bus.subscribe(SalesPromotionCommands.SUSPEND, cmd => salesPromotionService.suspend(recordActionRequest(cmd))),
		bus.subscribe(
			SalesPromotionCommands.DUPLICATE, cmd => salesPromotionService.duplicate(recordActionRequest(cmd)),
		),
		bus.subscribe(
			SalesPromotionCommands.MANAGE_CHANNELS, cmd => salesPromotionService.manageChannels(scopeDeltaRequest(cmd)),
		),
		bus.subscribe(
			SalesPromotionCommands.MANAGE_POINTS, cmd => salesPromotionService.managePoints(scopeDeltaRequest(cmd)),
		),
		bus.subscribe(
			SalesPromotionCommands.MANAGE_PRICELISTS,
			cmd => salesPromotionService.managePricelists(scopeDeltaRequest(cmd)),
		),
	];
	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}
