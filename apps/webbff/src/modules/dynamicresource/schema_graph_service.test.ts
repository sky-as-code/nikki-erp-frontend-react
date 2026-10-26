import { describe, expect, it } from 'vitest';

import { collectEdgeTargets, createSchemaGraphService, mapWithConcurrency } from './schema_graph_service';
import { UpstreamUnavailableError } from '../../common/http/errors';

import type { UpstreamClient, UpstreamJsonResponse } from '../../common/http/upstream_client';


/**
 * `GET /v1/vendingmachine/vdmc_kiosks/meta/schema` in the shape `ModelSchema.ToSimplized()` serializes
 * (backend `nikkierp/common/dynamicmodel/model/model_schema.go`), trimmed to two fields. Edges follow
 * `coremart/modules/vendingmachine/domain/models/kiosk.json`.
 */
const kioskSchema = {
	name: 'vdmc_kiosks',
	etag: '1f2e3d',
	record_label_field: 'name',
	default_search_fields: ['code', 'name', 'model_id'],
	fields: {
		name: { name: 'name', label: { 'en-US': 'Name' }, data_type: { name: 'string' }, is_primary_key: false },
		model_id: { name: 'model_id', label: { 'en-US': 'Model' }, data_type: { name: 'ulid' }, is_foreign_key: true },
	},
	label: { 'en-US': 'Kiosk' },
	from_relations: [
		{ edge: 'connections', src_field: 'kiosk_id', dest_schema_name: 'vdmc_kiosk_connections', relation_type: 'one:many' },
		{ edge: 'children', src_field: 'parent_id', dest_schema_name: 'vdmc_kiosks', relation_type: 'one:many' },
	],
	to_relations: [
		{ edge: 'org', src_field: 'org_id', dest_schema_name: 'iam_organizations', relation_type: 'many:one' },
		{ edge: 'model', src_field: 'model_id', dest_schema_name: 'vdmc_kiosk_models', relation_type: 'many:one' },
		{
			edge: 'shopping_screen_playlist', src_field: 'shopping_screen_playlist_id',
			dest_schema_name: 'vdmc_playlists', relation_type: 'many:one',
		},
		{
			edge: 'waiting_screen_playlist', src_field: 'waiting_screen_playlist_id',
			dest_schema_name: 'vdmc_playlists', relation_type: 'many:one',
		},
		{ edge: 'events', dest_schema_name: 'vdmc_kiosk_events', relation_type: 'many:many' },
	],
};

const ROOT_PATH = '/v1/vendingmachine/vdmc_kiosks/meta/schema';

function edgeSchema(name: string): Record<string, unknown> {
	return { name, etag: `etag-${name}`, fields: {}, label: { 'en-US': name } };
}

type Reply = UpstreamJsonResponse<unknown> | Error;

function fakeUpstream(replies: Record<string, Reply>): { upstream: UpstreamClient; calls: string[] } {
	const calls: string[] = [];
	const upstream: UpstreamClient = {
		forward: () => undefined,
		pipeTo: () => Promise.reject(new Error('unused')),
		streamTo: () => Promise.reject(new Error('unused')),
		requestJson: async <T>(_method: string, path: string) => {
			calls.push(path);
			const reply = replies[path.split('?', 1)[0]] ?? { status: 404, headers: {}, body: [] };
			if (reply instanceof Error) {
				throw reply;
			}
			return reply as UpstreamJsonResponse<T>;
		},
	};
	return { upstream, calls };
}

function ok(body: unknown): UpstreamJsonResponse<unknown> {
	return { status: 200, headers: {}, body };
}

const request = { moduleKey: 'vendingmachine', schemaName: 'vdmc_kiosks', query: 'org_id=o1', accessToken: 'tok' };

describe('collectEdgeTargets', () => {
	it('collects distinct to/from relation targets, excluding the root, with their module keys', () => {
		expect(collectEdgeTargets(kioskSchema, request)).toEqual([
			{ schemaName: 'iam_organizations', moduleKey: 'iam' },
			{ schemaName: 'vdmc_kiosk_models', moduleKey: 'vendingmachine' },
			{ schemaName: 'vdmc_playlists', moduleKey: 'vendingmachine' },
			{ schemaName: 'vdmc_kiosk_events', moduleKey: 'vendingmachine' },
			{ schemaName: 'vdmc_kiosk_connections', moduleKey: 'vendingmachine' },
		]);
	});

	it('tolerates a schema without relations or a malformed one', () => {
		expect(collectEdgeTargets({ name: 'x_y', fields: {} }, request)).toEqual([]);
		expect(collectEdgeTargets('oops', request)).toEqual([]);
		expect(collectEdgeTargets({ to_relations: [null, { edge: 'a' }, { dest_schema_name: 3 }] }, request)).toEqual([]);
	});
});

describe('SchemaGraphService', () => {
	it('fetches the root and every edge target, forwarding the query and token', async () => {
		const edgeNames = ['iam_organizations', 'vdmc_kiosk_models', 'vdmc_playlists', 'vdmc_kiosk_events',
			'vdmc_kiosk_connections'];
		const replies: Record<string, Reply> = { [ROOT_PATH]: ok(kioskSchema) };
		for (const name of edgeNames) {
			const moduleKey = name.startsWith('iam_') ? 'iam' : 'vendingmachine';
			replies[`/v1/${moduleKey}/${name}/meta/schema`] = ok(edgeSchema(name));
		}
		const { upstream, calls } = fakeUpstream(replies);
		const result = await createSchemaGraphService(upstream).fetchGraph(request);
		expect(result.status).toBe(200);
		expect(result.body).toEqual({
			schema: kioskSchema,
			edges: Object.fromEntries(edgeNames.map((name) => [name, edgeSchema(name)])),
			failed_edges: [],
		});
		expect(calls).toHaveLength(6);
		expect(calls.every((path) => path.endsWith('/meta/schema?org_id=o1'))).toBe(true);
	});

	it('omits failing edges and lists them in failed_edges', async () => {
		const { upstream } = fakeUpstream({
			[ROOT_PATH]: ok(kioskSchema),
			'/v1/iam/iam_organizations/meta/schema': { status: 403, headers: {}, body: [{ type: 'authorization' }] },
			'/v1/vendingmachine/vdmc_playlists/meta/schema': new UpstreamUnavailableError('down'),
			'/v1/vendingmachine/vdmc_kiosk_models/meta/schema': ok(edgeSchema('vdmc_kiosk_models')),
			'/v1/vendingmachine/vdmc_kiosk_connections/meta/schema': ok('not json'),
		});
		const result = await createSchemaGraphService(upstream).fetchGraph(request);
		expect(result.status).toBe(200);
		expect(result.body).toMatchObject({
			edges: { vdmc_kiosk_models: edgeSchema('vdmc_kiosk_models') },
			failed_edges: ['iam_organizations', 'vdmc_kiosk_connections', 'vdmc_kiosk_events', 'vdmc_playlists'],
		});
	});

	it('returns a failing root response as-is without fetching edges', async () => {
		const body = [{ type: 'authorization', key: 'common:err_unauthenticated', message: 'no' }];
		const { upstream, calls } = fakeUpstream({ [ROOT_PATH]: { status: 401, headers: {}, body } });
		const result = await createSchemaGraphService(upstream).fetchGraph(request);
		expect(result).toEqual({ status: 401, body });
		expect(calls).toEqual([`${ROOT_PATH}?org_id=o1`]);
	});

	it('rejects when the root schema is unreachable', async () => {
		const { upstream } = fakeUpstream({ [ROOT_PATH]: new UpstreamUnavailableError('down') });
		await expect(createSchemaGraphService(upstream).fetchGraph(request)).rejects.toBeInstanceOf(
			UpstreamUnavailableError,
		);
	});
});

describe('mapWithConcurrency', () => {
	it('never runs more than the limit at once and processes every item', async () => {
		let running = 0;
		let peak = 0;
		const seen: number[] = [];
		await mapWithConcurrency([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3, async (item) => {
			running++;
			peak = Math.max(peak, running);
			await new Promise((resolve) => setTimeout(resolve, 1));
			seen.push(item);
			running--;
		});
		expect(peak).toBe(3);
		expect(seen.sort((left, right) => left - right)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
	});
});
