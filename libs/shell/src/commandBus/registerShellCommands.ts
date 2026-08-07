import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerGenericResourceCommands, registerSchemaCommands } from '@nikkierp/common/dynamicModel';
import { IMenuRegistry } from '@nikkierp/ui/menu';

import { registerSessionCommands } from '../authenticate/sessionCommands';
import { registerModuleCommands } from '../erpModules/moduleCommands';
import { registerMenuCommands } from '../menu';
import { registerRoutingCommands } from '../routing/routingCommands';
import { registerUserContextCommands } from '../userContext/userContextCommands';


/**
 * Subscribes one domain's handlers and returns their disposer, the same contract the
 * built-in registrars below follow.
 */
export type ShellCommandRegistrar = (bus: ICommandBus) => () => void;

/** Host-owned services the Shell command handlers delegate to. */
export type ShellCommandDeps = {
	menuRegistry: IMenuRegistry,
	/**
	 * Commands owned by the shell *implementation* rather than by this library.
	 *
	 * `libs/shell` is consumed by `modules/shell` and never the reverse, so a concrete shell
	 * cannot be named here. It passes its registrars in instead, and they subscribe in the
	 * same synchronous pass as the built-ins — leaving no window where a component could
	 * publish before the handler exists.
	 */
	extraRegistrars?: ShellCommandRegistrar[],
};

/**
 * Subscribes all Shell-owned command handlers onto the Shell-hosted bus. Called once
 * when the bus is created so handlers exist before any component publishes. Each domain
 * is migrated off Redux incrementally (DUI-011); add its registrar here as it lands.
 */
export function registerShellCommands(bus: ICommandBus, deps: ShellCommandDeps): () => void {
	const unsubscribers = [
		registerModuleCommands(bus),
		registerRoutingCommands(bus),
		registerSessionCommands(bus),
		registerUserContextCommands(bus),
		registerSchemaCommands(bus),
		// One prefix subscription serving CRUD for every registered schema, including
		// resources defined at runtime that no module knows about.
		registerGenericResourceCommands(bus),
		registerMenuCommands(bus, deps.menuRegistry),
		...(deps.extraRegistrars ?? []).map(register => register(bus)),
	];
	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}
