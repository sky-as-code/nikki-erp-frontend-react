import { Command, CommandResponse, fail, ICommandBus, ok } from '@nikkierp/common/commandBus';
import { IMenuRegistry, MenuContribution } from '@nikkierp/ui/menu';


/**
 * Command-bus facade over the host {@link IMenuRegistry}.
 *
 * In-repo modules should call `host.menuRegistry.register(...)` directly during `init`:
 * it is typed, synchronous and throws at the call site on conflict. This facade exists
 * for out-of-repo / remote bundles that are handed only a bus, and for devtools. Both
 * paths delegate to the *same* registry instance, so there is one source of truth.
 */
export const LAYOUT_COMMANDS = Object.freeze({
	REGISTER_MENU: 'shell.layout.register_menu',
	UNREGISTER_MENU: 'shell.layout.unregister_menu',
} as const);

export type RegisterMenuPayload = MenuContribution & { override?: boolean };
export type UnregisterMenuPayload = { slug: string };
export type MenuCommandResult = { slug: string, itemCount: number };

export function registerMenuCommands(bus: ICommandBus, registry: IMenuRegistry): () => void {
	const unsubscribers = [
		bus.subscribe(
			LAYOUT_COMMANDS.REGISTER_MENU,
			(command: Command) => handleRegisterMenu(registry, command.payload as RegisterMenuPayload),
		),
		bus.subscribe(
			LAYOUT_COMMANDS.UNREGISTER_MENU,
			(command: Command) => handleUnregisterMenu(registry, command.payload as UnregisterMenuPayload),
		),
	];
	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

function handleRegisterMenu(
	registry: IMenuRegistry, payload?: RegisterMenuPayload,
): CommandResponse<MenuCommandResult, Error> {
	if (!payload?.slug || !payload.translationNs || !Array.isArray(payload.items)) {
		return fail(new Error(`${LAYOUT_COMMANDS.REGISTER_MENU} requires { slug, translationNs, items }.`));
	}
	try {
		const { override, ...contribution } = payload;
		registry.register(contribution, { override });
		return ok({ slug: payload.slug, itemCount: payload.items.length });
	}
	catch (error) {
		return fail(error as Error);
	}
}

function handleUnregisterMenu(
	registry: IMenuRegistry, payload?: UnregisterMenuPayload,
): CommandResponse<MenuCommandResult, Error> {
	if (!payload?.slug) {
		return fail(new Error(`${LAYOUT_COMMANDS.UNREGISTER_MENU} requires { slug }.`));
	}
	registry.unregister(payload.slug);
	return ok({ slug: payload.slug, itemCount: 0 });
}
