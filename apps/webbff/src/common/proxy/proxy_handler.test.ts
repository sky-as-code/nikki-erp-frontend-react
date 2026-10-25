import { describe, expect, it } from 'vitest';

import { toUpstreamPath } from './proxy_handler';


describe('toUpstreamPath', () => {
	it.each([
		['/api/v1/iam/iam_user?page=0&size=10', '/v1/iam/iam_user?page=0&size=10'],
		['/api/v2/x', '/v2/x'],
		['/api/v12/essential/essential_language/enabled', '/v12/essential/essential_language/enabled'],
		['/api/v1/inventory/a/b?q=../x', '/v1/inventory/a/b?q=../x'],
	])('maps %s to %s', (input, expected) => {
		expect(toUpstreamPath(input)).toBe(expected);
	});

	it.each([
		'/api/foo',
		'/api/v1',
		'/api/vx/iam',
		'/api/v0/config',
		'/apiv1/x',
		'/v1/x',
		'/api/v1/../admin',
		'/api/v1/%2e%2e/admin',
		'/api/v1/a/%E0%A4%A',
	])('rejects %s', (input) => {
		expect(toUpstreamPath(input)).toBeUndefined();
	});
});
