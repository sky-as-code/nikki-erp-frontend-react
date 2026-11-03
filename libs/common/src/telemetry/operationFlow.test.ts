import { SpanKind } from '@opentelemetry/api';
import { InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_TELEMETRY_CONFIG } from './config';
import { traceOperation, UI_OPERATIONS } from './operation';
import { carryOperation, operationOf, withOperation } from './operationCarrier';
import { initTelemetry, shutdownTelemetry } from './provider';
import { CommandBus } from '../commandBus';
import { registerGenericResourceCommands, resourceCommand } from '../dynamicModel/resourceCommands';
import { RestApi } from '../dynamicModel/restapi';
import { schemaRegistry } from '../dynamicModel/schema_registry';
import { RequestMaker } from '../request/request';

import type { TelemetryOperation } from './operation';
import type { ReadableSpan } from '@opentelemetry/sdk-trace-base';


/**
 * AC-09 through the shared layer every metadata-driven screen uses: a command published with an operation
 * crosses the bus, the generic CRUD handler, `CrudServiceBase` and `RestApi`, and each `RequestMaker` call
 * it makes is a child of that operation, even with two operations and their parallel calls interleaved.
 */

const API_ORIGIN = 'https://example.test';
const SCHEMA = 'test_widget';
const TRACEPARENT = /^00-([0-9a-f]{32})-([0-9a-f]{16})-0[01]$/;

let exporter: InMemorySpanExporter;
let fetchMock: ReturnType<typeof vi.fn>;
let bus: CommandBus;

function stubSchema(): void {
	const restApi = new RestApi({ resourcePath: `v1/test/${SCHEMA}`, requestMaker: new RequestMaker({ baseUrl: API_ORIGIN }) });
	vi.spyOn(schemaRegistry, 'get').mockResolvedValue({
		schemaName: SCHEMA, restApi, modelSchema: { name: SCHEMA, fields: {}, etag: 'e1' } as any, validationSchema: {} as any,
	});
}

beforeEach(async () => {
	await shutdownTelemetry();
	exporter = new InMemorySpanExporter();
	initTelemetry({
		...DEFAULT_TELEMETRY_CONFIG,
		propagationOrigins: [API_ORIGIN],
		spanProcessors: [new SimpleSpanProcessor(exporter)],
	});
	fetchMock = vi.fn().mockImplementation(async () => {
		await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
		return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
	});
	vi.stubGlobal('fetch', fetchMock);
	stubSchema();
	bus = new CommandBus();
	registerGenericResourceCommands(bus);
});

afterEach(async () => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
	await shutdownTelemetry();
});

function publish(action: Parameters<typeof resourceCommand>[1], payload: unknown, operation: TelemetryOperation) {
	return bus.publish({ name: resourceCommand(SCHEMA, action), payload, operation });
}

function finished(): ReadableSpan[] {
	return exporter.getFinishedSpans();
}

function spanIdOf(request: Request): string {
	return TRACEPARENT.exec(request.headers.get('traceparent') ?? '')![2];
}

describe('operations through the command bus and RestApi (AC-09)', () => {
	it('parents every parallel call of two overlapping operations on its own operation', async () => {
		await Promise.all([
			traceOperation(UI_OPERATIONS.SCREEN_LOAD, op => Promise.all([
				publish('search', { size: 20 }, op), publish('get_by_id', { id: 'a1' }, op), publish('exists', { ids: ['a2'] }, op),
			])),
			traceOperation(UI_OPERATIONS.FORM_SAVE, op => Promise.all([
				publish('update', { id: 'b1', etag: 'e' }, op), publish('delete', { ids: ['b2', 'b3'] }, op),
			])),
		]);

		const operations = finished().filter(span => span.kind === SpanKind.INTERNAL);
		const clients = finished().filter(span => span.kind === SpanKind.CLIENT);
		expect(operations.map(span => span.name).sort()).toEqual([UI_OPERATIONS.FORM_SAVE, UI_OPERATIONS.SCREEN_LOAD]);
		expect(clients).toHaveLength(6);
		const requests = fetchMock.mock.calls.map(call => call[0] as Request);
		for (const request of requests) {
			const client = clients.find(span => span.spanContext().spanId === spanIdOf(request))!;
			const isWrite = request.method === 'PATCH' || request.method === 'DELETE';
			const expected = isWrite ? UI_OPERATIONS.FORM_SAVE : UI_OPERATIONS.SCREEN_LOAD;
			const parent = operations.find(span => span.name === expected)!;
			expect(client.parentSpanContext?.spanId).toBe(parent.spanContext().spanId);
			expect(client.spanContext().traceId).toBe(parent.spanContext().traceId);
		}
		const ids = new Set(requests.map(request => request.headers.get('X-Idempotency-ID')));
		expect(ids.size).toBe(6);
	});

	it('ends the operation after its calls, and never sends the operation on the wire', async () => {
		const bodies: string[] = [];
		fetchMock.mockImplementation(async (request: Request) => {
			bodies.push(await request.text());
			return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
		});
		await traceOperation(UI_OPERATIONS.FORM_SAVE, op => publish('create', { name: 'w' }, op));

		expect(bodies).toEqual(['{"name":"w"}']);
		const [client] = finished().filter(span => span.kind === SpanKind.CLIENT);
		const [operation] = finished().filter(span => span.kind === SpanKind.INTERNAL);
		// Exported in the order they ended.
		expect(finished().indexOf(operation)).toBeGreaterThan(finished().indexOf(client));
	});

	it('leaves a command published without an operation as its own root trace (FE-04)', async () => {
		await bus.publish({ name: resourceCommand(SCHEMA, 'search'), payload: {} });

		const [client] = finished();
		expect(client.kind).toBe(SpanKind.CLIENT);
		expect(client.parentSpanContext).toBeUndefined();
	});
});

describe('operation carrier', () => {
	it('is invisible to JSON, query strings, entries and spreads, and leaves the original untouched', async () => {
		const operation = await traceOperation('test.op', async op => op);
		const original = { id: 'x', size: 1 };
		const carried = withOperation(original, operation);

		expect(operationOf(carried)).toBe(operation);
		expect(operationOf(original)).toBeUndefined();
		expect(JSON.stringify(carried)).toBe('{"id":"x","size":1}');
		expect(new URLSearchParams(carried as unknown as Record<string, string>).toString()).toBe('id=x&size=1');
		expect(operationOf({ ...carried })).toBeUndefined();
		expect(operationOf(carryOperation(carried, { id: 'y' }))).toBe(operation);
	});

	it('passes anything but a plain object or array through unchanged', async () => {
		const operation = await traceOperation('test.op', async op => op);
		const form = new FormData();

		expect(withOperation(undefined, operation)).toBeUndefined();
		expect(withOperation('text', operation)).toBe('text');
		expect(withOperation(form, operation)).toBe(form);
		expect(operationOf(form)).toBeUndefined();
	});
});
