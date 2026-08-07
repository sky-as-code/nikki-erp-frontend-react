import { ICommandBus, ok, ServiceResult } from '@nikkierp/common/commandBus';

import { sharedStateService } from './sharedStateService';


/**
 * Shell-owned shared-state commands.
 *
 * Part 0 must stay `shell`: the bus hands that segment to its `ModuleLoader`, so a different
 * prefix would be treated as a lazily-loadable micro-app name.
 */
export const SHARED_STATE_COMMANDS = Object.freeze({
	GET_CURRENT_ORG_ID: 'shell.shared_state.get_current_org_id',
	GET_CURRENT_MODULE: 'shell.shared_state.get_current_module',
} as const);

/**
 * Read-only by design: only the Shell writes this state, from the org/module switchers and the
 * layouts that re-derive it from the URL. Letting a micro-app set the active org over the bus
 * would let one module silently change what every other module reads.
 */
export function registerSharedStateCommands(bus: ICommandBus): () => void {
	const unsubscribers = [
		bus.subscribe(SHARED_STATE_COMMANDS.GET_CURRENT_ORG_ID, () => handleGetCurrentOrgId()),
		bus.subscribe(SHARED_STATE_COMMANDS.GET_CURRENT_MODULE, () => handleGetCurrentModule()),
	];
	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

function handleGetCurrentOrgId(): ServiceResult<string | null> {
	return ok(sharedStateService.getCurrentOrgId());
}

function handleGetCurrentModule(): ServiceResult<string | null> {
	return ok(sharedStateService.getCurrentModule());
}
