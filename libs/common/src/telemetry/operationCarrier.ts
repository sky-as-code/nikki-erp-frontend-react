import type { TelemetryOperation } from './operation';


/**
 * Where a command payload carries its {@link TelemetryOperation} from the publisher, across the command bus,
 * to the `RestApi` call made on its behalf. A registry symbol, so a micro-app built with its own copy of this
 * library reads the key the Shell's copy wrote.
 */
const OPERATION_KEY = Symbol.for('coremart.telemetry.operation');

/**
 * A shallow copy of `payload` carrying `operation` under a non-enumerable key: invisible to JSON bodies,
 * query strings, `Object.entries` and spreads, so it can never reach the wire. `payload` itself is left
 * untouched; anything but a plain object or array is returned as is.
 */
export function withOperation<TPayload>(payload: TPayload, operation: TelemetryOperation | undefined): TPayload {
	if (!operation || !isCarrier(payload)) return payload;
	const copy = (Array.isArray(payload) ? [...payload] : { ...payload }) as TPayload;
	Object.defineProperty(copy, OPERATION_KEY, { value: operation, enumerable: false });
	return copy;
}

/** The operation `value` carries, if any. */
export function operationOf(value: unknown): TelemetryOperation | undefined {
	return isCarrier(value) ? (value as Record<symbol, TelemetryOperation | undefined>)[OPERATION_KEY] : undefined;
}

/**
 * `target` carrying the operation of `source`. For code that rebuilds a request bag (a spread, a destructure)
 * on its way to `RestApi`, since the copy drops the non-enumerable key.
 */
export function carryOperation<TTarget>(source: unknown, target: TTarget): TTarget {
	return withOperation(target, operationOf(source));
}

function isCarrier(value: unknown): value is object {
	if (value === null || typeof value !== 'object') return false;
	const proto = Object.getPrototypeOf(value);
	return Array.isArray(value) || proto === Object.prototype || proto === null;
}
