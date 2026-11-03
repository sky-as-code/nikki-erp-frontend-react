import { DEFAULT_TELEMETRY_CONFIG, initTelemetry, operationOf, shutdownTelemetry, UI_OPERATIONS } from '@nikkierp/common';
import { CommandBus } from '@nikkierp/common/commandBus';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { publishTraced } from './tracedPublish';

import type { TelemetryConfig, TelemetryOperation } from '@nikkierp/common';


type EndedSpan = { name: string, status: { code: number } };

let ended: EndedSpan[];

beforeEach(async () => {
	await shutdownTelemetry();
	ended = [];
	const processor = {
		onStart: () => undefined,
		onEnd: (span: EndedSpan) => ended.push(span),
		forceFlush: async () => undefined,
		shutdown: async () => undefined,
	};
	initTelemetry({
		...DEFAULT_TELEMETRY_CONFIG, spanProcessors: [processor] as unknown as TelemetryConfig['spanProcessors'],
	});
});

afterEach(async () => {
	await shutdownTelemetry();
});

describe('publishTraced', () => {
	it('hands the handler the operation in its payload and ends it once the handler settles', async () => {
		const bus = new CommandBus();
		let seen: TelemetryOperation | undefined;
		let endedWhileRunning = -1;
		bus.subscribe('demo.widget.search', async (command) => {
			seen = operationOf(command.payload);
			endedWhileRunning = ended.length;
			return { data: 1, clientErrors: [] };
		});

		const response = await publishTraced(bus, { name: 'demo.widget.search', payload: { q: 'x' } }, UI_OPERATIONS.SCREEN_LOAD);

		expect(response.result?.data).toBe(1);
		expect(seen?.name).toBe(UI_OPERATIONS.SCREEN_LOAD);
		expect(endedWhileRunning).toBe(0);
		expect(ended.map(span => span.name)).toEqual([UI_OPERATIONS.SCREEN_LOAD]);
	});

	it('marks the operation failed on a technical error the bus returns as a value', async () => {
		const bus = new CommandBus();
		bus.subscribe('demo.widget.update', async () => {
			throw new Error('boom');
		});

		const response = await publishTraced(bus, { name: 'demo.widget.update', payload: {} }, UI_OPERATIONS.FORM_SAVE);

		expect(response.error).toBeInstanceOf(Error);
		expect(ended).toHaveLength(1);
		expect(ended[0].status.code).toBe(2);
	});

	it('opens no operation without a name', async () => {
		const bus = new CommandBus();
		bus.subscribe('demo.widget.get', async (command) => ({ data: operationOf(command.payload) ?? null, clientErrors: [] }));

		const response = await publishTraced(bus, { name: 'demo.widget.get', payload: {} });

		expect(response.result?.data).toBeNull();
		expect(ended).toHaveLength(0);
	});
});
