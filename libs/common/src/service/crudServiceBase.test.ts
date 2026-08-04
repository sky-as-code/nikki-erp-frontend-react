import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CrudServiceBase, GenericCrudService } from './crudServiceBase';
import { schemaRegistry } from '../dynamicModel/schema_registry';
import { createEventBus } from '../eventBus';
import { ClientErrorItem } from '../types/common';

import type { IEventBus } from '../eventBus';


const SCHEMA_NAME = 'test_widget';
const MODULE_NAME = 'test';

/** Stands in for `RestApi`; every method records its call and returns a canned result. */
function newRestApiStub() {
	return {
		create: vi.fn(async () => ({ data: { id: '1' }, clientErrors: [] })),
		update: vi.fn(async () => ({ data: { etag: 'e2' }, clientErrors: [] })),
		delete: vi.fn(async () => ({ data: { affected_count: 1, affected_at: '2026-01-01' }, clientErrors: [] })),
		setIsArchived: vi.fn(async () => ({ data: { etag: 'e3' }, clientErrors: [] })),
		manageM2m: vi.fn(async () => ({ data: { etag: 'e4' }, clientErrors: [] })),
		getById: vi.fn(async () => ({ data: { item: { id: '1' } }, clientErrors: [] })),
		getOne: vi.fn(async () => ({ data: { item: { id: '1' } }, clientErrors: [] })),
		search: vi.fn(async () => ({ data: { items: [] }, clientErrors: [] })),
		exists: vi.fn(async () => ({ data: { existing: [] }, clientErrors: [] })),
		getModelSchema: vi.fn(async () => ({ data: { name: SCHEMA_NAME }, clientErrors: [] })),
	};
}

type RestApiStub = ReturnType<typeof newRestApiStub>;

function clientError(message: string): ClientErrorItem {
	return new ClientErrorItem({ key: 'err.test', message, type: 'validation' });
}

class TestService extends CrudServiceBase {
	public constructor(eventBus: IEventBus) {
		super({ moduleName: MODULE_NAME, schemaName: SCHEMA_NAME, eventBus });
	}
}

describe('CrudServiceBase', () => {
	let restApi: RestApiStub;
	let eventBus: IEventBus;
	let service: TestService;
	let published: Array<{ topic: string, payload: unknown }>;

	beforeEach(() => {
		restApi = newRestApiStub();
		vi.spyOn(schemaRegistry, 'get').mockResolvedValue({
			schemaName: SCHEMA_NAME,
			restApi: restApi as any,
			modelSchema: { name: SCHEMA_NAME, fields: {}, etag: 'schema-1' },
			validationSchema: {} as any,
		});
		eventBus = createEventBus();
		published = [];
		eventBus.subscribe('*:*:*', (payload, topic) => published.push({ topic, payload }));
		service = new TestService(eventBus);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('delegation', () => {
		it('routes each method to the matching RestApi call', async () => {
			await service.create({ name: 'a' });
			await service.update({ id: '1', etag: 'e1' });
			await service.setIsArchived({ id: '1', etag: 'e1', is_archived: true });
			await service.getById({ id: '1' });
			await service.search({ page: 0 });
			await service.exists({ ids: ['1'] });
			await service.getModelSchema();

			expect(restApi.create).toHaveBeenCalledOnce();
			expect(restApi.update).toHaveBeenCalledOnce();
			expect(restApi.setIsArchived).toHaveBeenCalledOnce();
			expect(restApi.getById).toHaveBeenCalledOnce();
			expect(restApi.search).toHaveBeenCalledOnce();
			expect(restApi.exists).toHaveBeenCalledOnce();
			expect(restApi.getModelSchema).toHaveBeenCalledOnce();
		});

		it('passes client errors through without converting them to a throw', async () => {
			const errors = [clientError('Name is required')];
			restApi.create.mockResolvedValue({ data: null, clientErrors: errors } as any);

			const result = await service.create({});

			expect(result.data).toBeNull();
			expect(result.clientErrors).toEqual(errors);
		});

		it('lets a technical failure propagate instead of catching it', async () => {
			restApi.search.mockRejectedValue(new Error('network down'));

			await expect(service.search({})).rejects.toThrow('network down');
		});

		it('throws when the schema is not registered', async () => {
			vi.spyOn(schemaRegistry, 'get').mockResolvedValue(null);

			await expect(service.search({})).rejects.toThrow(/not registered/);
		});
	});

	describe('events', () => {
		it('emits {module}:{schema}:{action} on a successful mutation', async () => {
			await service.create({ name: 'a' });

			expect(published).toHaveLength(1);
			expect(published[0].topic).toBe('test:test_widget:create');
			expect(published[0].payload).toEqual({ data: { id: '1' }, clientErrors: [] });
		});

		it('emits for every mutation kind', async () => {
			await service.create({});
			await service.update({ id: '1', etag: 'e' });
			await service.delete({ id: '1' });
			await service.setIsArchived({ id: '1', etag: 'e', is_archived: true });
			await service.manageM2m({ add: ['1'] }, 'manage-things');

			expect(published.map(entry => entry.topic)).toEqual([
				'test:test_widget:create',
				'test:test_widget:update',
				'test:test_widget:delete',
				'test:test_widget:setIsArchived',
				'test:test_widget:manageM2m',
			]);
		});

		it('emits nothing for read-only methods', async () => {
			await service.getById({ id: '1' });
			await service.getOne({ id: '1' }, () => new URLSearchParams());
			await service.search({});
			await service.exists({ ids: ['1'] });
			await service.getModelSchema();

			expect(published).toHaveLength(0);
		});

		it('emits nothing when the operation was rejected', async () => {
			restApi.create.mockResolvedValue({ data: null, clientErrors: [clientError('nope')] } as any);

			await service.create({});

			expect(published).toHaveLength(0);
		});

		it('emits nothing when the operation threw', async () => {
			restApi.update.mockRejectedValue(new Error('boom'));

			await expect(service.update({ id: '1', etag: 'e' })).rejects.toThrow();

			expect(published).toHaveLength(0);
		});
	});

	describe('delete', () => {
		it('accepts a single `{id}`', async () => {
			await service.delete({ id: '1' });

			expect(restApi.delete).toHaveBeenCalledOnce();
			expect(restApi.delete).toHaveBeenCalledWith({ id: '1' });
		});

		it('fans `{ids}` out to one call per id and sums affected_count', async () => {
			const result = await service.delete({ ids: ['1', '2', '3'] });

			expect(restApi.delete).toHaveBeenCalledTimes(3);
			expect(result.data?.affected_count).toBe(3);
		});

		it('attempts every id and accumulates client errors on partial failure', async () => {
			restApi.delete
				.mockResolvedValueOnce({ data: { affected_count: 1, affected_at: 'x' }, clientErrors: [] } as any)
				.mockResolvedValueOnce({ data: null, clientErrors: [clientError('in use')] } as any)
				.mockResolvedValueOnce({ data: null, clientErrors: [clientError('locked')] } as any);

			const result = await service.delete({ ids: ['1', '2', '3'] });

			expect(restApi.delete).toHaveBeenCalledTimes(3);
			expect(result.data).toBeNull();
			expect(result.clientErrors).toHaveLength(2);
		});

		it('emits one aggregate event for a bulk delete, not one per id', async () => {
			await service.delete({ ids: ['1', '2'] });

			expect(published).toHaveLength(1);
			expect(published[0].topic).toBe('test:test_widget:delete');
		});
	});

	describe('GenericCrudService', () => {
		it('needs no subclass to serve a schema', async () => {
			const generic = new GenericCrudService({
				moduleName: MODULE_NAME, schemaName: SCHEMA_NAME, eventBus,
			});

			const result = await generic.search({});

			expect(result.data).toEqual({ items: [] });
		});
	});
});
