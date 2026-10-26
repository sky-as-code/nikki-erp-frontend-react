import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';


/**
 * The proxy sub-modules are copies of the owners' page metadata, read here as text so nothing is
 * imported across the module boundary. A copy that drifts from its owner keeps compiling and only
 * shows up as a page that publishes a command or names a field the owner no longer has.
 */
const MODULES_DIR = resolve(__dirname, '../../..');
const COMMERCE_SRC = resolve(__dirname, '..');

const PROXIES: Record<string, string[]> = {
	paymentinvoice: ['invoice', 'order', 'transaction'],
	accounting: [
		'tax', 'taxGroup', 'taxJurisdiction', 'taxMapping', 'taxProductClassification', 'taxRateVersion',
		'taxRoundingPolicy', 'taxRule', 'taxSimulator',
	],
	essential: ['uom', 'uomcat'],
};

function read(path: string): string {
	return readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
}

/** The file without its proxy note and with relative imports normalised to the owner's layout. */
function normalise(text: string, owner: string): string {
	return text
		.replace(/^\/\/ Proxy copy of .*\n(\/\/ .*\n)?/, '')
		.replace(`from '../../constants/${owner}'`, "from '../constants'")
		.replace(/from '\.\.\/\.\.\/features\/\w+\/commands'/g, "from '../features/<resource>/commands'")
		.replace(/from '\.\.\/features\/\w+\/commands'/g, "from '../features/<resource>/commands'")
		.replace("from '../../viewkit/accounting/props'", "from '../viewkit/props'");
}

describe.each(Object.entries(PROXIES))('proxy of %s', (owner, pages) => {
	it.each(pages)('pages/%s.ts matches the owner page', page => {
		const copy = read(resolve(COMMERCE_SRC, `pages/${owner}/${page}.ts`));
		const original = read(resolve(MODULES_DIR, `${owner}/src/pages/${page}.ts`));

		expect(normalise(copy, owner)).toBe(normalise(original, owner));
	});

	it('constants match the owner constants', () => {
		const copy = read(resolve(COMMERCE_SRC, `constants/${owner}.ts`)).replace(/^(\/\/ .*\n)+\n/, '');
		const original = read(resolve(MODULES_DIR, `${owner}/src/constants/index.ts`));

		expect(copy).toBe(original);
	});

	it('each copied command-name object still exists in the owner', () => {
		const copied = read(resolve(COMMERCE_SRC, `features/${owner}/commands.ts`));
		const names = [...copied.matchAll(/export const (\w+Commands) = /g)].map(match => match[1]);
		const ownerText = readOwnerCommands(owner);

		expect(names.length).toBeGreaterThan(0);
		expect(names.filter(name => !ownerText.includes(`export const ${name} = `))).toEqual([]);
	});

	it('registers nothing for the owner: no schemas, services, handlers or stores', () => {
		const bootstrap = read(resolve(COMMERCE_SRC, `bootstrap/${owner}.ts`));
		const commands = read(resolve(COMMERCE_SRC, `features/${owner}/commands.ts`));

		for (const text of [bootstrap, commands]) {
			expect(text).not.toMatch(/schemaRegistry\.register|registerCrudService|registerSchemaModule|\.subscribe\(/);
			expect(text).not.toMatch(/createModuleStore|registerReducer|engine\.use/);
		}
	});
});

function readOwnerCommands(owner: string): string {
	const featuresDir = resolve(MODULES_DIR, `${owner}/src/features`);
	const copied = read(resolve(COMMERCE_SRC, `features/${owner}/commands.ts`));
	const resources = new Set([...copied.matchAll(/export const (\w+)Commands = /g)].map(match => match[1]));
	return [...resources].map(resource => {
		const folder = resource.charAt(0).toLowerCase() + resource.slice(1);
		return read(resolve(featuresDir, `${folder}/commands.ts`));
	}).join('\n');
}
