import { dynamicResourceRouterFactory } from './dynamicresource/router';
import { iamRouterFactory } from './iam/router';
import { resourceFormsRouterFactory } from './resourceforms/router';
import { resourceViewRouterFactory } from './resourceview/router';

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
 * Mounted before the generic proxy, in this order. `resourceview` (`/api/v1/list/**`, `/api/v1/detail/**`) comes
 * before every router matching `/api/v1/:module/:schema/...`, which would otherwise read `list` as a module key.
 */
export const moduleRouterFactories: readonly ModuleRouterFactory[] = [
	resourceViewRouterFactory,
	iamRouterFactory,
	dynamicResourceRouterFactory,
	resourceFormsRouterFactory,
];
