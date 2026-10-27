import { describe, expect, it } from 'vitest';

import { createResourceViewService, parseResourceViewPath } from './resource_view_service';

import type { ResourceViewTarget } from './resource_view_service';
import type { UpstreamClient, UpstreamJsonResponse } from '../../common/http/upstream_client';
import type {
	SchemaGraphRequest, SchemaGraphResult, SchemaGraphService,
} from '../dynamicresource/schema_graph_service';


const userSchema = {
	name: 'iam_user',
	fields: {
		id: { name: 'id' }, display_name: { name: 'display_name' }, org_unit_id: { name: 'org_unit_id' },
		org_unit: { name: 'org_unit', is_edge_model: true },
	},
	default_search_fields: ['display_name', 'org_unit_id'],
	to_relations: [
		{ edge: 'org_unit', src_field: 'org_unit_id', dest_schema_name: 'iam_orgunit', relation_type: 'many:one' },
	],
};
const graph: SchemaGraphResult = {
	status: 200,
	body: {
		schema: userSchema,
		edges: { iam_orgunit: { name: 'iam_orgunit', record_label_field: 'name' } },
		failed_edges: [],
	},
};

function fakeUpstream(reply: UpstreamJsonResponse<unknown>) {
	const calls: { path: string; token?: string }[] = [];
	const upstream: UpstreamClient = {
		forward: () => undefined,
		pipeTo: () => Promise.reject(new Error('unused')),
		streamTo: () => Promise.reject(new Error('unused')),
		requestJson: async <T>(_method: string, path: string, options?: { accessToken?: string }) => {
			calls.push({ path, token: options?.accessToken });
			return reply as UpstreamJsonResponse<T>;
		},
	};
	return { upstream, calls };
}

function fakeGraphs(result: SchemaGraphResult = graph) {
	const requests: SchemaGraphRequest[] = [];
	const service: SchemaGraphService = {
		fetchGraph: async (request) => {
			requests.push(request);
			return result;
		},
	};
	return { service, requests };
}

function ok(body: unknown): UpstreamJsonResponse<unknown> {
	return { status: 200, headers: {}, body };
}

function target(kind: 'list' | 'detail', path: string): ResourceViewTarget {
	return parseResourceViewPath(kind, path.split('/'))!;
}

describe('parseResourceViewPath', () => {
	it('resolves a top-level and a nested resource', () => {
		expect(target('list', 'iam/iam_user')).toMatchObject({ moduleKey: 'iam', schemaName: 'iam_user' });
		expect(target('detail', 'iam/iam_user/01HX')).toMatchObject({ moduleKey: 'iam', schemaName: 'iam_user' });
		expect(target('list', 'vendingmachine/vdmc_kiosks/k1/vdmc_kiosk_events')).toMatchObject({
			moduleKey: 'vendingmachine', schemaName: 'vdmc_kiosk_events',
		});
		expect(target('detail', 'inventory/inventory_product/p1/inventory_variant/v-1')).toMatchObject({
			moduleKey: 'inventory', schemaName: 'inventory_variant',
		});
	});

	it.each([
		['list', 'iam'], ['list', 'iam/iam_user/x'], ['detail', 'iam/iam_user'], ['list', 'IAM/iam_user'],
		['list', 'iam/iam-user'], ['detail', 'iam/iam_user/..'], ['detail', 'iam/iam_user/a.b'],
		['list', 'iam/../iam_user'], ['list', 'iam/iam_user/x/y/z'],
	] as const)('refuses %s %s', (kind, path) => {
		expect(parseResourceViewPath(kind, path.split('/'))).toBeUndefined();
	});
});

describe('ResourceViewService', () => {
	it('lists with the default search fields plus edge labels, and strips the added ones', async () => {
		const { upstream, calls } = fakeUpstream(ok({
			items: [{ id: 'u1', org_unit: { id: 'o1', name: 'Sales' } }], total: 1,
			desired_fields: ['display_name', 'org_unit_id', 'org_unit.name'], masked_fields: [],
		}));
		const graphs = fakeGraphs();
		const result = await createResourceViewService(upstream, graphs.service).read({
			target: target('list', 'iam/iam_user'), query: new URLSearchParams('org_id=o9&page=0'), accessToken: 'tok',
		});
		expect(calls).toEqual([{
			path: '/v1/iam/iam_user?org_id=o9&page=0&fields=display_name&fields=org_unit_id&fields=org_unit.name',
			token: 'tok',
		}]);
		expect(graphs.requests[0]).toMatchObject({ moduleKey: 'iam', schemaName: 'iam_user', query: 'org_id=o9' });
		expect(result.status).toBe(200);
		expect(result.body).toMatchObject({
			desired_fields: ['display_name', 'org_unit_id'], edge_labels: { org_unit: 'name' },
		});
	});

	it('keeps a masked added edge in masked_fields', async () => {
		const { upstream } = fakeUpstream(ok({
			items: [{ id: 'u1', org_unit: null }], desired_fields: ['org_unit_id', 'org_unit.name'],
			masked_fields: ['org_unit.name'],
		}));
		const result = await createResourceViewService(upstream, fakeGraphs().service).read({
			target: target('list', 'iam/iam_user'), query: new URLSearchParams('fields=org_unit_id'), accessToken: 'tok',
		});
		expect(result.body).toMatchObject({ desired_fields: ['org_unit_id'], masked_fields: ['org_unit.name'] });
	});

	it('reads a detail with * plus every edge label, decorating meta', async () => {
		const { upstream, calls } = fakeUpstream(ok({
			item: { id: 'u1' }, meta: { desired_fields: ['*', 'org_unit.name'], masked_fields: null },
		}));
		const result = await createResourceViewService(upstream, fakeGraphs().service).read({
			target: target('detail', 'iam/iam_user/u1'), query: new URLSearchParams(), accessToken: 'tok',
		});
		expect(calls[0].path).toBe('/v1/iam/iam_user/u1?fields=*&fields=org_unit.name');
		expect(result.body).toEqual({
			item: { id: 'u1' },
			meta: { desired_fields: ['*'], masked_fields: null, edge_labels: { org_unit: 'name' } },
		});
	});

});

describe('ResourceViewService failures', () => {
	it('passes a non-2xx answer through untouched', async () => {
		const body = [{ type: 'authorization', key: 'k', message: 'm' }];
		const { upstream } = fakeUpstream({ status: 403, headers: {}, body });
		const result = await createResourceViewService(upstream, fakeGraphs().service).read({
			target: target('list', 'iam/iam_user'), query: new URLSearchParams(), accessToken: 'tok',
		});
		expect(result).toEqual({ status: 403, body });
	});

	it('forwards the request unchanged, without labels, when the schema graph is refused', async () => {
		const { upstream, calls } = fakeUpstream(ok({ items: [], desired_fields: [] }));
		const graphs = fakeGraphs({ status: 404, body: [] });
		const result = await createResourceViewService(upstream, graphs.service).read({
			target: target('list', 'iam/iam_user'), query: new URLSearchParams('page=1'), accessToken: 'tok',
		});
		expect(calls[0].path).toBe('/v1/iam/iam_user?page=1');
		expect(result.body).toEqual({ items: [], desired_fields: [], edge_labels: {} });
	});
});
