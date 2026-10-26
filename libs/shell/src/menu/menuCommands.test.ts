import { createCommandBus } from '@nikkierp/common/commandBus';
import { createMenuRegistry, RibbonMenuContribution } from '@nikkierp/ui/menu';
import { describe, expect, it } from 'vitest';

import { LAYOUT_COMMANDS, registerMenuCommands } from './menuCommands';


function ribbon(overrides: Partial<RibbonMenuContribution> = {}): RibbonMenuContribution {
	return {
		slug: 'commerce',
		translationNs: 'commerce',
		type: 'ribbon',
		tabs: [{
			labelKey: 'tab',
			blocks: [{
				titleKey: 'block',
				items: [
					{ labelKey: 'orders', link: '/order' },
					{ labelKey: 'more', items: [{ labelKey: 'bills', link: '/bill' }] },
				],
			}],
		}],
		...overrides,
	};
}

function setUp() {
	const bus = createCommandBus();
	const registry = createMenuRegistry();
	registerMenuCommands(bus, registry);
	const register = (payload: unknown) => bus.publish({ name: LAYOUT_COMMANDS.REGISTER_MENU, payload });
	return { registry, register };
}

describe('shell.layout.register_menu', () => {
	it('registers a traditional menu, type omitted', async () => {
		const { registry, register } = setUp();
		const response = await register({ slug: 'iam', translationNs: 'iam', items: [{ labelKey: 'a', link: '/a' }] });

		expect(response.error).toBeNull();
		expect(response.result?.data).toEqual({ slug: 'iam', itemCount: 1 });
		expect(registry.getMenu('iam')).toBeDefined();
	});

	it('registers a ribbon and counts its tabs', async () => {
		const { registry, register } = setUp();
		const response = await register(ribbon());

		expect(response.error).toBeNull();
		expect(response.result?.data).toEqual({ slug: 'commerce', itemCount: 1 });
		expect(registry.getMenu('commerce')?.type).toBe('ribbon');
	});

	it('refuses a traditional menu without items', async () => {
		const { register } = setUp();

		expect((await register({ slug: 'iam', translationNs: 'iam' })).error).toBeInstanceOf(Error);
	});

	it.each([
		['no tabs', ribbon({ tabs: [] })],
		['a tab without label', ribbon({ tabs: [{ labelKey: '', blocks: [] }] })],
		['a block without title', ribbon({ tabs: [{ labelKey: 't', blocks: [{ titleKey: '', items: [] }] }] })],
		['an item neither link nor dropdown', ribbon({
			tabs: [{ labelKey: 't', blocks: [{ titleKey: 'b', items: [{ labelKey: 'x' } as never] }] }],
		})],
	])('refuses a ribbon with %s', async (_name, payload) => {
		const { registry, register } = setUp();

		expect((await register(payload)).error).toBeInstanceOf(Error);
		expect(registry.getMenu('commerce')).toBeUndefined();
	});
});
