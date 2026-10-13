import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CrudServiceBase } from './crudServiceBase';
import { currentOrgSearchParams, withOrgId } from './orgContext';
import { CommandBus } from '../commandBus';
import { schemaRegistry } from '../dynamicModel/schema_registry';

import type { ICommandBus } from '../commandBus';
import type { SchemaPack } from '../dynamicModel';


const SCHEMA_NAME = 'test_org_widget';
const CURRENT_ORG = '01JWNY20G23KD4RV5VWYABQYHD';

function schemaPack(fields: Record<string, unknown>, restApi: unknown = {}): SchemaPack {
	return {
		schemaName: SCHEMA_NAME,
		restApi: restApi as any,
		modelSchema: { name: SCHEMA_NAME, fields, etag: 'schema-1' } as any,
		validationSchema: {} as any,
	};
}

const orgScoped = schemaPack({ org_id: {}, name: {} });
const unscoped = schemaPack({ name: {} });

function installBus(orgId: string | null): void {
	CommandBus.instance = {
		publish: vi.fn(async () => ({ result: { data: orgId } })),
	} as unknown as ICommandBus;
}

/** Exposes the protected helper a subclass's custom action uses. */
class TestService extends CrudServiceBase {
	public constructor() {
		super({ moduleName: 'test', schemaName: SCHEMA_NAME });
	}

	public customActionBody<T extends object>(body: T): Promise<T> {
		return this.withCurrentOrg(body);
	}
}

let previousBus: ICommandBus | undefined;

beforeEach(() => {
	previousBus = CommandBus.instance;
	installBus(CURRENT_ORG);
});

afterEach(() => {
	CommandBus.instance = previousBus;
	vi.restoreAllMocks();
});

describe('withOrgId', () => {
	it('adds the current org to a request for an org-scoped schema', async () => {
		expect(await withOrgId({ page: 0 }, orgScoped, SCHEMA_NAME)).toEqual({ page: 0, org_id: CURRENT_ORG });
	});

	it('keeps an org the caller set', async () => {
		expect(await withOrgId({ org_id: 'other' }, orgScoped, SCHEMA_NAME)).toEqual({ org_id: 'other' });
	});

	it('leaves a schema without org_id untouched', async () => {
		expect(await withOrgId({ page: 0 }, unscoped, SCHEMA_NAME)).toEqual({ page: 0 });
	});

	it('leaves an opted-out schema untouched although it declares org_id', async () => {
		expect(await withOrgId({ page: 0 }, orgScoped, 'iam_role')).toEqual({ page: 0 });
	});

	it('throws when the schema needs an org and none is resolved', async () => {
		installBus(null);

		await expect(withOrgId({}, orgScoped, SCHEMA_NAME)).rejects.toThrow(/no current organization/);
	});
});

describe('currentOrgSearchParams', () => {
	it('returns the org as a query tuple', async () => {
		expect(await currentOrgSearchParams()).toEqual([['org_id', CURRENT_ORG]]);
	});

	it('returns nothing before an org is resolved', async () => {
		installBus(null);

		expect(await currentOrgSearchParams()).toEqual([]);
	});
});

describe('CrudServiceBase', () => {
	const restApi = {
		search: vi.fn(async () => ({ data: { items: [] }, clientErrors: [] })),
		create: vi.fn(async () => ({ data: { id: '1' }, clientErrors: [] })),
	};

	beforeEach(() => {
		vi.spyOn(schemaRegistry, 'get').mockResolvedValue(schemaPack({ org_id: {} }, restApi));
	});

	it('scopes reads and writes alike', async () => {
		const service = new TestService();

		await service.search({ page: 0 });
		await service.create({ name: 'a' });

		expect(restApi.search).toHaveBeenCalledWith({ page: 0, org_id: CURRENT_ORG }, undefined);
		expect(restApi.create).toHaveBeenCalledWith({ name: 'a', org_id: CURRENT_ORG }, undefined);
	});

	it('scopes a custom action body through withCurrentOrg', async () => {
		expect(await new TestService().customActionBody({ kiosk_id: 'k1' }))
			.toEqual({ kiosk_id: 'k1', org_id: CURRENT_ORG });
	});
});
