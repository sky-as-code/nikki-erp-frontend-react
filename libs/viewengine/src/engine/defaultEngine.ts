import { createViewEngine } from './createViewEngine';

import type { IViewEngine } from '../core';


/**
 * Convenience singleton for standalone dev servers, Storybook and unit tests.
 *
 * NEVER reference this from library or micro-app code. A separately-built remote
 * bundle gets its own copy of this module and would register into a `Map` the
 * host cannot see -- which fails silently at runtime, the worst possible mode.
 * Production code receives the engine via `MicroAppBundleInitOptions.host.viewEngine`
 * or `useViewEngine()`.
 *
 * @internal
 */
export const defaultViewEngine: IViewEngine = createViewEngine({ instanceId: 'default' });
