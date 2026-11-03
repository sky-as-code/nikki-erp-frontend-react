import { context, trace, TraceFlags } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createJsonLogger, formatRecord } from './logger';
import { runWithIdempotencyId } from '../../telemetry/idempotency_id';
import { setServiceIdentity } from '../../telemetry/identity';


const SPAN_CONTEXT = { traceId: '4bf92f3577b34da6a3ce929d0e0e4736', spanId: '00f067aa0ba902b7' };
const ID = '019a46c2-2a40-7b35-9e0f-8e2fd22b9b6c';

beforeAll(() => {
	context.setGlobalContextManager(new AsyncLocalStorageContextManager().enable());
	setServiceIdentity({
		serviceName: 'coremart-bff', serviceVersion: '1.2.3', serviceInstanceId: 'host-1-abc',
		deploymentEnvironment: 'staging',
	});
});

afterAll(() => {
	context.disable();
});

describe('json logger', () => {
	it('AC-14 / ID-AC-13: a record outside any request has null telemetry and idempotency fields', () => {
		const record = JSON.parse(formatRecord('INFO', 'Web BFF running', []));
		expect(record).toEqual({
			timestamp: expect.stringMatching(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/),
			severity: 'INFO', message: 'Web BFF running',
			trace_id: null, span_id: null, idempotency_id: null,
			'service.name': 'coremart-bff', tenant_id: null, org_id: null,
		});
	});

	it('reads the active span and idempotency id at each call', () => {
		const spanContext = { ...SPAN_CONTEXT, traceFlags: TraceFlags.SAMPLED };
		const line = context.with(trace.setSpanContext(context.active(), spanContext), () => (
			runWithIdempotencyId(ID, () => formatRecord('WARN', 'x', []))
		));
		expect(JSON.parse(line)).toMatchObject({
			trace_id: SPAN_CONTEXT.traceId, span_id: SPAN_CONTEXT.spanId, idempotency_id: ID,
		});
	});

	it('nests caller fields under data, so they cannot override telemetry fields', () => {
		const record = JSON.parse(formatRecord('INFO', 'm', [{ trace_id: 'forged', severity: 'DEBUG' }]));
		expect(record).toMatchObject({ trace_id: null, severity: 'INFO', data: { trace_id: 'forged', severity: 'DEBUG' } });
	});

	it('serializes errors and several arguments, one line per record', () => {
		const lines: Array<[string, string]> = [];
		createJsonLogger((severity, line) => lines.push([severity, line])).error('failed', new TypeError('bad'), 3);
		expect(lines).toHaveLength(1);
		const [severity, json] = lines[0];
		expect(severity).toBe('ERROR');
		expect(json).not.toContain('\n');
		expect(JSON.parse(json).data).toEqual([{ type: 'TypeError', message: 'bad', stack: expect.any(String) }, 3]);
	});
});
