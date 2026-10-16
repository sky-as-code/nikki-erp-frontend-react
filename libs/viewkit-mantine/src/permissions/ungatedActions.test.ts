import { describe, expect, it } from 'vitest';

import { findUngatedActions } from './ungatedActions';


describe('findUngatedActions', () => {
	const page = {
		type: 'page',
		children: [{
			type: 'component',
			props: {
				schemaName: 'inventory_stock_transfer',
				extraActions: [{ label: 'del', command: 'core.resource.inventory_stock_transfer.delete' }],
				contextualActions: {
					confirm: { label: 'confirm', command: 'inventory.inventory_stock_transfer.confirm' },
					validate: { label: 'validate', command: 'inventory.inventory_stock_transfer.validate', actionCode: 'validate' },
					grid: { label: 'grid', routePath: 'grid/:id' },
				},
			},
		}],
	};

	it('reports a command whose verb maps to no code and that names none', () => {
		expect(findUngatedActions([page])).toEqual([{
			schemaName: 'inventory_stock_transfer', label: 'confirm', command: 'inventory.inventory_stock_transfer.confirm',
		}]);
	});

	it('ignores links, derived codes and explicit codes', () => {
		const labels = findUngatedActions(page).map(action => action.label);
		expect(labels).not.toContain('del');
		expect(labels).not.toContain('validate');
		expect(labels).not.toContain('grid');
	});
});
