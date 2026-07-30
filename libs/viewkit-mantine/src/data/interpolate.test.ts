import { describe, expect, it } from 'vitest';

import { interpolateParams } from './interpolate';


describe('interpolateParams', () => {
	it('substitutes a whole-string placeholder', () => {
		const result = interpolateParams({ if: ['roles', 'linked', '${id}'] }, { id: 'abc' });

		expect(result.value).toEqual({ if: ['roles', 'linked', 'abc'] });
		expect(result.missing).toEqual([]);
	});

	it('leaves embedded fragments alone', () => {
		const result = interpolateParams({ if: ['name', '*', 'prefix-${id}'] }, { id: 'abc' });

		expect(result.value).toEqual({ if: ['name', '*', 'prefix-${id}'] });
	});

	it('reports a missing param and leaves the leaf untouched', () => {
		const result = interpolateParams({ if: ['roles', 'linked', '${id}'] }, {});

		expect(result.value).toEqual({ if: ['roles', 'linked', '${id}'] });
		expect(result.missing).toEqual(['id']);
	});

	it('substitutes any route param, not just id', () => {
		const result = interpolateParams(['${orgSlug}', '${moduleSlug}'], { orgSlug: 'acme', moduleSlug: 'iam' });

		expect(result.value).toEqual(['acme', 'iam']);
	});

	it('recurses nested and/or nodes', () => {
		const graph = { and: [{ if: ['roles', 'linked', '${id}'] }, { or: [{ if: ['x', '=', '${id}'] }] }] };
		const result = interpolateParams(graph, { id: '7' });

		expect(result.value).toEqual({
			and: [{ if: ['roles', 'linked', '7'] }, { or: [{ if: ['x', '=', '7'] }] }],
		});
	});

	it('passes non-string primitives through', () => {
		const result = interpolateParams({ page: 0, on: true, none: null }, { id: 'a' });

		expect(result.value).toEqual({ page: 0, on: true, none: null });
	});

	it('drops prototype-polluting keys', () => {
		const result = interpolateParams(JSON.parse('{"__proto__":{"bad":1},"ok":2}'), {});

		expect(result.value).toEqual({ ok: 2 });
	});

	it('stops recursing past the depth cap', () => {
		let deep: any = '${id}';
		for (let i = 0; i < 30; i++) {
			deep = [deep];
		}
		const result = interpolateParams(deep, { id: 'x' });

		expect(result.missing).toEqual([]);
	});

	it('returns undefined unchanged', () => {
		expect(interpolateParams(undefined, { id: 'a' }).value).toBeUndefined();
	});
});
