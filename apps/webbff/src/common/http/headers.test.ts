import { describe, expect, it } from 'vitest';

import { buildForwardedHeaders, filterRequestHeaders, filterResponseHeaders } from './headers';


describe('filterRequestHeaders', () => {
	const incoming = {
		'content-type': 'application/json',
		'content-length': '12',
		accept: 'application/json',
		'accept-language': 'vi',
		'user-agent': 'test',
		'x-nikki-org-id': 'org1',
		'x-nikki-accesstoken': 'browser-token',
		authorization: 'Bearer browser',
		cookie: 'nikki_at=abc',
		host: 'cityboi.localhost:3000',
		connection: 'keep-alive',
		origin: 'http://evil.example',
	};

	it('keeps allowlisted and x-nikki-* headers and drops credentials, hop-by-hop and the rest', () => {
		expect(filterRequestHeaders(incoming, { keepBodyHeaders: true })).toEqual({
			'content-type': 'application/json',
			'content-length': '12',
			accept: 'application/json',
			'accept-language': 'vi',
			'user-agent': 'test',
			'x-nikki-org-id': 'org1',
		});
	});

	it('drops body framing headers when the BFF builds the body itself', () => {
		const result = filterRequestHeaders(incoming, { keepBodyHeaders: false });
		expect(result).not.toHaveProperty('content-type');
		expect(result).not.toHaveProperty('content-length');
		expect(result).toHaveProperty('x-nikki-org-id', 'org1');
	});
});

describe('filterResponseHeaders', () => {
	it('never forwards set-cookie or hop-by-hop headers', () => {
		const result = filterResponseHeaders({
			'content-type': 'application/x-ndjson',
			'content-disposition': 'attachment; filename="r.xlsx"',
			'x-accel-buffering': 'no',
			'x-nikki-total': '3',
			'set-cookie': ['a=b'],
			connection: 'close',
			'keep-alive': 'timeout=5',
			server: 'go',
		});
		expect(result).toEqual({
			'content-type': 'application/x-ndjson',
			'content-disposition': 'attachment; filename="r.xlsx"',
			'x-accel-buffering': 'no',
			'x-nikki-total': '3',
		});
	});
});

describe('buildForwardedHeaders', () => {
	it('appends the peer address to an existing chain', () => {
		const result = buildForwardedHeaders(
			{ 'x-forwarded-for': '10.0.0.1' },
			{ remoteAddress: '127.0.0.1', protocol: 'http', host: 'cityboi.localhost:3000' },
		);
		expect(result).toEqual({
			'x-forwarded-for': '10.0.0.1, 127.0.0.1',
			'x-forwarded-proto': 'http',
			'x-forwarded-host': 'cityboi.localhost:3000',
		});
	});
});
