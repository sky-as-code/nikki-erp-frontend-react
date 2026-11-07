import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { buildProductionMenu } from '../menu';


/**
 * Every key the Production pages, menu and action dialogs translate in the `production` namespace,
 * checked against the backend bundle read from the sibling repo (pattern of vendingMachine's
 * i18nKeys.test.ts). Skips, rather than fails, where the backend is not checked out beside this repo.
 */
const BACKEND = path.resolve(__dirname, '../../../../../../coreplatform-backend/nikkierp/modules');
const LANG_DIR = path.join(BACKEND, 'essential/infra/langJson');
const MODELS_DIR = path.join(BACKEND, 'production/domain/models');
const PAGES_DIR = path.resolve(__dirname, '../pages');
const LOCALES = ['en-US', 'vi-VN'] as const;

type SchemaJson = {
	label?: string,
	fields: { name: string, label?: string, description?: string, data_type: unknown }[],
};

function readKeys(file: string): Set<string> | null {
	if (!fs.existsSync(file)) {
		return null;
	}
	return new Set(Object.keys(JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, string>));
}

/** Labels, descriptions and enum values (`<field>.<value>`, as the badge and translated renderers prefix them). */
function schemaKeys(): string[] {
	const keys: string[] = [];
	for (const file of fs.readdirSync(MODELS_DIR).filter(name => name.endsWith('.json'))) {
		const schema = JSON.parse(fs.readFileSync(path.join(MODELS_DIR, file), 'utf8')) as SchemaJson;
		if (schema.label) {
			keys.push(schema.label);
		}
		for (const field of schema.fields) {
			keys.push(...[field.label, field.description].filter((key): key is string => Boolean(key)));
			const dataType = field.data_type as { type?: string, values?: string[] };
			if (dataType?.type === 'enum_string') {
				keys.push(...(dataType.values ?? []).map(value => `${field.name}.${value}`));
			}
		}
	}
	return keys;
}

function menuKeys(): string[] {
	return buildProductionMenu('production').tabs.flatMap(tab => [
		tab.labelKey,
		...tab.blocks.flatMap(block => [block.titleKey, ...block.items.map(item => item.labelKey)]),
	]);
}

/** Section headers, tab and action labels, and action input fields of the generated pages. */
function pageKeys(): string[] {
	const keys: string[] = ['fields.lot_name'];
	for (const file of fs.readdirSync(PAGES_DIR).filter(name => name.endsWith('.ts') && !name.endsWith('.test.ts'))) {
		const text = fs.readFileSync(path.join(PAGES_DIR, file), 'utf8');
		keys.push(...[...text.matchAll(/'?(?:header|label)'?: '([\w.]+)'/g)].map(match => match[1]));
		keys.push(...[...text.matchAll(/'name': '(\w+)'/g)].map(match => `fields.${match[1]}`));
	}
	return keys;
}

describe('production translation keys', () => {
	const shared = readKeys(path.join(LANG_DIR, 'en-US', 'common.json'));

	it.skipIf(!shared).each(LOCALES)('%s has every key the pages and menu use', (locale) => {
		const own = readKeys(path.join(LANG_DIR, locale, 'production.json')) ?? new Set<string>();
		const common = readKeys(path.join(LANG_DIR, locale, 'common.json')) ?? new Set<string>();
		const wanted = new Set([...schemaKeys(), ...menuKeys(), ...pageKeys()]);
		const missing = [...wanted].filter(key => !own.has(key) && !common.has(key)).sort();

		expect(missing).toEqual([]);
	});
});
