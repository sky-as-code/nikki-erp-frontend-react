import { describe, expect, it } from 'vitest';

import {
	filterModuleItems, groupModuleItems, isUnavailableModule, ModuleCardItem, sortModuleItems, toModuleCardItems,
} from './moduleHomeModel';

import type { Module } from '@nikkierp/shell/erpModules';


const compare = new Intl.Collator('en', { sensitivity: 'base', numeric: true }).compare;

function moduleOf(name: string, overrides: Partial<Module> = {}): Module {
	return {
		id: name, etag: '1', created_at: '', is_internal: false, is_orphaned: false, name, version: 'v1',
		has_ui: true, is_enabled: true, category: 'foundation', ...overrides,
	};
}

function cardOf(slug: string, overrides: Partial<ModuleCardItem> = {}): ModuleCardItem {
	return {
		slug, name: slug, category: 'foundation',
		isOrphaned: false, isEnabled: true, isAuthorized: true, isUnavailable: false, ...overrides,
	};
}

const context = {
	translateName: (module: Module) => `Label ${module.name}`,
	canAccess: (module: Pick<Module, 'name'>) => module.name !== 'locked',
};

describe('toModuleCardItems', () => {
	it('drops modules without a UI', () => {
		const cards = toModuleCardItems([moduleOf('iam'), moduleOf('core', { has_ui: false })], context);
		expect(cards.map((card) => card.slug)).toEqual(['iam']);
	});

	it('reads a missing category as foundation', () => {
		const [card] = toModuleCardItems([moduleOf('iam', { category: null })], context);
		expect(card.category).toBe('foundation');
	});

	it('translates the name and derives availability', () => {
		const cards = toModuleCardItems([
			moduleOf('iam'),
			moduleOf('locked'),
			moduleOf('off', { is_enabled: false }),
			moduleOf('gone', { is_orphaned: true }),
		], context);
		expect(cards[0]).toMatchObject({ name: 'Label iam', isAuthorized: true, isUnavailable: false });
		expect(cards.slice(1).map((card) => card.isUnavailable)).toEqual([true, true, true]);
		expect(cards[1].isAuthorized).toBe(false);
	});
});

describe('isUnavailableModule', () => {
	it('is unavailable when disabled, orphaned or unauthorized', () => {
		const available = { isEnabled: true, isOrphaned: false, isAuthorized: true };
		expect(isUnavailableModule(available)).toBe(false);
		expect(isUnavailableModule({ ...available, isEnabled: false })).toBe(true);
		expect(isUnavailableModule({ ...available, isOrphaned: true })).toBe(true);
		expect(isUnavailableModule({ ...available, isAuthorized: false })).toBe(true);
	});
});

describe('filterModuleItems', () => {
	const items = [cardOf('inventory', { name: 'Inventory' }), cardOf('iam', { name: 'Identity', isUnavailable: true })];

	it('hides unavailable modules unless asked to show them', () => {
		expect(filterModuleItems(items, '', false).map((item) => item.slug)).toEqual(['inventory']);
		expect(filterModuleItems(items, '', true)).toHaveLength(2);
	});

	it('matches the translated name or the slug, ignoring case and padding', () => {
		expect(filterModuleItems(items, '  IDENT ', true).map((item) => item.slug)).toEqual(['iam']);
		expect(filterModuleItems(items, 'iam', true).map((item) => item.slug)).toEqual(['iam']);
		expect(filterModuleItems(items, 'zzz', true)).toEqual([]);
	});
});

describe('sortModuleItems', () => {
	it('sorts by translated name, not slug, without mutating the input', () => {
		const items = [cardOf('a', { name: 'Zeta' }), cardOf('b', { name: 'alpha' })];
		expect(sortModuleItems(items, compare).map((item) => item.slug)).toEqual(['b', 'a']);
		expect(items[0].slug).toBe('a');
	});
});

describe('groupModuleItems', () => {
	const labels = { foundation: 'Foundation', coremart: 'Core Mart', coreparking: 'Core Parking' };
	const items = [
		cardOf('vm', { name: 'Vending', category: 'coremart' }),
		cardOf('iam', { name: 'Identity' }),
		cardOf('hq', { name: 'Headquarters', category: 'coremart' }),
		cardOf('inv', { name: 'Inventory' }),
	];

	it('returns no group for no modules', () => {
		expect(groupModuleItems([], 'category', (code) => labels[code], compare)).toEqual([]);
	});

	it('gives one unlabelled, sorted group without grouping', () => {
		const groups = groupModuleItems(items, 'none', (code) => labels[code], compare);
		expect(groups).toHaveLength(1);
		expect(groups[0].label).toBeNull();
		expect(groups[0].modules.map((item) => item.slug)).toEqual(['hq', 'iam', 'inv', 'vm']);
	});

	it('groups by category, sorting groups by label and modules within each', () => {
		const groups = groupModuleItems(items, 'category', (code) => labels[code], compare);
		expect(groups.map((group) => group.label)).toEqual(['Core Mart', 'Foundation']);
		expect(groups[0].modules.map((item) => item.slug)).toEqual(['hq', 'vm']);
		expect(groups[1].modules.map((item) => item.slug)).toEqual(['iam', 'inv']);
	});
});
