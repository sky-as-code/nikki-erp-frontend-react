import { describe, expect, it } from 'vitest';

import { buildSettingsPages } from './settings';
import { SETTINGS_PAGE_TEMPLATE } from '../viewkit/ids';
import { settingsPagePropsSchema } from '../viewkit/props';


describe('buildSettingsPages', () => {
	it('defines one page on the module index route', () => {
		const pages = buildSettingsPages();

		expect(pages).toHaveLength(1);
		expect(pages[0]!.routePath).toBe('');
		expect(pages[0]!.template).toBe(SETTINGS_PAGE_TEMPLATE);
	});

	it('survives a JSON round trip', () => {
		// The hard constraint on page metadata: it crosses a bundle boundary as plain data, so a
		// function or class instance anywhere in the tree would be silently dropped.
		const page = buildSettingsPages()[0]!;

		expect(JSON.parse(JSON.stringify(page))).toEqual(page);
	});

	it('rejects a pane list that is empty', () => {
		// The page renders the first pane on arrival, so an empty list would mean a rail with
		// nothing in it beside a permanently empty column.
		expect(() => settingsPagePropsSchema.parse({
			translationNs: 'settings',
			titleKey: 'page.title',
			emptyKey: 'page.empty',
			widgetName: 'pages.settings',
			panes: [],
		})).toThrow();
	});

	it('rejects an unknown prop', () => {
		// `.strict()` everywhere: a typo in a page definition must fail where it is authored
		// rather than be dropped and leave the author wondering why nothing changed.
		expect(() => settingsPagePropsSchema.parse({
			translationNs: 'settings',
			titleKey: 'page.title',
			emptyKey: 'page.empty',
			widgetName: 'pages.settings',
			panes: [{ slug: 'essential', labelKey: 'pane.general' }],
			paneList: [],
		})).toThrow();
	});
});
