import { Command, ICommandBus, ok, ServiceResult } from '@nikkierp/common/commandBus';

import { NavigateParams, routingService } from './routingService';
import { ActiveRoutingContext } from './types';


/**
 * Shell-owned routing commands.
 *
 * `shell` is the reserved host namespace: part 0 of a command name is what the bus hands
 * to its `ModuleLoader`, so it must never resolve to a lazily-loadable micro-app.
 */
export const ROUTING_COMMANDS = Object.freeze({
	GET_ACTIVE_CONTEXT: 'shell.routing.get_active_context',
	NAVIGATE: 'shell.routing.navigate',
	NAVIGATE_WILL_RETURN: 'shell.routing.navigate_will_return',
	NAVIGATE_RETURN_TO: 'shell.routing.navigate_return_to',
} as const);

export function registerRoutingCommands(bus: ICommandBus): () => void {
	const unsubscribers = [
		bus.subscribe(ROUTING_COMMANDS.GET_ACTIVE_CONTEXT, () => handleGetActiveContext()),
		bus.subscribe(ROUTING_COMMANDS.NAVIGATE, cmd => handleNavigate(cmd, 'navigateTo')),
		bus.subscribe(ROUTING_COMMANDS.NAVIGATE_WILL_RETURN, cmd => handleNavigate(cmd, 'navigateWillReturn')),
		bus.subscribe(ROUTING_COMMANDS.NAVIGATE_RETURN_TO, cmd => handleNavigate(cmd, 'navigateReturnTo')),
	];
	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

/**
 * The read half of the pair. The bus has no replay, so a module that mounts after
 * `shell:routing:active_org_changed` fired still needs a way to read the current value.
 */
function handleGetActiveContext(): ServiceResult<ActiveRoutingContext> {
	return ok(routingService.getActiveContext());
}

type NavigateMethod = 'navigateTo' | 'navigateWillReturn' | 'navigateReturnTo';

async function handleNavigate(command: Command, method: NavigateMethod): Promise<ServiceResult<null>> {
	const payload = command.payload as NavigateParams | undefined;
	// A malformed payload is a caller bug, not something the user can act on, so it
	// throws and surfaces as `CommandBusResponse.error` rather than as a client error.
	if (!payload?.to) {
		throw new Error(`${command.name} requires { to }.`);
	}
	await routingService[method](payload);
	return ok(null);
}
