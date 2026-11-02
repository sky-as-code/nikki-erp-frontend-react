import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { findUngatedActions } from '@nikkierp/viewkit-mantine/actionCodes';
import { RESOURCE_DETAIL_V2_TEMPLATE, RESOURCE_LIST_V2_TEMPLATE } from '@nikkierp/viewkit-mantine/ids';
import { describe, expect, it } from 'vitest';

import { buildEssentialPages, CURRENCIES_ROUTE, LANGUAGES_ROUTE } from '../bootstrap/essential';
import { buildSettingsMenu } from '../menu';

import type { TemplateRef } from '@nikkierp/viewengine/metadata';


/**
 * The Languages and Currencies pages are a copy of essential's page metadata, read here as text so nothing is
 * imported across the module boundary. A copy that drifts from its owner keeps compiling and only
 * shows up as a page that publishes a command or names a field the owner no longer has.
 */
const MODULES_DIR = resolve(__dirname, '../../..');
const SETTINGS_SRC = resolve(__dirname, '..');

function read(path: string): string {
	return readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
}

/** The file without its proxy note and with relative imports normalised to the owner's layout. */
function normalise(text: string, resource: string): string {
	return text
		.replace(/^\/\/ Proxy copy of .*\n(\/\/ .*\n)?/, '')
		.replace("from '../../constants/essential'", "from '../constants'")
		.replace("from '../../features/essential/commands'", `from '../features/${resource}/commands'`);
}

describe('proxy of essential', () => {
	it.each(['language', 'currency'])('pages/essential/%s.ts matches the owner page', (resource) => {
		const copy = read(resolve(SETTINGS_SRC, `pages/essential/${resource}.ts`));
		const original = read(resolve(MODULES_DIR, `essential/src/pages/${resource}.ts`));

		expect(normalise(copy, resource)).toBe(normalise(original, resource));
	});

	it('constants match the owner constants', () => {
		const copy = read(resolve(SETTINGS_SRC, 'constants/essential.ts')).replace(/^(\/\/ .*\n)+\n/, '');
		const original = read(resolve(MODULES_DIR, 'essential/src/constants/index.ts'));

		expect(copy).toBe(original);
	});

	it.each([['language', 'LanguageCommands'], ['currency', 'CurrencyCommands']])(
		'the copied command-name object of %s still exists in the owner', (resource, name) => {
			const owner = read(resolve(MODULES_DIR, `essential/src/features/${resource}/commands.ts`));

			expect(owner).toContain(`export const ${name} = `);
		},
	);

	it('registers nothing for the owner: no schemas, services, handlers or stores', () => {
		for (const file of ['bootstrap/essential.ts', 'features/essential/commands.ts']) {
			const text = read(resolve(SETTINGS_SRC, file));

			expect(text).not.toMatch(/schemaRegistry\.register|registerCrudService|registerSchemaModule|\.subscribe\(/);
			expect(text).not.toMatch(/createModuleStore|registerReducer|engine\.use/);
		}
	});
});

describe('Languages pages', () => {
	it('mounts one split view each at the settings languages and currencies routes', () => {
		const pages = buildEssentialPages();
		const { primary, secondary } = pages[0]!.props as { primary: TemplateRef, secondary: TemplateRef };

		expect(pages.map(page => page.routePath)).toEqual([LANGUAGES_ROUTE, CURRENCIES_ROUTE]);
		expect(CURRENCIES_ROUTE).toBe('essential/essential_currency');
		expect(primary.template).toBe(RESOURCE_LIST_V2_TEMPLATE);
		expect(secondary.template).toBe(RESOURCE_DETAIL_V2_TEMPLATE);
	});

	it('declares no ungated action and survives a JSON round trip', () => {
		const pages = buildEssentialPages();

		expect(findUngatedActions(pages)).toEqual([]);
		expect(JSON.parse(JSON.stringify(pages))).toEqual(pages);
	});

	it('binds the format fields to the format-pattern renderers', () => {
		const pages = buildEssentialPages();
		const { secondary } = pages[0]!.props as { secondary: TemplateRef<{ fieldRenderers: object }> };

		expect(secondary.props?.fieldRenderers).toEqual({
			date_format: { renderer: 'strftimeFormat' },
			time_format: { renderer: 'strftimeFormat' },
			short_time_format: { renderer: 'strftimeFormat' },
			grouping: { renderer: 'numberGrouping' },
		});
	});
});

describe('buildSettingsMenu', () => {
	it('links General settings to the index, Currencies and Translations to their pages', () => {
		const menu = buildSettingsMenu('settings');

		expect(menu.translationNs).toBe('settings');
		expect('items' in menu ? menu.items : []).toEqual([
			{ labelKey: 'settings.menu.general', link: '/' },
			{ labelKey: 'settings.menu.currencies', link: '/essential/essential_currency' },
			{
				labelKey: 'settings.menu.translations',
				items: [{ labelKey: 'settings.menu.languages', link: '/languages' }],
			},
		]);
	});
});
