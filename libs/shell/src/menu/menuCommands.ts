import { Command, ICommandBus, ok, ServiceResult } from '@nikkierp/common/commandBus';
import {
	AnyMenuContribution, IMenuRegistry, isRibbonMenu, RibbonItem, RibbonMenuContribution, RibbonTab,
} from '@nikkierp/ui/menu';


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

export type RegisterMenuPayload = AnyMenuContribution & { override?: boolean };
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

/**
 * A malformed payload or a slug conflict is a caller bug, not something an end user
 * can act on, so both throw and surface as `CommandBusResponse.error`.
 */
function handleRegisterMenu(
	registry: IMenuRegistry, payload?: RegisterMenuPayload,
): ServiceResult<MenuCommandResult> {
	assertContribution(payload);
	const { override, ...contribution } = payload;
	registry.register(contribution, { override });
	const itemCount = isRibbonMenu(contribution) ? contribution.tabs.length : contribution.items.length;
	return ok({ slug: contribution.slug, itemCount });
}

function assertContribution(payload?: RegisterMenuPayload): asserts payload is RegisterMenuPayload {
	if (!payload?.slug || !payload.translationNs) {
		throw new Error(`${LAYOUT_COMMANDS.REGISTER_MENU} requires { slug, translationNs }.`);
	}
	if (isRibbonMenu(payload)) {
		assertRibbon(payload);
	}
	else if (!Array.isArray(payload.items)) {
		throw new Error(`${LAYOUT_COMMANDS.REGISTER_MENU} requires { slug, translationNs, items }.`);
	}
}

function assertRibbon(payload: RibbonMenuContribution): void {
	const tabs = payload.tabs as unknown;
	if (!Array.isArray(tabs) || tabs.length === 0 || !tabs.every(isValidTab)) {
		throw new Error(
			`${LAYOUT_COMMANDS.REGISTER_MENU} with type 'ribbon' requires non-empty tabs[{ labelKey, `
			+ 'blocks[{ titleKey, items[{ labelKey, link | items }] }] }].',
		);
	}
}

function isValidTab(tab: RibbonTab): boolean {
	return Boolean(tab?.labelKey) && Array.isArray(tab.blocks) && tab.blocks.every(block => (
		Boolean(block?.titleKey) && Array.isArray(block.items) && block.items.every(isValidRibbonItem)
	));
}

function isValidRibbonItem(item: RibbonItem): boolean {
	return Boolean(item?.labelKey) && ('link' in item ? Boolean(item.link) : Array.isArray(item.items));
}

function handleUnregisterMenu(
	registry: IMenuRegistry, payload?: UnregisterMenuPayload,
): ServiceResult<MenuCommandResult> {
	if (!payload?.slug) {
		throw new Error(`${LAYOUT_COMMANDS.UNREGISTER_MENU} requires { slug }.`);
	}
	registry.unregister(payload.slug);
	return ok({ slug: payload.slug, itemCount: 0 });
}
