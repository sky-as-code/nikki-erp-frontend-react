import { dynamicResourceRouterFactory } from './dynamicresource/router';
import { iamRouterFactory } from './iam/router';
import { storageRouterFactory } from './storage/router';

import type { Container } from '../common/ioc/container';
import type { Router } from 'express';




export interface ModuleRouter {
	/** Mount path, e.g. `/api/v1/iam`. */
	readonly basePath: string;
	readonly router: Router;
}

export type ModuleRouterFactory = (container: Container) => ModuleRouter;

/**
 * Module routers (accumulation endpoints and endpoints whose behaviour differs from the upstream).
 * Mounted before the generic proxy, in this order.
 */
export const moduleRouterFactories: readonly ModuleRouterFactory[] = [
	iamRouterFactory,
	dynamicResourceRouterFactory,
	storageRouterFactory,
];
