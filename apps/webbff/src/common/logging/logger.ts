import { isSpanContextValid, trace } from '@opentelemetry/api';

import { currentIdempotencyId } from '../../telemetry/idempotency_id';
import { getServiceIdentity } from '../../telemetry/identity';


export interface Logger {
	info(message: string, ...args: unknown[]): void;
	warn(message: string, ...args: unknown[]): void;
	error(message: string, ...args: unknown[]): void;
}

export type Severity = 'INFO' | 'WARN' | 'ERROR';

/** Where a formatted line goes; one JSON record per call, newline-terminated. */
export type LogSink = (severity: Severity, line: string) => void;

/**
 * One JSON record per line. Telemetry and resource fields are read from the active context at each call (`null`
 * when absent; the logger never generates an id). Caller arguments go under `data`, so they cannot override them.
 */
export function createJsonLogger(sink: LogSink = writeToStdio): Logger {
	return {
		info: (message, ...args) => sink('INFO', formatRecord('INFO', message, args)),
		warn: (message, ...args) => sink('WARN', formatRecord('WARN', message, args)),
		error: (message, ...args) => sink('ERROR', formatRecord('ERROR', message, args)),
	};
}

export function formatRecord(severity: Severity, message: string, args: readonly unknown[]): string {
	const spanContext = trace.getActiveSpan()?.spanContext();
	const valid = spanContext !== undefined && isSpanContextValid(spanContext);
	const identity = getServiceIdentity();
	const record: Record<string, unknown> = {
		timestamp: new Date().toISOString(),
		severity,
		message,
		trace_id: valid ? spanContext.traceId : null,
		span_id: valid ? spanContext.spanId : null,
		idempotency_id: currentIdempotencyId() ?? null,
		'service.name': identity.serviceName,
		// The BFF has no authenticated tenant or organization of its own.
		tenant_id: null,
		org_id: null,
	};
	if (args.length > 0) {
		record.data = args.length === 1 ? toLoggable(args[0]) : args.map(toLoggable);
	}
	return safeStringify(record);
}

function toLoggable(value: unknown): unknown {
	if (value instanceof Error) {
		return { type: value.name, message: value.message, stack: value.stack };
	}
	return value;
}

function safeStringify(record: Record<string, unknown>): string {
	try {
		return JSON.stringify(record);
	}
	catch {
		return JSON.stringify({ ...record, data: '[unserializable]' });
	}
}

function writeToStdio(severity: Severity, line: string): void {
	const stream = severity === 'INFO' ? process.stdout : process.stderr;
	stream.write(`${line}\n`);
}
