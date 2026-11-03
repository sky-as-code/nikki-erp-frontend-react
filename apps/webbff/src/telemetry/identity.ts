import { randomBytes } from 'node:crypto';
import os from 'node:os';


/** The static resource fields every log record and span carries. */
export interface ServiceIdentity {
	readonly serviceName: string;
	readonly serviceVersion: string;
	readonly serviceInstanceId: string;
	readonly deploymentEnvironment: string;
}

export const DEFAULT_SERVICE_NAME = 'coremart-bff';
export const UNKNOWN_VERSION = 'unknown';

/** One per process, so that replicas and restarts never share it. */
export const PROCESS_INSTANCE_ID = `${os.hostname()}-${process.pid}-${randomBytes(4).toString('hex')}`;

let current: ServiceIdentity | undefined;

/** The identity set by the telemetry bootstrap, else defaults (tests, or a logger used before bootstrap). */
export function getServiceIdentity(): ServiceIdentity {
	current ??= Object.freeze({
		serviceName: DEFAULT_SERVICE_NAME,
		serviceVersion: UNKNOWN_VERSION,
		serviceInstanceId: PROCESS_INSTANCE_ID,
		deploymentEnvironment: process.env.NODE_ENV || 'unknown',
	});
	return current;
}

export function setServiceIdentity(identity: ServiceIdentity): void {
	current = Object.freeze({ ...identity });
}
