import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { schemaRegistry } from './schema_registry';

import type { ModelSchema } from './model_schema';
import type { RequestMaker } from '../request/request';


const SCHEMA_NAME = 'essential_uom';

/**
 * A `RequestMaker` that answers the schema fetch without a network. `RestApi` takes one by
 * injection, so registering with this is enough to make `get` resolve.
 */
function fakeRequestMaker(schemaName: string): RequestMaker {
	const modelSchema: Partial<ModelSchema> = { name: schemaName, fields: {}, etag: 'etag-1' };
	return {
		get: async () => ({ data: modelSchema, clientErrors: [] }),
	} as unknown as RequestMaker;
}

function register(schemaName: string): void {
	schemaRegistry.register([{
		schemaName,
		resourcePath: `v1/essential/${schemaName}`,
		requestMaker: fakeRequestMaker(schemaName),
	}]);
}

beforeEach(() => {
	schemaRegistry.clear();
});

afterEach(() => {
	schemaRegistry.clear();
	vi.restoreAllMocks();
});

describe('SchemaRegistry owner loading', () => {
	it('returns null for an unknown schema when no owner loader is set', async () => {
		expect(await schemaRegistry.get(SCHEMA_NAME)).toBeNull();
	});

	it('loads the owner and resolves once the loader registers the schema', async () => {
		const loader = vi.fn(async () => {
			register(SCHEMA_NAME);
			return 'loaded' as const;
		});
		schemaRegistry.setOwnerLoader(loader);

		const pack = await schemaRegistry.get(SCHEMA_NAME);

		expect(pack?.schemaName).toBe(SCHEMA_NAME);
		expect(loader).toHaveBeenCalledOnce();
	});

	it('returns null and warns when no micro-app owns the schema', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		schemaRegistry.setOwnerLoader(async () => 'unknown');

		expect(await schemaRegistry.get(SCHEMA_NAME)).toBeNull();
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('no micro-app owns'));
	});

	it('returns null and warns when the owner loads but registers nothing', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		schemaRegistry.setOwnerLoader(async () => 'loaded');

		expect(await schemaRegistry.get(SCHEMA_NAME)).toBeNull();
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('did not register it'));
	});

});

describe('SchemaRegistry owner-load bookkeeping', () => {
	it('loads the owner once for concurrent misses of the same schema', async () => {
		const loader = vi.fn(async () => {
			register(SCHEMA_NAME);
			return 'loaded' as const;
		});
		schemaRegistry.setOwnerLoader(loader);

		const [first, second] = await Promise.all([
			schemaRegistry.get(SCHEMA_NAME),
			schemaRegistry.get(SCHEMA_NAME),
		]);

		expect(first?.schemaName).toBe(SCHEMA_NAME);
		expect(second?.schemaName).toBe(SCHEMA_NAME);
		expect(loader).toHaveBeenCalledOnce();
	});

	// A second miss means the owner loaded and still did not register the schema, which retrying
	// cannot fix — and retrying on every render would re-download the bundle.
	it('does not retry the loader after a failed resolve', async () => {
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		const loader = vi.fn(async () => 'unknown' as const);
		schemaRegistry.setOwnerLoader(loader);

		await schemaRegistry.get(SCHEMA_NAME);
		await schemaRegistry.get(SCHEMA_NAME);

		expect(loader).toHaveBeenCalledOnce();
	});

	it('never invokes the loader for an already-registered schema', async () => {
		const loader = vi.fn(async () => 'loaded' as const);
		schemaRegistry.setOwnerLoader(loader);
		register(SCHEMA_NAME);

		expect((await schemaRegistry.get(SCHEMA_NAME))?.schemaName).toBe(SCHEMA_NAME);
		expect(loader).not.toHaveBeenCalled();
	});

	it('does not invoke the loader from refresh', async () => {
		const loader = vi.fn(async () => 'loaded' as const);
		schemaRegistry.setOwnerLoader(loader);

		expect(await schemaRegistry.refresh(SCHEMA_NAME)).toBeNull();
		expect(loader).not.toHaveBeenCalled();
	});
});

describe('SchemaRegistry schema graph', () => {
	function schemaOf(name: string): ModelSchema {
		return { name, fields: {}, etag: `etag-${name}` } as unknown as ModelSchema;
	}

	function graphRequestMaker(get: ReturnType<typeof vi.fn>): RequestMaker {
		return { get } as unknown as RequestMaker;
	}

	it('loads the root through meta/schema_graph and seeds the edge targets', async () => {
		const get = vi.fn(async (url: string) => (url.endsWith('/meta/schema_graph')
			? { data: { schema: schemaOf('inventory_product'), edges: { essential_uom: schemaOf('essential_uom') } }, clientErrors: [] }
			: { data: null, clientErrors: [] }));
		schemaRegistry.register([
			{ schemaName: 'inventory_product', resourcePath: 'v1/inventory/inventory_product', requestMaker: graphRequestMaker(get) },
			{ schemaName: 'essential_uom', resourcePath: 'v1/essential/essential_uom', requestMaker: graphRequestMaker(get) },
		]);

		const root = await schemaRegistry.get('inventory_product');
		const edge = await schemaRegistry.get('essential_uom');

		expect(root?.modelSchema.name).toBe('inventory_product');
		expect(edge?.modelSchema.etag).toBe('etag-essential_uom');
		expect(get).toHaveBeenCalledOnce();
	});

	it('falls back to meta/schema when the graph is unavailable', async () => {
		const get = vi.fn(async (url: string) => (url.endsWith('/meta/schema_graph')
			? { data: null, clientErrors: [{ type: 'business', key: 'common:err_not_found', message: 'nope' }] }
			: { data: schemaOf(SCHEMA_NAME), clientErrors: [] }));
		schemaRegistry.register([{
			schemaName: SCHEMA_NAME, resourcePath: `v1/essential/${SCHEMA_NAME}`, requestMaker: graphRequestMaker(get),
		}]);

		const pack = await schemaRegistry.get(SCHEMA_NAME);

		expect(pack?.modelSchema.name).toBe(SCHEMA_NAME);
		expect(get.mock.calls.map(call => call[0])).toEqual([
			`v1/essential/${SCHEMA_NAME}/meta/schema_graph`, `v1/essential/${SCHEMA_NAME}/meta/schema`,
		]);
	});

	it('holds a seed for a schema registered later', async () => {
		const get = vi.fn();
		schemaRegistry.seed([schemaOf(SCHEMA_NAME)]);
		schemaRegistry.register([{
			schemaName: SCHEMA_NAME, resourcePath: `v1/essential/${SCHEMA_NAME}`, requestMaker: graphRequestMaker(get),
		}]);

		expect((await schemaRegistry.get(SCHEMA_NAME))?.modelSchema.name).toBe(SCHEMA_NAME);
		expect(get).not.toHaveBeenCalled();
	});
});
