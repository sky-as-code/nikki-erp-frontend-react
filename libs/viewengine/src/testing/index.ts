import { createViewEngine } from '../engine/createViewEngine';

import type { IViewEngine } from '../core';


/**
 * A throwaway engine for unit tests and Storybook. Each call returns a fresh
 * instance, so tests never leak contributions into one another -- which is
 * exactly the failure mode the old module-singleton registries had.
 */
export function createTestEngine(instanceId = 'test'): IViewEngine {
	return createViewEngine({ instanceId });
}
