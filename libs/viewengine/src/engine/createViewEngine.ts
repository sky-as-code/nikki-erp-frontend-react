import { ViewEngine, ViewEngineOptions } from './ViewEngine';

import type { IViewEngine } from '../core';


export function createViewEngine(opts: ViewEngineOptions): IViewEngine {
	return new ViewEngine(opts);
}
