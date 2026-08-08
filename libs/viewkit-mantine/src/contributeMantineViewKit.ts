import { mantineViewKit } from './kit';

import type { IViewEngine } from '@nikkierp/viewengine/core';


/** Single public entry point of this kit. `engine.use(...)` is idempotent per kit id. */
export function contributeMantineViewKit(engine: IViewEngine): void {
	engine.use(mantineViewKit);
}
