import { describe, expect, it, vi } from 'vitest';

import { createNodeLabelResolver } from './nodeLabelResolver';

import type { ICommandBus } from '@nikkierp/common/commandBus';


const brandSchema = {
	name: 'inventory_brand',
	fields: {},
	record_label_field: 'name',
	label: { $ref: 'inventory_brand.label' },
};

function fakeBus(item: Record<string, unknown> | null): ICommandBus {
	const publish = vi.fn(async ({ name }: { name: string }) => {
		if (name === 'core.dynamic_model.get_schema') {
			return { data: { schemaName: 'inventory_brand', modelSchema: brandSchema } };
		}
		return item ? { data: { item } } : { error: new Error('not found') };
	});
	return { publish } as unknown as ICommandBus;
}

function resolverWith(bus: ICommandBus) {
	return createNodeLabelResolver({
		bus: () => bus,
		translate: (key, ns, count) => `${ns}:${key}:${count ?? ''}`,
		language: () => 'en-US',
	});
}

describe('createNodeLabelResolver', () => {
	it('labels a record node with its record label field', async () => {
		const bus = fakeBus({ name: 'Brand B' });
		await expect(resolverWith(bus)('/inventory/inventory_brand/01JB')).resolves.toBe('Brand B');
		expect(bus.publish).toHaveBeenLastCalledWith({
			name: 'core.resource.inventory_brand.get_by_id', payload: { id: '01JB', fields: ['name'] },
		});
	});

	it('labels a list node with the capitalised plural schema label', async () => {
		await expect(resolverWith(fakeBus(null))('/inventory/inventory_brand'))
			.resolves.toBe('Inventory:inventory_brand.label:99');
	});

	it('localizes a LangJSON record label', async () => {
		const bus = fakeBus({ name: { 'en-US': 'Coffee' } });
		await expect(resolverWith(bus)('/inventory/inventory_brand/01JB')).resolves.toBe('Coffee');
	});

	it('gives up on a path naming no schema or a record it cannot read', async () => {
		const bus = fakeBus(null);
		await expect(resolverWith(bus)('/vendingmachine/kiosks/K')).resolves.toBeUndefined();
		await expect(resolverWith(bus)('/inventory/inventory_brand/missing')).resolves.toBeUndefined();
	});
});
